import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;

  let sessionStore: session.Store;

  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    const MemStore = MemoryStore(session);
    sessionStore = new MemStore({ checkPeriod: sessionTtl });
  }

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  function getAuthDomain(req: { hostname: string; protocol: string }): string {
    return process.env.REPLIT_DOMAINS?.split(",")[0]?.trim() ?? req.hostname;
  }

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const domain = getAuthDomain(req);
    ensureStrategy(domain);
    const returnTo = req.query.returnTo as string | undefined;
    if (returnTo && returnTo.startsWith("/")) {
      (req.session as any).returnTo = returnTo;
    }
    if (req.query.popup === "1") {
      (req.session as any).isPopup = true;
    } else {
      delete (req.session as any).isPopup;
    }
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const domain = getAuthDomain(req);
    ensureStrategy(domain);
    passport.authenticate(`replitauth:${domain}`, {
      failureRedirect: "/api/login",
    }, (err: any, user: any, info: any) => {
      if (err || !user) {
        return res.redirect("/api/login");
      }
      req.logIn(user, async (err) => {
        if (err) {
          return res.redirect("/api/login");
        }

        const returnTo = (req.session as any).returnTo || "/home";
        const isPopup = (req.session as any).isPopup === true;
        delete (req.session as any).returnTo;
        delete (req.session as any).isPopup;

        const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/home";

        if (!isPopup) {
          return res.redirect(safeReturnTo);
        }

        res.send(`<!DOCTYPE html><html><head><title>Signing in...</title></head><body>
<script>
(function(){
  var dest = ${JSON.stringify(safeReturnTo)};
  if (typeof BroadcastChannel !== "undefined") {
    var bc = new BroadcastChannel("cultfam_auth");
    bc.postMessage({ type: "cultfam_auth_complete", returnTo: dest });
    bc.close();
  }
  window.close();
})();
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:40px">Completing sign-in…</p>
</body></html>`);
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `https://${getAuthDomain(req)}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

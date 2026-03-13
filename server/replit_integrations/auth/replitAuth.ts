import { createClient } from "@supabase/supabase-js";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { authStorage } from "./storage";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

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

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.get("/api/logout", (_req, res) => {
    res.json({ ok: true });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appUser = await authStorage.getOrCreateUser({
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Member",
    });

    req.user = {
      claims: { sub: appUser.id },
      appUser,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

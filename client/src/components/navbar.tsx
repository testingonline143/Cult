import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const displayName = user?.firstName || user?.email || "User";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(245,240,232,0.95)", backdropFilter: "blur(16px)", borderColor: "var(--warm-border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2"
              data-testid="link-home"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--terra)" }} />
              <span className="text-xl font-display font-black tracking-tight" style={{ color: "var(--ink)" }}>CultFam</span>
            </a>
            <a
              href="/explore"
              className="hidden sm:flex items-center gap-1 text-sm transition-colors"
              style={{ color: "var(--muted-warm)" }}
              data-testid="link-explore"
            >
              <Compass className="w-4 h-4" />
              Explore
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full" style={{ color: "var(--muted-warm)", background: "var(--terra-pale)" }}>
              {user?.city || "Tirupati"}
            </span>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/profile"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "var(--ink)" }}
                  data-testid="link-profile"
                >
                  {displayName}
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => logout()}
                  data-testid="button-sign-out"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full hidden sm:inline-flex"
                onClick={() => { window.location.href = "/api/login"; }}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            )}
            <Button
              size="sm"
              className="rounded-full hidden sm:inline-flex"
              onClick={() => { window.location.href = "/create"; }}
              data-testid="button-list-club-nav"
            >
              List Your Club
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{ background: "rgba(245,240,232,0.95)", backdropFilter: "blur(16px)", borderColor: "var(--warm-border)" }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              <a href="/explore" className="flex items-center gap-2 text-sm font-medium px-3 py-1.5" style={{ color: "var(--ink)" }} onClick={() => setMobileOpen(false)} data-testid="link-explore-mobile">
                <Compass className="w-4 h-4" />
                Explore Clubs
              </a>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => scrollTo("process")} data-testid="link-process-mobile">
                How It Works
              </Button>
              {isAuthenticated ? (
                <div className="flex flex-col gap-1 mt-2">
                  <a href="/profile" className="text-sm font-medium transition-colors px-3 py-1.5" style={{ color: "var(--ink)" }} data-testid="link-profile-mobile" onClick={() => setMobileOpen(false)}>
                    My Profile ({displayName})
                  </a>
                  {user && !user.quizCompleted && (
                    <a href="/onboarding" className="text-sm font-medium px-3 py-1.5" style={{ color: "var(--terra)" }} data-testid="link-quiz-mobile" onClick={() => setMobileOpen(false)}>
                      Take Quiz
                    </a>
                  )}
                  <Button size="sm" variant="outline" className="rounded-full text-xs self-start" onClick={() => logout()} data-testid="button-sign-out-mobile">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => { window.location.href = "/api/login"; setMobileOpen(false); }} data-testid="button-sign-in-mobile">
                  Sign In
                </Button>
              )}
              <Button size="sm" className="mt-2 rounded-full" onClick={() => { window.location.href = "/create"; setMobileOpen(false); }} data-testid="button-list-club-mobile">
                List Your Club
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

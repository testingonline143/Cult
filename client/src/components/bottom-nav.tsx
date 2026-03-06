import { useState } from "react";
import { useLocation } from "wouter";
import { Home, Users, Calendar, User, Plus, X, LayoutDashboard, PenLine } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Drawer } from "vaul";
import { Link } from "wouter";

const MAIN_TABS = [
  { path: "/home", label: "HOME", icon: Home },
  { path: "/explore", label: "CLUBS", icon: Users },
  { path: "/events", label: "EVENTS", icon: Calendar },
  { path: "/profile", label: "PROFILE", icon: User },
];

const TAB_PATHS = ["/home", "/explore", "/events", "/profile", "/organizer", "/notifications", "/create"];

export function BottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!TAB_PATHS.includes(location)) return null;

  const isOrganiser = user?.role === "organiser" || user?.role === "admin";
  const isCreator = !!user && (user.wantsToCreate === true || isOrganiser);

  const tabs = isCreator
    ? [
        { path: "/home", label: "HOME", icon: Home },
        { path: "/explore", label: "CLUBS", icon: Users },
        null,
        { path: "/events", label: "EVENTS", icon: Calendar },
        isOrganiser
          ? { path: "/organizer", label: "DASHBOARD", icon: LayoutDashboard }
          : { path: "/profile", label: "PROFILE", icon: User },
      ]
    : [
        { path: "/home", label: "HOME", icon: Home },
        { path: "/explore", label: "CLUBS", icon: Users },
        { path: "/events", label: "EVENTS", icon: Calendar },
        { path: "/profile", label: "PROFILE", icon: User },
      ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(245,240,232,0.97)",
          borderTop: "1.5px solid rgba(26,20,16,0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        data-testid="nav-bottom"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
          {tabs.map((tab, i) => {
            if (tab === null) {
              return (
                <div key="fab-slot" className="flex flex-col items-center px-3 py-1 relative" style={{ width: 56 }}>
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    style={{
                      background: "var(--terra)",
                      position: "absolute",
                      bottom: 10,
                      boxShadow: "0 4px 20px rgba(196,98,45,0.45)",
                    }}
                    data-testid="button-fab"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>
              );
            }

            const isActive = location === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 px-3 py-1 transition-colors relative"
                data-testid={`tab-${tab.label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon
                    className="w-5 h-5"
                    style={{ opacity: isActive ? 1 : 0.4, color: isActive ? "var(--terra)" : "var(--ink)" }}
                  />
                </div>
                {isActive && (
                  <span className="w-1 h-1 rounded-full" style={{ background: "var(--terra)" }} />
                )}
                <span
                  className="font-bold tracking-wider uppercase"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "1px",
                    color: isActive ? "var(--terra)" : "var(--muted-warm)",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* FAB Action Sheet */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-50"
            style={{ background: "rgba(26,20,16,0.5)", backdropFilter: "blur(2px)" }}
          />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 outline-none"
            style={{ maxWidth: 480, margin: "0 auto" }}
            data-testid="drawer-fab-actions"
          >
            <div
              className="rounded-t-[24px] px-5 pt-3 pb-10"
              style={{ background: "var(--warm-white)", borderTop: "1.5px solid var(--warm-border)" }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--warm-border)" }} />
              </div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-xl" style={{ color: "var(--ink)" }}>Create</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--cream2)" }}
                  data-testid="button-close-drawer"
                >
                  <X className="w-4 h-4" style={{ color: "var(--ink)" }} />
                </button>
              </div>
              <div className="space-y-3">
                <Link
                  href="/create?tab=club"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-[16px] transition-colors active:scale-[0.98]"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--warm-border)" }}
                  data-testid="action-create-club"
                >
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: "var(--terra-pale)" }}
                  >
                    <Users className="w-5 h-5" style={{ color: "var(--terra)" }} />
                  </div>
                  <div>
                    <p className="font-bold text-[15px]" style={{ color: "var(--ink)" }}>Create Club</p>
                    <p className="text-[12px]" style={{ color: "var(--muted-warm)" }}>Start your own community</p>
                  </div>
                </Link>

                <Link
                  href="/create?tab=event"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-[16px] transition-colors active:scale-[0.98]"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--warm-border)" }}
                  data-testid="action-create-event"
                >
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: "rgba(201,168,76,0.12)" }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <p className="font-bold text-[15px]" style={{ color: "var(--ink)" }}>Create Event</p>
                    <p className="text-[12px]" style={{ color: "var(--muted-warm)" }}>Schedule a meetup or activity</p>
                  </div>
                </Link>

                {isOrganiser && (
                  <Link
                    href="/organizer?tab=content"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-[16px] transition-colors active:scale-[0.98]"
                    style={{ background: "var(--cream)", border: "1.5px solid var(--warm-border)" }}
                    data-testid="action-create-post"
                  >
                    <div
                      className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{ background: "rgba(61,107,69,0.1)" }}
                    >
                      <PenLine className="w-5 h-5" style={{ color: "var(--green-accent)" }} />
                    </div>
                    <div>
                      <p className="font-bold text-[15px]" style={{ color: "var(--ink)" }}>Create Post</p>
                      <p className="text-[12px]" style={{ color: "var(--muted-warm)" }}>Share a moment with your club</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

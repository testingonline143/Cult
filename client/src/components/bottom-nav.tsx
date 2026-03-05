import { useLocation } from "wouter";
import { Home, Compass, Calendar, PlusCircle, User } from "lucide-react";

const TABS = [
  { path: "/home", label: "HOME", icon: Home },
  { path: "/explore", label: "EXPLORE", icon: Compass },
  { path: "/events", label: "EVENTS", icon: Calendar },
  { path: "/create", label: "CREATE", icon: PlusCircle },
  { path: "/profile", label: "PROFILE", icon: User },
];

const TAB_PATHS = ["/home", "/explore", "/events", "/create", "/profile", "/organizer"];

export function BottomNav() {
  const [location, navigate] = useLocation();

  if (!TAB_PATHS.includes(location)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(245,240,232,0.95)",
        borderTop: "1.5px solid rgba(26,20,16,0.1)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-colors"
              data-testid={`tab-${tab.label.toLowerCase()}`}
            >
              <Icon
                className="w-5 h-5"
                style={{ opacity: isActive ? 1 : 0.4, color: isActive ? "var(--terra)" : "var(--ink)" }}
              />
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--terra)" }}
                />
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
  );
}

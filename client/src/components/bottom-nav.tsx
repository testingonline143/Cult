import { useLocation } from "wouter";
import { Home, Compass, Calendar, PlusCircle, User } from "lucide-react";

const TABS = [
  { path: "/", label: "HOME", icon: Home },
  { path: "/explore", label: "EXPLORE", icon: Compass },
  { path: "/events", label: "EVENTS", icon: Calendar },
  { path: "/create", label: "CREATE", icon: PlusCircle },
  { path: "/profile", label: "PROFILE", icon: User },
];

const TAB_PATHS = ["/explore", "/events", "/create", "/profile"];

export function BottomNav() {
  const [location, navigate] = useLocation();

  if (!TAB_PATHS.includes(location)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                isActive ? "neon-text" : "text-muted-foreground"
              }`}
              data-testid={`tab-${tab.label.toLowerCase()}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "neon-text" : ""}`} />
              <span className="text-[10px] font-semibold tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useLocation } from "wouter";
import { Home, Compass, Calendar, User, LayoutDashboard, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

const USER_TABS = [
  { path: "/home", label: "HOME", icon: Home },
  { path: "/explore", label: "EXPLORE", icon: Compass },
  { path: "/events", label: "EVENTS", icon: Calendar },
  { path: "/notifications", label: "ALERTS", icon: Bell, hasBadge: true },
  { path: "/profile", label: "PROFILE", icon: User },
];

const ORGANISER_TABS = [
  { path: "/home", label: "HOME", icon: Home },
  { path: "/explore", label: "EXPLORE", icon: Compass },
  { path: "/events", label: "EVENTS", icon: Calendar },
  { path: "/notifications", label: "ALERTS", icon: Bell, hasBadge: true },
  { path: "/organizer", label: "DASHBOARD", icon: LayoutDashboard },
];

const TAB_PATHS = ["/home", "/explore", "/events", "/create", "/profile", "/organizer", "/notifications"];

export function BottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!TAB_PATHS.includes(location)) return null;

  const isOrganiser = user?.role === "organiser" || user?.role === "admin";
  const tabs = isOrganiser ? ORGANISER_TABS : USER_TABS;
  const unreadCount = unreadData?.count ?? 0;

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
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          const showBadge = (tab as any).hasBadge && unreadCount > 0;
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
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white font-bold px-1"
                    style={{
                      fontSize: "9px",
                      background: "var(--terra)",
                    }}
                    data-testid="badge-unread-count"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
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

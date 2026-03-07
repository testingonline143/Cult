import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, ShieldAlert, Users, Activity, Ban, BarChart3, Calendar, MapPin,
  Search, CheckCircle2, XCircle, Building2, UserCheck, ArrowLeft,
  TrendingUp, Camera, MessageSquare, Zap, RotateCcw, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import type { JoinRequest, Club } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminAnalytics {
  totalUsers: number;
  totalClubs: number;
  activeClubs: number;
  totalEvents: number;
  totalRsvps: number;
  totalCheckins: number;
  totalMoments: number;
  totalComments: number;
  newUsersThisWeek: number;
  newEventsThisWeek: number;
  newJoinsThisWeek: number;
  cityCounts: { city: string; count: number }[];
}

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  city: string | null;
  role: string | null;
  createdAt: string | null;
  clubCount: number;
}

interface AdminEvent {
  id: string;
  title: string;
  clubId: string;
  clubName: string;
  clubEmoji: string;
  startsAt: string;
  rsvpCount: number;
  checkedInCount: number;
  isCancelled: boolean | null;
  maxCapacity: number;
}

interface ActivityFeed {
  recentJoins: { name: string; clubName: string; createdAt: string | null }[];
  recentClubs: { name: string; emoji: string; city: string; createdAt: string | null }[];
  recentEvents: { title: string; clubName: string; startsAt: string }[];
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  analytics: <BarChart3 className="w-4 h-4" />,
  clubs: <Building2 className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  events: <Calendar className="w-4 h-4" />,
  joins: <UserCheck className="w-4 h-4" />,
};

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "clubs" | "users" | "events" | "joins">("analytics");

  const { data: pendingCountData } = useQuery<JoinRequest[]>({
    queryKey: ["/api/admin/join-requests"],
    enabled: isAuthenticated,
    retry: false,
  });
  const pendingCount = (pendingCountData ?? []).filter((r: any) => r.status === "pending" && !r.markedDone).length;

  if (authLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--cream)" }}>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-xl" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-[18px]" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--cream)" }}>
        <div className="w-full max-w-sm space-y-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
          >
            <Shield className="w-8 h-8" style={{ color: "var(--terra)" }} />
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--terra)" }} data-testid="text-admin-title">Admin Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--muted-warm)" }}>Sign in to access the admin dashboard</p>
          <a
            href="/api/login"
            className="inline-block w-full rounded-full py-3 text-sm font-bold text-white text-center"
            style={{ background: "var(--terra)" }}
            data-testid="button-admin-login"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "analytics", label: "Analytics" },
    { key: "clubs", label: "Clubs" },
    { key: "users", label: "Users" },
    { key: "events", label: "Events" },
    { key: "joins", label: "Requests", badge: pendingCount },
  ] as const;

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Admin";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Admin identity banner */}
      <div
        className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between"
        style={{
          background: "var(--ink)",
          borderBottom: "2px solid var(--terra)",
        }}
      >
        <div className="flex items-center gap-3">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover" style={{ border: "2px solid var(--terra)" }} />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--terra)" }}>
              {initials}
            </div>
          )}
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: "var(--terra)" }} />
              <span className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: "var(--terra)" }}>Admin Dashboard</span>
            </div>
            <p className="text-white font-semibold text-[13px]">{displayName}</p>
          </div>
        </div>
        <Link href="/home" data-testid="link-admin-home">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab bar */}
        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap relative`}
              style={activeTab === tab.key
                ? { background: "var(--terra)", color: "white" }
                : { background: "var(--warm-white)", border: "1.5px solid var(--warm-border)", color: "var(--muted-warm)" }
              }
              data-testid={`tab-${tab.key}`}
            >
              {TAB_ICONS[tab.key]}
              {tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
                  style={{ background: "#e53e3e" }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "clubs" && <ClubsMonitorTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "joins" && <JoinRequestsTab />}
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="text-center py-16 space-y-3">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
      >
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="font-display text-xl font-bold" data-testid="text-access-denied">Access Denied</h2>
      <p className="text-sm" style={{ color: "var(--muted-warm)" }}>You don't have admin privileges.</p>
      <Link href="/" className="inline-block text-sm font-semibold" style={{ color: "var(--terra)" }} data-testid="link-go-home">Go Home</Link>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div
      className="rounded-[18px] p-4 flex flex-col items-center gap-2"
      style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--terra-pale)" }}>
        <span style={{ color: "var(--terra)" }}>{icon}</span>
      </div>
      <div className={`text-2xl font-bold font-mono`} style={{ color: color || "var(--terra)" }}>{value}</div>
      <div className="text-[11px] text-center" style={{ color: "var(--muted-warm)" }}>{label}</div>
    </div>
  );
}

function AnalyticsTab() {
  const { data: analytics, isLoading, error } = useQuery<AdminAnalytics>({
    queryKey: ["/api/admin/analytics"],
    retry: false,
  });

  const { data: feed } = useQuery<ActivityFeed>({
    queryKey: ["/api/admin/activity-feed"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-24 rounded-[18px]" />)}
        </div>
      </div>
    );
  }

  if (error) return <AccessDenied />;
  if (!analytics) return null;

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, icon: <Users className="w-4 h-4" /> },
    { label: "Total Clubs", value: analytics.totalClubs, icon: <Building2 className="w-4 h-4" /> },
    { label: "Active Clubs", value: analytics.activeClubs, icon: <Activity className="w-4 h-4" />, color: "#16a34a" },
    { label: "Total Events", value: analytics.totalEvents, icon: <Calendar className="w-4 h-4" /> },
    { label: "Total RSVPs", value: analytics.totalRsvps, icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Check-ins", value: analytics.totalCheckins, icon: <Zap className="w-4 h-4" />, color: "#16a34a" },
    { label: "Moments", value: analytics.totalMoments, icon: <Camera className="w-4 h-4" /> },
    { label: "Comments", value: analytics.totalComments, icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6" data-testid="section-analytics">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* This Week growth strip */}
      <div
        className="rounded-[18px] p-4"
        style={{ background: "var(--ink)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: "var(--terra)" }} />
          <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "var(--terra)" }}>This Week</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-white font-mono">+{analytics.newUsersThisWeek}</p>
            <p className="text-[11px]" style={{ color: "var(--muted-warm2)" }}>New Users</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">+{analytics.newJoinsThisWeek}</p>
            <p className="text-[11px]" style={{ color: "var(--muted-warm2)" }}>New Members</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">+{analytics.newEventsThisWeek}</p>
            <p className="text-[11px]" style={{ color: "var(--muted-warm2)" }}>New Events</p>
          </div>
        </div>
      </div>

      {/* City breakdown */}
      {analytics.cityCounts.length > 0 && (
        <div
          className="rounded-[18px] p-5"
          style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
          data-testid="card-city-breakdown"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: "var(--terra)" }} />
            Clubs by City
          </h3>
          <div className="space-y-2">
            {analytics.cityCounts.map((city) => (
              <div key={city.city} className="flex items-center justify-between">
                <span className="text-sm">{city.city}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "var(--cream)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((city.count / Math.max(...analytics.cityCounts.map(c => c.count))) * 100)}%`,
                        background: "var(--terra)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono w-6 text-right" style={{ color: "var(--terra)" }}>{city.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {feed && (
        <div>
          <h3 className="font-display font-bold text-lg mb-3" style={{ color: "var(--ink)" }}>Recent Activity</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Recent Joins */}
            <div
              className="rounded-[18px] p-4"
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4" style={{ color: "var(--terra)" }} />
                <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--terra)" }}>Recent Joins</span>
              </div>
              <div className="space-y-2">
                {feed.recentJoins.length === 0 && <p className="text-xs" style={{ color: "var(--muted-warm)" }}>No joins yet</p>}
                {feed.recentJoins.map((j, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>{j.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-warm)" }}>{j.clubName}</p>
                    </div>
                    {j.createdAt && (
                      <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--muted-warm)" }}>
                        {formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Clubs */}
            <div
              className="rounded-[18px] p-4"
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" style={{ color: "var(--terra)" }} />
                <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--terra)" }}>New Clubs</span>
              </div>
              <div className="space-y-2">
                {feed.recentClubs.length === 0 && <p className="text-xs" style={{ color: "var(--muted-warm)" }}>No clubs yet</p>}
                {feed.recentClubs.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xl shrink-0">{c.emoji}</span>
                    <div>
                      <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>{c.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-warm)" }}>{c.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div
              className="rounded-[18px] p-4"
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" style={{ color: "var(--terra)" }} />
                <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--terra)" }}>New Events</span>
              </div>
              <div className="space-y-2">
                {feed.recentEvents.length === 0 && <p className="text-xs" style={{ color: "var(--muted-warm)" }}>No events yet</p>}
                {feed.recentEvents.map((e, i) => (
                  <div key={i}>
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>{e.title}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-warm)" }}>
                      {e.clubName} · {format(new Date(e.startsAt), "d MMM")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClubsMonitorTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clubs = [], isLoading, error } = useQuery<Club[]>({
    queryKey: ["/api/admin/clubs"],
    retry: false,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/clubs/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/clubs/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[18px]" />)}
      </div>
    );
  }

  if (error) return <AccessDenied />;
  if (clubs.length === 0) {
    return <div className="text-center py-12" style={{ color: "var(--muted-warm)" }} data-testid="text-no-clubs">No clubs yet</div>;
  }

  const q = searchQuery.toLowerCase().trim();
  const filtered = q
    ? clubs.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.organizerName || "").toLowerCase().includes(q)
      )
    : clubs;

  const activeClubs = clubs.filter(c => c.isActive !== false);
  const inactiveClubs = clubs.filter(c => c.isActive === false);

  return (
    <div className="space-y-5" data-testid="list-admin-clubs">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Building2 className="w-4 h-4" />} label="Total Clubs" value={clubs.length} />
        <StatCard icon={<Activity className="w-4 h-4" />} label="Active" value={activeClubs.length} color="#16a34a" />
        <StatCard icon={<Ban className="w-4 h-4" />} label="Deactivated" value={inactiveClubs.length} color="#dc2626" />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-warm)" }} />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm focus:outline-none"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            data-testid="input-search-clubs"
          />
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted-warm)" }}>{filtered.length} clubs</span>
      </div>

      <div className="space-y-2">
        {filtered.map((club) => {
          const foundingPct = club.foundingTotal && club.foundingTotal > 0
            ? Math.round(((club.foundingTaken ?? 0) / club.foundingTotal) * 100)
            : null;

          return (
            <div
              key={club.id}
              className={`p-4 rounded-[18px] transition-all hover:border-[rgba(196,98,45,0.3)] ${club.isActive === false ? "opacity-50" : ""}`}
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
              data-testid={`row-admin-club-${club.id}`}
            >
              <div className="flex items-center gap-3">
                <Link href={`/club/${club.id}`} className="text-2xl shrink-0">{club.emoji}</Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/club/${club.id}`}>
                      <span className="font-semibold text-sm hover:underline" style={{ color: "var(--ink)" }} data-testid={`text-admin-club-name-${club.id}`}>{club.name}</span>
                    </Link>
                    <span className="text-xs" style={{ color: "var(--muted-warm)" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--muted-warm)" }}>{club.category}</span>
                    {club.isActive === false && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-destructive/20 text-destructive rounded-full">
                        Deactivated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs flex-wrap" style={{ color: "var(--muted-warm)" }}>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.organizerName}</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {club.memberCount} members</span>
                    <span>{club.city}</span>
                  </div>
                  {foundingPct !== null && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cream)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${foundingPct}%`,
                            background: foundingPct >= 100 ? "#16a34a" : foundingPct >= 50 ? "var(--gold)" : "var(--terra)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: "var(--muted-warm)" }}>
                        {club.foundingTaken}/{club.foundingTotal} founding
                      </span>
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {club.isActive === false ? (
                    <button
                      onClick={() => activateMutation.mutate(club.id)}
                      disabled={activateMutation.isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                      style={{ background: "var(--terra-pale)", color: "var(--terra)" }}
                      data-testid={`button-activate-${club.id}`}
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => deactivateMutation.mutate(club.id)}
                      disabled={deactivateMutation.isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap bg-destructive/10 text-destructive"
                      data-testid={`button-deactivate-${club.id}`}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: allUsers = [], isLoading, error } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[18px]" />)}
      </div>
    );
  }

  if (error) return <AccessDenied />;

  const q = searchQuery.toLowerCase().trim();
  const filteredUsers = q
    ? allUsers.filter(u =>
        (u.firstName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      )
    : allUsers;

  const roleStyles: Record<string, { bg: string; color: string }> = {
    admin: { bg: "var(--terra)", color: "white" },
    organiser: { bg: "var(--terra-pale)", color: "var(--terra)" },
    user: { bg: "var(--cream)", color: "var(--muted-warm)" },
  };

  return (
    <div className="space-y-4" data-testid="section-admin-users">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-warm)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm focus:outline-none"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            data-testid="input-search-users"
          />
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted-warm)" }}>{filteredUsers.length} users</span>
      </div>

      <div className="space-y-2">
        {filteredUsers.map((u) => {
          const rs = roleStyles[u.role || "user"] || roleStyles.user;
          return (
            <div
              key={u.id}
              className="flex items-center gap-4 p-4 rounded-[18px] hover:border-[rgba(196,98,45,0.3)] transition-all"
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
              data-testid={`row-admin-user-${u.id}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white" style={{ background: "var(--terra)" }}>
                {(u.firstName || u.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "var(--ink)" }} data-testid={`text-user-name-${u.id}`}>
                    {u.firstName || "No Name"}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ background: rs.bg, color: rs.color }}
                  >
                    {u.role || "user"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs flex-wrap" style={{ color: "var(--muted-warm)" }}>
                  {u.email && <span>{u.email}</span>}
                  {u.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{u.city}</span>}
                  <span>{u.clubCount} clubs</span>
                  {u.createdAt && (
                    <span>Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <select
                  value={u.role || "user"}
                  onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                  disabled={roleMutation.isPending}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full focus:outline-none cursor-pointer"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--warm-border)", color: "var(--ink)" }}
                  data-testid={`select-role-${u.id}`}
                >
                  <option value="user">User</option>
                  <option value="organiser">Organiser</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12" style={{ color: "var(--muted-warm)" }} data-testid="text-no-users">
          {searchQuery ? "No users match your search" : "No users yet"}
        </div>
      )}
    </div>
  );
}

function EventsTab() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null);

  const { data: allEvents = [], isLoading, error } = useQuery<AdminEvent[]>({
    queryKey: ["/api/admin/events"],
    retry: false,
  });

  const cancelEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/admin/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      setConfirmingCancel(null);
      toast({ title: "Event cancelled" });
    },
    onError: () => {
      toast({ title: "Failed to cancel event", variant: "destructive" });
    },
  });

  const restoreEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("PATCH", `/api/admin/events/${eventId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "Event restored" });
    },
    onError: () => {
      toast({ title: "Failed to restore event", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[18px]" />)}
      </div>
    );
  }

  if (error) return <AccessDenied />;
  if (allEvents.length === 0) {
    return <div className="text-center py-12" style={{ color: "var(--muted-warm)" }} data-testid="text-no-events">No events yet</div>;
  }

  const now = new Date();
  const q = searchQuery.toLowerCase().trim();
  const filtered = q
    ? allEvents.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.clubName.toLowerCase().includes(q)
      )
    : allEvents;

  return (
    <div className="space-y-4" data-testid="section-admin-events">
      <div className="grid grid-cols-3 gap-3 mb-2">
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Total Events" value={allEvents.length} />
        <StatCard icon={<Activity className="w-4 h-4" />} label="Upcoming" value={allEvents.filter(e => new Date(e.startsAt) > now && !e.isCancelled).length} color="#16a34a" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Total RSVPs" value={allEvents.reduce((sum, e) => sum + e.rsvpCount, 0)} />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-warm)" }} />
          <input
            type="text"
            placeholder="Search events or clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm focus:outline-none"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            data-testid="input-search-events"
          />
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted-warm)" }}>{filtered.length} events</span>
      </div>

      <div className="space-y-2">
        {filtered.map((event) => {
          const d = new Date(event.startsAt);
          const isPast = d < now;
          const attendanceRate = event.rsvpCount > 0 ? Math.round((event.checkedInCount / event.rsvpCount) * 100) : 0;

          return (
            <div
              key={event.id}
              className={`rounded-[18px] transition-all hover:border-[rgba(196,98,45,0.3)] ${event.isCancelled ? "opacity-50" : isPast ? "opacity-70" : ""}`}
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
              data-testid={`row-admin-event-${event.id}`}
            >
              <Link href={`/event/${event.id}`} className="block p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl shrink-0">{event.clubEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>{event.title}</span>
                      {event.isCancelled && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-destructive/20 text-destructive rounded-full flex items-center gap-0.5">
                          <Ban className="w-2.5 h-2.5" /> Cancelled
                        </span>
                      )}
                      {!event.isCancelled && isPast && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--muted-warm)" }}>Past</span>
                      )}
                      {!event.isCancelled && !isPast && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a" }}>Upcoming</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs flex-wrap" style={{ color: "var(--muted-warm)" }}>
                      <span>{event.clubName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.rsvpCount}/{event.maxCapacity}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                    {isPast && event.rsvpCount > 0 && (
                      <div>
                        <div className="text-sm font-bold font-mono" style={{ color: "var(--terra)" }}>{attendanceRate}%</div>
                        <div className="text-[10px]" style={{ color: "var(--muted-warm)" }}>{event.checkedInCount}/{event.rsvpCount}</div>
                      </div>
                    )}
                    {event.isCancelled && (
                      <button
                        onClick={() => restoreEventMutation.mutate(event.id)}
                        disabled={restoreEventMutation.isPending}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                        style={{ background: "var(--terra-pale)", color: "var(--terra)" }}
                        data-testid={`button-restore-event-${event.id}`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                    )}
                    {!isPast && !event.isCancelled && (
                      confirmingCancel === event.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => cancelEventMutation.mutate(event.id)}
                            disabled={cancelEventMutation.isPending}
                            className="text-[10px] font-semibold px-2 py-1 rounded-full bg-destructive/10 text-destructive whitespace-nowrap"
                            data-testid={`button-confirm-cancel-event-${event.id}`}
                          >
                            {cancelEventMutation.isPending ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmingCancel(null)}
                            className="text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                            style={{ background: "var(--cream)", color: "var(--muted-warm)" }}
                            data-testid={`button-undo-cancel-event-${event.id}`}
                          >
                            Back
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingCancel(event.id)}
                          className="text-[10px] font-semibold px-2 py-1 rounded-full bg-destructive/10 text-destructive whitespace-nowrap"
                          data-testid={`button-cancel-event-${event.id}`}
                        >
                          Cancel
                        </button>
                      )
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JoinRequestsTab() {
  const { toast } = useToast();

  const { data: requests = [], isLoading, error } = useQuery<JoinRequest[]>({
    queryKey: ["/api/admin/join-requests"],
    retry: false,
  });

  const markDoneMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/join-requests/${id}/done`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/join-requests"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, clubId }: { id: string; clubId: string }) => {
      await apiRequest("POST", `/api/admin/join-requests/${id}/approve`, { clubId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({ title: "Request approved" });
    },
    onError: () => {
      toast({ title: "Failed to approve", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/join-requests/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/join-requests"] });
      toast({ title: "Request rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-[18px]" />)}
      </div>
    );
  }

  if (error) return <AccessDenied />;

  if (requests.length === 0) {
    return <div className="text-center py-12" style={{ color: "var(--muted-warm)" }} data-testid="text-no-join-requests">No join requests yet</div>;
  }

  const pending = requests.filter((r: any) => r.status === "pending");
  const rest = requests.filter((r: any) => r.status !== "pending");

  const statusStyle = (status: string) => {
    if (status === "approved") return { bg: "rgba(22,163,74,0.12)", color: "#16a34a" };
    if (status === "rejected") return { bg: "rgba(220,38,38,0.1)", color: "#dc2626" };
    return { bg: "rgba(201,168,76,0.12)", color: "var(--gold)" };
  };

  const renderRequest = (req: any) => {
    const ss = statusStyle(req.status);
    return (
      <div
        key={req.id}
        className={`p-4 rounded-[18px] transition-all ${req.markedDone ? "opacity-40" : ""}`}
        style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
        data-testid={`row-join-request-${req.id}`}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
            style={{ background: "var(--terra)" }}
          >
            {(req.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: "var(--ink)" }} data-testid={`text-join-name-${req.id}`}>{req.name}</span>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{ background: ss.bg, color: ss.color }}
              >
                {req.status}
              </span>
              {req.markedDone && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--muted-warm)" }}>Done</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap" style={{ color: "var(--muted-warm)" }}>
              <span data-testid={`text-join-phone-${req.id}`}>{req.phone}</span>
              <span>·</span>
              <span className="font-medium" style={{ color: "var(--terra)" }} data-testid={`text-join-club-${req.id}`}>{req.clubName}</span>
              <span>·</span>
              <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-1.5 items-end">
            {req.status === "pending" && (
              <>
                <button
                  onClick={() => approveMutation.mutate({ id: req.id, clubId: req.clubId })}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a" }}
                  data-testid={`button-approve-${req.id}`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate(req.id)}
                  disabled={rejectMutation.isPending}
                  className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap bg-destructive/10 text-destructive"
                  data-testid={`button-reject-${req.id}`}
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              </>
            )}
            {!req.markedDone && req.status !== "pending" && (
              <button
                onClick={() => markDoneMutation.mutate(req.id)}
                disabled={markDoneMutation.isPending}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: "var(--terra-pale)", color: "var(--terra)" }}
                data-testid={`button-mark-done-${req.id}`}
              >
                Mark Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5" data-testid="list-join-requests">
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display font-bold text-base" style={{ color: "var(--ink)" }}>Pending</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: "var(--terra)" }}
            >
              {pending.length}
            </span>
          </div>
          <div className="space-y-2">{pending.map(renderRequest)}</div>
        </div>
      )}
      {rest.length > 0 && (
        <div>
          {pending.length > 0 && (
            <h3 className="font-display font-bold text-base mb-3" style={{ color: "var(--ink)" }}>All Requests</h3>
          )}
          <div className="space-y-2">{rest.map(renderRequest)}</div>
        </div>
      )}
    </div>
  );
}

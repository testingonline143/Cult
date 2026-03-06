import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldAlert, Users, Activity, Ban, BarChart3, Calendar, MapPin, Search, ChevronDown, CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import type { JoinRequest, Club } from "@shared/schema";

interface AdminAnalytics {
  totalUsers: number;
  totalClubs: number;
  activeClubs: number;
  totalEvents: number;
  totalRsvps: number;
  totalCheckins: number;
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

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "clubs" | "users" | "events" | "joins">("analytics");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--warm-border)" }} />
          <div className="h-4 w-64 rounded-lg animate-pulse" style={{ background: "var(--warm-border)" }} />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto" style={{ borderRadius: 18 }}>
            <Shield className="w-8 h-8 text-[var(--terra)]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--terra)]" data-testid="text-admin-title">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access the admin dashboard</p>
          <a
            href="/api/login"
            className="inline-block w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold text-center"
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
    { key: "joins", label: "Requests" },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--terra)]" />
              <h1 className="font-display text-2xl font-bold text-[var(--terra)]" data-testid="text-admin-dashboard-title">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Platform oversight & management
              {user?.email && <span className="ml-2 text-xs">({user.email})</span>}
            </p>
          </div>
          <a href="/" className="text-sm text-[var(--terra)] hover:underline" data-testid="link-admin-home">&larr; Home</a>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-[var(--terra)] text-white shadow-[var(--warm-shadow)]" : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"}`}
              style={{ borderRadius: 18 }}
              data-testid={`tab-${tab.key}`}
            >
              {tab.label}
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
      <div className="w-16 h-16 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto" style={{ borderRadius: 18 }}>
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground" data-testid="text-access-denied">Access Denied</h2>
      <p className="text-sm text-muted-foreground">You don't have admin privileges.</p>
      <a href="/" className="inline-block text-sm text-[var(--terra)] hover:underline" data-testid="link-go-home">Go Home</a>
    </div>
  );
}

function AnalyticsTab() {
  const { data: analytics, isLoading, error } = useQuery<AdminAnalytics>({
    queryKey: ["/api/admin/analytics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <AccessDenied />;
  if (!analytics) return null;

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, color: "text-[var(--terra)]" },
    { label: "Total Clubs", value: analytics.totalClubs, color: "text-[var(--terra)]" },
    { label: "Active Clubs", value: analytics.activeClubs, color: "text-[var(--green-accent)]" },
    { label: "Total Events", value: analytics.totalEvents, color: "text-[var(--terra)]" },
    { label: "Total RSVPs", value: analytics.totalRsvps, color: "text-[var(--terra)]" },
    { label: "Check-ins", value: analytics.totalCheckins, color: "text-[var(--green-accent)]" },
  ];

  return (
    <div className="space-y-6" data-testid="section-analytics">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
            <div className={`text-2xl font-bold font-mono ${stat.color}`} data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {analytics.cityCounts.length > 0 && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-5" style={{ borderRadius: 18 }} data-testid="card-city-breakdown">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--terra)]" />
            Clubs by City
          </h3>
          <div className="space-y-2">
            {analytics.cityCounts.map((city) => (
              <div key={city.city} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{city.city}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-[var(--cream)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((city.count / Math.max(...analytics.cityCounts.map(c => c.count))) * 100)}%`,
                        background: "var(--terra)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--terra)] font-mono w-6 text-right">{city.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClubsMonitorTab() {
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
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <AccessDenied />;

  if (clubs.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-clubs">No clubs yet</div>;
  }

  const activeClubs = clubs.filter(c => c.isActive !== false);
  const inactiveClubs = clubs.filter(c => c.isActive === false);

  return (
    <div className="space-y-6" data-testid="list-admin-clubs">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-total-clubs">{clubs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Clubs</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--green-accent)] font-mono" data-testid="text-active-clubs">{activeClubs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Active</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-destructive font-mono" data-testid="text-inactive-clubs">{inactiveClubs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Deactivated</div>
        </div>
      </div>

      <div className="space-y-2">
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`flex items-center gap-4 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] ${club.isActive === false ? "opacity-50" : ""}`}
            style={{ borderRadius: 18 }}
            data-testid={`row-admin-club-${club.id}`}
          >
            <Link href={`/club/${club.id}`} className="text-2xl shrink-0">{club.emoji}</Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/club/${club.id}`}>
                  <span className="font-semibold text-sm text-foreground hover:text-[var(--terra)] transition-colors" data-testid={`text-admin-club-name-${club.id}`}>{club.name}</span>
                </Link>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <span className="text-xs text-muted-foreground">{club.category}</span>
                {club.isActive === false && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-destructive/20 text-destructive rounded-md">
                    Deactivated
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.organizerName}</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {club.memberCount} members</span>
                <span>{club.city}</span>
                {club.createdAt && (
                  <span>
                    Created {new Date(club.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {club.isActive === false ? (
                <button
                  onClick={() => activateMutation.mutate(club.id)}
                  disabled={activateMutation.isPending}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra-pale)] text-[var(--terra)] transition-all whitespace-nowrap"
                  data-testid={`button-activate-${club.id}`}
                >
                  Activate
                </button>
              ) : (
                <button
                  onClick={() => deactivateMutation.mutate(club.id)}
                  disabled={deactivateMutation.isPending}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-destructive/10 text-destructive transition-all whitespace-nowrap"
                  data-testid={`button-deactivate-${club.id}`}
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
        ))}
      </div>
    );
  }

  if (error) return <AccessDenied />;

  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u =>
        (u.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers;

  const roleColors: Record<string, string> = {
    admin: "bg-[var(--terra)] text-white",
    organiser: "bg-[var(--terra-pale)] text-[var(--terra)]",
    user: "bg-[var(--cream)] text-muted-foreground",
  };

  return (
    <div className="space-y-4" data-testid="section-admin-users">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--warm-white)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
            data-testid="input-search-users"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{filteredUsers.length} users</span>
      </div>

      <div className="space-y-2">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-4 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)]"
            style={{ borderRadius: 18 }}
            data-testid={`row-admin-user-${u.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground" data-testid={`text-user-name-${u.id}`}>
                  {u.firstName || "No Name"}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${roleColors[u.role || "user"]}`}>
                  {u.role || "user"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
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
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--cream)] border-[1.5px] border-[var(--warm-border)] text-foreground focus:outline-none cursor-pointer"
                data-testid={`select-role-${u.id}`}
              >
                <option value="user">User</option>
                <option value="organiser">Organiser</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground" data-testid="text-no-users">
          {searchQuery ? "No users match your search" : "No users yet"}
        </div>
      )}
    </div>
  );
}

function EventsTab() {
  const { toast } = useToast();
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
        ))}
      </div>
    );
  }

  if (error) return <AccessDenied />;

  if (allEvents.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-events">No events yet</div>;
  }

  const now = new Date();

  return (
    <div className="space-y-4" data-testid="section-admin-events">
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono">{allEvents.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Events</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--green-accent)] font-mono">{allEvents.filter(e => new Date(e.startsAt) > now && !e.isCancelled).length}</div>
          <div className="text-xs text-muted-foreground mt-1">Upcoming</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono">{allEvents.reduce((sum, e) => sum + e.rsvpCount, 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Total RSVPs</div>
        </div>
      </div>

      <div className="space-y-2">
        {allEvents.map((event) => {
          const d = new Date(event.startsAt);
          const isPast = d < now;
          const attendanceRate = event.rsvpCount > 0 ? Math.round((event.checkedInCount / event.rsvpCount) * 100) : 0;

          return (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="block"
            >
              <div
                className={`flex items-center gap-4 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] transition-all hover:border-[rgba(196,98,45,0.3)] ${event.isCancelled ? "opacity-50" : isPast ? "opacity-60" : ""}`}
                style={{ borderRadius: 18 }}
                data-testid={`row-admin-event-${event.id}`}
              >
                <div className="text-2xl shrink-0">{event.clubEmoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{event.title}</span>
                    {event.isCancelled && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-destructive/20 text-destructive rounded-md flex items-center gap-0.5">
                        <Ban className="w-2.5 h-2.5" /> Cancelled
                      </span>
                    )}
                    {!event.isCancelled && isPast && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md text-muted-foreground">Past</span>
                    )}
                    {!event.isCancelled && !isPast && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[var(--green-accent)]/10 text-[var(--green-accent)] rounded-md">Upcoming</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{event.clubName}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} &middot; {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.rsvpCount}/{event.maxCapacity}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right flex items-center gap-2">
                  {isPast && event.rsvpCount > 0 && (
                    <div>
                      <div className="text-sm font-bold text-[var(--terra)] font-mono">{attendanceRate}%</div>
                      <div className="text-[10px] text-muted-foreground">{event.checkedInCount}/{event.rsvpCount} attended</div>
                    </div>
                  )}
                  {!isPast && !event.isCancelled && (
                    <div className="text-sm font-bold text-[var(--terra)] font-mono">{event.rsvpCount}</div>
                  )}
                  {!isPast && !event.isCancelled && (
                    confirmingCancel === event.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={(e) => { e.preventDefault(); cancelEventMutation.mutate(event.id); }}
                          disabled={cancelEventMutation.isPending}
                          className="text-[10px] font-semibold px-2 py-1 rounded-md bg-destructive/10 text-destructive transition-all whitespace-nowrap"
                          data-testid={`button-confirm-cancel-event-${event.id}`}
                        >
                          {cancelEventMutation.isPending ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); setConfirmingCancel(null); }}
                          className="text-[10px] font-semibold px-2 py-1 rounded-md bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground transition-all whitespace-nowrap"
                          data-testid={`button-undo-cancel-event-${event.id}`}
                        >
                          Back
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.preventDefault(); setConfirmingCancel(event.id); }}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-destructive/10 text-destructive transition-all whitespace-nowrap"
                        data-testid={`button-cancel-event-${event.id}`}
                      >
                        Cancel
                      </button>
                    )
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function JoinRequestsTab() {
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
        ))}
      </div>
    );
  }

  if (error) return <AccessDenied />;

  if (requests.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-join-requests">No join requests yet</div>;
  }

  return (
    <div className="space-y-2" data-testid="list-join-requests">
      {requests.map((req) => (
        <div
          key={req.id}
          className={`flex items-center gap-4 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] ${req.markedDone ? "opacity-40" : ""}`}
          style={{ borderRadius: 18 }}
          data-testid={`row-join-request-${req.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground" data-testid={`text-join-name-${req.id}`}>{req.name}</span>
              <span className="text-xs text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground" data-testid={`text-join-phone-${req.id}`}>{req.phone}</span>
              {(req as any).status && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  (req as any).status === "approved" ? "bg-[var(--green-accent)]/10 text-[var(--green-accent)]" :
                  (req as any).status === "rejected" ? "bg-destructive/10 text-destructive" :
                  "bg-[var(--gold)]/10 text-[var(--gold)]"
                }`}>
                  {(req as any).status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-[var(--terra)]" data-testid={`text-join-club-${req.id}`}>{req.clubName}</span>
              <span className="text-xs text-muted-foreground">
                {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"}
              </span>
            </div>
          </div>
          {!req.markedDone && (
            <button
              onClick={() => markDoneMutation.mutate(req.id)}
              disabled={markDoneMutation.isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra-pale)] text-[var(--terra)] transition-all whitespace-nowrap"
              data-testid={`button-mark-done-${req.id}`}
            >
              Mark as Done
            </button>
          )}
          {req.markedDone && (
            <span className="text-xs font-semibold text-muted-foreground" data-testid={`text-done-${req.id}`}>Done</span>
          )}
        </div>
      ))}
    </div>
  );
}

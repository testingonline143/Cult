import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Calendar, MapPin, Users, QrCode, Check, Copy, LayoutDashboard, Loader2, Plus, Pencil, Trash2, Clock, X, UserMinus, CheckCircle2, XCircle, Clock3, Ban, AlertTriangle, Link2, Zap, BarChart3, Download, ArrowRight, TrendingUp } from "lucide-react";
import type { Club, JoinRequest, Event, EventRsvp, ClubFaq, ClubScheduleEntry, ClubMoment } from "@shared/schema";

export default function Organizer() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "insights" | "events" | "content" | "edit">("overview");
  const [selectedClubIndex, setSelectedClubIndex] = useState(0);

  const { data: clubs = [], isLoading, error } = useQuery<Club[]>({
    queryKey: ["/api/organizer/my-clubs"],
    queryFn: async () => {
      const res = await fetch("/api/organizer/my-clubs", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 403) return [];
        throw new Error("Failed to fetch clubs");
      }
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const club = clubs.length > 0 ? clubs[selectedClubIndex] || clubs[0] : null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto" style={{ borderRadius: 18 }}>
            <LayoutDashboard className="w-8 h-8 text-[var(--terra)]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--terra)]" data-testid="text-organizer-title">Organizer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access your club dashboard</p>
          <button
            onClick={() => { window.location.href = "/api/login"; }}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold"
            data-testid="button-organizer-sign-in"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="h-7 w-48 rounded-lg animate-pulse" style={{ background: "var(--warm-border)" }} />
          <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: "var(--warm-border)" }} />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || clubs.length === 0 || !club) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto" style={{ borderRadius: 18 }}>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--terra)]" data-testid="text-no-club-title">No Clubs Yet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You haven't created any clubs yet. Create one to get started!
          </p>
          <button
            onClick={() => navigate("/create")}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold"
            data-testid="button-go-create-club"
          >
            Create a Club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--terra)]" data-testid="text-organizer-dashboard">
              {club.emoji} {club.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Organizer Dashboard</p>
          </div>
        </div>

        {clubs.length > 1 && (
          <div className="mb-6" data-testid="section-club-switcher">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Switch Club</label>
            <div className="flex gap-2 overflow-x-auto flex-wrap">
              {clubs.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClubIndex(index); setActiveTab("overview"); }}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedClubIndex === index
                      ? "bg-[var(--terra)] text-white shadow-[var(--warm-shadow)]"
                      : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
                  }`}
                  style={{ borderRadius: 18 }}
                  data-testid={`button-switch-club-${c.id}`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <RequestsTabBar activeTab={activeTab} setActiveTab={setActiveTab} clubId={club.id} />

        {activeTab === "overview" && <ClubOverview club={club} setActiveTab={setActiveTab} />}
        {activeTab === "requests" && <OrganizerRequests clubId={club.id} />}
        {activeTab === "insights" && <OrganizerInsights clubId={club.id} />}
        {activeTab === "events" && <OrganizerEvents clubId={club.id} />}
        {activeTab === "content" && <ContentManager clubId={club.id} />}
        {activeTab === "edit" && <EditClub club={club} />}
      </div>
    </div>
  );
}

function ClubOverview({ club, setActiveTab }: { club: Club; setActiveTab: (tab: "overview" | "requests" | "insights" | "events" | "content" | "edit") => void }) {
  const healthColors: Record<string, string> = {
    green: "text-[var(--green-accent)] bg-[var(--green-accent)]/10",
    yellow: "text-chart-4 bg-chart-4/10",
    red: "text-destructive bg-destructive/10",
  };

  const { data: pendingData } = useQuery<{ count: number }>({
    queryKey: ["/api/organizer/clubs", club.id, "pending-count"],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/clubs/${club.id}/pending-count`, { credentials: "include" });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
  });

  const { data: clubEvents = [] } = useQuery<(Event & { rsvpCount: number })[]>({
    queryKey: ["/api/clubs", club.id, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/events`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pendingCount = pendingData?.count ?? 0;
  const now = new Date();
  const nextEvent = clubEvents
    .filter(e => !e.isCancelled && new Date(e.startsAt) > now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] || null;

  return (
    <div className="space-y-4" data-testid="section-club-overview">
      <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-5" style={{ borderRadius: 18 }} data-testid="card-club-overview">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-md flex items-center justify-center text-3xl shrink-0"
            style={{ backgroundColor: club.bgColor || undefined, borderRadius: 14 }}
          >
            {club.emoji}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-[var(--terra)]">{club.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{club.shortDesc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-overview-members">{club.memberCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Members</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-md ${healthColors[club.healthStatus] || healthColors.green}`} data-testid="text-overview-health">
            {club.healthLabel}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Health Status</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-overview-founding">
            {club.foundingTaken ?? 0}/{club.foundingTotal ?? 20}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Founding Spots</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-sm font-medium text-foreground" data-testid="text-overview-schedule">{club.schedule}</div>
          <div className="text-xs text-muted-foreground mt-1">Schedule</div>
        </div>
      </div>

      <div className="space-y-2" data-testid="section-quick-actions">
        <h3 className="font-display text-sm font-bold text-[var(--terra)] uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => setActiveTab("requests")}
              className="w-full bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 flex items-center gap-3 text-left"
              style={{ borderRadius: 18 }}
              data-testid="quick-action-pending-requests"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-chart-4/15 shrink-0" style={{ borderRadius: 12 }}>
                <Clock3 className="w-5 h-5 text-chart-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{pendingCount} Pending Request{pendingCount !== 1 ? "s" : ""}</div>
                <div className="text-xs text-muted-foreground">Review and approve new members</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          )}

          <button
            onClick={() => setActiveTab("events")}
            className="w-full bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 flex items-center gap-3 text-left"
            style={{ borderRadius: 18 }}
            data-testid="quick-action-create-event"
          >
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--terra)]/10 shrink-0" style={{ borderRadius: 12 }}>
              <Plus className="w-5 h-5 text-[var(--terra)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">Create Event</div>
              <div className="text-xs text-muted-foreground">Schedule a new activity for your club</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>

          {nextEvent && (
            <div
              className="w-full bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 flex items-center gap-3"
              style={{ borderRadius: 18 }}
              data-testid="quick-action-next-event"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--green-accent)]/10 shrink-0" style={{ borderRadius: 12 }}>
                <Calendar className="w-5 h-5 text-[var(--green-accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{nextEvent.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(nextEvent.startsAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  {" · "}
                  {new Date(nextEvent.startsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {nextEvent.rsvpCount} RSVP{nextEvent.rsvpCount !== 1 ? "s" : ""}
                </div>
              </div>
              <Link
                href={`/scan-event?eventId=${nextEvent.id}`}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra)] text-white whitespace-nowrap shrink-0"
                data-testid="link-scan-next-event"
              >
                <QrCode className="w-3 h-3" />
                Scan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestsTabBar({ activeTab, setActiveTab, clubId }: { activeTab: string; setActiveTab: (tab: "overview" | "requests" | "insights" | "events" | "content" | "edit") => void; clubId: string }) {
  const { data: requests = [] } = useQuery<JoinRequest[]>({
    queryKey: ["/api/organizer/join-requests", clubId],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/join-requests/${clubId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const tabs = ["overview", "requests", "insights", "events", "content", "edit"] as const;
  const tabLabels: Record<string, string> = {
    overview: "Overview",
    requests: "Requests",
    insights: "Insights",
    events: "Events",
    content: "Content",
    edit: "Edit Club",
  };

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${activeTab === tab ? "bg-[var(--terra)] text-white shadow-[var(--warm-shadow)]" : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"}`}
          style={{ borderRadius: 18 }}
          data-testid={`tab-organizer-${tab}`}
        >
          {tabLabels[tab]}
          {tab === "requests" && pendingCount > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${activeTab === tab ? "bg-white text-[var(--terra)]" : "bg-[var(--terra)] text-white"}`}
              data-testid="badge-pending-requests"
            >
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface InsightsData {
  totalMembers: number;
  pendingRequests: number;
  totalEvents: number;
  avgAttendanceRate: number;
  topEvent: { title: string; attended: number; total: number } | null;
  recentJoins: { name: string; date: string | null }[];
  recentRsvps: { userName: string; eventTitle: string; date: string | null }[];
}

function OrganizerInsights({ clubId }: { clubId: string }) {
  const { data: insights, isLoading } = useQuery<InsightsData>({
    queryKey: ["/api/organizer/clubs", clubId, "insights"],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/clubs/${clubId}/insights`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  if (!insights) return (
    <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-insights">
      Unable to load insights.
    </div>
  );

  return (
    <div className="space-y-4" data-testid="section-organizer-insights">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-insight-members">{insights.totalMembers}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Members</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-chart-4 font-mono" data-testid="text-insight-pending">{insights.pendingRequests}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending Requests</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-insight-events">{insights.totalEvents}</div>
          <div className="text-xs text-muted-foreground mt-1">Events Created</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--green-accent)] font-mono" data-testid="text-insight-attendance">{insights.avgAttendanceRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">Avg Attendance</div>
        </div>
      </div>

      {insights.topEvent && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }} data-testid="card-top-event">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[var(--terra)]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Most Popular Event</span>
          </div>
          <div className="font-semibold text-sm text-foreground" data-testid="text-top-event-title">{insights.topEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5" data-testid="text-top-event-stats">
            {insights.topEvent.attended} attended out of {insights.topEvent.total} RSVPs
          </div>
        </div>
      )}

      <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }} data-testid="card-recent-activity">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[var(--terra)]" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Member Joins</span>
        </div>
        {insights.recentJoins.length === 0 ? (
          <div className="text-xs text-muted-foreground">No recent joins</div>
        ) : (
          <div className="space-y-2">
            {insights.recentJoins.map((join, i) => (
              <div key={i} className="flex items-center justify-between gap-2" data-testid={`recent-join-${i}`}>
                <span className="text-sm text-foreground">{join.name}</span>
                <span className="text-xs text-muted-foreground">
                  {join.date ? new Date(join.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }} data-testid="card-recent-rsvps">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[var(--terra)]" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent RSVPs</span>
        </div>
        {insights.recentRsvps.length === 0 ? (
          <div className="text-xs text-muted-foreground">No recent RSVPs</div>
        ) : (
          <div className="space-y-2">
            {insights.recentRsvps.map((rsvp, i) => (
              <div key={i} className="flex items-center justify-between gap-2" data-testid={`recent-rsvp-${i}`}>
                <div className="min-w-0">
                  <span className="text-sm text-foreground">{rsvp.userName}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">for {rsvp.eventTitle}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {rsvp.date ? new Date(rsvp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrganizerRequests({ clubId }: { clubId: string }) {
  const [viewFilter, setViewFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const { data: requests = [], isLoading } = useQuery<JoinRequest[]>({
    queryKey: ["/api/organizer/join-requests", clubId],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/join-requests/${clubId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/organizer/join-requests/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/join-requests", clubId] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/my-clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/organizer/join-requests/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/join-requests", clubId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest("DELETE", `/api/organizer/clubs/${clubId}/members/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/join-requests", clubId] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/my-clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
    },
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  const pending = requests.filter(r => r.status === "pending");
  const approved = requests.filter(r => r.status === "approved");
  const rejected = requests.filter(r => r.status === "rejected");

  const filteredRequests = viewFilter === "all" ? requests
    : viewFilter === "pending" ? pending
    : viewFilter === "approved" ? approved
    : rejected;

  const filterOptions = [
    { key: "pending" as const, label: "Pending", count: pending.length },
    { key: "approved" as const, label: "Members", count: approved.length },
    { key: "rejected" as const, label: "Rejected", count: rejected.length },
    { key: "all" as const, label: "All", count: requests.length },
  ];

  const handleDownloadMembers = () => {
    const members = requests.filter(r => r.status === "approved");
    if (members.length === 0) return;
    const header = "Name,Phone,Join Date";
    const rows = members.map(m => {
      const name = `"${(m.name || "").replace(/"/g, '""')}"`;
      const phone = `"${(m.phone || "").replace(/"/g, '""')}"`;
      const joinDate = m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
      return `${name},${phone},${joinDate}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "members.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4" data-testid="list-organizer-requests">
      <div className="flex gap-2 overflow-x-auto flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setViewFilter(opt.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
              viewFilter === opt.key
                ? "bg-[var(--terra-pale)] text-[var(--terra)] border-[1.5px] border-[rgba(196,98,45,0.3)]"
                : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
            }`}
            style={{ borderRadius: 14 }}
            data-testid={`filter-requests-${opt.key}`}
          >
            {opt.label}
            <span className={`inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold ${
              viewFilter === opt.key ? "bg-[var(--terra)] text-white" : "bg-muted text-muted-foreground"
            }`}>
              {opt.count}
            </span>
          </button>
        ))}
        {viewFilter === "approved" && approved.length > 0 && (
          <button
            onClick={handleDownloadMembers}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 bg-[var(--terra)] text-white ml-auto"
            style={{ borderRadius: 14 }}
            data-testid="button-download-members"
          >
            <Download className="w-3 h-3" />
            Download CSV
          </button>
        )}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground" data-testid="text-no-requests">
          {viewFilter === "pending" ? "No pending requests" : viewFilter === "approved" ? "No approved members yet" : viewFilter === "rejected" ? "No rejected requests" : "No join requests yet"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)]"
              style={{ borderRadius: 18 }}
              data-testid={`row-request-${req.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground" data-testid={`text-request-name-${req.id}`}>{req.name}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        req.status === "pending"
                          ? "bg-chart-4/15 text-chart-4"
                          : req.status === "approved"
                          ? "bg-[var(--green-accent)]/15 text-[var(--green-accent)]"
                          : "bg-destructive/15 text-destructive"
                      }`}
                      data-testid={`badge-status-${req.id}`}
                    >
                      {req.status === "pending" && <Clock3 className="w-2.5 h-2.5" />}
                      {req.status === "approved" && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {req.status === "rejected" && <XCircle className="w-2.5 h-2.5" />}
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{req.phone}</div>
                  <div className="text-xs text-muted-foreground">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveMutation.mutate(req.id)}
                        disabled={approveMutation.isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--green-accent)]/15 text-[var(--green-accent)] transition-all whitespace-nowrap inline-flex items-center gap-1"
                        data-testid={`button-approve-${req.id}`}
                      >
                        {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(req.id)}
                        disabled={rejectMutation.isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-destructive/10 text-destructive transition-all whitespace-nowrap inline-flex items-center gap-1"
                        data-testid={`button-reject-${req.id}`}
                      >
                        {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                        Reject
                      </button>
                    </>
                  )}
                  {req.status === "approved" && (
                    <button
                      onClick={() => {
                        if (confirm("Remove this member from the club?")) {
                          removeMemberMutation.mutate(req.id);
                        }
                      }}
                      disabled={removeMemberMutation.isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-md bg-destructive/10 text-destructive transition-all whitespace-nowrap inline-flex items-center gap-1"
                      data-testid={`button-remove-member-${req.id}`}
                    >
                      {removeMemberMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrganizerEvents({ clubId }: { clubId: string }) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [locationText, setLocationText] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("20");
  const [createError, setCreateError] = useState("");
  const [duplicatingFrom, setDuplicatingFrom] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { data: events = [], isLoading } = useQuery<(Event & { rsvpCount: number })[]>({
    queryKey: ["/api/clubs", clubId, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/events`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; startsAt: string; locationText: string; maxCapacity: number }) => {
      const res = await apiRequest("POST", `/api/clubs/${clubId}/events`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      resetForm();
      setShowCreate(false);
    },
    onError: (err: Error) => {
      setCreateError(err.message || "Failed to create event");
    },
  });

  const handleDuplicate = (event: Event & { rsvpCount: number }) => {
    setTitle(event.title);
    setDescription(event.description || "");
    setLocationText(event.locationText);
    setMaxCapacity(String(event.maxCapacity));
    setStartsAt("");
    setCreateError("");
    setDuplicatingFrom(event.title);
    setShowCreate(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartsAt("");
    setLocationText("");
    setMaxCapacity("20");
    setCreateError("");
    setDuplicatingFrom(null);
  };

  const clearDuplicate = () => {
    resetForm();
  };

  const handleCreate = () => {
    if (!title.trim() || !startsAt || !locationText.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      startsAt,
      locationText: locationText.trim(),
      maxCapacity: parseInt(maxCapacity) || 20,
    });
  };

  if (isLoading) return (
    <div className="space-y-3">
      <div className="h-12 rounded-md animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      {[1, 2].map((i) => (
        <div key={i} className="h-32 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4" data-testid="section-organizer-events">
      <button
        onClick={() => {
          if (showCreate) {
            resetForm();
            setShowCreate(false);
          } else {
            resetForm();
            setShowCreate(true);
          }
        }}
        className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold"
        data-testid="button-create-event"
      >
        {showCreate ? "Cancel" : "+ Create Event"}
      </button>

      {showCreate && (
        <div ref={formRef} className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 space-y-3" style={{ borderRadius: 18 }} data-testid="form-create-event">
          {duplicatingFrom && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[var(--terra-pale)] border border-[rgba(196,98,45,0.3)]" data-testid="banner-duplicating">
              <div className="flex items-center gap-2 min-w-0">
                <Copy className="w-3.5 h-3.5 text-[var(--terra)] shrink-0" />
                <span className="text-xs font-medium text-[var(--terra)] truncate">Duplicating: {duplicatingFrom}</span>
              </div>
              <button
                onClick={clearDuplicate}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                data-testid="button-clear-duplicate"
              >
                Clear
              </button>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Event Title</label>
            <input
              type="text"
              placeholder="Weekend Trek to Talakona"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid="input-event-title"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              placeholder="What's this event about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
              data-testid="input-event-desc"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid="input-event-datetime"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Max Capacity</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                min="2"
                max="500"
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid="input-event-capacity"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label>
            <input
              type="text"
              placeholder="Sri Venkateswara University Ground"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid="input-event-location"
            />
          </div>
          {createError && <p className="text-xs text-destructive font-medium text-center" data-testid="text-event-error">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending || !title.trim() || !startsAt || !locationText.trim()}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
            data-testid="button-submit-event"
          >
            {createMutation.isPending ? "Creating..." : "Create Event"}
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground" data-testid="text-no-events">
          No events yet. Create one to engage your members!
        </div>
      ) : (
        <div className="space-y-2">
          {(() => {
            const now = new Date();
            const todayStr = now.toDateString();
            const todayEvents = events.filter((e) => !e.isCancelled && new Date(e.startsAt).toDateString() === todayStr);
            const otherEvents = events.filter((e) => e.isCancelled || new Date(e.startsAt).toDateString() !== todayStr);
            return (
              <>
                {todayEvents.map((event) => (
                  <EventTodayBanner key={`today-${event.id}`} event={event} />
                ))}
                {otherEvents.map((event) => (
                  <EventCard key={event.id} event={event} clubId={clubId} onDuplicate={handleDuplicate} />
                ))}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function EventTodayBanner({ event }: { event: Event & { rsvpCount: number } }) {
  const d = new Date(event.startsAt);
  const { toast } = useToast();

  const copyLink = () => {
    const url = `${window.location.origin}/scan/${event.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Scanner link copied!" });
    }).catch(() => {
      toast({ title: "Could not copy link", variant: "destructive" });
    });
  };

  return (
    <div
      className="relative overflow-hidden p-5"
      style={{
        borderRadius: 18,
        background: "linear-gradient(135deg, var(--ink) 0%, #2d1810 100%)",
      }}
      data-testid={`banner-event-today-${event.id}`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--terra)] text-white text-[10px] font-bold uppercase tracking-wider">
        <Zap className="w-3 h-3" />
        Today
      </div>

      <div className="mb-4">
        <h3 className="font-display text-lg font-bold text-white pr-16" data-testid={`text-today-event-title-${event.id}`}>
          {event.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-white/60 mt-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {event.locationText}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {event.rsvpCount}/{event.maxCapacity} RSVPs
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/scan/${event.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-[var(--terra)] text-white rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98]"
          data-testid={`button-today-checkin-${event.id}`}
        >
          <QrCode className="w-5 h-5" />
          Check In Attendees
        </Link>
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-semibold bg-white/10 text-white/80 transition-all active:scale-[0.98]"
          data-testid={`button-today-copy-link-${event.id}`}
        >
          <Link2 className="w-3.5 h-3.5" />
          Share
        </button>
      </div>
    </div>
  );
}

type AttendeeData = EventRsvp & { userName: string | null; checkedIn: boolean | null; checkedInAt: Date | null };

function EventCard({ event, clubId, onDuplicate }: { event: Event & { rsvpCount: number }; clubId: string; onDuplicate: (event: Event & { rsvpCount: number }) => void }) {
  const [showAttendees, setShowAttendees] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { toast } = useToast();
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDescription, setEditDescription] = useState(event.description || "");
  const [editStartsAt, setEditStartsAt] = useState(() => {
    const d = new Date(event.startsAt);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [editLocationText, setEditLocationText] = useState(event.locationText);
  const [editMaxCapacity, setEditMaxCapacity] = useState(String(event.maxCapacity));
  const [editError, setEditError] = useState("");

  const d = new Date(event.startsAt);
  const isPast = d < new Date();
  const isCancelled = event.isCancelled;

  const { data: attendeeData } = useQuery<{ attendees: AttendeeData[]; checkedInCount: number; totalRsvps: number }>({
    queryKey: ["/api/events", event.id, "attendees"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event.id}/attendees`, {
        credentials: "include",
      });
      if (!res.ok) return { attendees: [], checkedInCount: 0, totalRsvps: 0 };
      return res.json();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; startsAt: string; locationText: string; maxCapacity: number }) => {
      const res = await apiRequest("PATCH", `/api/clubs/${clubId}/events/${event.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEditForm(false);
      setEditError("");
    },
    onError: (err: Error) => {
      setEditError(err.message || "Failed to update event");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/clubs/${clubId}/events/${event.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowCancelConfirm(false);
    },
  });

  const handleEditSubmit = () => {
    if (!editTitle.trim() || !editStartsAt || !editLocationText.trim()) return;
    editMutation.mutate({
      title: editTitle.trim(),
      description: editDescription.trim(),
      startsAt: editStartsAt,
      locationText: editLocationText.trim(),
      maxCapacity: parseInt(editMaxCapacity) || 20,
    });
  };

  const checkedInCount = attendeeData?.checkedInCount ?? 0;
  const totalRsvps = attendeeData?.totalRsvps ?? event.rsvpCount;
  const attendees = attendeeData?.attendees ?? [];

  return (
    <div
      className={`bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 ${isCancelled ? "opacity-50" : isPast ? "opacity-50" : ""}`}
      style={{ borderRadius: 18 }}
      data-testid={`event-card-${event.id}`}
    >
      <div className="mb-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm text-foreground">{event.title}</span>
          {isCancelled && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-destructive/15 text-destructive" data-testid={`badge-cancelled-${event.id}`}>
              <Ban className="w-2.5 h-2.5" />
              Cancelled
            </span>
          )}
          {!isCancelled && isPast && <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md text-muted-foreground">Past</span>}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="mb-3 p-3 rounded-md bg-destructive/10 border border-destructive/30" data-testid={`confirm-cancel-event-${event.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Cancel this event?</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">This will mark the event as cancelled. Attendees will see it as cancelled.</p>
          <div className="flex gap-2">
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex-1 py-2 rounded-md text-xs font-semibold bg-destructive text-white disabled:opacity-50"
              data-testid={`button-confirm-cancel-${event.id}`}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Event"}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 py-2 rounded-md text-xs font-semibold bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
              data-testid={`button-dismiss-cancel-${event.id}`}
            >
              Keep Event
            </button>
          </div>
        </div>
      )}

      {showEditForm && (
        <div className="mb-3 p-3 rounded-md bg-[var(--cream)] border-[1.5px] border-[var(--warm-border)] space-y-3" data-testid={`form-edit-event-${event.id}`}>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Event Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--warm-white)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid={`input-edit-event-title-${event.id}`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--warm-white)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
              data-testid={`input-edit-event-desc-${event.id}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
              <input
                type="datetime-local"
                value={editStartsAt}
                onChange={(e) => setEditStartsAt(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--warm-white)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid={`input-edit-event-datetime-${event.id}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Max Capacity</label>
              <input
                type="number"
                value={editMaxCapacity}
                onChange={(e) => setEditMaxCapacity(e.target.value)}
                min="2"
                max="500"
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--warm-white)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid={`input-edit-event-capacity-${event.id}`}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label>
            <input
              type="text"
              value={editLocationText}
              onChange={(e) => setEditLocationText(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--warm-white)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid={`input-edit-event-location-${event.id}`}
            />
          </div>
          {editError && <p className="text-xs text-destructive font-medium text-center" data-testid={`text-edit-event-error-${event.id}`}>{editError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleEditSubmit}
              disabled={editMutation.isPending || !editTitle.trim() || !editStartsAt || !editLocationText.trim()}
              className="flex-1 bg-[var(--terra)] text-white rounded-md py-2.5 text-sm font-semibold disabled:opacity-50"
              data-testid={`button-submit-edit-event-${event.id}`}
            >
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => { setShowEditForm(false); setEditError(""); }}
              className="px-4 py-2.5 rounded-md text-sm font-semibold bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
              data-testid={`button-cancel-edit-event-${event.id}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {event.description && (
        <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} &middot; {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {event.locationText}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {event.rsvpCount}/{event.maxCapacity}
        </span>
      </div>

      {!isCancelled && !isPast && (
        <div className="mt-3 pt-3 border-t border-[var(--warm-border)]">
          <div className="flex gap-2 mb-2">
            <Link
              href={`/scan/${event.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--terra)] text-white rounded-xl py-2.5 text-sm font-bold transition-all active:scale-[0.98]"
              data-testid={`button-scan-attendees-${event.id}`}
            >
              <QrCode className="w-4 h-4" />
              Scan & Check In
            </Link>
            <button
              onClick={() => {
                const url = `${window.location.origin}/scan/${event.id}`;
                navigator.clipboard.writeText(url).then(() => {
                  toast({ title: "Scanner link copied!" });
                }).catch(() => {
                  toast({ title: "Could not copy link", variant: "destructive" });
                });
              }}
              className="flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-semibold bg-[var(--terra-pale)] text-[var(--terra)] transition-all active:scale-[0.98]"
              data-testid={`button-copy-scan-link-${event.id}`}
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--cream)] text-muted-foreground"
              data-testid={`button-edit-event-${event.id}`}
            >
              <Pencil className="w-2.5 h-2.5" />
              Edit
            </button>
            <button
              onClick={() => onDuplicate(event)}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--cream)] text-muted-foreground"
              data-testid={`button-duplicate-${event.id}`}
            >
              <Copy className="w-2.5 h-2.5" />
              Duplicate
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--cream)] text-destructive/70"
              data-testid={`button-cancel-event-${event.id}`}
            >
              <Ban className="w-2.5 h-2.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isCancelled && isPast && (
        <div className="mt-3 pt-3 border-t border-[var(--warm-border)]">
          <div className="mb-2" data-testid={`summary-attendance-${event.id}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground" data-testid={`text-attendance-stats-${event.id}`}>
                {checkedInCount} of {totalRsvps} attended
              </span>
              <span className="text-xs font-bold text-[var(--terra)]">
                {totalRsvps > 0 ? Math.round((checkedInCount / totalRsvps) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--cream)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${totalRsvps > 0 ? Math.round((checkedInCount / totalRsvps) * 100) : 0}%`,
                  background: "var(--terra)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onDuplicate(event)}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--cream)] text-muted-foreground"
              data-testid={`button-duplicate-${event.id}`}
            >
              <Copy className="w-2.5 h-2.5" />
              Duplicate
            </button>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mt-3 pt-3 border-t border-[var(--warm-border)]">
          <button
            onClick={() => onDuplicate(event)}
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--cream)] text-muted-foreground"
            data-testid={`button-duplicate-${event.id}`}
          >
            <Copy className="w-2.5 h-2.5" />
            Duplicate
          </button>
        </div>
      )}

      {!isCancelled && (
        <div className="mt-2">
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
            data-testid={`button-toggle-attendees-${event.id}`}
          >
            <Users className="w-3 h-3" />
            <span>{showAttendees ? "Hide" : "Show"} attendees ({totalRsvps})</span>
          </button>
          {showAttendees && (
            <div className="mt-2 space-y-1" data-testid={`list-attendees-${event.id}`}>
              {attendees.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2" data-testid={`text-no-attendees-${event.id}`}>No attendees yet</div>
              ) : (
                attendees.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md"
                    data-testid={`attendee-row-${a.id}`}
                  >
                    {a.checkedIn ? (
                      <Check className="w-3.5 h-3.5 text-[var(--terra)]" data-testid={`icon-checked-in-${a.id}`} />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-muted-foreground/30" data-testid={`icon-not-checked-in-${a.id}`} />
                    )}
                    <span className="text-xs text-foreground" data-testid={`text-attendee-name-${a.id}`}>
                      {a.userName || "Anonymous"}
                    </span>
                    {a.checkedIn && (
                      <span className="text-[10px] text-[var(--terra)] ml-auto" data-testid={`text-checkin-status-${a.id}`}>
                        Checked in
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContentManager({ clubId }: { clubId: string }) {
  const [activeSection, setActiveSection] = useState<"faqs" | "schedule" | "moments">("faqs");

  return (
    <div className="space-y-4" data-testid="section-content-manager">
      <div className="flex gap-2 flex-wrap">
        {(["faqs", "schedule", "moments"] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === section
                ? "bg-[var(--terra-pale)] text-[var(--terra)] border-[1.5px] border-[rgba(196,98,45,0.3)]"
                : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
            }`}
            style={{ borderRadius: 18 }}
            data-testid={`tab-content-${section}`}
          >
            {section === "faqs" ? "FAQs" : section === "schedule" ? "Schedule" : "Moments"}
          </button>
        ))}
      </div>

      {activeSection === "faqs" && <FaqsManager clubId={clubId} />}
      {activeSection === "schedule" && <ScheduleManager clubId={clubId} />}
      {activeSection === "moments" && <MomentsManager clubId={clubId} />}
    </div>
  );
}

function FaqsManager({ clubId }: { clubId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const { data: faqs = [], isLoading } = useQuery<ClubFaq[]>({
    queryKey: ["/api/clubs", clubId, "faqs"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/faqs`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      const res = await apiRequest("POST", `/api/clubs/${clubId}/faqs`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "faqs"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { question: string; answer: string } }) => {
      const res = await apiRequest("PATCH", `/api/clubs/${clubId}/faqs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "faqs"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clubs/${clubId}/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "faqs"] });
    },
  });

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (faq: ClubFaq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { question: question.trim(), answer: answer.trim() } });
    } else {
      createMutation.mutate({ question: question.trim(), answer: answer.trim() });
    }
  };

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-3" data-testid="section-faqs-manager">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display text-base font-bold text-[var(--terra)]">FAQs</h3>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra)] text-white"
          data-testid="button-add-faq"
        >
          <Plus className="w-3 h-3" />
          {showForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 space-y-3" style={{ borderRadius: 18 }} data-testid="form-faq">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Question</label>
            <input
              type="text"
              placeholder="e.g. What should I bring?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid="input-faq-question"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Answer</label>
            <textarea
              placeholder="Write the answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
              data-testid="input-faq-answer"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || !question.trim() || !answer.trim()}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
            data-testid="button-submit-faq"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update FAQ" : "Add FAQ"}
          </button>
        </div>
      )}

      {faqs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-faqs">
          No FAQs yet. Add some to help members!
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4"
              style={{ borderRadius: 18 }}
              data-testid={`faq-item-${faq.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground" data-testid={`text-faq-question-${faq.id}`}>{faq.question}</div>
                  <div className="text-xs text-muted-foreground mt-1" data-testid={`text-faq-answer-${faq.id}`}>{faq.answer}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(faq)}
                    className="p-1.5 rounded-md text-muted-foreground"
                    data-testid={`button-edit-faq-${faq.id}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(faq.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-md text-destructive"
                    data-testid={`button-delete-faq-${faq.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ScheduleManager({ clubId }: { clubId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");

  const { data: entries = [], isLoading } = useQuery<ClubScheduleEntry[]>({
    queryKey: ["/api/clubs", clubId, "schedule"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/schedule`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { dayOfWeek: string; startTime: string; endTime: string; activity: string; location: string }) => {
      const res = await apiRequest("POST", `/api/clubs/${clubId}/schedule`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "schedule"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { dayOfWeek: string; startTime: string; endTime: string; activity: string; location: string } }) => {
      const res = await apiRequest("PATCH", `/api/clubs/${clubId}/schedule/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "schedule"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clubs/${clubId}/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "schedule"] });
    },
  });

  const resetForm = () => {
    setDayOfWeek("Monday");
    setStartTime("");
    setEndTime("");
    setActivity("");
    setLocation("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (entry: ClubScheduleEntry) => {
    setDayOfWeek(entry.dayOfWeek);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime || "");
    setActivity(entry.activity);
    setLocation(entry.location || "");
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!startTime.trim() || !activity.trim()) return;
    const data = { dayOfWeek, startTime: startTime.trim(), endTime: endTime.trim(), activity: activity.trim(), location: location.trim() };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-3" data-testid="section-schedule-manager">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display text-base font-bold text-[var(--terra)]">Schedule</h3>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra)] text-white"
          data-testid="button-add-schedule"
        >
          <Plus className="w-3 h-3" />
          {showForm ? "Cancel" : "Add Entry"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 space-y-3" style={{ borderRadius: 18 }} data-testid="form-schedule">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid="select-schedule-day"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Start Time</label>
              <input
                type="text"
                placeholder="e.g. 5:30 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid="input-schedule-start"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">End Time</label>
              <input
                type="text"
                placeholder="e.g. 7:30 AM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid="input-schedule-end"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Activity</label>
            <input
              type="text"
              placeholder="e.g. Morning Trek"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid="input-schedule-activity"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label>
            <input
              type="text"
              placeholder="e.g. University Ground"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
              data-testid="input-schedule-location"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || !startTime.trim() || !activity.trim()}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
            data-testid="button-submit-schedule"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update Entry" : "Add Entry"}
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-schedule">
          No schedule entries yet. Add your club's weekly schedule!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4"
              style={{ borderRadius: 18 }}
              data-testid={`schedule-item-${entry.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground" data-testid={`text-schedule-activity-${entry.id}`}>{entry.activity}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {entry.dayOfWeek}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.startTime}{entry.endTime ? ` - ${entry.endTime}` : ""}
                    </span>
                    {entry.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {entry.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(entry)}
                    className="p-1.5 rounded-md text-muted-foreground"
                    data-testid={`button-edit-schedule-${entry.id}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-md text-destructive"
                    data-testid={`button-delete-schedule-${entry.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MOMENT_ICONS = [
  { label: "Star", icon: "star" },
  { label: "Fire", icon: "fire" },
  { label: "Heart", icon: "heart" },
  { label: "Trophy", icon: "trophy" },
  { label: "Camera", icon: "camera" },
  { label: "Mountain", icon: "mountain" },
  { label: "Music", icon: "music" },
  { label: "Book", icon: "book" },
];

function MomentsManager({ clubId }: { clubId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");

  const { data: moments = [], isLoading } = useQuery<ClubMoment[]>({
    queryKey: ["/api/clubs", clubId, "moments"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/moments`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { caption: string; emoji?: string }) => {
      const res = await apiRequest("POST", `/api/clubs/${clubId}/moments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "moments"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clubs/${clubId}/moments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "moments"] });
    },
  });

  const resetForm = () => {
    setCaption("");
    setSelectedIcon("");
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!caption.trim()) return;
    createMutation.mutate({ caption: caption.trim(), emoji: selectedIcon || undefined });
  };

  const formatRelativeTime = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-3" data-testid="section-moments-manager">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display text-base font-bold text-[var(--terra)]">Moments</h3>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra)] text-white"
          data-testid="button-add-moment"
        >
          <Plus className="w-3 h-3" />
          {showForm ? "Cancel" : "Add Moment"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 space-y-3" style={{ borderRadius: 18 }} data-testid="form-moment">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Caption</label>
            <textarea
              placeholder="Share a highlight or moment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
              data-testid="input-moment-caption"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Icon (optional)</label>
            <div className="flex gap-2 flex-wrap">
              {MOMENT_ICONS.map((item) => (
                <button
                  key={item.icon}
                  onClick={() => setSelectedIcon(selectedIcon === item.icon ? "" : item.icon)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    selectedIcon === item.icon
                      ? "bg-[var(--terra-pale)] text-[var(--terra)] border-[1.5px] border-[rgba(196,98,45,0.3)]"
                      : "bg-[var(--cream)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
                  }`}
                  data-testid={`button-icon-${item.icon}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !caption.trim()}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
            data-testid="button-submit-moment"
          >
            {createMutation.isPending ? "Posting..." : "Post Moment"}
          </button>
        </div>
      )}

      {moments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-moments">
          No moments yet. Share highlights from your club!
        </div>
      ) : (
        <div className="space-y-2">
          {moments.map((moment) => (
            <div
              key={moment.id}
              className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4"
              style={{ borderRadius: 18 }}
              data-testid={`moment-item-${moment.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {moment.emoji && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--terra-pale)] text-[var(--terra)]" data-testid={`text-moment-icon-${moment.id}`}>
                        {moment.emoji}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground" data-testid={`text-moment-time-${moment.id}`}>
                      {formatRelativeTime(moment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1.5" data-testid={`text-moment-caption-${moment.id}`}>{moment.caption}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(moment.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-md text-destructive shrink-0"
                  data-testid={`button-delete-moment-${moment.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditClub({ club }: { club: Club }) {
  const [shortDesc, setShortDesc] = useState(club.shortDesc);
  const [fullDesc, setFullDesc] = useState(club.fullDesc || "");
  const [organizerName, setOrganizerName] = useState(club.organizerName || "");
  const [whatsappNumber, setWhatsappNumber] = useState(club.whatsappNumber || "");
  const [schedule, setSchedule] = useState(club.schedule);
  const [location, setLocation] = useState(club.location);
  const [healthStatus, setHealthStatus] = useState(club.healthStatus);
  const [highlightsText, setHighlightsText] = useState((club.highlights || []).join("\n"));
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: { shortDesc: string; fullDesc: string; organizerName: string; whatsappNumber: string; schedule: string; location: string; healthStatus: string; highlights: string[] }) => {
      const res = await apiRequest("PATCH", `/api/organizer/club/${club.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/my-clubs"] });
    },
  });

  const handleSave = () => {
    const highlights = highlightsText.split("\n").map(h => h.trim()).filter(Boolean);
    updateMutation.mutate({ shortDesc, fullDesc, organizerName, whatsappNumber, schedule, location, healthStatus, highlights });
  };

  return (
    <div className="space-y-4" data-testid="section-edit-club">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Short Description</label>
          <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
            data-testid="input-edit-shortdesc"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Description</label>
          <textarea
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            rows={5}
            placeholder="Write a detailed description of your club..."
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
            data-testid="input-edit-fulldesc"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Shown on your club's detail page.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Organizer Name</label>
          <input
            type="text"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            placeholder="Your name as the organizer"
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
            data-testid="input-edit-organizer-name"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">WhatsApp Number</label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
            data-testid="input-edit-whatsapp"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Members can reach you on WhatsApp.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Schedule</label>
          <input
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
            data-testid="input-edit-schedule"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
            data-testid="input-edit-location"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Health Status</label>
          <div className="flex gap-2">
            {(["green", "yellow", "red"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setHealthStatus(status)}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all border ${
                  healthStatus === status
                    ? status === "green" ? "bg-[var(--green-accent)]/20 text-[var(--green-accent)] border-[var(--green-accent)]/40"
                    : status === "yellow" ? "bg-chart-4/20 text-chart-4 border-chart-4/40"
                    : "bg-destructive/20 text-destructive border-destructive/40"
                    : "bg-[var(--warm-white)] border-[var(--warm-border)] text-muted-foreground"
                }`}
                data-testid={`button-health-${status}`}
              >
                {status === "green" ? "Active" : status === "yellow" ? "Moderate" : "Low"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Club Highlights</label>
          <textarea
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            rows={4}
            placeholder={"One highlight per line, e.g.:\nWe've done 12 treks this year!\nOur community has 50+ active members"}
            className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
            data-testid="input-edit-highlights"
          />
          <p className="text-[11px] text-muted-foreground mt-1">One per line. These show on your club page.</p>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
        data-testid="button-save-club"
      >
        {updateMutation.isPending ? "Saving..." : saved ? "Saved" : "Save Changes"}
      </button>
    </div>
  );
}

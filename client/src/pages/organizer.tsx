import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch, Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { Calendar, MapPin, Users, QrCode, Check, Copy, LayoutDashboard, Loader2, Plus, Pencil, Trash2, Clock, X, UserMinus, CheckCircle2, XCircle, Clock3, Ban, AlertTriangle, Link2, Zap, BarChart3, Download, ArrowRight, TrendingUp, Repeat, UserCheck, TrendingDown, Medal, Megaphone, MessageSquare, Shield, ChevronDown, ChevronUp, Users2, BarChart2, Vote, Bell, Pin, Camera, Globe } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import type { Club, JoinRequest, Event, EventRsvp, ClubFaq, ClubScheduleEntry, ClubMoment, ClubAnnouncement } from "@shared/schema";

export default function Organizer() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const urlTab = new URLSearchParams(searchString).get("tab") as "overview" | "requests" | "insights" | "events" | "content" | "edit" | "announcements" | null;
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "insights" | "events" | "content" | "edit" | "announcements">(urlTab || "overview");
  const [contentInitialSection, setContentInitialSection] = useState<"faqs" | "schedule" | "moments">("faqs");
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

        <RequestsTabBar activeTab={activeTab} setActiveTab={setActiveTab} clubId={club.id} isCreator={user?.id === club.creatorUserId} />

        {activeTab === "overview" && <ClubOverview club={club} user={user} setActiveTab={setActiveTab} setContentInitialSection={setContentInitialSection} />}
        {activeTab === "requests" && <OrganizerRequests clubId={club.id} club={club} />}
        {activeTab === "insights" && <OrganizerInsights clubId={club.id} />}
        {activeTab === "events" && <OrganizerEvents clubId={club.id} />}
        {activeTab === "content" && <ContentManager clubId={club.id} initialSection={contentInitialSection} />}
        {activeTab === "edit" && user?.id === club.creatorUserId && <EditClub club={club} />}
        {activeTab === "announcements" && <AnnouncementsManager clubId={club.id} />}
      </div>
      <BottomNav />
    </div>
  );
}

function ClubOverview({ club, user, setActiveTab, setContentInitialSection }: { club: Club; user: any; setActiveTab: (tab: "overview" | "requests" | "insights" | "events" | "content" | "edit" | "announcements") => void; setContentInitialSection?: (s: "faqs" | "schedule" | "moments") => void }) {
  const { toast } = useToast();
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

  const { data: clubMomentsData = [] } = useQuery<{ id: string }[]>({
    queryKey: ["/api/clubs", club.id, "moments"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/moments`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pendingCount = pendingData?.count ?? 0;
  const now = new Date();
  const nextEvent = clubEvents
    .filter(e => !e.isCancelled && new Date(e.startsAt) > now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] || null;

  const hasEvent = clubEvents.length > 0;
  const hasMoment = clubMomentsData.length > 0;
  const showChecklist = !hasEvent || !hasMoment;

  const clubLink = `${window.location.origin}/club/${club.id}`;
  const copyClubLink = () => {
    navigator.clipboard.writeText(clubLink).then(() => {
      toast({ description: "Club link copied!" });
    });
  };

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
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-[var(--terra)]">{club.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{club.shortDesc}</p>
            {club.schedule && (
              <div className="flex items-center gap-1 mt-1.5">
                <Clock3 className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate">{club.schedule}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-overview-members">{club.memberCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Members</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-overview-events">
            {clubEvents.filter(e => !e.isCancelled).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Events</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-overview-founding">
            {club.foundingTaken ?? 0}/{club.foundingTotal ?? 20}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Founding Spots</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-md ${healthColors[club.healthStatus] || healthColors.green}`} data-testid="text-overview-health">
            {club.healthLabel}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Health Status</div>
        </div>
      </div>

      {showChecklist && (
        <div
          className="rounded-md p-5 space-y-4"
          style={{ background: "var(--ink)", borderRadius: 18 }}
          data-testid="card-getting-started"
        >
          <div>
            <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: "var(--terra-light)" }}>Your club is live!</p>
            <h3 className="font-display text-lg font-bold text-white leading-tight">Get Your Club Going</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Complete these steps to launch properly</p>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--terra)" }}>
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-white/70 line-through">Club created</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: hasEvent ? "var(--terra)" : "rgba(255,255,255,0.15)" }}
              >
                {hasEvent ? <Check className="w-3.5 h-3.5 text-white" /> : <Calendar className="w-3.5 h-3.5 text-white/60" />}
              </div>
              {hasEvent ? (
                <span className="text-sm text-white/50 line-through">Create your first event</span>
              ) : (
                <button
                  onClick={() => setActiveTab("events")}
                  className="text-sm font-semibold text-white underline underline-offset-2"
                  data-testid="checklist-create-event"
                >
                  Create your first event →
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: hasMoment ? "var(--terra)" : "rgba(255,255,255,0.15)" }}
              >
                {hasMoment ? <Check className="w-3.5 h-3.5 text-white" /> : <Camera className="w-3.5 h-3.5 text-white/60" />}
              </div>
              {hasMoment ? (
                <span className="text-sm text-white/50 line-through">Post your first moment</span>
              ) : (
                <button
                  onClick={() => { setContentInitialSection?.("moments"); setActiveTab("content"); }}
                  className="text-sm font-semibold text-white underline underline-offset-2"
                  data-testid="checklist-post-moment"
                >
                  Post your first moment →
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Link2 className="w-3.5 h-3.5 text-white/60" />
              </div>
              <button
                onClick={copyClubLink}
                className="text-sm font-semibold text-white underline underline-offset-2"
                data-testid="checklist-copy-link"
              >
                Share your club link
              </button>
            </div>
          </div>
          <div className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <span className="text-[10px] font-mono truncate flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              {clubLink}
            </span>
            <button
              onClick={copyClubLink}
              className="text-[10px] font-bold shrink-0"
              style={{ color: "var(--terra-light)" }}
              data-testid="button-copy-club-link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <Link href={`/page-builder/${club.id}`} style={{ textDecoration: "none" }}>
        <div className="rounded-md p-4 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]" style={{ borderRadius: 18, background: "linear-gradient(135deg, var(--terra-pale), rgba(201,168,76,0.08))", border: "1.5px solid rgba(196,98,45,0.2)" }} data-testid="card-public-page">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "var(--terra)", color: "white" }}>
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-bold text-[var(--ink)]">Public Page</div>
            <p className="text-xs text-[var(--muted-warm)] mt-0.5">
              {club.slug ? `Live at /c/${club.slug}` : "Set up a shareable page for your club"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--terra)] shrink-0" />
        </div>
      </Link>

      {user?.id === club.creatorUserId && <CoOrganisersCard clubId={club.id} />}
    </div>
  );
}

function RequestsTabBar({ activeTab, setActiveTab, clubId, isCreator }: { activeTab: string; setActiveTab: (tab: "overview" | "requests" | "insights" | "events" | "content" | "edit" | "announcements") => void; clubId: string; isCreator?: boolean }) {
  const { data: requests = [] } = useQuery<JoinRequest[]>({
    queryKey: ["/api/organizer/join-requests", clubId],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/join-requests/${clubId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const allTabs = ["overview", "requests", "insights", "events", "content", "announcements", ...(isCreator ? ["edit"] : [])] as ("overview" | "requests" | "insights" | "events" | "content" | "edit" | "announcements")[];
  const tabLabels: Record<string, string> = {
    overview: "Overview",
    requests: "Requests",
    insights: "Insights",
    events: "Events",
    content: "Content",
    announcements: "Broadcast",
    edit: "Edit Club",
  };

  return (
    <div
      className="flex mb-6 overflow-x-auto -mx-4 px-4"
      style={{ borderBottom: "1.5px solid var(--warm-border)", scrollbarWidth: "none" }}
    >
      {allTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${
            activeTab === tab
              ? "border-[var(--terra)] text-[var(--terra)]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-testid={`tab-organizer-${tab}`}
        >
          {tabLabels[tab]}
          {tab === "requests" && pendingCount > 0 && (
            <span
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[var(--terra)] text-white"
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

interface AnalyticsData {
  memberGrowth: { week: string; count: number }[];
  perEventStats: { id: string; title: string; date: string; rsvps: number; attended: number; rate: number; isCancelled: boolean | null }[];
  mostActiveMembers: { name: string; rsvpCount: number }[];
  engagementRate: number;
  noShowRate: number;
}

function OrganizerInsights({ clubId }: { clubId: string }) {
  const { data: insights, isLoading: insightsLoading } = useQuery<InsightsData>({
    queryKey: ["/api/organizer/clubs", clubId, "insights"],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/clubs/${clubId}/insights`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/organizer/clubs", clubId, "analytics"],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/clubs/${clubId}/analytics`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  const isLoading = insightsLoading || analyticsLoading;

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} />
      ))}
    </div>
  );

  if (!insights) return (
    <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-insights">
      Unable to load insights.
    </div>
  );

  const maxGrowth = analytics ? Math.max(...analytics.memberGrowth.map(w => w.count), 1) : 1;

  return (
    <div className="space-y-4" data-testid="section-organizer-insights">

      {/* ── Section 1: Key Metrics ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-insight-members">{insights.totalMembers}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Members</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-chart-4 font-mono" data-testid="text-insight-pending">{insights.pendingRequests}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending Requests</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-insight-events">{insights.totalEvents}</div>
          <div className="text-xs text-muted-foreground mt-1">Events Created</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--green-accent)] font-mono" data-testid="text-insight-attendance">{insights.avgAttendanceRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">Avg Attendance</div>
        </div>
      </div>

      {/* ── Section 2: Engagement Health ── */}
      {analytics && insights.totalEvents > 0 && (
        <div className="grid grid-cols-2 gap-3" data-testid="section-engagement-health">
          <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }}>
            <div className="flex items-center gap-1.5 mb-2">
              <UserCheck className="w-3.5 h-3.5 text-[var(--terra)]" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-engagement-rate">{analytics.engagementRate}%</div>
            <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">members who've RSVPd to at least one event</div>
          </div>
          <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }}>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No-Shows</span>
            </div>
            <div className="text-2xl font-bold text-destructive font-mono" data-testid="text-noshow-rate">{analytics.noShowRate}%</div>
            <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">avg RSVPs that didn't check in</div>
          </div>
        </div>
      )}

      {/* ── Section 3: Member Growth Chart ── */}
      {analytics && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }} data-testid="card-member-growth">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[var(--terra)]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Growth (last 8 weeks)</span>
          </div>
          <div className="flex items-end gap-1.5 h-20" data-testid="chart-member-growth">
            {analytics.memberGrowth.map((bar, i) => {
              const heightPct = maxGrowth > 0 ? Math.max((bar.count / maxGrowth) * 100, bar.count > 0 ? 8 : 3) : 3;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="w-full flex flex-col justify-end" style={{ height: 64 }}>
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${heightPct}%`,
                        minHeight: 3,
                        background: bar.count > 0 ? "var(--terra)" : "var(--warm-border)",
                        opacity: bar.count > 0 ? 1 : 0.5,
                      }}
                      data-testid={`bar-growth-${i}`}
                    />
                  </div>
                  {bar.count > 0 && (
                    <div className="text-[9px] font-mono font-bold text-[var(--terra)]">{bar.count}</div>
                  )}
                  <div className="text-[8px] text-muted-foreground text-center leading-tight truncate w-full px-0.5">{bar.week}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 4: Per-Event Attendance Breakdown ── */}
      {analytics && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }} data-testid="card-event-breakdown">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[var(--terra)]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Breakdown</span>
          </div>
          {analytics.perEventStats.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2" data-testid="text-no-events-breakdown">No events yet — create one to see attendance data.</div>
          ) : (
            <div className="space-y-3">
              {analytics.perEventStats.slice(0, 8).map((evt, i) => (
                <div key={evt.id} data-testid={`event-breakdown-row-${evt.id}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{evt.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {evt.date ? new Date(evt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                        {evt.isCancelled && <span className="ml-1 text-destructive">• Cancelled</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-[var(--terra)]" data-testid={`text-event-rate-${evt.id}`}>{evt.rate}%</div>
                      <div className="text-[10px] text-muted-foreground">{evt.attended}/{evt.rsvps}</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--warm-border)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${evt.rsvps > 0 ? evt.rate : 0}%`,
                        background: evt.rate >= 80 ? "var(--green-accent)" : evt.rate >= 50 ? "var(--terra)" : "hsl(var(--chart-4))",
                      }}
                      data-testid={`bar-event-attendance-${evt.id}`}
                    />
                  </div>
                  {i < analytics.perEventStats.slice(0, 8).length - 1 && (
                    <div className="mt-3 border-t border-[var(--warm-border)]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Section 5: Most Active Members ── */}
      {analytics && (
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4" style={{ borderRadius: 18 }} data-testid="card-top-members">
          <div className="flex items-center gap-2 mb-3">
            <Medal className="w-4 h-4 text-[var(--terra)]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Members</span>
          </div>
          {analytics.mostActiveMembers.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2" data-testid="text-no-top-members">No event RSVPs yet.</div>
          ) : (
            <div className="space-y-2">
              {analytics.mostActiveMembers.map((member, i) => (
                <div key={i} className="flex items-center justify-between gap-2" data-testid={`top-member-${i}`}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: i === 0 ? "#C4622D" : i === 1 ? "#8B7355" : "var(--warm-border)", color: i < 2 ? "white" : "var(--ink)" }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono" style={{ background: "var(--terra)", color: "white" }} data-testid={`badge-member-rsvps-${i}`}>
                    {member.rsvpCount} RSVPs
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Section 6: Most Popular Event + Recent Activity (existing) ── */}
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

function OrganizerRequests({ clubId, club }: { clubId: string; club: Club }) {
  const [viewFilter, setViewFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

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
                  {(req as any).answer1 && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          const next = new Set(expandedAnswers);
                          if (next.has(req.id)) { next.delete(req.id); } else { next.add(req.id); }
                          setExpandedAnswers(next);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--terra)] transition-colors"
                        data-testid={`button-toggle-answers-${req.id}`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        {expandedAnswers.has(req.id) ? "Hide answers" : "View answers"}
                        {expandedAnswers.has(req.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {expandedAnswers.has(req.id) && (
                        <div className="mt-2 space-y-2 p-2.5 rounded-lg" style={{ background: "var(--terra-pale)", border: "1px solid rgba(196,98,45,0.2)" }}>
                          {club.joinQuestion1 && (
                            <div>
                              <div className="text-[10px] font-bold text-[var(--terra)] uppercase tracking-wider">{club.joinQuestion1}</div>
                              <div className="text-xs text-[var(--ink)] mt-0.5">{(req as any).answer1}</div>
                            </div>
                          )}
                          {club.joinQuestion2 && (req as any).answer2 && (
                            <div>
                              <div className="text-[10px] font-bold text-[var(--terra)] uppercase tracking-wider">{club.joinQuestion2}</div>
                              <div className="text-xs text-[var(--ink)] mt-0.5">{(req as any).answer2}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
  const [recurrenceRule, setRecurrenceRule] = useState("none");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
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
    setRecurrenceRule("none");
    setCoverImageUrl(null);
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
      ...(recurrenceRule !== "none" ? { recurrenceRule } : {}),
      ...(coverImageUrl ? { coverImageUrl } : {}),
    } as any);
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
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
              <Repeat className="w-3 h-3" />
              Repeat
            </label>
            <div className="flex gap-2 flex-wrap">
              {[["none","Once"],["weekly","Weekly"],["biweekly","Bi-weekly"],["monthly","Monthly"]].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRecurrenceRule(val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${recurrenceRule === val ? "bg-[var(--terra-pale)] text-[var(--terra)] border-[rgba(196,98,45,0.4)]" : "bg-[var(--warm-white)] border-[var(--warm-border)] text-muted-foreground"}`}
                  data-testid={`button-recurrence-${val}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {recurrenceRule !== "none" && (
              <p className="text-[11px] text-muted-foreground mt-1.5">We'll create 4 instances automatically</p>
            )}
          </div>
          <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} label="Cover Photo (optional)" />
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
  const [editCoverImageUrl, setEditCoverImageUrl] = useState<string | null>(event.coverImageUrl ?? null);
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
    enabled: showAttendees,
  });

  const editMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; startsAt: string; locationText: string; maxCapacity: number; coverImageUrl: string | null }) => {
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
      coverImageUrl: editCoverImageUrl,
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
          {event.recurrenceRule && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ background: 'rgba(196,98,45,0.1)', color: 'var(--terra)' }} data-testid={`badge-recurring-${event.id}`}>
              <Repeat className="w-2.5 h-2.5" />
              Recurring
            </span>
          )}
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
          <ImageUpload value={editCoverImageUrl} onChange={setEditCoverImageUrl} label="Event Cover Photo" />
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
            {event.recurrenceRule && (
              <button
                onClick={() => {
                  const params = new URLSearchParams({ tab: "event", clubId, from: event.id });
                  window.location.href = `/create?${params.toString()}`;
                }}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md text-white"
                style={{ background: "var(--terra)" }}
                data-testid={`button-schedule-next-${event.id}`}
              >
                ↻ Schedule Next
              </button>
            )}
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

function ContentManager({ clubId, initialSection = "faqs" }: { clubId: string; initialSection?: "faqs" | "schedule" | "moments" }) {
  const [activeSection, setActiveSection] = useState<"faqs" | "schedule" | "moments">(initialSection);

  const sections: { key: "faqs" | "schedule" | "moments"; label: string }[] = [
    { key: "faqs", label: "FAQs" },
    { key: "schedule", label: "Schedule" },
    { key: "moments", label: "Moments" },
  ];

  return (
    <div className="space-y-4" data-testid="section-content-manager">
      <div className="flex gap-2 flex-wrap">
        {sections.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === key
                ? "bg-[var(--terra-pale)] text-[var(--terra)] border-[1.5px] border-[rgba(196,98,45,0.3)]"
                : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"
            }`}
            style={{ borderRadius: 18 }}
            data-testid={`tab-content-${key}`}
          >
            {label}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [momentImageUrl, setMomentImageUrl] = useState<string | null>(null);

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
      const res = await apiRequest("POST", `/api/clubs/${clubId}/moments`, {
        caption: data.caption,
        emoji: data.emoji,
        imageUrl: momentImageUrl ?? undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "moments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { caption: string; emoji?: string } }) => {
      const res = await apiRequest("PATCH", `/api/clubs/${clubId}/moments/${id}`, data);
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
    setMomentImageUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (moment: ClubMoment) => {
    setCaption(moment.caption);
    setSelectedIcon(moment.emoji || "");
    setMomentImageUrl(null);
    setEditingId(moment.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!caption.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { caption: caption.trim(), emoji: selectedIcon || undefined } });
    } else {
      createMutation.mutate({ caption: caption.trim(), emoji: selectedIcon || undefined });
    }
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
          {!editingId && (
            <ImageUpload value={momentImageUrl} onChange={setMomentImageUrl} label="Photo (optional)" />
          )}
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
            disabled={createMutation.isPending || updateMutation.isPending || !caption.trim()}
            className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
            data-testid="button-submit-moment"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update Moment" : "Post Moment"}
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
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(moment)}
                    className="p-1.5 rounded-md text-muted-foreground"
                    data-testid={`button-edit-moment-${moment.id}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(moment.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-md text-destructive"
                    data-testid={`button-delete-moment-${moment.id}`}
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

function AnnouncementsManager({ clubId }: { clubId: string }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [notifyMembers, setNotifyMembers] = useState(true);

  const { data: announcements = [], isLoading } = useQuery<ClubAnnouncement[]>({
    queryKey: ["/api/organizer/clubs", clubId, "announcements"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/announcements`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const postMutation = useMutation({
    mutationFn: async (data: { title: string; body: string; isPinned: boolean; notifyMembers: boolean }) => {
      const res = await apiRequest("POST", `/api/organizer/clubs/${clubId}/announcements`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Announcement posted!" });
      setTitle("");
      setBody("");
      setIsPinned(false);
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "announcements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/organizer/clubs/${clubId}/announcements/${id}`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "announcements"] });
    },
  });

  return (
    <div className="space-y-5" data-testid="section-announcements-manager">
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-4 h-4 text-[var(--terra)]" />
          <h3 className="font-display text-base font-bold text-[var(--ink)]">New Announcement</h3>
        </div>
        <input
          type="text"
          placeholder="Title (e.g. Weekend trek is on!)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
          data-testid="input-announcement-title"
        />
        <textarea
          placeholder="Write your message to all members..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none"
          data-testid="input-announcement-body"
        />
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setIsPinned(!isPinned)}
              className={`w-9 h-5 rounded-full transition-all relative ${isPinned ? "bg-[var(--terra)]" : "bg-[var(--warm-border)]"}`}
              data-testid="toggle-pin-announcement"
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPinned ? "left-4" : "left-0.5"}`} />
            </div>
            <span className="text-sm text-foreground flex items-center gap-1.5">
              <Pin className="w-3 h-3" />
              Pin to club page
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setNotifyMembers(!notifyMembers)}
              className={`w-9 h-5 rounded-full transition-all relative ${notifyMembers ? "bg-[var(--terra)]" : "bg-[var(--warm-border)]"}`}
              data-testid="toggle-notify-members"
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifyMembers ? "left-4" : "left-0.5"}`} />
            </div>
            <span className="text-sm text-foreground flex items-center gap-1.5">
              <Bell className="w-3 h-3" />
              Notify all members
            </span>
          </label>
        </div>
        <button
          onClick={() => postMutation.mutate({ title, body, isPinned, notifyMembers })}
          disabled={postMutation.isPending || !title.trim() || !body.trim()}
          className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50"
          data-testid="button-post-announcement"
        >
          {postMutation.isPending ? "Posting..." : "Post Announcement"}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--warm-border)" }} />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-announcements">
          No announcements yet. Post your first one above!
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-2xl" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} data-testid={`card-announcement-${ann.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-sm text-[var(--ink)]" data-testid={`text-ann-title-${ann.id}`}>{ann.title}</span>
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ background: "var(--terra-pale)", color: "var(--terra)" }}>
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{ann.body}</p>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(ann.id)}
                  disabled={deleteMutation.isPending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive transition-colors shrink-0"
                  style={{ background: "rgba(239,68,68,0.08)" }}
                  data-testid={`button-delete-announcement-${ann.id}`}
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

function CoOrganisersCard({ clubId }: { clubId: string }) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: coOrganisers = [] } = useQuery<{ userId: string; name: string; profileImageUrl: string | null }[]>({
    queryKey: ["/api/organizer/clubs", clubId, "co-organisers"],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/clubs/${clubId}/co-organisers`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: approvedMembers = [] } = useQuery<{ userId: string | null; name: string; profileImageUrl: string | null }[]>({
    queryKey: ["/api/clubs", clubId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/members`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const coOrgIds = new Set(coOrganisers.map(c => c.userId));
  const eligibleMembers = approvedMembers.filter(m => m.userId && !coOrgIds.has(m.userId));

  const addMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/organizer/clubs/${clubId}/co-organisers`, { userId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Co-organiser added!" });
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "co-organisers"] });
    },
    onError: () => toast({ title: "Failed to add co-organiser", variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/organizer/clubs/${clubId}/co-organisers/${userId}`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "co-organisers"] });
    },
  });

  return (
    <div className="p-4 rounded-2xl space-y-4" style={{ background: "var(--warm-white)", border: "1.5px solid rgba(196,98,45,0.25)" }} data-testid="card-co-organisers">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-[var(--terra)]" />
        <h3 className="font-display text-base font-bold text-[var(--ink)]">Co-organisers</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--terra-pale)", color: "var(--terra)" }}>Creator only</span>
      </div>
      <p className="text-xs text-muted-foreground">Give trusted members dashboard access to help manage requests, events, and content.</p>

      {coOrganisers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2" data-testid="text-no-co-organisers">No co-organisers yet.</p>
      ) : (
        <div className="space-y-2">
          {coOrganisers.map((co) => (
            <div key={co.userId} className="flex items-center justify-between gap-2 p-2 rounded-xl" style={{ background: "var(--cream)" }} data-testid={`row-co-organiser-${co.userId}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--terra-pale)", color: "var(--terra)" }}>
                  {co.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[var(--ink)]">{co.name}</span>
              </div>
              <button
                onClick={() => removeMutation.mutate(co.userId)}
                disabled={removeMutation.isPending}
                className="text-xs font-semibold text-destructive px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: "rgba(239,68,68,0.08)" }}
                data-testid={`button-remove-co-organiser-${co.userId}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {eligibleMembers.length > 0 ? (
        <div className="flex gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none"
            data-testid="select-co-organiser-candidate"
          >
            <option value="">Select a member...</option>
            {eligibleMembers.map(m => (
              <option key={m.userId!} value={m.userId!}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={() => selectedUserId && addMutation.mutate(selectedUserId)}
            disabled={!selectedUserId || addMutation.isPending}
            className="px-4 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--terra)" }}
            data-testid="button-add-co-organiser"
          >
            {addMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">All approved members are already co-organisers or there are no members yet.</p>
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
  const [joinQuestion1, setJoinQuestion1] = useState((club as any).joinQuestion1 || "");
  const [joinQuestion2, setJoinQuestion2] = useState((club as any).joinQuestion2 || "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(club.coverImageUrl ?? null);
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
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
    updateMutation.mutate({ shortDesc, fullDesc, organizerName, whatsappNumber, schedule, location, joinQuestion1: joinQuestion1.trim() || null, joinQuestion2: joinQuestion2.trim() || null, coverImageUrl: coverImageUrl ?? null });
  };

  return (
    <div className="space-y-4" data-testid="section-edit-club">
      <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} label="Club Cover Photo" />

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
        <div className="pt-2 border-t border-[var(--warm-border)]">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--terra)]" />
            <span className="text-xs font-bold text-[var(--terra)] uppercase tracking-wider">Join Questions</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Applicants will see these when requesting to join.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Question 1 (optional)</label>
              <input
                type="text"
                value={joinQuestion1}
                onChange={(e) => setJoinQuestion1(e.target.value)}
                placeholder="What's your experience level?"
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid="input-edit-join-q1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Question 2 (optional)</label>
              <input
                type="text"
                value={joinQuestion2}
                onChange={(e) => setJoinQuestion2(e.target.value)}
                placeholder="How did you hear about us?"
                className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30"
                data-testid="input-edit-join-q2"
              />
            </div>
          </div>
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

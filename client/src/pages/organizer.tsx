import { lazy, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useSearch } from "wouter";
import { LayoutDashboard, Users, Loader2 } from "lucide-react";
import type { Club, JoinRequest } from "@shared/schema";

// ── Lazy-loaded tab components ──────────────────────────────────────────────
const OverviewTab      = lazy(() => import("./organizer/OverviewTab"));
const InsightsTab      = lazy(() => import("./organizer/InsightsTab"));
const RequestsTab      = lazy(() => import("./organizer/RequestsTab"));
const MembersTab       = lazy(() => import("./organizer/MembersTab"));
const EventsTab        = lazy(() => import("./organizer/EventsTab"));
const ContentTab       = lazy(() => import("./organizer/ContentTab"));
const AnnouncementsTab = lazy(() => import("./organizer/AnnouncementsTab"));
const EditTab          = lazy(() => import("./organizer/EditTab"));

// ── Tab-level Suspense fallback ───────────────────────────────────────────
function TabFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--terra)]" />
    </div>
  );
}

// ──Nav tab-bar (kept here as it is tiny and always visible) ──────────────
type TabKey = "overview" | "requests" | "members" | "insights" | "events" | "content" | "edit" | "announcements";

function RequestsTabBar({ activeTab, setActiveTab, clubId, isCreator }: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  clubId: string;
  isCreator?: boolean;
}) {
  const { data: requests = [] } = useQuery<JoinRequest[]>({
    queryKey: ["/api/organizer/join-requests", clubId],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/join-requests/${clubId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const allTabs: TabKey[] = ["overview", "requests", "members", "insights", "events", "content", "announcements", ...(isCreator ? ["edit" as TabKey] : [])];
  const tabLabels: Record<string, string> = { overview: "Overview", requests: "Requests", members: "Members", insights: "Insights", events: "Events", content: "Content", announcements: "Broadcast", edit: "Edit Club" };
  return (
    <div className="flex mb-6 overflow-x-auto -mx-4 px-4" style={{ borderBottom: "1.5px solid var(--warm-border)", scrollbarWidth: "none" }}>
      {allTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap inline-flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${activeTab === tab ? "border-[var(--terra)] text-[var(--terra)]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          data-testid={`tab-organizer-${tab}`}
        >
          {tabLabels[tab]}
          {tab === "requests" && pendingCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[var(--terra)] text-white" data-testid="badge-pending-requests">
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Organizer() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const urlTab = new URLSearchParams(searchString).get("tab") as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(urlTab || "overview");
  const [contentInitialSection, setContentInitialSection] = useState<"faqs" | "schedule" | "moments">("faqs");
  const [selectedClubIndex, setSelectedClubIndex] = useState(0);

  const { data: clubs = [], isLoading, error } = useQuery<Club[]>({
    queryKey: ["/api/organizer/my-clubs"],
    queryFn: async () => {
      const res = await fetch("/api/organizer/my-clubs", { credentials: "include" });
      if (!res.ok) { if (res.status === 403) return []; throw new Error("Failed to fetch clubs"); }
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
          <button onClick={() => { window.location.href = "/api/login"; }} className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold" data-testid="button-organizer-sign-in">Sign In</button>
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
          <div className="flex gap-2 mt-4">{[1,2,3,4,5].map(i=><div key={i} className="h-9 w-20 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}/>)}</div>
          <div className="grid grid-cols-2 gap-3 mt-4">{[1,2,3,4].map(i=><div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}/>)}</div>
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
          <p className="text-sm text-muted-foreground mt-1">You haven't created any clubs yet. Create one to get started!</p>
          <button onClick={() => navigate("/create")} className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold" data-testid="button-go-create-club">Create a Club</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--terra)]" data-testid="text-organizer-dashboard">{club.emoji} {club.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Organizer Dashboard</p>
          </div>
        </div>

        {clubs.length > 1 && (
          <div className="mb-6" data-testid="section-club-switcher">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Switch Club</label>
            <div className="flex gap-2 overflow-x-auto flex-wrap">
              {clubs.map((c, index) => (
                <button key={c.id} onClick={() => { setSelectedClubIndex(index); setActiveTab("overview"); }}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${selectedClubIndex === index ? "bg-[var(--terra)] text-white" : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"}`}
                  style={{ borderRadius: 18 }} data-testid={`button-switch-club-${c.id}`}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <RequestsTabBar activeTab={activeTab} setActiveTab={setActiveTab} clubId={club.id} isCreator={user?.id === club.creatorUserId} />

        <Suspense fallback={<TabFallback />}>
          {activeTab === "overview"      && <OverviewTab club={club} user={user} setActiveTab={setActiveTab} setContentInitialSection={setContentInitialSection} />}
          {activeTab === "requests"      && <RequestsTab clubId={club.id} club={club} />}
          {activeTab === "members"       && <MembersTab clubId={club.id} />}
          {activeTab === "insights"      && <InsightsTab clubId={club.id} />}
          {activeTab === "events"        && <EventsTab clubId={club.id} />}
          {activeTab === "content"       && <ContentTab clubId={club.id} initialSection={contentInitialSection} />}
          {activeTab === "announcements" && <AnnouncementsTab clubId={club.id} />}
          {activeTab === "edit" && user?.id === club.creatorUserId && <EditTab club={club} />}
        </Suspense>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Calendar, MapPin, Users, QrCode, Check, Copy, LayoutDashboard, Loader2 } from "lucide-react";
import type { Club, JoinRequest, Event, EventRsvp } from "@shared/schema";

export default function Organizer() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "events" | "edit">("overview");
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
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto mb-3" style={{ borderRadius: 18 }}>
            <LayoutDashboard className="w-6 h-6 text-[var(--terra)]" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your clubs...</p>
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

        <div className="flex gap-2 mb-6 overflow-x-auto flex-wrap">
          {(["overview", "requests", "events", "edit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? "bg-[var(--terra)] text-white shadow-[var(--warm-shadow)]" : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"}`}
              style={{ borderRadius: 18 }}
              data-testid={`tab-organizer-${tab}`}
            >
              {tab === "overview" ? "Overview" : tab === "requests" ? "Join Requests" : tab === "events" ? "Events" : "Edit Club"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <ClubOverview club={club} />}
        {activeTab === "requests" && <OrganizerRequests clubId={club.id} />}
        {activeTab === "events" && <OrganizerEvents clubId={club.id} />}
        {activeTab === "edit" && <EditClub club={club} />}
      </div>
    </div>
  );
}

function ClubOverview({ club }: { club: Club }) {
  const healthColors: Record<string, string> = {
    green: "text-[var(--green-accent)] bg-[var(--green-accent)]/10",
    yellow: "text-chart-4 bg-chart-4/10",
    red: "text-destructive bg-destructive/10",
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
    </div>
  );
}

function OrganizerRequests({ clubId }: { clubId: string }) {
  const { data: requests = [], isLoading } = useQuery<JoinRequest[]>({
    queryKey: ["/api/organizer/join-requests", clubId],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/join-requests/${clubId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/organizer/join-requests/${id}/contacted`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/join-requests", clubId] });
    },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  if (requests.length === 0) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="text-no-requests">No join requests yet</div>;
  }

  return (
    <div className="space-y-2" data-testid="list-organizer-requests">
      {requests.map((req) => (
        <div
          key={req.id}
          className={`flex items-center gap-3 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] ${req.markedDone ? "opacity-40" : ""}`}
          style={{ borderRadius: 18 }}
          data-testid={`row-request-${req.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground">{req.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{req.phone}</div>
            <div className="text-xs text-muted-foreground">
              {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
            </div>
          </div>
          {req.markedDone ? (
            <span className="text-xs font-semibold text-[var(--terra)] whitespace-nowrap flex items-center gap-1" data-testid={`text-contacted-${req.id}`}>
              <Check className="w-3 h-3" /> Added to WhatsApp
            </span>
          ) : (
            <button
              onClick={() => contactMutation.mutate(req.id)}
              disabled={contactMutation.isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra-pale)] text-[var(--terra)] transition-all whitespace-nowrap inline-flex items-center gap-1"
              data-testid={`button-contacted-${req.id}`}
            >
              {contactMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Added to WhatsApp
            </button>
          )}
        </div>
      ))}
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
      const res = await fetch(`/api/clubs/${clubId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message || "Failed to create event");
      }
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

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
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDuplicate={handleDuplicate} />
          ))}
        </div>
      )}
    </div>
  );
}

type AttendeeData = EventRsvp & { userName: string | null; checkedIn: boolean | null; checkedInAt: Date | null };

function EventCard({ event, onDuplicate }: { event: Event & { rsvpCount: number }; onDuplicate: (event: Event & { rsvpCount: number }) => void }) {
  const [showAttendees, setShowAttendees] = useState(false);
  const d = new Date(event.startsAt);
  const isPast = d < new Date();

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

  const checkedInCount = attendeeData?.checkedInCount ?? 0;
  const totalRsvps = attendeeData?.totalRsvps ?? event.rsvpCount;
  const attendees = attendeeData?.attendees ?? [];

  return (
    <div
      className={`bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] p-4 ${isPast ? "opacity-50" : ""}`}
      style={{ borderRadius: 18 }}
      data-testid={`event-card-${event.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-semibold text-sm text-foreground">{event.title}</div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isPast && <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md text-muted-foreground">Past</span>}
          <button
            onClick={() => onDuplicate(event)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--terra-pale)] text-[var(--terra)]"
            data-testid={`button-duplicate-${event.id}`}
          >
            <Copy className="w-3 h-3" />
            Duplicate
          </button>
          <Link
            href={`/scan/${event.id}`}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--terra-pale)] text-[var(--terra)]"
            data-testid={`button-scan-attendees-${event.id}`}
          >
            <QrCode className="w-3 h-3" />
            Scan Attendees
          </Link>
        </div>
      </div>
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
      <div className="mt-3 pt-3 border-t border-[var(--warm-border)]">
        <button
          onClick={() => setShowAttendees(!showAttendees)}
          className="flex items-center gap-2 text-xs font-semibold text-foreground"
          data-testid={`button-toggle-attendees-${event.id}`}
        >
          <span data-testid={`text-attendance-stats-${event.id}`}>
            {checkedInCount}/{totalRsvps} checked in
          </span>
          <span className="text-muted-foreground">{showAttendees ? "Hide" : "Show"} attendees</span>
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
    </div>
  );
}

function EditClub({ club }: { club: Club }) {
  const [shortDesc, setShortDesc] = useState(club.shortDesc);
  const [schedule, setSchedule] = useState(club.schedule);
  const [location, setLocation] = useState(club.location);
  const [healthStatus, setHealthStatus] = useState(club.healthStatus);
  const [highlightsText, setHighlightsText] = useState((club.highlights || []).join("\n"));
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: { shortDesc: string; schedule: string; location: string; healthStatus: string; highlights: string[] }) => {
      const res = await fetch(`/api/organizer/club/${club.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
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
    updateMutation.mutate({ shortDesc, schedule, location, healthStatus, highlights });
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

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, MapPin, Users, Share2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Club } from "@shared/schema";

const HEALTH_STYLES: Record<string, { dot: string; text: string }> = {
  green: { dot: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  yellow: { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
  red: { dot: "bg-red-400", text: "text-red-600 dark:text-red-400" },
};

interface ClubDetailModalProps {
  club: Club | null;
  onClose: () => void;
}

interface ClubEvent {
  id: string;
  title: string;
  startsAt: string;
  locationText: string;
  maxCapacity: number;
  rsvpCount: number;
}

export function ClubDetailModal({ club, onClose }: ClubDetailModalProps) {
  const { user } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinError, setJoinError] = useState("");

  const joinMutation = useMutation({
    mutationFn: async (data: { clubId: string; clubName: string; name: string; phone: string }) => {
      const res = await apiRequest("POST", "/api/join", data);
      return res.json();
    },
    onSuccess: () => {
      setJoinSuccess(true);
      setShowJoinForm(false);
      setJoinName("");
      setJoinPhone("");
      setJoinError("");
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs-with-activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity/feed"] });
      if (club) queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "activity"] });
    },
    onError: () => {
      setJoinError("Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    if (club) {
      document.body.style.overflow = "hidden";
      setShowJoinForm(false);
      setJoinSuccess(false);
      setJoinName(user?.name || "");
      setJoinPhone(user?.phone || "");
      setJoinError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [club, user]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const { data: activity } = useQuery<{ recentJoins: number; recentJoinNames: string[]; totalEvents: number; lastEventDate: string | null }>({
    queryKey: ["/api/clubs", club?.id, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club!.id}/activity`);
      if (!res.ok) return { recentJoins: 0, recentJoinNames: [], totalEvents: 0, lastEventDate: null };
      return res.json();
    },
    enabled: !!club,
  });

  if (!club) return null;

  const health = HEALTH_STYLES[club.healthStatus] || HEALTH_STYLES["green"];
  const foundingSpotsLeft = (club.foundingTotal ?? 20) - (club.foundingTaken ?? 0);
  const foundingProgress = ((club.foundingTaken ?? 0) / (club.foundingTotal ?? 20)) * 100;
  const allFoundingTaken = foundingSpotsLeft <= 0;

  const handleJoinSubmit = () => {
    setJoinError("");
    if (!joinName || joinName.length < 2) {
      setJoinError("Name is required (minimum 2 characters)");
      return;
    }
    if (!joinPhone || joinPhone.replace(/\D/g, "").length < 10) {
      setJoinError("Phone is required (minimum 10 digits)");
      return;
    }
    joinMutation.mutate({
      clubId: club.id,
      clubName: club.name,
      name: joinName,
      phone: joinPhone,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          data-testid="modal-backdrop"
        />

        <motion.div
          className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          data-testid="modal-club-detail"
        >
          <div
            className="relative p-6 pb-4 rounded-t-2xl sm:rounded-t-2xl"
            style={{ backgroundColor: club.bgColor || undefined }}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/club/${club.id}`;
                  const text = `Check out ${club.name} on Sangh! ${url}`;
                  if (navigator.share) {
                    navigator.share({ title: club.name, text: `Check out ${club.name} on Sangh!`, url }).catch(() => {});
                  } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                  }
                }}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                data-testid="button-share-modal"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-5xl mb-4">{club.emoji}</div>

            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
              {club.category}
            </div>
            <h2
              className="font-serif text-2xl font-bold text-primary tracking-tight leading-tight mb-2"
              data-testid="text-modal-club-name"
            >
              {club.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${health.text}`}>
                <span className={`w-2 h-2 rounded-full ${health.dot}`} />
                {club.healthLabel}
              </span>
              {club.lastActive && (
                <span className="text-xs text-muted-foreground">
                  {club.lastActive}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 pt-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-modal-club-desc">
              {club.fullDesc}
            </p>

            {club.organizerName && (
              <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3" data-testid="card-organizer">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                  {club.organizerAvatar || "🧑"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{club.organizerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {club.organizerYears || "Organizer"}
                    {club.organizerResponse && (
                      <> · {club.organizerResponse}</>
                    )}
                  </div>
                </div>
                {club.organizerYears && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[hsl(var(--clay))]/10 text-[hsl(var(--clay))] rounded-full border border-[hsl(var(--clay))]/20 whitespace-nowrap">
                    {club.organizerYears.split(" ")[0]} organizer
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">📅</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Schedule</div>
                <div className="text-sm font-medium text-foreground">{club.schedule}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">📍</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Location</div>
                <div className="text-sm font-medium text-foreground">{club.location}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">👥</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Members</div>
                <div className="text-sm font-medium text-foreground">{club.memberCount} members</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">📆</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Active Since</div>
                <div className="text-sm font-medium text-foreground">{club.activeSince || "—"}</div>
              </div>
            </div>

            {activity && (activity.recentJoins > 0 || activity.totalEvents > 0) && (
              <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200/30 dark:border-orange-800/20 rounded-xl p-4 space-y-2" data-testid="section-recent-activity">
                <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                  🔥 Recent Activity
                </h3>
                {activity.recentJoins > 0 && (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-recent-joins">
                    <span>🌱</span>
                    <span className="text-foreground font-medium">
                      {activity.recentJoins} {activity.recentJoins === 1 ? "person" : "people"} joined this week
                    </span>
                  </div>
                )}
                {activity.recentJoinNames.length > 0 && (
                  <div className="text-sm text-muted-foreground pl-6" data-testid="text-recent-names">
                    {activity.recentJoinNames.join(", ")}
                    {activity.recentJoins > activity.recentJoinNames.length &&
                      ` and ${activity.recentJoins - activity.recentJoinNames.length} others`} joined recently
                  </div>
                )}
                {activity.totalEvents > 0 && (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-total-events">
                    <span>📅</span>
                    <span className="text-foreground font-medium">{activity.totalEvents} events hosted</span>
                  </div>
                )}
                {activity.lastEventDate && (
                  <div className="text-sm text-muted-foreground pl-6" data-testid="text-last-event">
                    Last meetup: {new Date(activity.lastEventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </div>
                )}
              </div>
            )}

            <ClubEvents clubId={club.id} userId={user?.id} />

            {club.highlights && club.highlights.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 space-y-3" data-testid="section-highlights">
                <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" /> Club Highlights
                </h3>
                {club.highlights.map((highlight, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-3 text-sm text-foreground italic" data-testid="text-highlight">
                    {highlight}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[hsl(var(--clay))]/[0.06] border border-[hsl(var(--clay))]/15 rounded-xl p-4" data-testid="card-founding">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[hsl(var(--clay))]" />
                  <span className="text-sm font-semibold text-[hsl(var(--clay))]">Founding Member Spots</span>
                </div>
                <span className="text-xs font-bold text-[hsl(var(--clay))]">
                  {allFoundingTaken ? "All taken" : `${foundingSpotsLeft} of ${club.foundingTotal ?? 20} left`}
                </span>
              </div>
              <div className="w-full h-2 bg-[hsl(var(--clay))]/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[hsl(var(--clay))] rounded-full transition-all"
                  style={{ width: `${Math.min(foundingProgress, 100)}%` }}
                  data-testid="bar-founding-progress"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {allFoundingTaken
                  ? "All founding spots taken. You can still join!"
                  : "Join now to get your Founding Member badge"}
              </p>
            </div>

            {joinSuccess ? (
              <div className="text-center py-6 space-y-3" data-testid="card-join-success">
                <div className="text-4xl">🌱</div>
                <h3 className="font-serif text-xl font-bold text-primary">You're in the tribe!</h3>
                <p className="text-sm text-muted-foreground">
                  Organizer will add you to WhatsApp group within 24 hours.
                </p>
                {club.whatsappNumber && (
                  <a
                    href={`https://wa.me/${club.whatsappNumber}?text=${encodeURIComponent(`Hi! I just joined ${club.name} on Sangh. Please add me to the group!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                    data-testid="button-join-whatsapp"
                  >
                    <span className="text-lg">💬</span>
                    Message Organizer on WhatsApp
                  </a>
                )}
              </div>
            ) : showJoinForm ? (
              <div className="space-y-3" data-testid="form-join">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-join-name"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-join-phone"
                />
                {joinError && (
                  <p className="text-xs text-red-500 font-medium" data-testid="text-join-error">{joinError}</p>
                )}
                <button
                  onClick={handleJoinSubmit}
                  disabled={joinMutation.isPending}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-50"
                  data-testid="button-send-join"
                >
                  {joinMutation.isPending ? "Sending..." : "Send Join Request"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pt-2 pb-2">
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all"
                  data-testid="button-modal-join"
                >
                  I Want to Join
                </button>
                {club.whatsappNumber && (
                  <a
                    href={`https://wa.me/${club.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[50px] h-[50px] bg-[#25D366] text-white rounded-xl text-xl flex items-center justify-center shrink-0 transition-all"
                    data-testid="button-modal-whatsapp"
                  >
                    💬
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ClubEvents({ clubId, userId }: { clubId: string; userId?: string }) {
  const { data: events = [] } = useQuery<ClubEvent[]>({
    queryKey: ["/api/clubs", clubId, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/events`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId || "" },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "events"] });
    },
  });

  const upcomingEvents = events.filter((e) => new Date(e.startsAt) > new Date());
  if (upcomingEvents.length === 0) return null;

  return (
    <div data-testid="section-club-events">
      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        Upcoming Events
      </h3>
      <div className="space-y-2">
        {upcomingEvents.slice(0, 3).map((event) => {
          const d = new Date(event.startsAt);
          const spotsLeft = event.maxCapacity - event.rsvpCount;
          return (
            <div key={event.id} className="bg-muted/30 rounded-xl p-3" data-testid={`club-event-${event.id}`}>
              <div className="font-medium text-sm text-foreground mb-1">{event.title}</div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.locationText}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.rsvpCount} going · {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
                </span>
                {userId && spotsLeft > 0 && (
                  <button
                    onClick={() => rsvpMutation.mutate(event.id)}
                    disabled={rsvpMutation.isPending}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                    data-testid={`button-rsvp-club-${event.id}`}
                  >
                    Count Me In
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, MapPin, Users, Share2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Club } from "@shared/schema";

const HEALTH_STYLES: Record<string, { dot: string; text: string }> = {
  green: { dot: "bg-emerald-500", text: "text-emerald-400" },
  yellow: { dot: "bg-yellow-500", text: "text-yellow-400" },
  red: { dot: "bg-red-400", text: "text-red-400" },
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
  const { user, isAuthenticated } = useAuth();
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
      setJoinName(user?.firstName || "");
      setJoinPhone("");
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="modal-backdrop"
        />

        <motion.div
          className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          data-testid="modal-club-detail"
        >
          <div
            className="relative p-6 pb-4 rounded-t-2xl sm:rounded-t-2xl glass-card"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/club/${club.id}`;
                  const text = `Check out ${club.name} on CultFam! ${url}`;
                  if (navigator.share) {
                    navigator.share({ title: club.name, text: `Check out ${club.name} on CultFam!`, url }).catch(() => {});
                  } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                  }
                }}
                className="w-8 h-8 rounded-full bg-muted/80 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                data-testid="button-share-modal"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted/80 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
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
              className="font-display text-2xl font-bold neon-text tracking-tight leading-tight mb-2"
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
              <div className="glass-card rounded-xl p-4 flex items-center gap-3" data-testid="card-organizer">
                <div className="w-10 h-10 rounded-full bg-neon/10 flex items-center justify-center text-lg shrink-0">
                  {club.organizerAvatar || <Users className="w-5 h-5 neon-text" />}
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
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-neon/10 neon-text rounded-full neon-border whitespace-nowrap">
                    {club.organizerYears.split(" ")[0]} organizer
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3">
                <Calendar className="w-4 h-4 neon-text mb-1" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Schedule</div>
                <div className="text-sm font-medium text-foreground">{club.schedule}</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <MapPin className="w-4 h-4 neon-text mb-1" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Location</div>
                <div className="text-sm font-medium text-foreground">{club.location}</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <Users className="w-4 h-4 neon-text mb-1" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Members</div>
                <div className="text-sm font-medium text-foreground">{club.memberCount} members</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <Calendar className="w-4 h-4 neon-text mb-1" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Active Since</div>
                <div className="text-sm font-medium text-foreground">{club.activeSince || "—"}</div>
              </div>
            </div>

            {activity && (activity.recentJoins > 0 || activity.totalEvents > 0) && (
              <div className="glass-card neon-border rounded-xl p-4 space-y-2" data-testid="section-recent-activity">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  Recent Activity
                </h3>
                {activity.recentJoins > 0 && (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-recent-joins">
                    <span className="neon-text font-medium">
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

            <ClubEvents clubId={club.id} isAuthenticated={isAuthenticated} />

            {club.highlights && club.highlights.length > 0 && (
              <div className="glass-card rounded-xl p-5 space-y-3" data-testid="section-highlights">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Star className="w-5 h-5 neon-text" /> Club Highlights
                </h3>
                {club.highlights.map((highlight, index) => (
                  <div key={index} className="border-l-2 border-neon/30 pl-3 text-sm text-foreground italic" data-testid="text-highlight">
                    {highlight}
                  </div>
                ))}
              </div>
            )}

            <div className="glass-card neon-border rounded-xl p-4" data-testid="card-founding">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 neon-text" />
                  <span className="text-sm font-semibold neon-text">Founding Member Spots</span>
                </div>
                <span className="text-xs font-bold neon-text">
                  {allFoundingTaken ? "All taken" : `${foundingSpotsLeft} of ${club.foundingTotal ?? 20} left`}
                </span>
              </div>
              <div className="w-full h-2 bg-neon/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-neon rounded-full transition-all neon-glow"
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

            {club.isActive === false ? (
              <div className="text-center py-4 space-y-2" data-testid="card-club-inactive">
                <p className="text-sm font-semibold text-foreground">This club is currently inactive</p>
                <p className="text-xs text-muted-foreground">Check back later or explore other clubs.</p>
              </div>
            ) : joinSuccess ? (
              <div className="text-center py-6 space-y-3" data-testid="card-join-success">
                <Star className="w-10 h-10 mx-auto neon-text" />
                <h3 className="font-display text-xl font-bold neon-text">You're in the tribe!</h3>
                <p className="text-sm text-muted-foreground">
                  Organizer will add you to WhatsApp group within 24 hours.
                </p>
                {club.whatsappNumber && (
                  <a
                    href={`https://wa.me/${club.whatsappNumber}?text=${encodeURIComponent(`Hi! I just joined ${club.name} on CultFam. Please add me to the group!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-foreground rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                    data-testid="button-join-whatsapp"
                  >
                    Message Organizer on WhatsApp
                  </a>
                )}
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-4 space-y-3" data-testid="card-join-signin">
                <p className="text-sm font-semibold text-foreground">Want to join {club.name}?</p>
                <p className="text-xs text-muted-foreground">Sign in first so the organizer can reach you</p>
                <a
                  href="/api/login"
                  className="inline-block bg-neon text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold neon-glow"
                  data-testid="button-signin-to-join"
                >
                  Sign In to Join
                </a>
              </div>
            ) : showJoinForm ? (
              <div className="space-y-3" data-testid="form-join">
                <p className="text-xs text-muted-foreground">Your phone number is shared with the organizer so they can add you to the WhatsApp group.</p>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 placeholder:text-muted-foreground"
                  data-testid="input-join-name"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (for WhatsApp group)"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 placeholder:text-muted-foreground"
                  data-testid="input-join-phone"
                />
                {joinError && (
                  <p className="text-xs text-destructive font-medium" data-testid="text-join-error">{joinError}</p>
                )}
                <button
                  onClick={handleJoinSubmit}
                  disabled={joinMutation.isPending}
                  className="w-full bg-neon text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-50 neon-glow"
                  data-testid="button-send-join"
                >
                  {joinMutation.isPending ? "Sending..." : "Send Join Request"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pt-2 pb-2">
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="flex-1 bg-neon text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all neon-glow"
                  data-testid="button-modal-join"
                >
                  I Want to Join
                </button>
                {club.whatsappNumber && (
                  <a
                    href={`https://wa.me/${club.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[50px] h-[50px] bg-emerald-600 text-foreground rounded-xl text-xl flex items-center justify-center shrink-0 transition-all"
                    data-testid="button-modal-whatsapp"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
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

function ClubEvents({ clubId, isAuthenticated }: { clubId: string; isAuthenticated: boolean }) {
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        <Calendar className="w-4 h-4 neon-text" />
        Upcoming Events
      </h3>
      <div className="space-y-2">
        {upcomingEvents.slice(0, 3).map((event) => {
          const d = new Date(event.startsAt);
          const spotsLeft = event.maxCapacity - event.rsvpCount;
          return (
            <div key={event.id} className="glass-card rounded-xl p-3" data-testid={`club-event-${event.id}`}>
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
                {isAuthenticated && spotsLeft > 0 && (
                  <button
                    onClick={() => rsvpMutation.mutate(event.id)}
                    disabled={rsvpMutation.isPending}
                    className="bg-neon text-primary-foreground px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
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

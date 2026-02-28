import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Star, Calendar, MapPin, Users, MessageCircle, Clock, User, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Club } from "@shared/schema";

const HEALTH_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  green: { dot: "bg-green-500", text: "text-green-700 dark:text-green-400", label: "Very Active" },
  yellow: { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400", label: "Active" },
  red: { dot: "bg-red-400", text: "text-red-600 dark:text-red-400", label: "Needs Members" },
};

interface ClubEvent {
  id: string;
  title: string;
  startsAt: string;
  locationText: string;
  maxCapacity: number;
  rsvpCount: number;
}

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: club, isLoading, error } = useQuery<Club>({
    queryKey: ["/api/clubs", id],
  });

  if (isLoading) {
    return <ClubDetailSkeleton />;
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-4">
            <User className="w-12 h-12 mx-auto text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-club-not-found">
            Club not found
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            This club may have been removed or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return <ClubDetailContent club={club} />;
}

function handleShareClub(club: Club) {
  const url = `${window.location.origin}/club/${club.id}`;
  const text = `Check out ${club.name} on Sangh! ${url}`;

  if (navigator.share) {
    navigator.share({ title: club.name, text: `Check out ${club.name} on Sangh!`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
}

function ClubDetailContent({ club }: { club: Club }) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinName, setJoinName] = useState(user?.firstName || "");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinError, setJoinError] = useState("");

  const { data: activity } = useQuery<{ recentJoins: number; recentJoinNames: string[]; totalEvents: number; lastEventDate: string | null }>({
    queryKey: ["/api/clubs", club.id, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/activity`);
      if (!res.ok) return { recentJoins: 0, recentJoinNames: [], totalEvents: 0, lastEventDate: null };
      return res.json();
    },
  });

  useEffect(() => {
    setJoinName(user?.firstName || "");
  }, [user]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "activity"] });
    },
    onError: () => {
      setJoinError("Something went wrong. Please try again.");
    },
  });

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
    <div className="min-h-screen bg-background">
      <div
        className="relative px-4 sm:px-6 pt-4 pb-8"
        style={{ backgroundColor: club.bgColor || undefined }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleShareClub(club)}
              data-testid="button-share-club"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-6xl mb-4" data-testid="text-club-emoji">{club.emoji}</div>

          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
            {club.category}
          </div>
          <h1
            className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3"
            data-testid="text-club-name"
          >
            {club.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${health.text}`}>
              <span className={`w-2 h-2 rounded-full ${health.dot}`} />
              {club.healthLabel}
            </span>
            {club.lastActive && (
              <span className="text-xs text-muted-foreground" data-testid="text-last-active">
                {club.lastActive}
              </span>
            )}
            <Badge variant="secondary" className="text-xs" data-testid="badge-members">
              <Users className="w-3 h-3 mr-1" />
              {club.memberCount} members
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-club-description">
          {club.fullDesc}
        </p>

        {club.organizerName && (
          <Card className="p-4 flex items-center gap-3" data-testid="card-organizer">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
              {club.organizerAvatar || <User className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">{club.organizerName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                {club.organizerYears && <span>{club.organizerYears}</span>}
                {club.organizerResponse && (
                  <>
                    <span className="mx-1">·</span>
                    <Clock className="w-3 h-3 inline" />
                    <span>{club.organizerResponse}</span>
                  </>
                )}
              </div>
            </div>
            {club.organizerYears && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[hsl(var(--clay))]/10 text-[hsl(var(--clay))] rounded-full border border-[hsl(var(--clay))]/20 whitespace-nowrap">
                {club.organizerYears.split(" ")[0]} organizer
              </span>
            )}
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Schedule</div>
            <div className="text-sm font-medium text-foreground" data-testid="text-schedule">{club.schedule}</div>
          </Card>
          <Card className="p-4">
            <MapPin className="w-5 h-5 text-primary mb-2" />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Location</div>
            <div className="text-sm font-medium text-foreground" data-testid="text-location">{club.location}</div>
          </Card>
          <Card className="p-4">
            <Users className="w-5 h-5 text-primary mb-2" />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Members</div>
            <div className="text-sm font-medium text-foreground" data-testid="text-member-count">{club.memberCount} members</div>
          </Card>
          <Card className="p-4">
            <Clock className="w-5 h-5 text-primary mb-2" />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Active Since</div>
            <div className="text-sm font-medium text-foreground" data-testid="text-active-since">{club.activeSince || "—"}</div>
          </Card>
        </div>

        {activity && (activity.recentJoins > 0 || activity.totalEvents > 0) && (
          <Card className="p-5 bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/30 dark:border-orange-800/20 space-y-3" data-testid="section-recent-activity">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              🔥 Recent Activity
            </h3>
            <div className="space-y-2">
              {activity.recentJoins > 0 && (
                <div className="flex items-center gap-2 text-sm" data-testid="text-recent-joins">
                  <span className="text-orange-500">🌱</span>
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
                  <span className="text-orange-500">📅</span>
                  <span className="text-foreground font-medium">{activity.totalEvents} events hosted</span>
                </div>
              )}
              {activity.lastEventDate && (
                <div className="text-sm text-muted-foreground pl-6" data-testid="text-last-event">
                  Last meetup: {new Date(activity.lastEventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </div>
              )}
            </div>
          </Card>
        )}

        <ClubEvents clubId={club.id} isAuthenticated={isAuthenticated} />

        <Card className="p-4 bg-[hsl(var(--clay))]/[0.06] border-[hsl(var(--clay))]/15" data-testid="card-founding">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
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
        </Card>

        {club.highlights && club.highlights.length > 0 && (
          <Card className="p-5 space-y-3" data-testid="section-highlights">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Club Highlights
            </h3>
            {club.highlights.map((highlight, index) => (
              <div key={index} className="border-l-2 border-primary/30 pl-3 text-sm text-foreground italic" data-testid="text-highlight">
                {highlight}
              </div>
            ))}
          </Card>
        )}

        {joinSuccess ? (
          <Card className="p-6 text-center space-y-3" data-testid="card-join-success">
            <div className="text-4xl">
              <Star className="w-10 h-10 mx-auto text-[hsl(var(--clay))]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground">You're in the tribe!</h3>
            <p className="text-sm text-muted-foreground">
              Organizer will add you to WhatsApp group within 24 hours.
            </p>
            {club.whatsappNumber && (
              <a
                href={`https://wa.me/${club.whatsappNumber}?text=${encodeURIComponent(`Hi! I just joined ${club.name} on Sangh. Please add me to the group!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-md px-5 py-3 text-sm font-semibold transition-all border border-[#25D366]"
                data-testid="button-join-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                Message Organizer on WhatsApp
              </a>
            )}
          </Card>
        ) : showJoinForm ? (
          <Card className="p-6 space-y-3" data-testid="form-join">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Join {club.name}</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="input-join-name"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={joinPhone}
              onChange={(e) => setJoinPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="input-join-phone"
            />
            {joinError && (
              <p className="text-xs text-red-500 font-medium" data-testid="text-join-error">{joinError}</p>
            )}
            <Button
              onClick={handleJoinSubmit}
              disabled={joinMutation.isPending}
              className="w-full"
              data-testid="button-send-join"
            >
              {joinMutation.isPending ? "Sending..." : "Send Join Request"}
            </Button>
          </Card>
        ) : (
          <div className="flex items-center gap-3 pt-2 pb-4">
            <Button
              onClick={() => setShowJoinForm(true)}
              className="flex-1"
              data-testid="button-join"
            >
              I Want to Join
            </Button>
            {club.whatsappNumber && (
              <a
                href={`https://wa.me/${club.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-whatsapp"
              >
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
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
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        Upcoming Events
      </h3>
      <div className="space-y-3">
        {upcomingEvents.slice(0, 5).map((event) => {
          const d = new Date(event.startsAt);
          const spotsLeft = event.maxCapacity - event.rsvpCount;
          return (
            <Card key={event.id} className="p-4" data-testid={`club-event-${event.id}`}>
              <div className="font-medium text-sm text-foreground mb-1">{event.title}</div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.locationText}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.rsvpCount} going · {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
                </span>
                {isAuthenticated && spotsLeft > 0 && (
                  <Button
                    size="sm"
                    onClick={() => rsvpMutation.mutate(event.id)}
                    disabled={rsvpMutation.isPending}
                    data-testid={`button-rsvp-club-${event.id}`}
                  >
                    Count Me In
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ClubDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 pt-4 pb-8 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="w-20 h-5 mb-6" />
          <Skeleton className="w-16 h-16 rounded-md mb-4" />
          <Skeleton className="w-24 h-3 mb-2" />
          <Skeleton className="w-64 h-8 mb-3" />
          <div className="flex gap-3">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-24 h-5" />
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-20" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </div>
  );
}

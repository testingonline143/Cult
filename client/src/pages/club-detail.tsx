import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Share2, MapPin, Calendar, Users, ArrowRight, Star, MessageCircle, User, Settings, Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Club } from "@shared/schema";

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
          <h2 className="font-display text-xl font-bold text-foreground mb-2" data-testid="text-club-not-found">
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

  if (club.isActive === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <h2 className="font-display text-xl font-bold text-foreground mb-2" data-testid="text-club-inactive">
            This club is currently inactive
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {club.name} has been temporarily deactivated. Check back later or explore other clubs.
          </p>
          <Button onClick={() => navigate("/explore")} data-testid="button-explore-clubs">
            Explore Other Clubs
          </Button>
        </Card>
      </div>
    );
  }

  return <ClubDetailContent club={club} />;
}

function handleShareClub(club: Club) {
  const url = `${window.location.origin}/club/${club.id}`;
  const text = `Check out ${club.name} on CultFam! ${url}`;

  if (navigator.share) {
    navigator.share({ title: club.name, text: `Check out ${club.name} on CultFam!`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
}

function ClubDetailContent({ club }: { club: Club }) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isOwner = !!(user && club.creatorUserId && user.id === club.creatorUserId);
  const joinFormRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (showJoinForm && joinFormRef.current) {
      joinFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showJoinForm]);

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

  const tags: string[] = [];
  if (club.highlights && club.highlights.length > 0) {
    tags.push(...club.highlights);
  }
  if (club.vibe === "casual") {
    tags.push("Beginner-friendly");
  }
  if (club.city) {
    tags.push(club.city);
  }
  if (club.timeOfDay) {
    tags.push(club.timeOfDay.charAt(0).toUpperCase() + club.timeOfDay.slice(1));
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* 1. HERO SECTION */}
      <div className="relative h-64 w-full bg-gradient-to-b from-neon/20 via-card to-background flex items-center justify-center">
        <span className="text-8xl select-none" data-testid="text-club-emoji">{club.emoji}</span>

        <button
          onClick={() => navigate("/explore")}
          className="absolute top-4 left-4 glass-card rounded-full p-2"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <button
          onClick={() => handleShareClub(club)}
          className="absolute top-4 right-4 glass-card rounded-full p-2"
          data-testid="button-share-club"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-neon text-primary-foreground rounded-full px-3 py-1 text-xs font-bold uppercase" data-testid="badge-category">
              {club.category}
            </span>
            {club.schedule && (
              <span className="glass-card rounded-full px-3 py-1 text-xs font-medium text-foreground" data-testid="badge-schedule">
                {club.schedule}
              </span>
            )}
          </div>
          <h1
            className="font-display text-3xl font-bold text-foreground mt-2"
            data-testid="text-club-name"
          >
            {club.name}
          </h1>
        </div>
      </div>

      {/* 2. LEADER + HEALTH SECTION */}
      {club.organizerName && (
        <div className="px-4 py-4 flex justify-between items-center gap-4" data-testid="section-leader">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon/20 flex items-center justify-center shrink-0">
              <span className="neon-text font-bold text-lg">
                {club.organizerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Leader</div>
              <div className="font-display font-bold text-foreground">{club.organizerName}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Members</div>
            <div className="font-display text-2xl font-bold text-foreground" data-testid="text-member-count">
              {club.memberCount}
            </div>
          </div>
        </div>
      )}

      {/* HEALTH STATUS + ACTIVE SINCE */}
      <div className="px-4 py-2 flex items-center gap-4 flex-wrap" data-testid="section-health">
        {club.healthLabel && (
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${
            club.healthStatus === "green" ? "text-neon" : club.healthStatus === "yellow" ? "text-chart-4" : "text-destructive"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              club.healthStatus === "green" ? "bg-neon" : club.healthStatus === "yellow" ? "bg-chart-4" : "bg-destructive"
            }`} />
            {club.healthLabel}
          </span>
        )}
        {club.activeSince && (
          <span className="text-xs text-muted-foreground">Active since {club.activeSince}</span>
        )}
      </div>

      {isOwner && (
        <div className="px-4 py-3" data-testid="section-organiser-controls">
          <div className="glass-card neon-border rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold neon-text uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              Organiser Controls
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/organizer`)}
                className="flex items-center gap-2 bg-neon/15 hover:bg-neon/25 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold neon-text"
                data-testid="button-view-dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                View Dashboard
              </button>
              <button
                onClick={() => navigate(`/create?tab=event&clubId=${club.id}`)}
                className="flex items-center gap-2 bg-neon/15 hover:bg-neon/25 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold neon-text"
                data-testid="button-create-event-for-club"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
              <button
                onClick={() => navigate(`/organizer`)}
                className="flex items-center gap-2 bg-neon/15 hover:bg-neon/25 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold neon-text"
                data-testid="button-edit-club"
              >
                <Settings className="w-4 h-4" />
                Edit Club
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABOUT SECTION */}
      <div className="px-4 py-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h2>
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-club-description">
          {club.fullDesc}
        </p>
      </div>

      {/* 4. TAGS/HIGHLIGHTS SECTION */}
      {tags.length > 0 && (
        <div className="px-4 py-2" data-testid="section-tags">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="glass-card rounded-full px-3 py-1.5 text-xs text-muted-foreground" data-testid={`tag-${i}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      {activity && (activity.recentJoins > 0 || activity.totalEvents > 0) && (
        <div className="px-4 py-4" data-testid="section-recent-activity">
          <div className="glass-card neon-border rounded-2xl p-4 space-y-2">
            <h3 className="font-display text-base font-bold text-foreground">Recent Activity</h3>
            {activity.recentJoins > 0 && (
              <div className="flex items-center gap-2 text-sm" data-testid="text-recent-joins">
                <Users className="w-4 h-4 neon-text" />
                <span className="text-foreground">
                  <span className="font-semibold neon-text">{activity.recentJoins}</span> new {activity.recentJoins === 1 ? "member" : "members"} this week
                </span>
              </div>
            )}
            {activity.totalEvents > 0 && (
              <div className="flex items-center gap-2 text-sm" data-testid="text-total-events">
                <Calendar className="w-4 h-4 neon-text" />
                <span className="text-foreground">
                  <span className="font-semibold neon-text">{activity.totalEvents}</span> {activity.totalEvents === 1 ? "event" : "events"} hosted
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. UPCOMING EVENTS SECTION */}
      <ClubEvents clubId={club.id} clubName={club.name} isAuthenticated={isAuthenticated} />

      {/* Founding Member Card */}
      <div className="px-4 py-4">
        <Card className="p-4 glass-card neon-border" data-testid="card-founding">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
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
        </Card>
      </div>

      {/* 6. JOIN CTA - Sticky at bottom */}
      {joinSuccess ? (
        <div className="px-4 py-6">
          <Card className="p-6 text-center space-y-3" data-testid="card-join-success">
            <div className="text-4xl">
              <Star className="w-10 h-10 mx-auto neon-text" />
            </div>
            <h3 className="font-display text-xl font-bold neon-text">You're in the tribe!</h3>
            <p className="text-sm text-muted-foreground">
              Organizer will add you to WhatsApp group within 24 hours.
            </p>
            {club.whatsappNumber && (
              <a
                href={`https://wa.me/${club.whatsappNumber}?text=${encodeURIComponent(`Hi! I just joined ${club.name} on CultFam. Please add me to the group!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 text-foreground rounded-md px-5 py-3 text-sm font-semibold transition-all border border-emerald-600"
                data-testid="button-join-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                Message Organizer on WhatsApp
              </a>
            )}
          </Card>
        </div>
      ) : showJoinForm ? (
        <div ref={joinFormRef} className="px-4 py-6">
          <Card className="p-6 space-y-3" data-testid="form-join">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Join {club.name}</h3>
            <p className="text-xs text-muted-foreground mb-1">Your phone number is shared with the organizer so they can add you to the WhatsApp group.</p>
            <input
              type="text"
              placeholder="Your Name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              className="w-full px-4 py-3 rounded-md glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 placeholder:text-muted-foreground"
              data-testid="input-join-name"
            />
            <input
              type="tel"
              placeholder="Phone Number (for WhatsApp group)"
              value={joinPhone}
              onChange={(e) => setJoinPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-md glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 placeholder:text-muted-foreground"
              data-testid="input-join-phone"
            />
            {joinError && (
              <p className="text-xs text-destructive font-medium" data-testid="text-join-error">{joinError}</p>
            )}
            <button
              onClick={handleJoinSubmit}
              disabled={joinMutation.isPending}
              className="w-full bg-neon text-background rounded-xl py-4 font-display font-bold text-lg neon-glow disabled:opacity-50"
              data-testid="button-send-join"
            >
              {joinMutation.isPending ? "Sending..." : "Send Join Request"}
            </button>
          </Card>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 px-4 py-3 space-y-2" data-testid="sticky-join-cta">
          {!isAuthenticated ? (
            <a
              href="/api/login"
              className="block w-full bg-neon text-primary-foreground text-center rounded-xl py-4 font-display font-bold text-lg neon-glow"
              data-testid="button-signin-to-join"
            >
              Sign In to Join
            </a>
          ) : (
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full bg-neon text-background rounded-xl py-4 font-display font-bold text-lg neon-glow"
              data-testid="button-join"
            >
              I Want to Join
            </button>
          )}
          {club.whatsappNumber && (
            <a
              href={`https://wa.me/${club.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full glass-card rounded-xl py-3 text-sm font-medium text-foreground"
              data-testid="button-whatsapp"
            >
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ClubEvents({ clubId, clubName, isAuthenticated }: { clubId: string; clubName: string; isAuthenticated: boolean }) {
  const [, navigate] = useLocation();
  const [justRsvpdId, setJustRsvpdId] = useState<string | null>(null);

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
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "events"] });
      setJustRsvpdId(eventId);
    },
  });

  const upcomingEvents = events.filter((e) => new Date(e.startsAt) > new Date());

  return (
    <div className="px-4 py-4" data-testid="section-club-events">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Upcoming Events</h2>
      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming events</p>
      ) : (
        <div className="space-y-2">
          {upcomingEvents.slice(0, 5).map((event) => {
            const d = new Date(event.startsAt);
            const month = d.toLocaleDateString("en-IN", { month: "short" });
            const day = d.getDate();
            return (
              <div
                key={event.id}
                className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer hover-elevate"
                onClick={() => navigate(`/event/${event.id}`)}
                data-testid={`club-event-${event.id}`}
              >
                <div className="bg-neon/10 rounded-lg p-2 flex flex-col items-center justify-center shrink-0 min-w-[3rem]">
                  <span className="text-xs neon-text font-medium">{month}</span>
                  <span className="font-bold text-foreground text-lg leading-tight">{day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-foreground text-sm truncate">{event.title}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{event.locationText}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 neon-text shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClubDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="h-64 w-full bg-gradient-to-b from-card to-background flex items-center justify-center">
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
      <div className="px-4 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="w-16 h-3 mb-1" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="w-16 h-3 mb-1 ml-auto" />
          <Skeleton className="w-10 h-7 ml-auto" />
        </div>
      </div>
      <div className="px-4 py-4 space-y-2">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      <div className="px-4 py-2 flex gap-2 flex-wrap">
        <Skeleton className="w-20 h-7 rounded-full" />
        <Skeleton className="w-24 h-7 rounded-full" />
        <Skeleton className="w-16 h-7 rounded-full" />
      </div>
    </div>
  );
}

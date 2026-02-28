import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event, Club, EventRsvp } from "@shared/schema";

interface EventDetailResponse extends Event {
  rsvps: EventRsvp[];
  club: Club | null;
}

function handleShareEvent(event: Event, clubName: string) {
  const url = `${window.location.origin}/event/${event.id}`;
  const text = `Check out ${event.title} by ${clubName} on CultFam! ${url}`;

  if (navigator.share) {
    navigator.share({ title: event.title, text: `Check out ${event.title} by ${clubName} on CultFam!`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
}

function handleShareAfterRsvp(event: Event, clubName: string) {
  const url = `${window.location.origin}/event/${event.id}`;
  const text = `I'm going to ${event.title} with ${clubName}! Join me: ${url}`;

  if (navigator.share) {
    navigator.share({ title: event.title, text: `I'm going to ${event.title} with ${clubName}! Join me`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [justRsvpd, setJustRsvpd] = useState(false);

  const { data: eventData, isLoading, error } = useQuery<EventDetailResponse>({
    queryKey: ["/api/events", id],
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "RSVP failed" }));
        throw new Error(data.message || "RSVP failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      if (!data.alreadyRsvpd) {
        setJustRsvpd(true);
      }
    },
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${id}/rsvp`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to cancel RSVP");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setJustRsvpd(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-event-not-found">
            Event not found
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            This event may have been removed or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const club = eventData.club;
  const d = new Date(eventData.startsAt);
  const isPast = d < new Date();
  const rsvpCount = eventData.rsvps?.filter(r => r.status === "going").length ?? 0;
  const spotsLeft = eventData.maxCapacity - rsvpCount;
  const userRsvp = eventData.rsvps?.find(r => r.userId === user?.id && r.status === "going");
  const hasRsvp = !!userRsvp;
  const clubName = club?.name || "a club";

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1 as any)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => handleShareEvent(eventData, clubName)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            data-testid="button-share-event"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {club && (
          <Link
            href={`/club/${club.id}`}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            data-testid="link-event-club"
          >
            <span className="text-lg">{club.emoji}</span>
            <span className="text-xs font-medium text-muted-foreground">{club.name}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </Link>
        )}

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4" data-testid="text-event-title">
          {eventData.title}
        </h1>

        {isPast && (
          <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase mb-4" data-testid="badge-past">
            Past Event
          </div>
        )}

        <Card className="p-4 sm:p-5 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground" data-testid="text-event-date">{formatDate(eventData.startsAt)}</div>
                <div className="text-xs text-muted-foreground" data-testid="text-event-time">
                  {formatTime(eventData.startsAt)}
                  {eventData.endsAt && ` — ${formatTime(eventData.endsAt)}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground" data-testid="text-event-location">{eventData.locationText}</div>
                {eventData.locationUrl && (
                  <a
                    href={eventData.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                    data-testid="link-event-map"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground" data-testid="text-event-capacity">
                  {rsvpCount} going · {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                </div>
                <div className="text-xs text-muted-foreground">of {eventData.maxCapacity} max</div>
              </div>
            </div>
          </div>
        </Card>

        {eventData.description && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About this event</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-event-description">
              {eventData.description}
            </p>
          </div>
        )}

        {justRsvpd && !isPast && (
          <Card className="p-5 mb-6 border-primary/20 bg-primary/5 text-center" data-testid="card-rsvp-success">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">You're in! 🎉</h3>
            <p className="text-sm text-muted-foreground mb-4">Bring your friends along — the more the merrier!</p>
            <button
              onClick={() => handleShareAfterRsvp(eventData, clubName)}
              className="w-full bg-[#25D366] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
              data-testid="button-share-after-rsvp"
            >
              <Share2 className="w-4 h-4" />
              Share with Friends on WhatsApp
            </button>
          </Card>
        )}

        {!isPast && (
          <div className="space-y-3">
            {!isAuthenticated ? (
              <div className="text-center space-y-3">
                <Button
                  size="lg"
                  className="w-full rounded-xl py-6 text-sm font-semibold"
                  onClick={() => { window.location.href = "/api/login"; }}
                  data-testid="button-sign-in-rsvp"
                >
                  Sign In to RSVP
                </Button>
              </div>
            ) : hasRsvp && !justRsvpd ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold" data-testid="text-already-rsvpd">
                  <CheckCircle2 className="w-4 h-4" />
                  You're going!
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShareAfterRsvp(eventData, clubName)}
                    className="flex-1 bg-[#25D366] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
                    data-testid="button-share-rsvpd"
                  >
                    <Share2 className="w-4 h-4" />
                    Invite Friends
                  </button>
                  <button
                    onClick={() => cancelRsvpMutation.mutate()}
                    disabled={cancelRsvpMutation.isPending}
                    className="px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-cancel-rsvp"
                  >
                    {cancelRsvpMutation.isPending ? "..." : "Cancel"}
                  </button>
                </div>
              </div>
            ) : !justRsvpd && spotsLeft > 0 ? (
              <Button
                size="lg"
                className="w-full rounded-xl py-6 text-sm font-semibold"
                onClick={() => rsvpMutation.mutate()}
                disabled={rsvpMutation.isPending}
                data-testid="button-rsvp"
              >
                {rsvpMutation.isPending ? "Joining..." : "Count Me In"}
              </Button>
            ) : !justRsvpd && spotsLeft <= 0 ? (
              <div className="text-center py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium" data-testid="text-event-full">
                This event is full
              </div>
            ) : null}
          </div>
        )}

        {isPast && (
          <div className="text-center py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium" data-testid="text-event-past">
            This event has already happened
          </div>
        )}
      </div>
    </div>
  );
}

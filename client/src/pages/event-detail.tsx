import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Calendar, MapPin, Users, Share2, CheckCircle2, ExternalLink, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="rounded-2xl p-8 text-center max-w-md w-full" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--terra-pale)' }}>
            <Calendar className="w-7 h-7 text-[var(--terra)]" />
          </div>
          <h2 className="font-display text-xl font-bold text-[var(--ink)] mb-2" data-testid="text-event-not-found">
            Event not found
          </h2>
          <p className="text-sm text-[var(--muted-warm)] mb-4">
            This event may have been removed or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </div>
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
      <div className="relative h-64 w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #2D1A0A 0%, #5A3018 40%, #3D200C 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 40% 50%, rgba(196,98,45,0.4) 0%, transparent 60%)' }} />
          <span className="text-[80px] select-none relative z-[2]">{club?.emoji || ""}</span>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--cream) 100%)' }} />
        </div>

        <button
          onClick={() => navigate(-1 as any)}
          className="absolute top-14 left-5 w-9 h-9 rounded-xl flex items-center justify-center z-10"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={() => handleShareEvent(eventData, clubName)}
          className="absolute top-14 right-5 w-9 h-9 rounded-xl flex items-center justify-center z-10"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
          data-testid="button-share-event"
        >
          <Share2 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="relative z-[5] px-6 -mt-8">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-1.5 rounded-md mb-2" style={{ background: 'var(--terra-pale)', color: 'var(--terra)', border: '1px solid rgba(196,98,45,0.2)' }}>
          {club?.category || "Event"}
        </span>

        <h1 className="font-display text-[28px] font-black text-[var(--ink)] leading-[1.1] tracking-tight mb-4" data-testid="text-event-title">
          {eventData.title}
        </h1>

        {club && (
          <Link
            href={`/club/${club.id}`}
            className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-[14px] transition-colors hover-elevate"
            style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
            data-testid="link-event-club"
          >
            <span className="text-lg">{club.emoji}</span>
            <span className="text-xs font-medium text-[var(--muted-warm)]">{club.name}</span>
            <ExternalLink className="w-3 h-3 text-[var(--muted-warm)]" />
          </Link>
        )}

        {isPast && (
          <div className="inline-block px-3 py-1 rounded-md text-[var(--muted-warm)] text-xs font-bold uppercase mb-4" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="badge-past">
            Past Event
          </div>
        )}

        <div className="rounded-2xl p-4 sm:p-5 mb-4" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0" style={{ background: 'var(--terra-pale)', border: '1px solid rgba(196,98,45,0.15)' }}>
                <Calendar className="w-4 h-4 text-[var(--terra)]" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[1px] text-[var(--muted-warm)] mb-0.5">When</div>
                <div className="text-[13px] font-semibold text-[var(--ink)] leading-snug" data-testid="text-event-date">{formatDate(eventData.startsAt)}</div>
                <div className="text-xs text-[var(--muted-warm)]" data-testid="text-event-time">
                  {formatTime(eventData.startsAt)}
                  {eventData.endsAt && ` \u2014 ${formatTime(eventData.endsAt)}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ borderTop: '1px solid var(--warm-border)', paddingTop: '12px' }}>
              <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0" style={{ background: 'var(--terra-pale)', border: '1px solid rgba(196,98,45,0.15)' }}>
                <MapPin className="w-4 h-4 text-[var(--terra)]" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[1px] text-[var(--muted-warm)] mb-0.5">Where</div>
                <div className="text-[13px] font-semibold text-[var(--ink)]" data-testid="text-event-location">{eventData.locationText}</div>
                {eventData.locationUrl && (
                  <a
                    href={eventData.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--terra)] hover:underline"
                    data-testid="link-event-map"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ borderTop: '1px solid var(--warm-border)', paddingTop: '12px' }}>
              <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0" style={{ background: 'var(--terra-pale)', border: '1px solid rgba(196,98,45,0.15)' }}>
                <Users className="w-4 h-4 text-[var(--terra)]" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[1px] text-[var(--muted-warm)] mb-0.5">Capacity</div>
                <div className="text-[13px] font-semibold text-[var(--ink)]" data-testid="text-event-capacity">
                  {rsvpCount} going &middot; {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                </div>
                <div className="text-xs text-[var(--muted-warm)]">of {eventData.maxCapacity} max</div>
              </div>
            </div>
          </div>
        </div>

        {rsvpCount > 0 && (
          <div className="rounded-[14px] px-4 py-3 flex items-center justify-between mb-4" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[
                  { bg: 'var(--terra)', letter: 'A' },
                  { bg: 'var(--green-accent)', letter: 'B' },
                  { bg: 'var(--gold)', letter: 'C' },
                ].slice(0, Math.min(rsvpCount, 3)).map((av, i) => (
                  <div key={i} className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ background: av.bg, border: '2px solid var(--cream)' }}>
                    {av.letter}
                  </div>
                ))}
              </div>
              <span className="text-xs text-[var(--ink3)] font-medium ml-2.5">{rsvpCount} joining</span>
            </div>
            {spotsLeft > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,107,53,0.1)', color: '#D4521A', border: '1px solid rgba(196,98,45,0.25)' }}>
                {spotsLeft} spots left
              </span>
            )}
          </div>
        )}

        {eventData.description && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[var(--muted-warm)] uppercase tracking-wider mb-2">About this event</h3>
            <p className="text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap" data-testid="text-event-description">
              {eventData.description}
            </p>
          </div>
        )}

        {club && (
          <div className="rounded-2xl p-4 flex gap-3.5 items-center mb-4" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
            <div className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center text-2xl shrink-0" style={{ background: 'linear-gradient(135deg, #E8D5B8, #C4A882)', border: '2px solid var(--terra)' }}>
              {club.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base font-bold text-[var(--ink)]">{club.organizerName || club.name}</div>
              <div className="text-[11px] text-[var(--muted-warm)]">Hosted by {club.name}</div>
            </div>
          </div>
        )}

        {justRsvpd && !isPast && (
          <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: 'var(--warm-white)', border: '1.5px solid rgba(196,98,45,0.3)' }} data-testid="card-rsvp-success">
            <CheckCircle2 className="w-10 h-10 text-[var(--terra)] mx-auto mb-2" />
            <h3 className="font-display text-lg font-bold text-[var(--ink)] mb-1">You're in!</h3>
            <p className="text-sm text-[var(--muted-warm)] mb-4">Bring your friends along &mdash; the more the merrier!</p>
            <button
              onClick={() => handleShareAfterRsvp(eventData, clubName)}
              className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'var(--terra-pale)', color: 'var(--terra)', border: '1px solid rgba(196,98,45,0.3)' }}
              data-testid="button-share-after-rsvp"
            >
              <Share2 className="w-4 h-4" />
              Share with Friends on WhatsApp
            </button>
          </div>
        )}

        {hasRsvp && !isPast && userRsvp && (
          <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--warm-white)', border: '1.5px solid rgba(196,98,45,0.3)' }} data-testid="card-my-ticket">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-[var(--terra)]" />
              <h3 className="font-display text-lg font-bold text-[var(--ink)]">My Ticket</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-xl p-3 mb-4">
                <img
                  src={`/api/rsvps/${userRsvp.id}/qr`}
                  alt="Your event ticket QR code"
                  className="w-[200px] h-[200px]"
                  data-testid="img-ticket-qr"
                />
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm font-semibold text-[var(--ink)]" data-testid="text-ticket-event">{eventData.title}</div>
                <div className="text-xs text-[var(--muted-warm)]" data-testid="text-ticket-date">
                  {formatDate(eventData.startsAt)} &middot; {formatTime(eventData.startsAt)}
                </div>
                <div className="text-xs text-[var(--muted-warm)]">{eventData.locationText}</div>
              </div>
              <div className="mt-4 px-4 py-2 rounded-xl text-center" style={{ background: 'var(--terra-pale)' }}>
                <p className="text-xs text-[var(--terra)] font-medium" data-testid="text-ticket-instruction">
                  Show this QR to the organizer at entry
                </p>
              </div>
            </div>
          </div>
        )}

        {!isPast && (
          <div className="space-y-3 pb-8">
            {!isAuthenticated ? (
              <div className="text-center space-y-3">
                <Button
                  size="lg"
                  className="w-full rounded-md py-6 text-sm font-semibold"
                  onClick={() => { window.location.href = "/api/login"; }}
                  data-testid="button-sign-in-rsvp"
                >
                  Sign In to RSVP
                </Button>
              </div>
            ) : hasRsvp && !justRsvpd ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--terra-pale)', color: 'var(--terra)' }} data-testid="text-already-rsvpd">
                  <CheckCircle2 className="w-4 h-4" />
                  You're going!
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShareAfterRsvp(eventData, clubName)}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: 'var(--terra-pale)', color: 'var(--terra)', border: '1px solid rgba(196,98,45,0.3)' }}
                    data-testid="button-share-rsvpd"
                  >
                    <Share2 className="w-4 h-4" />
                    Invite Friends
                  </button>
                  <button
                    onClick={() => cancelRsvpMutation.mutate()}
                    disabled={cancelRsvpMutation.isPending}
                    className="px-4 py-3 rounded-xl text-sm text-[var(--muted-warm)] hover:text-[var(--ink)] transition-colors"
                    style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
                    data-testid="button-cancel-rsvp"
                  >
                    {cancelRsvpMutation.isPending ? "..." : "Cancel"}
                  </button>
                </div>
              </div>
            ) : !justRsvpd && spotsLeft > 0 ? (
              <button
                onClick={() => rsvpMutation.mutate()}
                disabled={rsvpMutation.isPending}
                className="w-full rounded-2xl py-4 font-display font-bold italic text-base tracking-tight flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: 'var(--ink)', color: 'var(--cream)' }}
                data-testid="button-rsvp"
              >
                {rsvpMutation.isPending ? "Joining..." : "Count Me In"}
              </button>
            ) : !justRsvpd && spotsLeft <= 0 ? (
              <div className="text-center py-3 rounded-xl text-[var(--muted-warm)] text-sm font-medium" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="text-event-full">
                This event is full
              </div>
            ) : null}
          </div>
        )}

        {isPast && (
          <div className="text-center py-3 rounded-xl text-[var(--muted-warm)] text-sm font-medium mb-8" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="text-event-past">
            This event has already happened
          </div>
        )}
      </div>
    </div>
  );
}

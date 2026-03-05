import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { format, isToday } from "date-fns";
import type { Club, Event } from "@shared/schema";
import { Link, useLocation } from "wouter";

interface EventWithClub extends Event {
  clubName?: string;
  rsvpCount?: number;
}

export default function HomeFeed() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: clubs = [], isLoading: clubsLoading } = useQuery<(Club & { recentJoins?: number })[]>({
    queryKey: ["/api/clubs-with-activity"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<EventWithClub[]>({
    queryKey: ["/api/events"],
  });

  const todayEvents = events
    .filter((e) => isToday(new Date(e.startsAt)))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const todayEvent = todayEvents[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-10 pb-2">
        <p className="text-[10px] font-semibold tracking-[3px] uppercase mb-1" style={{ color: "var(--terra)" }} data-testid="text-hero-eyebrow">
          Tirupati Edition
        </p>
        <h1 className="font-display text-[34px] font-black leading-[0.95] tracking-tight" style={{ color: "var(--ink)" }} data-testid="text-hero-heading">
          Find Your <em className="italic" style={{ color: "var(--terra)" }}>Tribe</em>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm" data-testid="text-hero-subtitle">Real life starts here.</p>
      </div>

      <div className="mx-6 flex items-center gap-2.5 py-2.5 mb-5" style={{ borderTop: "1.5px solid var(--ink)", borderBottom: "1px solid var(--warm-border)" }}>
        <span className="w-[7px] h-[7px] rounded-full shrink-0 animate-pulse" style={{ background: "var(--terra)" }} />
        <span className="text-[11px] font-medium truncate flex-1" style={{ color: "var(--muted-warm)" }}>
          {clubs.length} active clubs · {events.length} upcoming events
        </span>
        <span className="font-mono text-sm shrink-0" style={{ color: "var(--terra)", letterSpacing: "1px" }}>
          LIVE
        </span>
      </div>

      {user && !user.quizCompleted && (
        <div className="px-6 mb-6">
          <Link
            href="/onboarding"
            className="block rounded-[18px] p-5 transition-all group"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
            data-testid="card-quiz-prompt"
          >
            <div className="flex items-center gap-4">
              <ArrowRight className="w-8 h-8 shrink-0" style={{ color: "var(--terra)" }} />
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--ink)" }}>Find your perfect clubs</h3>
                <p className="text-sm" style={{ color: "var(--muted-warm)" }}>Take a 2-minute quiz to get matched</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: "var(--terra)" }} />
            </div>
          </Link>
        </div>
      )}

      <div className="px-6 mb-6">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="rounded-full w-2 h-2 inline-block animate-pulse" style={{ background: "var(--terra)" }} />
            <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.3px" }} data-testid="text-happening-today">Happening Today</h2>
          </div>
          <Link href="/events" className="text-[11px] font-bold tracking-[1px] uppercase" style={{ color: "var(--terra)" }} data-testid="link-view-all-events">
            VIEW ALL
          </Link>
        </div>

        {eventsLoading ? (
          <div className="rounded-[24px] p-4 space-y-3" style={{ background: "var(--ink)" }}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>
        ) : todayEvent ? (
          <div className="rounded-[24px] overflow-hidden" style={{ background: "var(--ink)" }} data-testid={`card-event-${todayEvent.id}`}>
            <div className="relative h-[200px] flex items-center justify-center"
              style={{ background: "linear-gradient(160deg, #2D1A0A 0%, #4A2A12 40%, #3D1F0A 70%, #1A0D05 100%)" }}>
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(196,98,45,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(201,168,76,0.15) 0%, transparent 50%)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, var(--ink) 100%)" }} />
              {todayEvent.clubName && (
                <span className="absolute top-3.5 left-3.5 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] uppercase text-white z-10" style={{ background: "var(--terra)" }} data-testid="text-event-badge">
                  TODAY
                </span>
              )}
            </div>
            <div className="px-[18px] pb-[18px] relative z-10">
              {todayEvent.clubName && (
                <p className="text-[10px] font-semibold tracking-[1.5px] uppercase mb-1.5" style={{ color: "var(--terra-light)" }} data-testid="text-event-club">
                  {todayEvent.clubName}
                </p>
              )}
              <h3 className="font-display font-bold text-xl mb-3.5" style={{ color: "var(--cream)", lineHeight: "1.2" }} data-testid="text-event-title">
                {todayEvent.title}
              </h3>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-warm2)" }}>
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span data-testid="text-event-time">{format(new Date(todayEvent.startsAt), "EEE, MMM d · h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-warm2)" }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span data-testid="text-event-location">{todayEvent.locationText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-warm2)" }}>
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span data-testid="text-event-spots">
                      {todayEvent.maxCapacity - (todayEvent.rsvpCount ?? 0)} spots left
                    </span>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-xl text-white text-[13px] font-bold" style={{ background: "var(--terra)" }} data-testid="button-join-event">
                  <Link href={`/event/${todayEvent.id}`}>Join Event</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--muted-warm)" }} data-testid="text-no-events">No events today</p>
        )}
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.3px" }} data-testid="text-trending-clubs">Trending Clubs</h2>
          <Link href="/explore" className="text-[11px] font-bold tracking-[1px] uppercase" style={{ color: "var(--terra)" }} data-testid="link-explore">
            EXPLORE
          </Link>
        </div>

        {clubsLoading ? (
          <div className="flex gap-3 pb-4 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[18px] w-[148px] flex-shrink-0" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}>
                <Skeleton className="h-[92px] rounded-t-[18px]" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 pb-4 overflow-x-auto">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => navigate(`/club/${club.id}`)}
                className="rounded-[18px] w-[148px] flex-shrink-0 text-left overflow-hidden"
                style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
                data-testid={`card-club-${club.id}`}
              >
                <div className="h-[92px] flex items-center justify-center text-[38px]"
                  style={{ background: "linear-gradient(135deg, #E8D5B8, #C4A882)" }}>
                  <span className="select-none" aria-hidden="true">{club.emoji}</span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="font-display font-bold text-[13px] leading-tight mb-0.5" style={{ color: "var(--ink)" }} data-testid={`text-club-name-${club.id}`}>
                    {club.name}
                  </p>
                  <p className="text-[10px] mb-2" style={{ color: "var(--muted-warm)" }} data-testid={`text-club-meta-${club.id}`}>
                    {club.schedule}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold" style={{ color: "var(--terra)" }}>
                      {club.memberCount} members
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>
                      {(club as any).rating ? `${(club as any).rating}` : ""}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

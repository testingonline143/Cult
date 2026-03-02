import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ClubDetailModal } from "@/components/club-detail-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { format, isToday } from "date-fns";
import type { Club, Event } from "@shared/schema";
import { Link } from "wouter";

interface EventWithClub extends Event {
  clubName?: string;
  rsvpCount?: number;
}

export default function HomeFeed() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
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
      <div className="px-5 pt-10 pb-6">
        <h1 className="font-display italic text-3xl font-bold text-foreground" data-testid="text-hero-heading">
          Find Your Tribe in <span className="neon-text">Tirupati</span>
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-hero-subtitle">Real life starts here.</p>
      </div>

      {user && !user.quizCompleted && (
        <div className="px-5 mb-6">
          <Link
            href="/onboarding"
            className="block glass-card glass-card-hover rounded-2xl p-5 transition-all group"
            data-testid="card-quiz-prompt"
          >
            <div className="flex items-center gap-4">
              <ArrowRight className="w-8 h-8 neon-text shrink-0" />
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground text-lg">Find your perfect clubs</h3>
                <p className="text-sm text-muted-foreground">Take a 2-minute quiz to get matched</p>
              </div>
              <ArrowRight className="w-5 h-5 neon-text group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      )}

      <div className="px-5 mb-6">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 rounded-full w-2 h-2 inline-block" />
            <h2 className="font-bold text-lg text-foreground" data-testid="text-happening-today">Happening Today</h2>
          </div>
          <Link href="/events" className="neon-text text-xs font-semibold tracking-wide" data-testid="link-view-all-events">
            VIEW ALL
          </Link>
        </div>

        {eventsLoading ? (
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>
        ) : todayEvent ? (
          <div className="glass-card rounded-2xl p-4" data-testid={`card-event-${todayEvent.id}`}>
            {todayEvent.clubName && (
              <p className="neon-text uppercase text-[11px] font-semibold tracking-wider mb-1" data-testid="text-event-club">
                {todayEvent.clubName}
              </p>
            )}
            <h3 className="font-display font-bold text-foreground text-lg mb-3" data-testid="text-event-title">
              {todayEvent.title}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span data-testid="text-event-time">{format(new Date(todayEvent.startsAt), "EEE, MMM d · h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span data-testid="text-event-location">{todayEvent.locationText}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 shrink-0" />
                <span className="glass-card px-2 py-0.5 rounded-md text-xs" data-testid="text-event-spots">
                  {todayEvent.maxCapacity - (todayEvent.rsvpCount ?? 0)} spots left
                </span>
              </div>
            </div>
            <Button asChild size="sm" className="rounded-full bg-neon text-background hover:bg-neon/90" data-testid="button-join-event">
              <Link href={`/event/${todayEvent.id}`}>Join</Link>
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm" data-testid="text-no-events">No events today</p>
        )}
      </div>

      <div className="px-5 mb-6">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <h2 className="font-bold text-lg text-foreground" data-testid="text-trending-clubs">Trending Clubs</h2>
          <Link href="/explore" className="neon-text text-xs font-semibold tracking-wide" data-testid="link-explore">
            EXPLORE
          </Link>
        </div>

        {clubsLoading ? (
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl w-44 flex-shrink-0">
                <Skeleton className="h-28 rounded-t-2xl" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => setSelectedClub(club)}
                className="glass-card rounded-2xl w-44 flex-shrink-0 text-left"
                data-testid={`card-club-${club.id}`}
              >
                <div className="h-28 rounded-t-2xl flex items-end p-3 bg-gradient-to-t from-neon/20 to-background">
                  <span className="text-4xl" aria-hidden="true">{club.emoji}</span>
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-sm text-foreground" data-testid={`text-club-name-${club.id}`}>
                    {club.name}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-club-meta-${club.id}`}>
                    {club.memberCount} members · {club.schedule}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ClubDetailModal club={selectedClub} onClose={() => setSelectedClub(null)} />
    </div>
  );
}

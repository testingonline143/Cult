import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { format, isToday, isSaturday, isSunday, isThisWeek } from "date-fns";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { Event, Club, EventRsvp } from "@shared/schema";

const FILTERS = ["All", "Free", "Today", "This Weekend"] as const;
type Filter = (typeof FILTERS)[number];

interface EventWithRsvps extends Event {
  rsvps?: EventRsvp[];
}

export default function Events() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: events = [], isLoading: eventsLoading } = useQuery<EventWithRsvps[]>({
    queryKey: ["/api/events"],
  });

  const { data: clubs = [] } = useQuery<Club[]>({
    queryKey: ["/api/clubs"],
  });

  const clubMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const club of clubs) {
      map[club.id] = club.name;
    }
    return map;
  }, [clubs]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    let filtered = events.filter((e) => new Date(e.startsAt) >= now);

    if (activeFilter === "Free") {
      filtered = filtered.filter((e) => !e.ticketPrice || e.ticketPrice === 0);
    } else if (activeFilter === "Today") {
      filtered = filtered.filter((e) => isToday(new Date(e.startsAt)));
    } else if (activeFilter === "This Weekend") {
      filtered = filtered.filter((e) => {
        const d = new Date(e.startsAt);
        return (isSaturday(d) || isSunday(d)) && isThisWeek(d, { weekStartsOn: 1 });
      });
    }

    return filtered.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  }, [events, activeFilter]);

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <h1 className="font-display italic text-3xl font-bold text-foreground mb-6" data-testid="text-page-title">
        Event Schedule
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar" data-testid="filter-pills">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            data-testid={`button-filter-${filter.toLowerCase().replace(/\s+/g, "-")}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeFilter === filter
                ? "bg-neon text-primary-foreground neon-glow"
                : "glass-card text-muted-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {eventsLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-muted-foreground" data-testid="text-empty-state">
          <Calendar className="w-12 h-12 mb-3" />
          <p className="text-lg font-semibold">No upcoming events</p>
          <p className="text-sm mt-1">
            {activeFilter !== "All" ? "Try a different filter" : "Check back soon for new events"}
          </p>
          {isAuthenticated && (
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-1.5 bg-neon text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold neon-glow"
              data-testid="link-create-event"
            >
              <Plus className="w-4 h-4" />
              Create an Event
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-2">
          {filteredEvents.map((event) => {
            const date = new Date(event.startsAt);
            return (
              <div
                key={event.id}
                className="glass-card rounded-2xl p-4 mb-4 flex gap-4 relative"
                data-testid={`card-event-${event.id}`}
              >
                <div className="flex-shrink-0 text-center w-16">
                  <div className="neon-text text-xs font-bold uppercase">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {format(date, "d")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, "MMM")}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-foreground" data-testid={`text-event-title-${event.id}`}>
                    {event.title}
                  </h3>
                  <p className="neon-text text-xs font-bold uppercase tracking-wider" data-testid={`text-club-name-${event.id}`}>
                    {clubMap[event.clubId] || "Unknown Club"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(date, "h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.locationText}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{event.rsvps?.filter(r => r.status === "going").length ?? 0} / {event.maxCapacity} Joined</span>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="neon-text text-sm font-semibold"
                      data-testid={`link-details-${event.id}`}
                    >
                      Details
                    </button>
                  </div>
                </div>

                {(!event.ticketPrice || event.ticketPrice === 0) && (
                  <span className="absolute top-3 right-3 bg-neon/10 neon-text text-xs font-bold px-2 py-0.5 rounded-full" data-testid={`badge-free-${event.id}`}>
                    FREE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

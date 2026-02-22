import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";

interface UpcomingEvent {
  id: string;
  clubId: string;
  title: string;
  description: string | null;
  locationText: string;
  startsAt: string;
  maxCapacity: number;
  clubName: string;
  clubEmoji: string;
  rsvpCount: number;
}

export function UpcomingEvents() {
  const { user } = useAuth();

  const { data: events = [], isLoading } = useQuery<UpcomingEvent[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await fetch("/api/events?limit=6");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
      });
      if (!res.ok) throw new Error("Failed to RSVP");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });

  if (isLoading || events.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10" data-testid="section-upcoming-events">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-foreground" data-testid="text-events-title">
          Happening Soon 🎉
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((event, index) => {
          const spotsLeft = event.maxCapacity - event.rsvpCount;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-72 bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all"
              data-testid={`card-event-${event.id}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{event.clubEmoji}</span>
                <span className="text-xs text-muted-foreground font-medium truncate">{event.clubName}</span>
              </div>
              <h3 className="font-serif font-bold text-foreground text-sm mb-2 line-clamp-2">{event.title}</h3>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {event.locationText}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {event.rsvpCount} going · {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                </div>
              </div>
              {user && spotsLeft > 0 && (
                <button
                  onClick={() => rsvpMutation.mutate(event.id)}
                  disabled={rsvpMutation.isPending}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-2 text-xs font-semibold disabled:opacity-50"
                  data-testid={`button-rsvp-${event.id}`}
                >
                  Count Me In
                </button>
              )}
              {!user && (
                <p className="text-[10px] text-muted-foreground text-center italic">Sign in to RSVP</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

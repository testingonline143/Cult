import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CalendarDays, MapPin, Clock, CheckCircle2, XCircle, LogIn, UserPlus } from "lucide-react";
import { SignInModal } from "@/components/sign-in-modal";
import type { Event, Club, EventRsvp } from "@shared/schema";

interface EventDetailResponse extends Event {
  rsvps: EventRsvp[];
  club: Club | null;
}

export default function CheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSignIn, setShowSignIn] = useState(false);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery<EventDetailResponse>({
    queryKey: ["/api/events", eventId],
  });

  const userRsvp = eventData?.rsvps?.find((r) => r.userId === user?.id);

  const checkinMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "x-user-id": user?.id || "" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(data.message || "Check-in failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.alreadyCheckedIn) {
        toast({ title: "Already checked in", description: "You've already checked in to this event." });
      } else {
        toast({ title: "Checked in!", description: "You're all set. Enjoy the event!" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
    },
    onError: (err: Error) => {
      toast({ title: "Check-in failed", description: err.message, variant: "destructive" });
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "x-user-id": user?.id || "" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(data.message || "RSVP failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "RSVP confirmed!", description: "You can now check in." });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
    },
    onError: (err: Error) => {
      toast({ title: "RSVP failed", description: err.message, variant: "destructive" });
    },
  });

  const handleCheckin = () => {
    checkinMutation.mutate();
  };

  const handleRsvp = () => {
    rsvpMutation.mutate();
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </div>
    );
  }

  if (eventError || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-6 text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold" data-testid="text-error-title">Event Not Found</h2>
          <p className="text-muted-foreground" data-testid="text-error-message">
            This event doesn't exist or may have been removed.
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/"} data-testid="button-go-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const isCheckedIn = userRsvp?.checkedIn === true;
  const hasRsvp = !!userRsvp && userRsvp.status === "going";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        {eventData.club && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{eventData.club.emoji}</span>
            <span className="text-sm text-muted-foreground" data-testid="text-club-name">{eventData.club.name}</span>
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-2xl font-bold" data-testid="text-event-title">{eventData.title}</h1>
          {eventData.description && (
            <p className="text-muted-foreground" data-testid="text-event-description">{eventData.description}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm" data-testid="text-event-date">{formatDate(eventData.startsAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm" data-testid="text-event-time">
              {formatTime(eventData.startsAt)}
              {eventData.endsAt && ` - ${formatTime(eventData.endsAt)}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm" data-testid="text-event-location">{eventData.locationText}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          {!user ? (
            <div className="text-center space-y-4">
              <LogIn className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-sign-in-prompt">
                Sign in to check in to this event
              </p>
              <Button onClick={() => setShowSignIn(true)} data-testid="button-sign-in">
                Sign In
              </Button>
            </div>
          ) : isCheckedIn ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
              <h2 className="text-xl font-semibold" data-testid="text-checked-in">You're checked in!</h2>
              <p className="text-muted-foreground text-sm">Enjoy the event</p>
              {userRsvp?.checkedInAt && (
                <Badge variant="secondary" data-testid="badge-checkin-time">
                  Checked in at {formatTime(userRsvp.checkedInAt)}
                </Badge>
              )}
            </div>
          ) : hasRsvp ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground" data-testid="text-rsvp-confirmed">
                You've RSVP'd to this event
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckin}
                disabled={checkinMutation.isPending}
                data-testid="button-checkin"
              >
                {checkinMutation.isPending ? "Checking in..." : "Check In"}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <UserPlus className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-no-rsvp">
                You haven't RSVP'd to this event yet
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRsvp}
                disabled={rsvpMutation.isPending}
                data-testid="button-rsvp"
              >
                {rsvpMutation.isPending ? "RSVP'ing..." : "RSVP First"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
}

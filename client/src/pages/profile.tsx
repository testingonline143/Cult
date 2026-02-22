import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { JoinRequest, Club } from "@shared/schema";
import { ArrowLeft, Edit2, Check, X, Calendar, MapPin } from "lucide-react";

export default function Profile() {
  const { user, login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6"
          data-testid="link-profile-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <ProfileHeader user={user} onUpdate={login} />
        <UserEvents userId={user.id} />
        <JoinedClubs userId={user.id} />
      </div>
    </div>
  );
}

function ProfileHeader({ user, onUpdate }: { user: { id: string; name: string; phone: string }; onUpdate: (u: { id: string; name: string; phone: string }) => void }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (data) => {
      onUpdate({ id: user.id, name: data.user.name, phone: user.phone });
      setEditing(false);
      setError("");
    },
    onError: () => {
      setError("Failed to update name");
    },
  });

  const handleSave = () => {
    if (!editName || editName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    updateMutation.mutate(editName);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6" data-testid="card-profile">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0">
          🧑
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-edit-name"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-all"
                  data-testid="button-save-name"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditing(false); setEditName(user.name); setError(""); }}
                  className="w-8 h-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center transition-all"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {error && <p className="text-xs text-red-500" data-testid="text-edit-error">{error}</p>}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-primary" data-testid="text-profile-name">{user.name}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="w-7 h-7 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center transition-all"
                  data-testid="button-edit-name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-profile-phone">{user.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UserRsvp {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStartsAt: string;
  eventLocation: string;
  clubName: string;
  clubEmoji: string;
  status: string;
}

function UserEvents({ userId }: { userId: string }) {
  const { data: rsvps = [], isLoading } = useQuery<UserRsvp[]>({
    queryKey: ["/api/user/events", userId],
    queryFn: async () => {
      const res = await fetch("/api/user/events", {
        headers: { "x-user-id": userId },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const upcomingRsvps = rsvps.filter((r) => new Date(r.eventStartsAt) > new Date());

  if (isLoading || upcomingRsvps.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="font-serif text-lg font-bold text-foreground mb-4" data-testid="text-your-events-title">
        Your Upcoming Events ({upcomingRsvps.length})
      </h2>
      <div className="space-y-2" data-testid="list-user-events">
        {upcomingRsvps.map((rsvp) => {
          const d = new Date(rsvp.eventStartsAt);
          return (
            <div
              key={rsvp.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
              data-testid={`card-rsvp-event-${rsvp.eventId}`}
            >
              <div className="text-2xl shrink-0">{rsvp.clubEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{rsvp.eventTitle}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{rsvp.clubName}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {rsvp.eventLocation}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">Going ✓</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JoinedClubs({ userId }: { userId: string }) {
  const { data: joinRequests = [], isLoading: loadingRequests } = useQuery<JoinRequest[]>({
    queryKey: ["/api/user/join-requests", userId],
    queryFn: async () => {
      const res = await fetch("/api/user/join-requests", {
        headers: { "x-user-id": userId },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const clubIds = Array.from(new Set(joinRequests.map((r) => r.clubId)));

  const { data: clubs = [], isLoading: loadingClubs } = useQuery<Club[]>({
    queryKey: ["/api/clubs"],
  });

  const joinedClubs = clubs.filter((c) => clubIds.includes(c.id));

  if (loadingRequests || loadingClubs) {
    return <div className="text-center py-12 text-muted-foreground">Loading your clubs...</div>;
  }

  return (
    <div>
      <h2 className="font-serif text-lg font-bold text-foreground mb-4" data-testid="text-joined-clubs-title">
        Clubs You've Joined ({joinedClubs.length})
      </h2>

      {joinedClubs.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl" data-testid="text-no-joined-clubs">
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-sm text-muted-foreground">You haven't joined any clubs yet.</p>
          <a href="/" className="text-sm text-primary hover:underline mt-2 inline-block" data-testid="link-explore-clubs">
            Explore clubs
          </a>
        </div>
      ) : (
        <div className="space-y-3" data-testid="list-joined-clubs">
          {joinedClubs.map((club) => {
            const request = joinRequests.find((r) => r.clubId === club.id);
            return (
              <div
                key={club.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                data-testid={`card-joined-club-${club.id}`}
              >
                <div className="text-3xl shrink-0">{club.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground" data-testid={`text-club-name-${club.id}`}>{club.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{club.category} · {club.memberCount} members</div>
                  {request?.createdAt && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Joined {new Date(request.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${club.healthStatus === "green" ? "bg-green-500" : club.healthStatus === "yellow" ? "bg-yellow-500" : "bg-red-400"}`} />
                  <span className="text-xs text-muted-foreground">{club.healthLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {joinRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4" data-testid="text-request-history-title">
            Request History ({joinRequests.length})
          </h2>
          <div className="space-y-2" data-testid="list-request-history">
            {joinRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-lg"
                data-testid={`row-request-${req.id}`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{req.clubName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </span>
                </div>
                {req.markedDone ? (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400" data-testid={`text-status-${req.id}`}>Added ✓</span>
                ) : (
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400" data-testid={`text-status-${req.id}`}>Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

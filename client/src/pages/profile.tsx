import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { JoinRequest, Club } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { ArrowLeft, Edit2, Check, X, Calendar, MapPin, RefreshCw } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

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

        <ProfileHeader user={user} />
        <ProfileActions user={user} />
        <UserEvents userId={user.id} />
        <JoinedClubs userId={user.id} />
      </div>
    </div>
  );
}

function ProfileHeader({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.firstName || "");
  const [editBio, setEditBio] = useState(user.bio || "");
  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; bio: string }) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditing(false);
      setError("");
    },
    onError: () => {
      setError("Failed to update profile");
    },
  });

  const handleSave = () => {
    if (!editName || editName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    updateMutation.mutate({ name: editName, bio: editBio });
  };

  const displayName = user.firstName || user.email || "User";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-4" data-testid="card-profile">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            "🧑"
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-edit-name"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 200))}
                  placeholder="Tell the club about yourself"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  data-testid="input-edit-bio"
                />
                <p className="text-xs text-muted-foreground text-right mt-0.5">{editBio.length}/200</p>
              </div>
              {error && <p className="text-xs text-red-500" data-testid="text-edit-error">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                  data-testid="button-save-profile"
                >
                  <Check className="w-3.5 h-3.5" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditName(user.firstName || ""); setEditBio(user.bio || ""); setError(""); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-semibold"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-primary" data-testid="text-profile-name">{displayName}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="w-7 h-7 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center transition-all"
                  data-testid="button-edit-name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {user.email && <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-profile-email">{user.email}</p>}
              {user.city && <p className="text-xs text-muted-foreground mt-0.5">📍 {user.city}</p>}
              {user.bio && <p className="text-sm text-foreground mt-2" data-testid="text-profile-bio">{user.bio}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileActions({ user }: { user: User }) {
  const [, navigate] = useLocation();

  const handleRedoQuiz = () => {
    navigate("/onboarding");
  };

  return (
    <div className="flex gap-2 mb-6">
      {user.quizCompleted && (
        <button
          onClick={handleRedoQuiz}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          data-testid="button-redo-quiz"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Redo Quiz
        </button>
      )}
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
        credentials: "include",
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
        credentials: "include",
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

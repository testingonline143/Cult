import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import type { JoinRequest, Club } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { ArrowLeft, Edit2, Check, X, Calendar, MapPin, RefreshCw, User as UserIcon, Users, LogIn, Camera, Loader2, LayoutDashboard, ChevronRight } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-sm w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-neon/10 flex items-center justify-center mx-auto neon-border border">
            <UserIcon className="w-8 h-8 neon-text" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground" data-testid="text-sign-in-heading">
            Your Profile
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-sign-in-message">
            Sign in to view your profile, joined clubs, and upcoming events.
          </p>
          <button
            onClick={() => { window.location.href = "/api/login"; }}
            className="bg-neon text-background rounded-xl px-8 py-3 text-sm font-semibold inline-flex items-center gap-2"
            data-testid="button-sign-in-profile"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/user/photo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile photo updated!" });
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    photoMutation.mutate(file);
  };

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
    <div className="glass-card rounded-2xl p-6 mb-4" data-testid="card-profile">
      <div className="flex items-start gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full bg-neon/10 flex items-center justify-center shrink-0 overflow-hidden neon-border border group"
          disabled={photoMutation.isPending}
          data-testid="button-upload-photo"
        >
          {photoMutation.isPending ? (
            <Loader2 className="w-6 h-6 neon-text animate-spin" />
          ) : user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            <UserIcon className="w-7 h-7 neon-text" />
          )}
          {!photoMutation.isPending && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          )}
        </button>
        <span className="text-[10px] text-muted-foreground mt-1 block text-center sm:hidden">Tap to change</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handlePhotoSelect}
          data-testid="input-photo-upload"
        />
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30"
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
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 resize-none"
                  data-testid="input-edit-bio"
                />
                <p className="text-xs text-muted-foreground text-right mt-0.5">{editBio.length}/200</p>
              </div>
              {error && <p className="text-xs text-destructive" data-testid="text-edit-error">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                  data-testid="button-save-profile"
                >
                  <Check className="w-3.5 h-3.5" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditName(user.firstName || ""); setEditBio(user.bio || ""); setError(""); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md glass-card text-muted-foreground text-xs font-semibold"
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
                <h1 className="font-display text-2xl font-bold neon-text" data-testid="text-profile-name">{displayName}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="w-7 h-7 rounded-full glass-card text-muted-foreground flex items-center justify-center transition-all"
                  data-testid="button-edit-name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {user.email && <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-profile-email">{user.email}</p>}
              {user.city && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.city}</p>}
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

  const isOrganiserOrAdmin = user.role === "organiser" || user.role === "admin";

  return (
    <div className="space-y-3 mb-6">
      {isOrganiserOrAdmin && (
        <Link href="/organizer" data-testid="link-organiser-dashboard">
          <div className="glass-card rounded-2xl p-4 neon-border border flex items-center gap-4 cursor-pointer group transition-all">
            <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 neon-text" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold neon-text" data-testid="text-organiser-dashboard-label">Organiser Dashboard</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your clubs, events & members</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </Link>
      )}
      <div className="flex gap-2 flex-wrap">
        {user.quizCompleted && (
          <button
            onClick={handleRedoQuiz}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md glass-card text-xs font-semibold text-muted-foreground transition-all"
            data-testid="button-redo-quiz"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Redo Quiz
          </button>
        )}
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
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const upcomingRsvps = rsvps.filter((r) => new Date(r.eventStartsAt) > new Date());

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="h-5 w-48 bg-muted/20 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (upcomingRsvps.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="font-display text-lg font-bold text-foreground mb-4" data-testid="text-your-events-title">
        Your Upcoming Events ({upcomingRsvps.length})
      </h2>
      <div className="space-y-2" data-testid="list-user-events">
        {upcomingRsvps.map((rsvp) => {
          const d = new Date(rsvp.eventStartsAt);
          return (
            <div
              key={rsvp.id}
              className="flex items-center gap-4 p-4 glass-card rounded-2xl"
              data-testid={`card-rsvp-event-${rsvp.eventId}`}
            >
              <div className="text-2xl shrink-0">{rsvp.clubEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{rsvp.eventTitle}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{rsvp.clubName}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} &middot; {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {rsvp.eventLocation}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold neon-text shrink-0 flex items-center gap-1">
                <Check className="w-3 h-3" /> Going
              </span>
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
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 bg-muted/20 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-foreground mb-4" data-testid="text-joined-clubs-title">
        Clubs You've Joined ({joinedClubs.length})
      </h2>

      {joinedClubs.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl" data-testid="text-no-joined-clubs">
          <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">You haven't joined any clubs yet.</p>
          <Link href="/explore" className="text-sm neon-text hover:underline mt-2 inline-block" data-testid="link-explore-clubs">
            Explore clubs
          </Link>
        </div>
      ) : (
        <div className="space-y-3" data-testid="list-joined-clubs">
          {joinedClubs.map((club) => {
            const request = joinRequests.find((r) => r.clubId === club.id);
            return (
              <div
                key={club.id}
                className="flex items-center gap-4 p-4 glass-card rounded-2xl"
                data-testid={`card-joined-club-${club.id}`}
              >
                <div className="text-3xl shrink-0">{club.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground" data-testid={`text-club-name-${club.id}`}>{club.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{club.category} &middot; {club.memberCount} members</div>
                  {request?.createdAt && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Joined {new Date(request.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${club.healthStatus === "green" ? "bg-neon" : club.healthStatus === "yellow" ? "bg-chart-4" : "bg-destructive"}`} />
                  <span className="text-xs text-muted-foreground">{club.healthLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {joinRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-foreground mb-4" data-testid="text-request-history-title">
            Request History ({joinRequests.length})
          </h2>
          <div className="space-y-2" data-testid="list-request-history">
            {joinRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 p-3 glass-card rounded-2xl"
                data-testid={`row-request-${req.id}`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{req.clubName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </span>
                </div>
                {req.markedDone ? (
                  <span className="text-xs font-semibold neon-text flex items-center gap-1" data-testid={`text-status-${req.id}`}><Check className="w-3 h-3" /> Added</span>
                ) : (
                  <span className="text-xs font-semibold text-chart-4" data-testid={`text-status-${req.id}`}>Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Shield, ShieldAlert, Users, Activity, Ban } from "lucide-react";
import type { JoinRequest, Club } from "@shared/schema";

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"clubs" | "joins">("clubs");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto" style={{ borderRadius: 18 }}>
            <Shield className="w-8 h-8 text-[var(--terra)]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--terra)]" data-testid="text-admin-title">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access the admin dashboard</p>
          <a
            href="/api/login"
            className="inline-block w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold text-center"
            data-testid="button-admin-login"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--terra)]" />
              <h1 className="font-display text-2xl font-bold text-[var(--terra)]" data-testid="text-admin-dashboard-title">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor clubs and member activity
              {user?.email && <span className="ml-2 text-xs">({user.email})</span>}
            </p>
          </div>
          <a href="/" className="text-sm text-[var(--terra)] hover:underline" data-testid="link-admin-home">&larr; Home</a>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("clubs")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "clubs" ? "bg-[var(--terra)] text-white shadow-[var(--warm-shadow)]" : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"}`}
            style={{ borderRadius: 18 }}
            data-testid="tab-clubs"
          >
            Live Clubs
          </button>
          <button
            onClick={() => setActiveTab("joins")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "joins" ? "bg-[var(--terra)] text-white shadow-[var(--warm-shadow)]" : "bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] text-muted-foreground"}`}
            style={{ borderRadius: 18 }}
            data-testid="tab-join-requests"
          >
            Join Requests
          </button>
        </div>

        {activeTab === "clubs" ? <ClubsMonitorTab /> : <JoinRequestsTab />}
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-16 h-16 rounded-2xl bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] flex items-center justify-center mx-auto" style={{ borderRadius: 18 }}>
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground" data-testid="text-access-denied">Access Denied</h2>
      <p className="text-sm text-muted-foreground">You don't have admin privileges.</p>
      <a href="/" className="inline-block text-sm text-[var(--terra)] hover:underline" data-testid="link-go-home">Go Home</a>
    </div>
  );
}

function ClubsMonitorTab() {
  const { data: clubs = [], isLoading, error } = useQuery<Club[]>({
    queryKey: ["/api/admin/clubs"],
    retry: false,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/clubs/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/clubs/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <AccessDenied />;
  }

  if (clubs.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-clubs">No clubs yet</div>;
  }

  const activeClubs = clubs.filter(c => c.isActive !== false);
  const inactiveClubs = clubs.filter(c => c.isActive === false);

  return (
    <div className="space-y-6" data-testid="list-admin-clubs">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--terra)] font-mono" data-testid="text-total-clubs">{clubs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Clubs</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-[var(--green-accent)] font-mono" data-testid="text-active-clubs">{activeClubs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Active</div>
        </div>
        <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-md p-4 text-center" style={{ borderRadius: 18 }}>
          <div className="text-2xl font-bold text-destructive font-mono" data-testid="text-inactive-clubs">{inactiveClubs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Deactivated</div>
        </div>
      </div>

      <div className="space-y-2">
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`flex items-center gap-4 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] ${club.isActive === false ? "opacity-50" : ""}`}
            style={{ borderRadius: 18 }}
            data-testid={`row-admin-club-${club.id}`}
          >
            <div className="text-2xl shrink-0">{club.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground" data-testid={`text-admin-club-name-${club.id}`}>{club.name}</span>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <span className="text-xs text-muted-foreground">{club.category}</span>
                {club.isActive === false && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-destructive/20 text-destructive rounded-md">
                    Deactivated
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.organizerName}</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {club.memberCount} members</span>
                <span>{club.city}</span>
                {club.createdAt && (
                  <span>
                    Created {new Date(club.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {club.isActive === false ? (
                <button
                  onClick={() => activateMutation.mutate(club.id)}
                  disabled={activateMutation.isPending}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra-pale)] text-[var(--terra)] transition-all whitespace-nowrap"
                  data-testid={`button-activate-${club.id}`}
                >
                  Activate
                </button>
              ) : (
                <button
                  onClick={() => deactivateMutation.mutate(club.id)}
                  disabled={deactivateMutation.isPending}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-destructive/10 text-destructive transition-all whitespace-nowrap"
                  data-testid={`button-deactivate-${club.id}`}
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JoinRequestsTab() {
  const { data: requests = [], isLoading, error } = useQuery<JoinRequest[]>({
    queryKey: ["/api/admin/join-requests"],
    retry: false,
  });

  const markDoneMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/join-requests/${id}/done`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/join-requests"] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <AccessDenied />;
  }

  if (requests.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-join-requests">No join requests yet</div>;
  }

  return (
    <div className="space-y-2" data-testid="list-join-requests">
      {requests.map((req) => (
        <div
          key={req.id}
          className={`flex items-center gap-4 p-4 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] ${req.markedDone ? "opacity-40" : ""}`}
          style={{ borderRadius: 18 }}
          data-testid={`row-join-request-${req.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground" data-testid={`text-join-name-${req.id}`}>{req.name}</span>
              <span className="text-xs text-muted-foreground">&middot;</span>
              <span className="text-xs text-muted-foreground" data-testid={`text-join-phone-${req.id}`}>{req.phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-[var(--terra)]" data-testid={`text-join-club-${req.id}`}>{req.clubName}</span>
              <span className="text-xs text-muted-foreground">
                {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"}
              </span>
            </div>
          </div>
          {!req.markedDone && (
            <button
              onClick={() => markDoneMutation.mutate(req.id)}
              disabled={markDoneMutation.isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--terra-pale)] text-[var(--terra)] transition-all whitespace-nowrap"
              data-testid={`button-mark-done-${req.id}`}
            >
              Mark as Done
            </button>
          )}
          {req.markedDone && (
            <span className="text-xs font-semibold text-muted-foreground" data-testid={`text-done-${req.id}`}>Done</span>
          )}
        </div>
      ))}
    </div>
  );
}

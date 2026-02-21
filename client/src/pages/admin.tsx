import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JoinRequest, ClubSubmission } from "@shared/schema";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"joins" | "submissions">("joins");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "sangh2026") {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Wrong password");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="font-serif text-2xl font-bold text-primary" data-testid="text-admin-title">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="input-admin-password"
          />
          {error && <p className="text-xs text-red-500 font-medium text-center" data-testid="text-admin-error">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold"
            data-testid="button-admin-login"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary" data-testid="text-admin-dashboard-title">🔐 Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage join requests and club submissions</p>
          </div>
          <a href="/" className="text-sm text-primary hover:underline" data-testid="link-admin-home">← Home</a>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("joins")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === "joins" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            data-testid="tab-join-requests"
          >
            Join Requests
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === "submissions" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            data-testid="tab-club-submissions"
          >
            Club Submissions
          </button>
        </div>

        {activeTab === "joins" ? <JoinRequestsTab /> : <ClubSubmissionsTab />}
      </div>
    </div>
  );
}

function JoinRequestsTab() {
  const { data: requests = [], isLoading } = useQuery<JoinRequest[]>({
    queryKey: ["/api/admin/join-requests"],
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

  if (requests.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-join-requests">No join requests yet</div>;
  }

  return (
    <div className="space-y-2" data-testid="list-join-requests">
      {requests.map((req) => (
        <div
          key={req.id}
          className={`flex items-center gap-4 p-4 rounded-xl border border-border ${req.markedDone ? "opacity-40" : "bg-card"}`}
          data-testid={`row-join-request-${req.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground" data-testid={`text-join-name-${req.id}`}>{req.name}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground" data-testid={`text-join-phone-${req.id}`}>{req.phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-primary" data-testid={`text-join-club-${req.id}`}>{req.clubName}</span>
              <span className="text-xs text-muted-foreground">
                {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
          {!req.markedDone && (
            <button
              onClick={() => markDoneMutation.mutate(req.id)}
              disabled={markDoneMutation.isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all whitespace-nowrap"
              data-testid={`button-mark-done-${req.id}`}
            >
              Mark as Done
            </button>
          )}
          {req.markedDone && (
            <span className="text-xs font-semibold text-muted-foreground" data-testid={`text-done-${req.id}`}>Done ✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ClubSubmissionsTab() {
  const { data: submissions = [], isLoading } = useQuery<ClubSubmission[]>({
    queryKey: ["/api/admin/club-submissions"],
  });

  const markDoneMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/club-submissions/${id}/done`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/club-submissions"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/club-submissions/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/club-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (submissions.length === 0) {
    return <div className="text-center py-12 text-muted-foreground" data-testid="text-no-submissions">No club submissions yet</div>;
  }

  return (
    <div className="space-y-2" data-testid="list-club-submissions">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className={`flex items-center gap-4 p-4 rounded-xl border border-border ${sub.markedDone ? "opacity-40" : "bg-card"}`}
          data-testid={`row-submission-${sub.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground" data-testid={`text-sub-club-${sub.id}`}>{sub.clubName}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{sub.category}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground" data-testid={`text-sub-organizer-${sub.id}`}>{sub.organizerName}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{sub.whatsappNumber}</span>
              {sub.meetupFrequency && (
                <>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{sub.meetupFrequency}</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
          {!sub.markedDone && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => approveMutation.mutate(sub.id)}
                disabled={approveMutation.isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all whitespace-nowrap"
                data-testid={`button-approve-sub-${sub.id}`}
              >
                {approveMutation.isPending ? "Creating..." : "Approve & Create Club"}
              </button>
              <button
                onClick={() => markDoneMutation.mutate(sub.id)}
                disabled={markDoneMutation.isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all whitespace-nowrap"
                data-testid={`button-mark-done-sub-${sub.id}`}
              >
                Dismiss
              </button>
            </div>
          )}
          {sub.markedDone && (
            <span className="text-xs font-semibold text-muted-foreground" data-testid={`text-done-sub-${sub.id}`}>Done ✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Club, JoinRequest } from "@shared/schema";

export default function Organizer() {
  const [whatsapp, setWhatsapp] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "dashboard">("phone");
  const [error, setError] = useState("");
  const [club, setClub] = useState<Club | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "edit">("overview");

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone });
      return res.json();
    },
    onSuccess: () => {
      setStep("otp");
      setError("");
    },
    onError: () => setError("Failed to send OTP. Check your number."),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { whatsappNumber: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/organizer/login", data);
      return res.json();
    },
    onSuccess: (data: { success: boolean; club: Club }) => {
      setClub(data.club);
      setStep("dashboard");
      setError("");
    },
    onError: () => setError("Invalid OTP or no club found for this number."),
  });

  const handleSendOtp = () => {
    setError("");
    if (!whatsapp || whatsapp.replace(/\D/g, "").length < 10) {
      setError("Enter a valid WhatsApp number");
      return;
    }
    sendOtpMutation.mutate(whatsapp);
  };

  const handleLogin = () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    loginMutation.mutate({ whatsappNumber: whatsapp, otp });
  };

  if (step !== "dashboard") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3">📋</div>
            <h1 className="font-serif text-2xl font-bold text-primary" data-testid="text-organizer-title">Organizer Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "phone" ? "Login with your WhatsApp number" : "Enter the OTP sent to your phone"}
            </p>
          </div>
          {step === "phone" ? (
            <>
              <input
                type="tel"
                placeholder="WhatsApp Number"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-organizer-whatsapp"
              />
              {error && <p className="text-xs text-red-500 font-medium text-center" data-testid="text-organizer-error">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                data-testid="button-organizer-send-otp"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-organizer-otp"
              />
              {error && <p className="text-xs text-red-500 font-medium text-center" data-testid="text-organizer-error">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loginMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                data-testid="button-organizer-verify"
              >
                {loginMutation.isPending ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Change number
              </button>
            </>
          )}
          <div className="text-center">
            <a href="/" className="text-xs text-primary hover:underline" data-testid="link-organizer-home">← Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-xl font-bold text-primary" data-testid="text-organizer-dashboard">
              {club?.emoji} {club?.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Organizer Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-primary hover:underline" data-testid="link-dashboard-home">Home</a>
            <button
              onClick={() => { setStep("phone"); setClub(null); setWhatsapp(""); setOtp(""); }}
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="button-organizer-logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["overview", "requests", "edit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              data-testid={`tab-organizer-${tab}`}
            >
              {tab === "overview" ? "Overview" : tab === "requests" ? "Join Requests" : "Edit Club"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && club && <ClubOverview club={club} />}
        {activeTab === "requests" && club && <OrganizerRequests clubId={club.id} />}
        {activeTab === "edit" && club && <EditClub club={club} onUpdate={setClub} />}
      </div>
    </div>
  );
}

function ClubOverview({ club }: { club: Club }) {
  const healthColors: Record<string, string> = {
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="space-y-4" data-testid="section-club-overview">
      <div className="bg-card border border-border rounded-2xl p-5" data-testid="card-club-overview">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
            style={{ backgroundColor: club.bgColor || undefined }}
          >
            {club.emoji}
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-lg font-bold text-primary">{club.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{club.shortDesc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary" data-testid="text-overview-members">{club.memberCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Members</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${healthColors[club.healthStatus] || healthColors.green}`} data-testid="text-overview-health">
            {club.healthLabel}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Health Status</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary" data-testid="text-overview-founding">
            {club.foundingTaken ?? 0}/{club.foundingTotal ?? 20}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Founding Spots</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-sm font-medium text-foreground" data-testid="text-overview-schedule">{club.schedule}</div>
          <div className="text-xs text-muted-foreground mt-1">Schedule</div>
        </div>
      </div>
    </div>
  );
}

function OrganizerRequests({ clubId }: { clubId: string }) {
  const { data: requests = [], isLoading } = useQuery<JoinRequest[]>({
    queryKey: ["/api/organizer/join-requests", clubId],
  });

  const contactMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/organizer/join-requests/${id}/contacted`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/join-requests", clubId] });
    },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  if (requests.length === 0) {
    return <div className="text-center py-8 text-muted-foreground" data-testid="text-no-requests">No join requests yet</div>;
  }

  return (
    <div className="space-y-2" data-testid="list-organizer-requests">
      {requests.map((req) => (
        <div
          key={req.id}
          className={`flex items-center gap-3 p-4 rounded-xl border border-border ${req.markedDone ? "opacity-40" : "bg-card"}`}
          data-testid={`row-request-${req.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground">{req.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{req.phone}</div>
            <div className="text-xs text-muted-foreground">
              {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
            </div>
          </div>
          {req.markedDone ? (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap" data-testid={`text-contacted-${req.id}`}>
              Added to WhatsApp ✓
            </span>
          ) : (
            <button
              onClick={() => contactMutation.mutate(req.id)}
              disabled={contactMutation.isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all whitespace-nowrap"
              data-testid={`button-contacted-${req.id}`}
            >
              Added to WhatsApp
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function EditClub({ club, onUpdate }: { club: Club; onUpdate: (club: Club) => void }) {
  const [shortDesc, setShortDesc] = useState(club.shortDesc);
  const [schedule, setSchedule] = useState(club.schedule);
  const [location, setLocation] = useState(club.location);
  const [healthStatus, setHealthStatus] = useState(club.healthStatus);
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: { shortDesc: string; schedule: string; location: string; healthStatus: string }) => {
      const res = await apiRequest("PATCH", `/api/organizer/club/${club.id}`, data);
      return res.json();
    },
    onSuccess: (data: Club) => {
      onUpdate(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ shortDesc, schedule, location, healthStatus });
  };

  return (
    <div className="space-y-4" data-testid="section-edit-club">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Short Description</label>
          <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            data-testid="input-edit-shortdesc"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Schedule</label>
          <input
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="input-edit-schedule"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="input-edit-location"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Health Status</label>
          <div className="flex gap-2">
            {(["green", "yellow", "red"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setHealthStatus(status)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  healthStatus === status
                    ? status === "green" ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                    : status === "yellow" ? "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700"
                    : "bg-red-50 text-red-600 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                    : "bg-muted text-muted-foreground border-border"
                }`}
                data-testid={`button-health-${status}`}
              >
                {status === "green" ? "Active" : status === "yellow" ? "Moderate" : "Low"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        data-testid="button-save-club"
      >
        {updateMutation.isPending ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}

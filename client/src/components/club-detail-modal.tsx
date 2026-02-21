import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Club } from "@shared/schema";

const HEALTH_STYLES: Record<string, { dot: string; text: string }> = {
  green: { dot: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  yellow: { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
  red: { dot: "bg-red-400", text: "text-red-600 dark:text-red-400" },
};

interface ClubDetailModalProps {
  club: Club | null;
  onClose: () => void;
}

export function ClubDetailModal({ club, onClose }: ClubDetailModalProps) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinError, setJoinError] = useState("");

  const joinMutation = useMutation({
    mutationFn: async (data: { clubId: string; clubName: string; name: string; phone: string }) => {
      const res = await apiRequest("POST", "/api/join", data);
      return res.json();
    },
    onSuccess: () => {
      setJoinSuccess(true);
      setShowJoinForm(false);
      setJoinName("");
      setJoinPhone("");
      setJoinError("");
    },
    onError: () => {
      setJoinError("Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    if (club) {
      document.body.style.overflow = "hidden";
      setShowJoinForm(false);
      setJoinSuccess(false);
      setJoinName("");
      setJoinPhone("");
      setJoinError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [club]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!club) return null;

  const health = HEALTH_STYLES[club.healthStatus] || HEALTH_STYLES["green"];
  const foundingSpotsLeft = (club.foundingTotal ?? 20) - (club.foundingTaken ?? 0);
  const foundingProgress = ((club.foundingTaken ?? 0) / (club.foundingTotal ?? 20)) * 100;
  const allFoundingTaken = foundingSpotsLeft <= 0;

  const handleJoinSubmit = () => {
    setJoinError("");
    if (!joinName || joinName.length < 2) {
      setJoinError("Name is required (minimum 2 characters)");
      return;
    }
    if (!joinPhone || joinPhone.replace(/\D/g, "").length < 10) {
      setJoinError("Phone is required (minimum 10 digits)");
      return;
    }
    joinMutation.mutate({
      clubId: club.id,
      clubName: club.name,
      name: joinName,
      phone: joinPhone,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          data-testid="modal-backdrop"
        />

        <motion.div
          className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          data-testid="modal-club-detail"
        >
          <div
            className="relative p-6 pb-4 rounded-t-2xl sm:rounded-t-2xl"
            style={{ backgroundColor: club.bgColor || undefined }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-5xl mb-4">{club.emoji}</div>

            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-2">
              {club.category}
            </div>
            <h2
              className="font-serif text-2xl font-bold text-primary tracking-tight leading-tight mb-2"
              data-testid="text-modal-club-name"
            >
              {club.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${health.text}`}>
                <span className={`w-2 h-2 rounded-full ${health.dot}`} />
                {club.healthLabel}
              </span>
              {club.lastActive && (
                <span className="text-xs text-muted-foreground">
                  {club.lastActive}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 pt-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-modal-club-desc">
              {club.fullDesc}
            </p>

            {club.organizerName && (
              <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3" data-testid="card-organizer">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                  {club.organizerAvatar || "🧑"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{club.organizerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {club.organizerYears || "Organizer"}
                    {club.organizerResponse && (
                      <> · {club.organizerResponse}</>
                    )}
                  </div>
                </div>
                {club.organizerYears && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[hsl(var(--clay))]/10 text-[hsl(var(--clay))] rounded-full border border-[hsl(var(--clay))]/20 whitespace-nowrap">
                    {club.organizerYears.split(" ")[0]} organizer
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">📅</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Schedule</div>
                <div className="text-sm font-medium text-foreground">{club.schedule}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">📍</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Location</div>
                <div className="text-sm font-medium text-foreground">{club.location}</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">👥</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Members</div>
                <div className="text-sm font-medium text-foreground">{club.memberCount} members</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <div className="text-lg mb-1">📆</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Active Since</div>
                <div className="text-sm font-medium text-foreground">{club.activeSince || "—"}</div>
              </div>
            </div>

            <div className="bg-[hsl(var(--clay))]/[0.06] border border-[hsl(var(--clay))]/15 rounded-xl p-4" data-testid="card-founding">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[hsl(var(--clay))]" />
                  <span className="text-sm font-semibold text-[hsl(var(--clay))]">Founding Member Spots</span>
                </div>
                <span className="text-xs font-bold text-[hsl(var(--clay))]">
                  {allFoundingTaken ? "All taken" : `${foundingSpotsLeft} of ${club.foundingTotal ?? 20} left`}
                </span>
              </div>
              <div className="w-full h-2 bg-[hsl(var(--clay))]/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[hsl(var(--clay))] rounded-full transition-all"
                  style={{ width: `${Math.min(foundingProgress, 100)}%` }}
                  data-testid="bar-founding-progress"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {allFoundingTaken
                  ? "All founding spots taken. You can still join!"
                  : "Join now to get your Founding Member badge"}
              </p>
            </div>

            {joinSuccess ? (
              <div className="text-center py-6 space-y-2" data-testid="card-join-success">
                <div className="text-4xl">🌱</div>
                <h3 className="font-serif text-xl font-bold text-primary">You're in the tribe!</h3>
                <p className="text-sm text-muted-foreground">
                  Organizer will add you to WhatsApp group within 24 hours.
                </p>
              </div>
            ) : showJoinForm ? (
              <div className="space-y-3" data-testid="form-join">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-join-name"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-join-phone"
                />
                {joinError && (
                  <p className="text-xs text-red-500 font-medium" data-testid="text-join-error">{joinError}</p>
                )}
                <button
                  onClick={handleJoinSubmit}
                  disabled={joinMutation.isPending}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-50"
                  data-testid="button-send-join"
                >
                  {joinMutation.isPending ? "Sending..." : "Send Join Request"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pt-2 pb-2">
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all"
                  data-testid="button-modal-join"
                >
                  I Want to Join
                </button>
                {club.whatsappNumber && (
                  <a
                    href={`https://wa.me/${club.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[50px] h-[50px] bg-[#25D366] text-white rounded-xl text-xl flex items-center justify-center shrink-0 transition-all"
                    data-testid="button-modal-whatsapp"
                  >
                    💬
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

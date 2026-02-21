import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Users, Star, Clock, MessageCircle } from "lucide-react";
import type { Club } from "@shared/schema";

const CATEGORY_EMOJIS: Record<string, string> = {
  Trekking: "\u{1F3D4}\uFE0F",
  Books: "\u{1F4DA}",
  Cycling: "\u{1F6B4}",
  Photography: "\u{1F4F7}",
  Fitness: "\u{1F4AA}",
  Art: "\u{1F3A8}",
  Writing: "\u{270D}\uFE0F",
  Music: "\u{1F3B5}",
};

const CATEGORY_BG: Record<string, string> = {
  Trekking: "bg-emerald-100 dark:bg-emerald-900/30",
  Books: "bg-amber-100 dark:bg-amber-900/30",
  Cycling: "bg-sky-100 dark:bg-sky-900/30",
  Photography: "bg-slate-100 dark:bg-slate-800/30",
  Fitness: "bg-rose-100 dark:bg-rose-900/30",
  Art: "bg-violet-100 dark:bg-violet-900/30",
  Writing: "bg-orange-100 dark:bg-orange-900/30",
  Music: "bg-pink-100 dark:bg-pink-900/30",
};

const HEALTH_STYLES: Record<string, { dot: string; text: string }> = {
  "Very Active": { dot: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  "Moderate": { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
  "Quiet": { dot: "bg-red-400", text: "text-red-600 dark:text-red-400" },
};

interface ClubDetailModalProps {
  club: Club | null;
  onClose: () => void;
}

export function ClubDetailModal({ club, onClose }: ClubDetailModalProps) {
  useEffect(() => {
    if (club) {
      document.body.style.overflow = "hidden";
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

  const emoji = club ? (CATEGORY_EMOJIS[club.category] || "\u{1F33F}") : "";
  const emojiBg = club ? (CATEGORY_BG[club.category] || "bg-muted") : "";
  const health = club ? (HEALTH_STYLES[club.activityLevel] || HEALTH_STYLES["Moderate"]) : HEALTH_STYLES["Moderate"];

  return (
    <AnimatePresence>
      {club && (
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
            <div className={`relative p-6 pb-4 ${emojiBg} rounded-t-2xl sm:rounded-t-2xl`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-5xl mb-4">{emoji}</div>

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
                  {club.activityLevel}
                </span>
                {club.lastMet && (
                  <span className="text-xs text-muted-foreground">
                    Met {club.lastMet}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 pt-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-modal-club-desc">
                {club.description}
              </p>

              {club.organizerName && (
                <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3" data-testid="card-organizer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    🧑
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{club.organizerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {club.organizerYears ? `${club.organizerYears} year${club.organizerYears > 1 ? "s" : ""} running` : "Organizer"}
                      {club.responseTime && (
                        <> · Responds {club.responseTime}</>
                      )}
                    </div>
                  </div>
                  {club.organizerYears && club.organizerYears >= 2 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[hsl(var(--clay))]/10 text-[hsl(var(--clay))] rounded-full border border-[hsl(var(--clay))]/20 whitespace-nowrap">
                      {club.organizerYears}yr organizer
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-0 divide-y divide-border">
                <div className="flex items-start gap-3 py-3">
                  <div className="text-lg mt-0.5">📅</div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Schedule</div>
                    <div className="text-sm font-medium text-foreground">{club.schedule}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3">
                  <div className="text-lg mt-0.5">📍</div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Location</div>
                    <div className="text-sm font-medium text-foreground">{club.meetingPoint}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3">
                  <div className="text-lg mt-0.5">👥</div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Members</div>
                    <div className="text-sm font-medium text-foreground">{club.memberCount} members</div>
                  </div>
                </div>
              </div>

              {club.foundingSpots && club.foundingSpots > 0 && (
                <div className="flex items-center gap-2 bg-[hsl(var(--clay))]/[0.06] border border-[hsl(var(--clay))]/15 rounded-xl px-4 py-3">
                  <Star className="w-4 h-4 text-[hsl(var(--clay))]" />
                  <span className="text-sm font-semibold text-[hsl(var(--clay))]">
                    {club.foundingSpots} Founding member spots left
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2 pb-2">
                <button
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold transition-all"
                  data-testid="button-modal-join"
                >
                  Join This Club
                </button>
                <button
                  className="w-[50px] h-[50px] bg-[#25D366] text-white rounded-xl text-xl flex items-center justify-center shrink-0 transition-all"
                  data-testid="button-modal-whatsapp"
                >
                  💬
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

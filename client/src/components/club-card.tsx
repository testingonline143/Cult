import { motion } from "framer-motion";
import { Calendar, Users, MapPin, Star } from "lucide-react";
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
  Trekking: "bg-emerald-50 dark:bg-emerald-900/20",
  Books: "bg-amber-50 dark:bg-amber-900/20",
  Cycling: "bg-sky-50 dark:bg-sky-900/20",
  Photography: "bg-slate-50 dark:bg-slate-800/20",
  Fitness: "bg-rose-50 dark:bg-rose-900/20",
  Art: "bg-violet-50 dark:bg-violet-900/20",
  Writing: "bg-orange-50 dark:bg-orange-900/20",
  Music: "bg-pink-50 dark:bg-pink-900/20",
};

const HEALTH_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  "Very Active": { dot: "bg-green-500", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400" },
  "Moderate": { dot: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400" },
  "Quiet": { dot: "bg-red-400", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" },
};

interface ClubCardProps {
  club: Club;
  index: number;
}

export function ClubCard({ club, index }: ClubCardProps) {
  const emoji = CATEGORY_EMOJIS[club.category] || "\u{1F33F}";
  const emojiBg = CATEGORY_BG[club.category] || "bg-muted";
  const health = HEALTH_STYLES[club.activityLevel] || HEALTH_STYLES["Moderate"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover-elevate"
        data-testid={`card-club-${club.id}`}
      >
        <div className="p-5 pb-0 flex justify-between items-start">
          <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] ${emojiBg}`}>
            {emoji}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${health.bg} ${health.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
            {club.activityLevel}
          </div>
        </div>

        <div className="p-5 pt-4">
          <div className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-1.5">
            {club.category}
          </div>
          <h3
            className="font-serif text-xl font-bold text-primary tracking-tight leading-tight mb-2"
            data-testid={`text-club-name-${club.id}`}
          >
            {club.name}
          </h3>
          <p
            className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-2"
            data-testid={`text-club-desc-${club.id}`}
          >
            {club.description}
          </p>

          {club.foundingSpots && club.foundingSpots > 0 && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--clay))] bg-[hsl(var(--clay))]/[0.08] border border-[hsl(var(--clay))]/20 px-2.5 py-1 rounded-full mb-4">
              <Star className="w-3 h-3" />
              {club.foundingSpots} Founding spots left
            </div>
          )}

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-3.5 border-t border-border mb-4">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {club.schedule}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {club.memberCount} members
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {club.meetingPoint}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex-1 bg-primary text-primary-foreground rounded-[10px] py-2.5 text-[13px] font-semibold transition-all"
              data-testid={`button-view-club-${club.id}`}
            >
              View Club →
            </button>
            <button
              className="w-[42px] h-[42px] bg-[#25D366] text-white rounded-[10px] text-lg flex items-center justify-center shrink-0 transition-all"
              data-testid={`button-chat-club-${club.id}`}
            >
              💬
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

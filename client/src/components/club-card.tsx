import { motion } from "framer-motion";
import { Calendar, Users, MapPin, Star, Clock, ArrowRight, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Club } from "@shared/schema";

const HEALTH_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  green: { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  yellow: { dot: "bg-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  red: { dot: "bg-red-400", bg: "bg-red-500/10", text: "text-red-400" },
};

interface ClubCardProps {
  club: Club & { recentJoins?: number };
  index: number;
  onViewClub?: (club: Club) => void;
}

function shareClub(club: Club, e: React.MouseEvent) {
  e.stopPropagation();
  const url = `${window.location.origin}/club/${club.id}`;
  const text = `Check out ${club.name} on CultFam! ${url}`;

  if (navigator.share) {
    navigator.share({ title: club.name, text: `Check out ${club.name} on CultFam!`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
}

export function ClubCard({ club, index, onViewClub }: ClubCardProps) {
  const health = HEALTH_STYLES[club.healthStatus] || HEALTH_STYLES["green"];
  const foundingSpotsLeft = (club.foundingTotal ?? 20) - (club.foundingTaken ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div
        className="glass-card glass-card-hover rounded-2xl overflow-visible transition-all hover-elevate cursor-pointer"
        data-testid={`card-club-${club.id}`}
        onClick={() => onViewClub?.(club)}
      >
        <div className="p-5 pb-0 flex justify-between items-start">
          <div
            className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px]"
            style={{ backgroundColor: club.bgColor || undefined }}
          >
            {club.emoji}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${health.bg} ${health.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
            {club.healthLabel}
          </div>
        </div>

        <div className="p-5 pt-4">
          <div className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-1.5">
            {club.category}
          </div>
          <h3
            className="font-display text-xl font-bold neon-text tracking-tight leading-tight mb-2"
            data-testid={`text-club-name-${club.id}`}
          >
            {club.name}
          </h3>
          <p
            className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-2"
            data-testid={`text-club-desc-${club.id}`}
          >
            {club.shortDesc}
          </p>

          {foundingSpotsLeft > 0 && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neon bg-neon/[0.08] border border-neon/20 px-2.5 py-1 rounded-full mb-4">
              <Star className="w-3 h-3" />
              {foundingSpotsLeft} Founding spots left
            </div>
          )}

          {club.recentJoins != null && club.recentJoins > 0 && (
            <div
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full mb-4"
              data-testid={`badge-recent-joins-${club.id}`}
            >
              {club.recentJoins} joined this week
            </div>
          )}

          <div className="flex items-center flex-wrap gap-2 mb-4">
            <Badge variant="secondary" data-testid={`badge-members-${club.id}`}>
              <Users className="w-3 h-3 mr-1" />
              {club.memberCount} members
            </Badge>
            {club.lastActive && (
              <Badge variant="outline" data-testid={`badge-activity-${club.id}`}>
                <Clock className="w-3 h-3 mr-1" />
                {club.lastActive}
              </Badge>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-3.5 border-t border-border mb-4">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {club.schedule}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {club.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex-1 bg-neon text-background rounded-[10px] py-2.5 text-[13px] font-semibold transition-all"
              data-testid={`button-view-club-${club.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onViewClub?.(club);
              }}
            >
              View Club
            </button>
            <Link
              href={`/club/${club.id}`}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2"
              data-testid={`link-club-page-${club.id}`}
            >
              View
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => shareClub(club, e)}
              data-testid={`button-share-club-${club.id}`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {club.whatsappNumber && (
              <a
                href={`https://wa.me/${club.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[42px] h-[42px] bg-emerald-600 text-foreground rounded-[10px] text-lg flex items-center justify-center shrink-0 transition-all"
                data-testid={`button-chat-club-${club.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                💬
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

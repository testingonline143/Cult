import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClubCard } from "@/components/club-card";
import type { Club } from "@shared/schema";

const FILTER_TABS = [
  { id: "All", emoji: "\u{1F33F}" },
  { id: "Trekking", emoji: "\u{1F3D4}\uFE0F" },
  { id: "Books", emoji: "\u{1F4DA}" },
  { id: "Cycling", emoji: "\u{1F6B4}" },
  { id: "Photography", emoji: "\u{1F4F7}" },
  { id: "Fitness", emoji: "\u{1F4AA}" },
  { id: "Art", emoji: "\u{1F3A8}" },
];

type ClubWithActivity = Club & { recentJoins?: number };

interface ClubsSectionProps {
  clubs: ClubWithActivity[];
  isLoading: boolean;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onViewClub?: (club: Club) => void;
}

export function ClubsSection({ clubs, isLoading, activeCategory, onCategoryChange, onViewClub }: ClubsSectionProps) {
  const filteredClubs = activeCategory === "All"
    ? clubs
    : clubs.filter((c) => c.category === activeCategory);

  return (
    <section id="clubs" className="py-16 sm:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[2px] uppercase text-[hsl(var(--clay))] mb-3">
            <span className="w-5 h-px bg-[hsl(var(--clay))]" />
            Live Now
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            What's popping in Tirupati
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-9"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`px-4 py-2 rounded-full border-[1.5px] text-[13px] font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
                data-testid={`button-filter-${tab.id.toLowerCase()}`}
              >
                {tab.emoji} {tab.id}
              </button>
            );
          })}
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-5 space-y-4 bg-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-[52px] h-[52px] rounded-[14px]" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredClubs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg mb-2">No clubs found in this category yet.</p>
            <p className="text-sm text-muted-foreground">
              Want to start one?{" "}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById("organizer")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-list-club-empty"
              >
                List your club
              </Button>
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClubs.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} onViewClub={onViewClub} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

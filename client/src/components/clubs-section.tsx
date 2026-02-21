import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClubCard } from "@/components/club-card";
import { Leaf, Mountain, BookOpen, Bike, Camera, Dumbbell, Palette } from "lucide-react";
import type { Club } from "@shared/schema";

const FILTER_TABS = [
  { id: "All", label: "All", icon: Leaf },
  { id: "Trekking", label: "Trekking", icon: Mountain },
  { id: "Books", label: "Books", icon: BookOpen },
  { id: "Cycling", label: "Cycling", icon: Bike },
  { id: "Photography", label: "Photography", icon: Camera },
  { id: "Fitness", label: "Fitness", icon: Dumbbell },
  { id: "Art", label: "Art", icon: Palette },
];

interface ClubsSectionProps {
  clubs: Club[];
  isLoading: boolean;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ClubsSection({ clubs, isLoading, activeCategory, onCategoryChange }: ClubsSectionProps) {
  const filteredClubs = activeCategory === "All"
    ? clubs
    : clubs.filter((c) => c.category === activeCategory);

  return (
    <section id="clubs" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-medium text-primary mb-3">Explore</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            All Clubs in Tirupati
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(tab.id)}
                data-testid={`button-filter-${tab.id.toLowerCase()}`}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {tab.label}
              </Button>
            );
          })}
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-md" />
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
                variant="link"
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
              <ClubCard key={club.id} club={club} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

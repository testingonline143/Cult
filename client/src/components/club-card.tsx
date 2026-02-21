import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Star, MessageCircle, ArrowRight, Mountain, BookOpen, Bike, Camera, Dumbbell, Palette, PenTool, Music } from "lucide-react";
import type { Club } from "@shared/schema";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Trekking: Mountain,
  Books: BookOpen,
  Cycling: Bike,
  Photography: Camera,
  Fitness: Dumbbell,
  Art: Palette,
  Writing: PenTool,
  Music: Music,
};

const ACTIVITY_COLORS: Record<string, string> = {
  "Very Active": "bg-primary/10 text-primary",
  "Moderate": "bg-chart-2/10 text-chart-2",
  "Quiet": "bg-muted-foreground/10 text-muted-foreground",
};

interface ClubCardProps {
  club: Club;
  index: number;
}

export function ClubCard({ club, index }: ClubCardProps) {
  const Icon = CATEGORY_ICONS[club.category] || Mountain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="p-5 sm:p-6 h-full flex flex-col hover-elevate" data-testid={`card-club-${club.id}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={`text-xs ${ACTIVITY_COLORS[club.activityLevel] || ""}`}>
                  {club.activityLevel}
                </Badge>
                <span className="text-xs text-muted-foreground">{club.category}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2" data-testid={`text-club-name-${club.id}`}>{club.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow" data-testid={`text-club-desc-${club.id}`}>
          {club.description}
        </p>

        {club.foundingSpots && club.foundingSpots > 0 && (
          <div className="flex items-center gap-1.5 text-chart-2 text-sm font-medium mb-4">
            <Star className="w-3.5 h-3.5" />
            <span>{club.foundingSpots} Founding spots left</span>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mb-5">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {club.schedule}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {club.memberCount} members
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {club.meetingPoint}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-club-${club.id}`}>
            View Club
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
          <Button variant="ghost" size="icon" data-testid={`button-chat-club-${club.id}`}>
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

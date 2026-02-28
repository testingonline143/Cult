import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ClubsSection } from "@/components/clubs-section";
import { ProcessSection } from "@/components/process-section";
import { OrganizerSection } from "@/components/organizer-section";
import { Footer } from "@/components/footer";
import { ActivityTicker } from "@/components/activity-ticker";
import { ClubDetailModal } from "@/components/club-detail-modal";
import { UpcomingEvents } from "@/components/upcoming-events";
import { useAuth } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import type { Club } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const { user } = useAuth();

  const { data: clubs = [], isLoading } = useQuery<(Club & { recentJoins?: number })[]>({
    queryKey: ["/api/clubs-with-activity"],
  });

  const handleMatch = (categories: string[], _times: string[]) => {
    if (categories.length > 0) {
      setActiveCategory(categories[0]);
    } else {
      setActiveCategory("All");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onMatch={handleMatch} />
      <ActivityTicker />

      {user && !user.quizCompleted && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <a
            href="/onboarding"
            className="block bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 hover:bg-primary/10 transition-all group"
            data-testid="card-quiz-prompt"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎯</span>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-foreground text-lg">Find your perfect clubs</h3>
                <p className="text-sm text-muted-foreground">Take a 2-minute quiz to get matched with clubs based on your interests</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      )}

      <UpcomingEvents />

      <ClubsSection
        clubs={clubs}
        isLoading={isLoading}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onViewClub={setSelectedClub}
      />
      <ProcessSection />
      <OrganizerSection />
      <Footer />
      <ClubDetailModal club={selectedClub} onClose={() => setSelectedClub(null)} />
    </div>
  );
}

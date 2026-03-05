import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { HeroSection, MatchSection } from "@/components/hero-section";
import { ClubsSection } from "@/components/clubs-section";
import { ProcessSection } from "@/components/process-section";
import { OrganizerSection } from "@/components/organizer-section";
import { Footer } from "@/components/footer";
import { ActivityTicker } from "@/components/activity-ticker";
import { UpcomingEvents } from "@/components/upcoming-events";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight } from "lucide-react";
import type { Club } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
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
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <HeroSection onMatch={handleMatch} />
      <ActivityTicker />

      {user && !user.quizCompleted && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <a
            href="/onboarding"
            className="block rounded-2xl p-5 transition-all group hover-elevate"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)", borderRadius: "18px" }}
            data-testid="card-quiz-prompt"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl" style={{ background: "var(--terra-pale)", borderRadius: "14px", padding: "8px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
              </span>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--ink)" }}>Find your perfect clubs</h3>
                <p className="text-sm" style={{ color: "var(--muted-warm)" }}>Take a 2-minute quiz to get matched with clubs based on your interests</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: "var(--terra)" }} />
            </div>
          </a>
        </div>
      )}

      <MatchSection onMatch={handleMatch} />
      <UpcomingEvents />

      <ClubsSection
        clubs={clubs}
        isLoading={isLoading}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ProcessSection />
      <OrganizerSection />
      <Footer />
    </div>
  );
}

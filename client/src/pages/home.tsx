import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { MatcherSection } from "@/components/matcher-section";
import { ClubsSection } from "@/components/clubs-section";
import { ProcessSection } from "@/components/process-section";
import { OrganizerSection } from "@/components/organizer-section";
import { Footer } from "@/components/footer";
import type { Club } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: clubs = [], isLoading } = useQuery<Club[]>({
    queryKey: ["/api/clubs"],
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
      <HeroSection />
      <MatcherSection onMatch={handleMatch} />
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

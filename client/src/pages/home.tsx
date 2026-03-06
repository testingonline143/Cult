import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { CategoryShowcase } from "@/components/activity-ticker";
import { ClubsSection } from "@/components/clubs-section";
import { ProcessSection } from "@/components/process-section";
import { OrganizerSection } from "@/components/organizer-section";
import { Footer } from "@/components/footer";
import type { Club } from "@shared/schema";

export default function Home() {
  const { data: clubs = [], isLoading } = useQuery<(Club & { recentJoins?: number })[]>({
    queryKey: ["/api/clubs-with-activity"],
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Navbar />
      <HeroSection />
      <CategoryShowcase />
      <ClubsSection clubs={clubs} isLoading={isLoading} />
      <ProcessSection />
      <OrganizerSection />
      <Footer />
    </div>
  );
}

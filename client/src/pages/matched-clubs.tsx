import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ClubDetailModal } from "@/components/club-detail-modal";
import type { Club } from "@shared/schema";

interface MatchedClub extends Club {
  matchScore: number;
}

export default function MatchedClubs() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const { data: matchedClubs = [], isLoading } = useQuery<MatchedClub[]>({
    queryKey: ["/api/quiz/matches"],
    queryFn: async () => {
      const res = await fetch("/api/quiz/matches", {
        headers: { "x-user-id": user?.id || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
    enabled: !!user,
  });

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎯</div>
          <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-matches-title">
            Your Top Matches{user.city ? ` in ${user.city}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Based on your interests and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : matchedClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-muted-foreground">No clubs matched yet. More clubs coming soon!</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-semibold"
              data-testid="button-browse-all"
            >
              Browse All Clubs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedClubs.map((club, index) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedClub(club)}
                data-testid={`card-match-${club.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                    {club.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-foreground truncate" data-testid={`text-match-name-${club.id}`}>
                        {club.name}
                      </h3>
                      <span
                        className="flex-shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full"
                        data-testid={`badge-match-score-${club.id}`}
                      >
                        {club.matchScore}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{club.shortDesc}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {club.memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {club.city || club.location}
                      </span>
                      <span className="bg-muted px-2 py-0.5 rounded-full">{club.category}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/explore")}
            className="text-sm text-primary hover:underline font-medium"
            data-testid="link-explore-all"
          >
            Explore All Clubs →
          </button>
        </div>
      </div>
      <ClubDetailModal club={selectedClub} onClose={() => setSelectedClub(null)} />
    </div>
  );
}

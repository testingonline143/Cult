import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users, Crosshair, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import type { Club } from "@shared/schema";

interface MatchedClub extends Club {
  matchScore: number;
}

export default function MatchedClubs() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: matchedClubs = [], isLoading } = useQuery<MatchedClub[]>({
    queryKey: ["/api/quiz/matches"],
    queryFn: async () => {
      const res = await fetch("/api/quiz/matches", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="mb-3">
            <Crosshair className="w-10 h-10 mx-auto" style={{ color: 'var(--terra)' }} />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground" data-testid="text-matches-title">
            Your Top Matches{user?.city ? ` in ${user.city}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Based on your interests and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : matchedClubs.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--terra-pale)' }}>
              <Search className="w-7 h-7" style={{ color: 'var(--terra)' }} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No matches yet</h3>
            <p className="text-sm text-muted-foreground mb-4 px-4">More clubs are being added to Tirupati. Browse what's available now!</p>
            <button
              onClick={() => navigate("/explore")}
              className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--terra)', boxShadow: 'var(--warm-shadow)' }}
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
                className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer transition-all"
                onClick={() => navigate(`/club/${club.id}`)}
                data-testid={`card-match-${club.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'var(--terra-pale)' }}>
                    {club.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-bold text-foreground truncate" data-testid={`text-match-name-${club.id}`}>
                        {club.name}
                      </h3>
                      <span
                        className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--terra-pale)', color: 'var(--terra)', border: '1px solid rgba(196,98,45,0.3)' }}
                        data-testid={`badge-match-score-${club.id}`}
                      >
                        {club.matchScore}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{club.shortDesc}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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
            className="text-sm hover:underline font-medium"
            style={{ color: 'var(--terra)' }}
            data-testid="link-explore-all"
          >
            Explore All Clubs →
          </button>
        </div>
      </div>
    </div>
  );
}

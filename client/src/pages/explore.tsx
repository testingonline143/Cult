import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ClubDetailModal } from "@/components/club-detail-modal";
import { ClubCard } from "@/components/club-card";
import { CATEGORIES, CITIES, CATEGORY_EMOJI } from "@shared/schema";
import type { Club } from "@shared/schema";

const ALL_CATEGORIES = ["All", ...CATEGORIES];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [activeVibe, setActiveVibe] = useState("all");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (activeCategory !== "All") queryParams.set("category", activeCategory);
  if (activeCity !== "All Cities") queryParams.set("city", activeCity);
  if (activeVibe !== "all") queryParams.set("vibe", activeVibe);

  const { data: clubs = [], isLoading } = useQuery<(Club & { recentJoins?: number })[]>({
    queryKey: ["/api/clubs-with-activity", search, activeCategory, activeCity, activeVibe],
    queryFn: async () => {
      const res = await fetch(`/api/clubs-with-activity?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch clubs");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-explore-title">
            Explore Clubs 🔍
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Find your people and join the community</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clubs or hobbies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="input-explore-search"
          />
        </div>

        <div className="relative mb-3" data-testid="filter-categories">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                data-testid={`filter-cat-${cat.toLowerCase()}`}
              >
                {cat !== "All" && CATEGORY_EMOJI[cat] ? `${CATEGORY_EMOJI[cat]} ` : ""}
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <select
            value={activeCity}
            onChange={(e) => setActiveCity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="select-explore-city"
          >
            <option value="All Cities">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex rounded-xl border border-border overflow-hidden" data-testid="toggle-vibe">
            {[
              { value: "all", label: "All" },
              { value: "casual", label: "☕ Casual" },
              { value: "competitive", label: "🏆 Competitive" },
            ].map((v) => (
              <button
                key={v.value}
                onClick={() => setActiveVibe(v.value)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  activeVibe === v.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
                data-testid={`vibe-filter-${v.value}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-lg font-bold text-foreground mb-2">No clubs found</h3>
            <p className="text-sm text-muted-foreground">Try different filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.filter(c => c.isActive !== false).map((club, index) => (
              <ClubCard
                key={club.id}
                club={club}
                index={index}
                onViewClub={(c) => setSelectedClub(c)}
              />
            ))}
          </div>
        )}
      </div>
      <ClubDetailModal club={selectedClub} onClose={() => setSelectedClub(null)} />
    </div>
  );
}

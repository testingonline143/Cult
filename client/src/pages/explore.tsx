import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";
import { CATEGORIES, CITIES, CATEGORY_EMOJI } from "@shared/schema";
import type { Club } from "@shared/schema";

const ALL_CATEGORIES = ["All", ...CATEGORIES];

const CATEGORY_GRADIENTS: Record<string, string> = {
  Trekking: "from-emerald-900/40 via-green-800/20 to-card",
  Books: "from-amber-900/40 via-yellow-800/20 to-card",
  Cycling: "from-sky-900/40 via-blue-800/20 to-card",
  Photography: "from-violet-900/40 via-purple-800/20 to-card",
  Fitness: "from-red-900/40 via-rose-800/20 to-card",
  Art: "from-pink-900/40 via-fuchsia-800/20 to-card",
  Football: "from-blue-900/40 via-indigo-800/20 to-card",
  Cricket: "from-green-900/40 via-lime-800/20 to-card",
  Chess: "from-slate-800/40 via-gray-700/20 to-card",
  Music: "from-purple-900/40 via-violet-800/20 to-card",
  Gaming: "from-indigo-900/40 via-blue-800/20 to-card",
  Dance: "from-rose-900/40 via-pink-800/20 to-card",
  Cooking: "from-orange-900/40 via-amber-800/20 to-card",
  Yoga: "from-teal-900/40 via-cyan-800/20 to-card",
};

const DEFAULT_GRADIENT = "from-neon/10 via-background to-card";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [activeVibe, setActiveVibe] = useState("all");

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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="font-display italic text-3xl font-bold text-foreground mb-6" data-testid="text-explore-title">
          Discover Clubs
        </h1>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tribes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 placeholder:text-muted-foreground"
            data-testid="input-explore-search"
          />
        </div>

        <div className="relative mb-4" data-testid="filter-categories">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-neon text-primary-foreground neon-glow"
                    : "glass-card text-muted-foreground"
                }`}
                data-testid={`filter-cat-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={activeCity}
            onChange={(e) => setActiveCity(e.target.value)}
            className="px-3 py-2 rounded-xl glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30"
            data-testid="select-explore-city"
          >
            <option value="All Cities">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex rounded-xl overflow-hidden glass-card" data-testid="toggle-vibe">
            {[
              { value: "all", label: "All" },
              { value: "casual", label: "Casual" },
              { value: "competitive", label: "Competitive" },
            ].map((v) => (
              <button
                key={v.value}
                onClick={() => setActiveVibe(v.value)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  activeVibe === v.value
                    ? "bg-neon text-primary-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid={`vibe-filter-${v.value}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 glass-card rounded-2xl animate-pulse" data-testid={`skeleton-club-${i}`} />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-neon/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 neon-text" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2" data-testid="text-no-clubs">No clubs found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try different filters or search terms</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setActiveCity("All Cities");
                setActiveVibe("all");
              }}
              className="inline-flex items-center gap-1.5 bg-neon/10 neon-text px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-neon/20"
              data-testid="button-clear-filters"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {clubs.filter(c => c.isActive !== false).map((club) => {
              const gradient = CATEGORY_GRADIENTS[club.category] || DEFAULT_GRADIENT;
              return (
                <Link
                  key={club.id}
                  href={`/club/${club.id}`}
                  className="block"
                  data-testid={`card-club-${club.id}`}
                >
                  <div className="glass-card rounded-2xl overflow-hidden cursor-pointer hover-elevate">
                    <div className={`relative h-48 rounded-t-2xl bg-gradient-to-b ${gradient} flex items-center justify-center`}>
                      <span className="text-6xl select-none" data-testid={`emoji-club-${club.id}`}>{club.emoji}</span>
                      <span className="absolute top-3 left-3 bg-neon text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold" data-testid={`badge-category-${club.id}`}>
                        {club.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-lg text-foreground" data-testid={`text-club-name-${club.id}`}>
                        {club.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`text-club-desc-${club.id}`}>
                        {club.shortDesc}
                      </p>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {club.schedule}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {club.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 neon-text text-xs" data-testid={`badge-members-${club.id}`}>
                            <Users className="w-3.5 h-3.5" />
                            {club.memberCount}
                          </span>
                          <span className="neon-text font-semibold text-sm" data-testid={`link-view-club-${club.id}`}>
                            View Club
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

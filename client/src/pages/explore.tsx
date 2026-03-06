import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, MapPin, Calendar, PlusCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { CATEGORIES, CITIES, CATEGORY_EMOJI } from "@shared/schema";
import type { Club } from "@shared/schema";
import { CATEGORY_GRADIENTS, DEFAULT_GRADIENT } from "@/lib/constants";

const ALL_CATEGORIES = ["All", ...CATEGORIES];

export default function Explore() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isOrganiser = user?.role === "organiser" || user?.role === "admin";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [activeVibe, setActiveVibe] = useState("all");
  const [activeTimeOfDay, setActiveTimeOfDay] = useState("all");

  const becomeCreatorMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/user/become-creator"),
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], (old: any) =>
        old ? { ...old, wantsToCreate: true } : old
      );
      navigate("/create");
    },
    onError: () => {
      navigate("/create");
    },
  });

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (activeCategory !== "All") queryParams.set("category", activeCategory);
  if (activeCity !== "All Cities") queryParams.set("city", activeCity);
  if (activeVibe !== "all") queryParams.set("vibe", activeVibe);
  if (activeTimeOfDay !== "all") queryParams.set("timeOfDay", activeTimeOfDay);

  const { data: clubs = [], isLoading } = useQuery<(Club & { recentJoins?: number })[]>({
    queryKey: ["/api/clubs-with-activity", search, activeCategory, activeCity, activeVibe, activeTimeOfDay],
    queryFn: async () => {
      const res = await fetch(`/api/clubs-with-activity?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch clubs");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-6">
        <h1 className="font-display italic text-3xl font-bold mb-6" style={{ color: "var(--ink)" }} data-testid="text-explore-title">
          Discover Clubs
        </h1>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-warm)" }} />
          <input
            type="text"
            placeholder="Search tribes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 placeholder:opacity-60"
            style={{
              background: "var(--warm-white)",
              border: "1.5px solid var(--warm-border)",
              color: "var(--ink)",
              "--tw-ring-color": "rgba(196,98,45,0.3)",
            } as React.CSSProperties}
            data-testid="input-explore-search"
          />
        </div>

        <div className="relative mb-4" data-testid="filter-categories">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                style={
                  activeCategory === cat
                    ? { background: "var(--ink)", color: "var(--cream)", border: "1.5px solid var(--ink)" }
                    : { background: "var(--warm-white)", color: "var(--ink3)", border: "1.5px solid var(--warm-border)" }
                }
                data-testid={`filter-cat-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <select
            value={activeCity}
            onChange={(e) => setActiveCity(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
            style={{
              background: "var(--warm-white)",
              border: "1.5px solid var(--warm-border)",
              color: "var(--ink)",
              "--tw-ring-color": "rgba(196,98,45,0.3)",
            } as React.CSSProperties}
            data-testid="select-explore-city"
          >
            <option value="All Cities">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--warm-border)", background: "var(--warm-white)" }} data-testid="toggle-vibe">
            {[
              { value: "all", label: "All" },
              { value: "casual", label: "Casual" },
              { value: "competitive", label: "Competitive" },
            ].map((v) => (
              <button
                key={v.value}
                onClick={() => setActiveVibe(v.value)}
                className="px-3 py-2 text-xs font-medium transition-all"
                style={
                  activeVibe === v.value
                    ? { background: "var(--ink)", color: "var(--cream)" }
                    : { color: "var(--muted-warm)" }
                }
                data-testid={`vibe-filter-${v.value}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap" data-testid="filter-time-of-day">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-warm)" }}>Time:</span>
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--warm-border)", background: "var(--warm-white)" }}>
            {[
              { value: "all", label: "Any" },
              { value: "morning", label: "☀️ Morning" },
              { value: "evening", label: "🌆 Evening" },
              { value: "weekends", label: "🗓️ Weekends" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTimeOfDay(t.value)}
                className="px-3 py-2 text-xs font-medium transition-all"
                style={
                  activeTimeOfDay === t.value
                    ? { background: "var(--ink)", color: "var(--cream)" }
                    : { color: "var(--muted-warm)" }
                }
                data-testid={`time-filter-${t.value}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-[18px] animate-pulse" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} data-testid={`skeleton-club-${i}`} />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--terra-pale)" }}>
              <Search className="w-7 h-7" style={{ color: "var(--terra)" }} />
            </div>
            <h3 className="font-display text-lg font-bold mb-2" style={{ color: "var(--ink)" }} data-testid="text-no-clubs">No clubs found</h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-warm)" }}>Try different filters or search terms</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setActiveCity("All Cities");
                setActiveVibe("all");
                setActiveTimeOfDay("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--terra-pale)", color: "var(--terra)" }}
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
                  <div className="rounded-[18px] overflow-hidden hover-elevate" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}>
                    <div className="relative h-48 flex items-center justify-center" style={{ background: gradient }}>
                      <span className="text-6xl select-none" data-testid={`emoji-club-${club.id}`}>{club.emoji}</span>
                      <span className="absolute top-3 left-3 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] uppercase text-white" style={{ background: "var(--terra)" }} data-testid={`badge-category-${club.id}`}>
                        {club.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-lg" style={{ color: "var(--ink)" }} data-testid={`text-club-name-${club.id}`}>
                        {club.name}
                      </h3>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--muted-warm)" }} data-testid={`text-club-desc-${club.id}`}>
                        {club.shortDesc}
                      </p>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--muted-warm)" }}>
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
                          <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--terra)" }} data-testid={`badge-members-${club.id}`}>
                            <Users className="w-3.5 h-3.5" />
                            {club.memberCount}
                          </span>
                          <span className="font-semibold text-sm" style={{ color: "var(--terra)" }} data-testid={`link-view-club-${club.id}`}>
                            View Club
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {isAuthenticated && !isOrganiser && (
              <button
                onClick={() => becomeCreatorMutation.mutate()}
                disabled={becomeCreatorMutation.isPending}
                className="w-full text-left"
                data-testid="card-start-club"
              >
                <div className="rounded-[18px] p-6 text-center space-y-3" style={{ background: "var(--terra-pale)", border: "1.5px dashed rgba(196,98,45,0.4)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(196,98,45,0.15)" }}>
                    <PlusCircle className="w-6 h-6" style={{ color: "var(--terra)" }} />
                  </div>
                  <h3 className="font-display text-base font-bold" style={{ color: "var(--terra)" }}>
                    Don't see your hobby?
                  </h3>
                  <p className="text-xs" style={{ color: "var(--muted-warm)" }}>
                    Start your own club and build a community around what you love.
                  </p>
                  <span className="inline-block text-sm font-semibold" style={{ color: "var(--terra)" }}>
                    {becomeCreatorMutation.isPending ? "Setting up..." : "Start a Club →"}
                  </span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

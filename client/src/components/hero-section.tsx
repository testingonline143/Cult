import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown } from "lucide-react";

const INTERESTS = [
  { id: "Trekking", emoji: "\u{1F3D4}\uFE0F" },
  { id: "Books", emoji: "\u{1F4DA}" },
  { id: "Cycling", emoji: "\u{1F6B4}" },
  { id: "Photography", emoji: "\u{1F4F7}" },
  { id: "Fitness", emoji: "\u{1F4AA}" },
  { id: "Art", emoji: "\u{1F3A8}" },
];

const TIMES = [
  { id: "morning", label: "Early Morning", emoji: "\u{1F305}" },
  { id: "evening", label: "Evening", emoji: "\u{1F307}" },
  { id: "weekends", label: "Weekends", emoji: "\u{1F4C5}" },
];

interface HeroSectionProps {
  onMatch: (categories: string[], times: string[]) => void;
}

export function HeroSection({ onMatch }: HeroSectionProps) {
  const { data: stats } = useQuery<{ totalMembers: number; totalClubs: number; upcomingEvents: number }>({
    queryKey: ["/api/stats"],
  });

  return (
    <section id="hero" className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden bg-[hsl(var(--primary)/1)]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-[hsl(var(--clay))]/[0.08] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px" }} />
      </div>

      <div className="relative z-10 text-center max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] text-[11px] font-bold tracking-[2.5px] uppercase text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--clay))] animate-pulse" />
            Tirupati
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-sans font-black text-white leading-[0.95] tracking-tight mb-6"
          style={{ fontSize: "clamp(48px, 10vw, 96px)", letterSpacing: "-3px" }}
          data-testid="text-hero-headline"
        >
          Find your <span className="text-[hsl(var(--clay))]">cult.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-white/60 max-w-[480px] mx-auto mb-10 leading-relaxed"
          style={{ fontSize: "clamp(16px, 2.2vw, 20px)" }}
          data-testid="text-hero-subheadline"
        >
          Your city has more going on than you think.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <button
            onClick={() => document.getElementById("clubs")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[hsl(var(--clay))] hover:brightness-110 text-white rounded-full px-10 py-4 text-base font-bold transition-all shadow-lg shadow-[hsl(var(--clay))]/25"
            data-testid="button-explore-clubs"
          >
            Explore Clubs
          </button>
          <button
            onClick={() => document.getElementById("match")?.scrollIntoView({ behavior: "smooth" })}
            className="text-white/60 hover:text-white rounded-full px-8 py-4 text-sm font-medium transition-all border border-white/15 hover:border-white/30 hover:bg-white/[0.05]"
            data-testid="button-find-match"
          >
            Find Your Match
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex items-center justify-center gap-6 sm:gap-10"
        >
          {[
            { value: stats ? `${stats.totalClubs}+` : "—", label: "Active Clubs" },
            { value: stats ? `${stats.totalMembers}+` : "—", label: "Members" },
            { value: stats ? `${stats.upcomingEvents}` : "—", label: "Events This Week" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="font-sans text-2xl sm:text-3xl font-black text-white leading-none">{stat.value}</div>
              <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <button
          onClick={() => document.getElementById("match")?.scrollIntoView({ behavior: "smooth" })}
          className="text-white/30 hover:text-white/50 transition-colors animate-bounce"
          aria-label="Scroll down"
          data-testid="button-scroll-down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
}

export function MatchSection({ onMatch }: HeroSectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTime = (id: string) => {
    setSelectedTimes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleMatch = () => {
    onMatch(selectedInterests, selectedTimes);
    document.getElementById("clubs")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="match" className="py-16 sm:py-20">
      <div className="max-w-[520px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="font-sans text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-2">
            What are you into?
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick your interests and we'll match you with the right cult
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          data-testid="card-match-widget"
        >
          <div className="mb-4">
            <div className="text-xs text-muted-foreground font-medium mb-2.5">Interests</div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-medium transition-all ${
                    selectedInterests.includes(interest.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40"
                  }`}
                  data-testid={`button-interest-${interest.id.toLowerCase()}`}
                >
                  {interest.emoji} {interest.id}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs text-muted-foreground font-medium mb-2.5">When are you free?</div>
            <div className="flex flex-wrap gap-2">
              {TIMES.map((time) => (
                <button
                  key={time.id}
                  onClick={() => toggleTime(time.id)}
                  className={`px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-medium transition-all ${
                    selectedTimes.includes(time.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40"
                  }`}
                  data-testid={`button-time-${time.id}`}
                >
                  {time.emoji} {time.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleMatch}
            className="w-full bg-[hsl(var(--clay))] hover:brightness-110 text-white border-none rounded-xl py-3.5 text-sm font-bold transition-all"
            data-testid="button-show-matches"
          >
            Show My Matches
          </button>
        </motion.div>
      </div>
    </section>
  );
}

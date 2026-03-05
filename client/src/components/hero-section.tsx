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
    <section id="hero" className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden" style={{ background: "var(--cream)" }}>
      <div className="relative z-10 text-center max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[2.5px] uppercase mb-8" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)", color: "var(--muted-warm)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--terra)" }} />
            Tirupati
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display font-black leading-[0.95] tracking-tight mb-6"
          style={{ fontSize: "clamp(48px, 10vw, 96px)", letterSpacing: "-3px", color: "var(--ink)" }}
          data-testid="text-hero-headline"
        >
          Find your <em style={{ color: "var(--terra)", fontStyle: "italic" }}>cult.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="max-w-[480px] mx-auto mb-10 leading-relaxed"
          style={{ fontSize: "clamp(16px, 2.2vw, 20px)", color: "var(--muted-warm)" }}
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
            className="rounded-full px-10 py-4 text-base font-bold transition-all"
            style={{ background: "var(--terra)", color: "white", boxShadow: "var(--warm-shadow)" }}
            data-testid="button-explore-clubs"
          >
            Explore Clubs
          </button>
          <button
            onClick={() => document.getElementById("match")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full px-8 py-4 text-sm font-medium transition-all"
            style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)", color: "var(--muted-warm)" }}
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
            { value: stats ? `${stats.totalClubs}+` : "\u2014", label: "Active Clubs" },
            { value: stats ? `${stats.totalMembers}+` : "\u2014", label: "Members" },
            { value: stats ? `${stats.upcomingEvents}` : "\u2014", label: "Events This Week" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="font-mono text-2xl sm:text-3xl leading-none" style={{ color: "var(--terra)", letterSpacing: "1px" }}>{stat.value}</div>
              <div className="text-[11px] mt-1 uppercase tracking-wider font-medium" style={{ color: "var(--muted-warm)" }}>{stat.label}</div>
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
          className="transition-colors animate-bounce"
          style={{ color: "var(--muted-warm)" }}
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
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: "var(--ink)" }}>
            What are you into?
          </h2>
          <p className="text-sm" style={{ color: "var(--muted-warm)" }}>
            Pick your interests and we'll match you with the right cult
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)", borderRadius: "18px" }}
          data-testid="card-match-widget"
        >
          <div className="mb-4">
            <div className="text-xs font-medium mb-2.5" style={{ color: "var(--muted-warm)" }}>Interests</div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className="px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-medium transition-all"
                  style={
                    selectedInterests.includes(interest.id)
                      ? { background: "var(--ink)", color: "var(--cream)", borderColor: "var(--ink)" }
                      : { background: "var(--warm-white)", borderColor: "var(--warm-border)", color: "var(--ink3, #3D3228)" }
                  }
                  data-testid={`button-interest-${interest.id.toLowerCase()}`}
                >
                  {interest.emoji} {interest.id}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs font-medium mb-2.5" style={{ color: "var(--muted-warm)" }}>When are you free?</div>
            <div className="flex flex-wrap gap-2">
              {TIMES.map((time) => (
                <button
                  key={time.id}
                  onClick={() => toggleTime(time.id)}
                  className="px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-medium transition-all"
                  style={
                    selectedTimes.includes(time.id)
                      ? { background: "var(--ink)", color: "var(--cream)", borderColor: "var(--ink)" }
                      : { background: "var(--warm-white)", borderColor: "var(--warm-border)", color: "var(--ink3, #3D3228)" }
                  }
                  data-testid={`button-time-${time.id}`}
                >
                  {time.emoji} {time.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleMatch}
            className="w-full border-none rounded-xl py-3.5 text-sm font-bold transition-all"
            style={{ background: "var(--terra)", color: "white", boxShadow: "var(--warm-shadow)" }}
            data-testid="button-show-matches"
          >
            Show My Matches
          </button>
        </motion.div>
      </div>
    </section>
  );
}

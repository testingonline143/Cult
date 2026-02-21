import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-150px] w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[80px]" />
        <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] bg-[hsl(var(--clay))]/[0.05] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 text-center max-w-[700px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/[0.05] text-[11px] font-semibold tracking-[2px] uppercase text-primary mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Tirupati's Club Discovery Platform
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif font-black text-primary leading-none tracking-tight mb-6"
          style={{ fontSize: "clamp(44px, 9vw, 88px)", letterSpacing: "-3px" }}
        >
          Find where<br />you <em className="text-[hsl(var(--clay))]">belong</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground max-w-[440px] mx-auto mb-10 leading-relaxed"
          style={{ fontSize: "clamp(15px, 2vw, 18px)" }}
        >
          Discover active clubs in Tirupati — trekking, books, cycling, photography and more. Real communities, real people.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card border border-border rounded-[20px] p-5 sm:p-6 max-w-[480px] w-full mx-auto mb-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-left"
        >
          <div className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[1px] mb-3.5">
            ✦ Find your best match
          </div>

          <div className="mb-2.5">
            <div className="text-xs text-muted-foreground font-medium mb-2">What are you into?</div>
            <div className="flex flex-wrap gap-2 mb-3.5">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium transition-all ${
                    selectedInterests.includes(interest.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                  data-testid={`button-interest-${interest.id.toLowerCase()}`}
                >
                  {interest.emoji} {interest.id}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3.5">
            <div className="text-xs text-muted-foreground font-medium mb-2">When are you free?</div>
            <div className="flex flex-wrap gap-2">
              {TIMES.map((time) => (
                <button
                  key={time.id}
                  onClick={() => toggleTime(time.id)}
                  className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium transition-all ${
                    selectedTimes.includes(time.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground"
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
            className="w-full bg-[hsl(var(--clay))] text-white border-none rounded-xl py-3 text-sm font-semibold transition-all"
            data-testid="button-show-matches"
          >
            Show My Matches →
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-8 flex-wrap justify-center"
        >
          {[
            { value: "10+", label: "Active Clubs" },
            { value: "500+", label: "Members" },
            { value: "Free", label: "To Join" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="text-center px-4 border-r border-border last:border-r-0"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="font-serif text-[28px] font-bold text-primary leading-none">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

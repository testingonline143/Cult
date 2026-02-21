import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Tirupati's Club Discovery Platform
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          Find where{" "}
          <br className="sm:hidden" />
          you <span className="italic font-serif text-primary">belong</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Discover active clubs in Tirupati — trekking, books, cycling, photography and more.
          Real communities, real people.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Button
            size="lg"
            onClick={() => scrollTo("matcher")}
            data-testid="button-find-match"
          >
            Find Your Match
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => scrollTo("clubs")}
            data-testid="button-explore-clubs"
          >
            Explore Clubs
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: "10+", label: "Active Clubs" },
            { value: "500+", label: "Members" },
            { value: "Free", label: "To Join" },
            { value: "8%", label: "Commission Only" },
          ].map((stat) => (
            <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollTo("matcher")}
          data-testid="button-scroll-down"
        >
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </Button>
      </motion.div>
    </section>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Mountain, BookOpen, Bike, Camera, Dumbbell, Palette, Sunrise, Sunset, Calendar, ArrowRight } from "lucide-react";

const INTERESTS = [
  { id: "Trekking", label: "Trekking", icon: Mountain },
  { id: "Books", label: "Books", icon: BookOpen },
  { id: "Cycling", label: "Cycling", icon: Bike },
  { id: "Photography", label: "Photography", icon: Camera },
  { id: "Fitness", label: "Fitness", icon: Dumbbell },
  { id: "Art", label: "Art", icon: Palette },
];

const TIMES = [
  { id: "morning", label: "Early Morning", icon: Sunrise },
  { id: "evening", label: "Evening", icon: Sunset },
  { id: "weekends", label: "Weekends", icon: Calendar },
];

interface MatcherSectionProps {
  onMatch: (categories: string[], times: string[]) => void;
}

export function MatcherSection({ onMatch }: MatcherSectionProps) {
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
    <section id="matcher" className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Find your best match
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8">
            <div className="mb-8">
              <h3 className="text-base font-semibold mb-4">What are you into?</h3>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  const Icon = interest.icon;
                  return (
                    <Button
                      key={interest.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleInterest(interest.id)}
                      data-testid={`button-interest-${interest.id.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {interest.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-base font-semibold mb-4">When are you free?</h3>
              <div className="flex flex-wrap gap-2">
                {TIMES.map((time) => {
                  const isSelected = selectedTimes.includes(time.id);
                  const Icon = time.icon;
                  return (
                    <Button
                      key={time.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTime(time.id)}
                      data-testid={`button-time-${time.id}`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {time.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleMatch}
              disabled={selectedInterests.length === 0}
              data-testid="button-show-matches"
            >
              Show My Matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

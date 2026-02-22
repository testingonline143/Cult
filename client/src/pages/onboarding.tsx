import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { HOBBY_ICONS } from "@shared/schema";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", emoji: "🌱", desc: "Just getting started" },
  { value: "intermediate", label: "Intermediate", emoji: "🌿", desc: "Some experience" },
  { value: "pro", label: "Pro", emoji: "🌳", desc: "Very experienced" },
];

const VIBE_OPTIONS = [
  { value: "casual", label: "Casual Hangout", emoji: "☕", desc: "Relaxed, social, fun vibes" },
  { value: "competitive", label: "Competitive Play", emoji: "🏆", desc: "Serious, goal-oriented" },
];

const AVAILABILITY_OPTIONS = [
  { value: "weekday_morning", label: "Weekday Morning", emoji: "🌅" },
  { value: "weekday_evening", label: "Weekday Evening", emoji: "🌆" },
  { value: "weekend_morning", label: "Weekend Morning", emoji: "☀️" },
  { value: "weekend_evening", label: "Weekend Evening", emoji: "🌙" },
];

export default function Onboarding() {
  const { user, login } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [vibePreference, setVibePreference] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [collegeOrWork, setCollegeOrWork] = useState("");

  const totalSteps = 5;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          interests,
          experienceLevel,
          vibePreference,
          availability,
          collegeOrWork: collegeOrWork || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      if (user) {
        login({ ...user, quizCompleted: true });
      }
      navigate("/matched-clubs");
    },
  });

  const toggleInterest = (name: string) => {
    setInterests((prev) => {
      if (prev.includes(name)) return prev.filter((i) => i !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  };

  const toggleAvailability = (value: string) => {
    setAvailability((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return interests.length >= 1;
      case 2: return !!experienceLevel;
      case 3: return !!vibePreference;
      case 4: return availability.length >= 1;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      saveMutation.mutate();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-lg mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-lg font-bold text-primary" data-testid="text-quiz-title">
              Tell us about yourself
            </h1>
            <span className="text-xs text-muted-foreground" data-testid="text-quiz-step">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2" data-testid="progress-bar">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-step1-title">
                    What are your top interests? 🎯
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pick 1 to 3 hobbies you love
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {HOBBY_ICONS.map((hobby) => {
                      const selected = interests.includes(hobby.name);
                      return (
                        <button
                          key={hobby.name}
                          onClick={() => toggleInterest(hobby.name)}
                          className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                            selected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                          data-testid={`hobby-${hobby.name.toLowerCase()}`}
                        >
                          <span className="text-2xl mb-1">{hobby.emoji}</span>
                          <span className="text-xs font-medium text-foreground">{hobby.name}</span>
                          {selected && (
                            <Check className="w-3 h-3 text-primary mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {interests.length}/3 selected
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-step2-title">
                    How experienced are you? 🎓
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    This helps us match you with the right crowd
                  </p>
                  <div className="space-y-3">
                    {EXPERIENCE_LEVELS.map((level) => {
                      const selected = experienceLevel === level.value;
                      return (
                        <button
                          key={level.value}
                          onClick={() => setExperienceLevel(level.value)}
                          className={`w-full flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                            selected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                          data-testid={`experience-${level.value}`}
                        >
                          <span className="text-3xl mr-4">{level.emoji}</span>
                          <div>
                            <span className="font-semibold text-foreground">{level.label}</span>
                            <p className="text-xs text-muted-foreground">{level.desc}</p>
                          </div>
                          {selected && <Check className="w-5 h-5 text-primary ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-step3-title">
                    What vibe do you prefer? ✨
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    How do you like to spend time with your community?
                  </p>
                  <div className="space-y-3">
                    {VIBE_OPTIONS.map((vibe) => {
                      const selected = vibePreference === vibe.value;
                      return (
                        <button
                          key={vibe.value}
                          onClick={() => setVibePreference(vibe.value)}
                          className={`w-full flex items-center p-5 rounded-xl border-2 transition-all text-left ${
                            selected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                          data-testid={`vibe-${vibe.value}`}
                        >
                          <span className="text-4xl mr-4">{vibe.emoji}</span>
                          <div>
                            <span className="font-semibold text-foreground text-lg">{vibe.label}</span>
                            <p className="text-sm text-muted-foreground">{vibe.desc}</p>
                          </div>
                          {selected && <Check className="w-5 h-5 text-primary ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-step4-title">
                    When are you usually free? 📅
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select all time slots that work for you
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABILITY_OPTIONS.map((slot) => {
                      const selected = availability.includes(slot.value);
                      return (
                        <button
                          key={slot.value}
                          onClick={() => toggleAvailability(slot.value)}
                          className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                            selected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                          data-testid={`availability-${slot.value}`}
                        >
                          <span className="text-2xl mb-2">{slot.emoji}</span>
                          <span className="text-sm font-medium text-foreground text-center">{slot.label}</span>
                          {selected && <Check className="w-4 h-4 text-primary mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2" data-testid="text-step5-title">
                    Your college or workplace? 🏫
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Optional — helps us find campus clubs for you
                  </p>
                  <input
                    type="text"
                    value={collegeOrWork}
                    onChange={(e) => setCollegeOrWork(e.target.value)}
                    placeholder="e.g., SV University, TCS Tirupati..."
                    className="w-full px-4 py-4 rounded-xl border-2 border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    data-testid="input-college"
                  />
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    You can skip this — just hit Finish below
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="button-quiz-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || saveMutation.isPending}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            data-testid="button-quiz-next"
          >
            {saveMutation.isPending ? "Saving..." : step === totalSteps ? "Finish" : "Next"}
            {step < totalSteps && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-4"
          data-testid="button-skip-quiz"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { CATEGORIES, CITIES } from "@shared/schema";

export function OrganizerSection() {
  const [showForm, setShowForm] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [clubName, setClubName] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [schedule, setSchedule] = useState("");
  const [location, setLocation] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("Tirupati");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/clubs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: clubName,
          category,
          shortDesc,
          fullDesc,
          schedule,
          location,
          organizerName,
          whatsappNumber,
          city,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Failed to create club" }));
        throw new Error(data.message || "Failed to create club");
      }
      return res.json();
    },
    onSuccess: () => {
      setCreated(true);
      setTimeout(() => {
        navigate("/organizer");
      }, 2000);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName || clubName.length < 3) {
      toast({ title: "Club name must be at least 3 characters", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    if (!organizerName || organizerName.length < 2) {
      toast({ title: "Organizer name must be at least 2 characters", variant: "destructive" });
      return;
    }
    createMutation.mutate();
  };

  return (
    <section id="organizer" className="py-16 sm:py-20">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-[hsl(var(--clay))]" />

            <div className="text-[52px] mb-5">{"\u{1F3D5}\uFE0F"}</div>
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-[1.1] mb-3.5">
              Got a crew? <span className="text-[hsl(var(--clay))]">Put it on the map.</span>
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[500px] mx-auto mb-8">
              List your club for free. Get discovered by hundreds of people looking for exactly what you're building. Goes live instantly.
            </p>

            <div className="flex gap-3 justify-center flex-wrap mb-8">
              {["Free forever", "Goes live instantly", "More members", "Get discovered"].map((perk) => (
                <span key={perk} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground px-3.5 py-1.5 rounded-full bg-background border border-border">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {perk}
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {!showForm && !created && (
                <motion.div key="cta" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-primary-foreground rounded-full px-9 py-4 text-[15px] font-semibold transition-all"
                    data-testid="button-list-club-cta"
                  >
                    Create My Club for Free →
                  </button>
                </motion.div>
              )}

              {showForm && !created && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-[450px] mx-auto text-left"
                >
                  {!isAuthenticated ? (
                    <div className="text-center space-y-4 py-6">
                      <LogIn className="w-10 h-10 text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">Sign in first to create your club</p>
                      <button
                        onClick={() => { window.location.href = "/api/login"; }}
                        className="bg-primary text-primary-foreground rounded-xl px-8 py-3 text-sm font-semibold"
                        data-testid="button-sign-in-to-create"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Club Name *</label>
                        <Input
                          placeholder="e.g. Tirupati Trekkers"
                          className="rounded-xl"
                          data-testid="input-club-name"
                          value={clubName}
                          onChange={(e) => setClubName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category *</label>
                        <Select onValueChange={setCategory} value={category}>
                          <SelectTrigger className="rounded-xl" data-testid="select-category">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Your Name *</label>
                        <Input
                          placeholder="Your full name"
                          className="rounded-xl"
                          data-testid="input-organizer-name"
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Short Description</label>
                        <Input
                          placeholder="One-liner about your club"
                          className="rounded-xl"
                          data-testid="input-short-desc"
                          value={shortDesc}
                          onChange={(e) => setShortDesc(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Full Description</label>
                        <textarea
                          placeholder="Tell people what your club is about, what you do, who should join..."
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          data-testid="input-full-desc"
                          value={fullDesc}
                          onChange={(e) => setFullDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Schedule</label>
                          <Input
                            placeholder="e.g. Every Sunday 6 AM"
                            className="rounded-xl"
                            data-testid="input-schedule"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Location</label>
                          <Input
                            placeholder="e.g. SV University"
                            className="rounded-xl"
                            data-testid="input-location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">City</label>
                          <Select onValueChange={setCity} value={city}>
                            <SelectTrigger className="rounded-xl" data-testid="select-city">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              {CITIES.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">WhatsApp</label>
                          <Input
                            placeholder="For member coordination"
                            type="tel"
                            className="rounded-xl"
                            data-testid="input-whatsapp"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-[15px] font-semibold transition-all disabled:opacity-60"
                        data-testid="button-submit-club"
                      >
                        {createMutation.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </span>
                        ) : (
                          "Create Club & Go Live →"
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {created && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                  data-testid="text-creation-success"
                >
                  <div className="text-5xl mb-3">{"\u{1F331}"}</div>
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">Your Club is Live!</h3>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to your organizer dashboard...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

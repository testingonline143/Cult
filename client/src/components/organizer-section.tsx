import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClubSubmissionSchema, CATEGORIES } from "@shared/schema";
import { z } from "zod";

const formSchema = insertClubSubmissionSchema.extend({
  clubName: z.string().min(2, "Club name must be at least 2 characters"),
  organizerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  category: z.string().min(1, "Please select a category"),
});

type FormValues = z.infer<typeof formSchema>;

export function OrganizerSection() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubName: "",
      organizerName: "",
      phone: "",
      category: "",
      description: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/club-submissions", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormValues) => {
    submitMutation.mutate(data);
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
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight leading-[1.1] mb-3.5">
              Running a club in Tirupati?
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[500px] mx-auto mb-8">
              List your club free. Get discovered by hundreds of people actively looking for exactly what you're building. No fees, no complexity.
            </p>

            <div className="flex gap-3 justify-center flex-wrap mb-8">
              {["Free forever", "5 minute setup", "More members", "Get discovered"].map((perk) => (
                <span key={perk} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground px-3.5 py-1.5 rounded-full bg-background border border-border">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {perk}
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {!showForm && !submitted && (
                <motion.div key="cta" exit={{ opacity: 0 }}>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-primary-foreground rounded-full px-9 py-4 text-[15px] font-semibold transition-all"
                    data-testid="button-list-club-cta"
                  >
                    List My Club for Free →
                  </button>
                </motion.div>
              )}

              {showForm && !submitted && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-[400px] mx-auto text-left"
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="clubName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Club Name"
                                className="rounded-xl"
                                data-testid="input-club-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="organizerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Your Name"
                                className="rounded-xl"
                                data-testid="input-organizer-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="WhatsApp Number"
                                className="rounded-xl"
                                data-testid="input-phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl" data-testid="select-category">
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your club..."
                                className="resize-none rounded-xl"
                                rows={3}
                                data-testid="input-description"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-[15px] font-semibold transition-all disabled:opacity-60"
                        data-testid="button-submit-club"
                      >
                        {submitMutation.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          "Submit Club →"
                        )}
                      </button>
                    </form>
                  </Form>
                </motion.div>
              )}

              {submitted && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                  data-testid="text-submission-success"
                >
                  <div className="text-5xl mb-3">{"\u{1F331}"}</div>
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">Received!</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll contact you within 24 hours to get your club set up.
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

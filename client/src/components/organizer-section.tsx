import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tent, Check, ArrowRight, X, Loader2 } from "lucide-react";
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
    <section id="organizer" className="py-20 sm:py-28 bg-card/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 sm:p-10 relative overflow-visible">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-5">
                  <Tent className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Running a club in Tirupati?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  List your club free. Get discovered by hundreds of people actively looking for exactly what you're building. No fees, no complexity.
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm mb-6">
                  {["Free forever", "5 minute setup", "More members", "Get discovered"].map((perk) => (
                    <span key={perk} className="inline-flex items-center gap-1.5 text-primary font-medium">
                      <Check className="w-4 h-4" />
                      {perk}
                    </span>
                  ))}
                </div>
                {!showForm && !submitted && (
                  <Button
                    size="lg"
                    onClick={() => setShowForm(true)}
                    data-testid="button-list-club-cta"
                  >
                    List My Club for Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {showForm && !submitted && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full lg:w-96"
                  >
                    <div className="rounded-md border border-border bg-background p-5">
                      <div className="flex items-center justify-between gap-1 mb-5">
                        <div className="flex items-center gap-2">
                          <Tent className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">List Your Club</h3>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowForm(false)}
                          data-testid="button-close-form"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-5">
                        Free forever. We'll reach out within 24 hours to get you set up.
                      </p>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="clubName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Club Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Tirupati Runners"
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
                                <FormLabel className="text-xs">Your Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Ravi Kumar"
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
                                <FormLabel className="text-xs">Phone / WhatsApp</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 9876543210"
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
                                <FormLabel className="text-xs">Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-category">
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
                                <FormLabel className="text-xs">Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your club..."
                                    className="resize-none"
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
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={submitMutation.isPending}
                            data-testid="button-submit-club"
                          >
                            {submitMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                Submit Club
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                )}

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full lg:w-96"
                  >
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-6 text-center" data-testid="text-submission-success">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Received!</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll contact you within 24 hours to get your club set up.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

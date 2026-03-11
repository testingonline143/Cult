import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, Link as LinkIcon, Copy, Check, ExternalLink, Globe, Loader2, Calendar, MapPin, X } from "lucide-react";
import type { Club, ClubPageSection, Event } from "@shared/schema";

interface SectionEvent {
  id: string;
  sectionId: string;
  eventId: string;
  position: number;
  eventTitle: string;
  eventStartsAt: string;
  eventLocation: string;
}

interface SectionWithEvents extends ClubPageSection {
  events: SectionEvent[];
}

export default function PageBuilder() {
  const { clubId } = useParams<{ clubId: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: club, isLoading: clubLoading } = useQuery<Club>({
    queryKey: ["/api/clubs", clubId],
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<SectionWithEvents[]>({
    queryKey: ["/api/organizer/clubs", clubId, "page-sections"],
    queryFn: async () => {
      const res = await fetch(`/api/organizer/clubs/${clubId}/page-sections`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!clubId,
  });

  const { data: clubEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/clubs", clubId, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/events`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!clubId,
  });

  const [slug, setSlug] = useState("");
  const [slugSaved, setSlugSaved] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);

  useEffect(() => {
    if (club?.slug) setSlug(club.slug);
  }, [club?.slug]);

  const slugMutation = useMutation({
    mutationFn: async (newSlug: string) => {
      const res = await apiRequest("PATCH", `/api/organizer/clubs/${clubId}/slug`, { slug: newSlug });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId] });
      setSlugSaved(true);
      setTimeout(() => setSlugSaved(false), 2000);
      toast({ title: "URL updated!" });
    },
    onError: (err: any) => {
      toast({ title: err?.message || "Failed to update URL", variant: "destructive" });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async (data: { title: string; emoji: string; description?: string }) => {
      const res = await apiRequest("POST", `/api/organizer/clubs/${clubId}/page-sections`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "page-sections"] });
      toast({ title: "Section added!" });
      setNewSectionTitle("");
      setNewSectionEmoji("📌");
      setShowNewSection(false);
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionId, data }: { sectionId: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/organizer/clubs/${clubId}/page-sections/${sectionId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "page-sections"] });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      await apiRequest("DELETE", `/api/organizer/clubs/${clubId}/page-sections/${sectionId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "page-sections"] });
      toast({ title: "Section deleted" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (sectionIds: string[]) => {
      await apiRequest("PATCH", `/api/organizer/clubs/${clubId}/page-sections/reorder`, { sectionIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "page-sections"] });
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async ({ sectionId, eventId }: { sectionId: string; eventId: string }) => {
      const res = await apiRequest("POST", `/api/organizer/clubs/${clubId}/page-sections/${sectionId}/events`, { eventId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "page-sections"] });
    },
  });

  const removeEventMutation = useMutation({
    mutationFn: async ({ sectionId, seId }: { sectionId: string; seId: string }) => {
      await apiRequest("DELETE", `/api/organizer/clubs/${clubId}/page-sections/${sectionId}/events/${seId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/clubs", clubId, "page-sections"] });
    },
  });

  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionEmoji, setNewSectionEmoji] = useState("📌");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [addingEventToSection, setAddingEventToSection] = useState<string | null>(null);

  if (authLoading || clubLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--terra)]" />
      </div>
    );
  }

  if (!isAuthenticated || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--cream)" }}>
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-[var(--ink)] mb-2">Access Denied</h2>
          <p className="text-sm text-[var(--muted-warm)]">You need to be logged in and be a club manager to access this page.</p>
        </div>
      </div>
    );
  }

  const publicUrl = club.slug ? `${window.location.origin}/c/${club.slug}` : null;

  const moveSection = (index: number, direction: "up" | "down") => {
    const ids = sections.map(s => s.id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= ids.length) return;
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    reorderMutation.mutate(ids);
  };

  const handleCopyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setSlugCopied(true);
      setTimeout(() => setSlugCopied(false), 2000);
    }
  };

  const SECTION_EMOJIS = ["📌", "🎯", "🏆", "📸", "🎉", "📅", "💡", "🔥", "⭐", "🎵", "🏃", "📚"];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--cream)" }}>
      <div className="sticky top-0 z-30 px-5 pt-14 pb-3 flex items-center justify-between" style={{ background: "var(--cream)", borderBottom: "1.5px solid var(--warm-border)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/organizer")} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }} data-testid="button-back">
            <ChevronLeft className="w-4 h-4 text-[var(--ink)]" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-[var(--ink)]">Page Builder</h1>
            <p className="text-[10px] text-[var(--muted-warm)]">{club.name}</p>
          </div>
        </div>
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--terra)]" style={{ background: "var(--terra-pale)" }} data-testid="link-preview-page">
            <Eye className="w-3.5 h-3.5" /> Preview
          </a>
        )}
      </div>

      <div className="px-5 mt-5">
        <div className="rounded-2xl p-4" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[var(--terra)]" />
            <h2 className="font-display text-sm font-bold text-[var(--ink)]">Public URL</h2>
          </div>
          <p className="text-xs text-[var(--muted-warm)] mb-3">Set a custom URL for your club's public page. Share it anywhere!</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center rounded-lg overflow-hidden" style={{ border: "1.5px solid var(--warm-border)", background: "var(--cream)" }}>
              <span className="text-xs text-[var(--muted-warm)] px-2.5 shrink-0 select-none">/c/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-club-name"
                className="flex-1 py-2.5 pr-2.5 text-sm bg-transparent outline-none text-[var(--ink)]"
                data-testid="input-slug"
              />
            </div>
            <button
              onClick={() => slug.length >= 2 && slugMutation.mutate(slug)}
              disabled={slug.length < 2 || slugMutation.isPending}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--terra)" }}
              data-testid="button-save-slug"
            >
              {slugMutation.isPending ? "..." : slugSaved ? "Saved!" : "Save"}
            </button>
          </div>
          {publicUrl && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 text-xs text-[var(--terra)] font-medium truncate">{publicUrl}</div>
              <button onClick={handleCopyUrl} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold" style={{ background: "var(--terra-pale)", color: "var(--terra)" }} data-testid="button-copy-url">
                {slugCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {slugCopied ? "Copied!" : "Copy"}
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold" style={{ background: "var(--terra-pale)", color: "var(--terra)" }} data-testid="link-open-page">
                <ExternalLink className="w-3 h-3" /> Open
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            Sections
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--terra-pale)", color: "var(--terra)" }}>{sections.length}</span>
          </h2>
          <button
            onClick={() => setShowNewSection(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "var(--terra)" }}
            data-testid="button-add-section"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>

        {showNewSection && (
          <div className="rounded-2xl p-4 mb-3" style={{ background: "var(--warm-white)", border: "1.5px solid rgba(196,98,45,0.3)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex flex-wrap gap-1">
                {SECTION_EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewSectionEmoji(e)} className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${newSectionEmoji === e ? "ring-2 ring-[var(--terra)] scale-110" : ""}`} style={{ background: "var(--cream)" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Section title (e.g. Featured Events)"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--cream)] outline-none text-[var(--ink)]"
              style={{ border: "1.5px solid var(--warm-border)" }}
              data-testid="input-section-title"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setShowNewSection(false); setNewSectionTitle(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-[var(--muted-warm)]"
                style={{ background: "var(--cream)", border: "1.5px solid var(--warm-border)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => newSectionTitle.trim() && createSectionMutation.mutate({ title: newSectionTitle.trim(), emoji: newSectionEmoji })}
                disabled={!newSectionTitle.trim() || createSectionMutation.isPending}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "var(--terra)" }}
                data-testid="button-create-section"
              >
                {createSectionMutation.isPending ? "Creating..." : "Create Section"}
              </button>
            </div>
          </div>
        )}

        {sectionsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--terra)]" /></div>
        ) : sections.length === 0 && !showNewSection ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "var(--warm-white)", border: "1.5px dashed var(--warm-border)" }}>
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm font-semibold text-[var(--ink)] mb-1">No sections yet</p>
            <p className="text-xs text-[var(--muted-warm)]">Add sections to organize your public page with events, highlights, and more.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}>
                <div className="p-3 flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveSection(idx, "up")} disabled={idx === 0} className="text-[var(--muted-warm)] disabled:opacity-30" data-testid={`button-move-up-${section.id}`}><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveSection(idx, "down")} disabled={idx === sections.length - 1} className="text-[var(--muted-warm)] disabled:opacity-30" data-testid={`button-move-down-${section.id}`}><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <span className="text-lg">{section.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm font-bold text-[var(--ink)] truncate">{section.title}</div>
                    {section.description && <p className="text-xs text-[var(--muted-warm)] truncate">{section.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateSectionMutation.mutate({ sectionId: section.id, data: { isVisible: !section.isVisible } })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--cream)" }}
                      data-testid={`button-toggle-visibility-${section.id}`}
                    >
                      {section.isVisible !== false ? <Eye className="w-3.5 h-3.5 text-[var(--terra)]" /> : <EyeOff className="w-3.5 h-3.5 text-[var(--muted-warm)]" />}
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this section?")) deleteSectionMutation.mutate(section.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}
                      data-testid={`button-delete-section-${section.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="px-3 pb-3">
                  {section.events.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {section.events.map((evt) => (
                        <div key={evt.id} className="flex items-center gap-2 rounded-lg p-2" style={{ background: "var(--cream)" }}>
                          <Calendar className="w-3.5 h-3.5 text-[var(--terra)] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[var(--ink)] truncate">{evt.eventTitle}</div>
                            <div className="text-[10px] text-[var(--muted-warm)]">{new Date(evt.eventStartsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                          </div>
                          <button
                            onClick={() => removeEventMutation.mutate({ sectionId: section.id, seId: evt.id })}
                            className="text-red-400 hover:text-red-500"
                            data-testid={`button-remove-event-${evt.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {addingEventToSection === section.id ? (
                    <EventPicker
                      events={clubEvents}
                      existingEventIds={section.events.map(e => e.eventId)}
                      onSelect={(eventId) => {
                        addEventMutation.mutate({ sectionId: section.id, eventId });
                        setAddingEventToSection(null);
                      }}
                      onCancel={() => setAddingEventToSection(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setAddingEventToSection(section.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-[var(--terra)] transition-colors"
                      style={{ background: "var(--terra-pale)" }}
                      data-testid={`button-add-event-to-${section.id}`}
                    >
                      <Plus className="w-3 h-3" /> Add Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventPicker({ events, existingEventIds, onSelect, onCancel }: {
  events: Event[];
  existingEventIds: string[];
  onSelect: (eventId: string) => void;
  onCancel: () => void;
}) {
  const available = events.filter(e => !existingEventIds.includes(e.id) && !e.isCancelled);

  if (available.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-[var(--muted-warm)]">No available events to add.</p>
        <button onClick={onCancel} className="text-xs text-[var(--terra)] font-semibold mt-1">Close</button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 rounded-lg p-2" style={{ background: "var(--cream)", border: "1.5px dashed var(--warm-border)" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[var(--ink)]">Select an event</span>
        <button onClick={onCancel} className="text-xs text-[var(--muted-warm)]">Cancel</button>
      </div>
      {available.map((event) => (
        <button
          key={event.id}
          onClick={() => onSelect(event.id)}
          className="w-full flex items-center gap-2 rounded-lg p-2 text-left transition-colors"
          style={{ background: "var(--warm-white)" }}
          data-testid={`button-pick-event-${event.id}`}
        >
          <Calendar className="w-3.5 h-3.5 text-[var(--terra)] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--ink)] truncate">{event.title}</div>
            <div className="text-[10px] text-[var(--muted-warm)]">
              {new Date(event.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {event.locationText && ` · ${event.locationText}`}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

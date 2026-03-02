import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { CATEGORIES, CITIES } from "@shared/schema";
import type { Club } from "@shared/schema";
import { LogIn, Loader2, Type, AlignLeft, Tag, Repeat, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Create() {
  const [activeTab, setActiveTab] = useState<"club" | "event">("club");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display italic text-3xl font-bold text-foreground mb-6" data-testid="text-create-title">
          Create
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("club")}
            className={`rounded-full px-6 py-2 font-semibold transition-colors ${
              activeTab === "club"
                ? "bg-neon text-primary-foreground"
                : "glass-card text-muted-foreground"
            }`}
            data-testid="tab-new-club"
          >
            New Club
          </button>
          <button
            onClick={() => setActiveTab("event")}
            className={`rounded-full px-6 py-2 font-semibold transition-colors ${
              activeTab === "event"
                ? "bg-neon text-primary-foreground"
                : "glass-card text-muted-foreground"
            }`}
            data-testid="tab-new-event"
          >
            New Event
          </button>
        </div>

        {activeTab === "club" ? (
          isAuthenticated ? (
            <ClubForm />
          ) : (
            <SignInPrompt message="Sign in to create a club" />
          )
        ) : isAuthenticated ? (
          <EventForm />
        ) : (
          <SignInPrompt message="Sign in to create an event" />
        )}
      </div>
    </div>
  );
}

function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-xl p-8 text-center space-y-4">
      <LogIn className="w-10 h-10 text-neon mx-auto" />
      <p className="text-sm text-muted-foreground" data-testid="text-sign-in-prompt">{message}</p>
      <button
        onClick={() => { window.location.href = "/api/login"; }}
        className="bg-neon text-primary-foreground rounded-xl px-8 py-3 text-sm font-semibold"
        data-testid="button-sign-in-create"
      >
        Sign In
      </button>
    </div>
  );
}

function ClubForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [clubName, setClubName] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [category, setCategory] = useState("");
  const [schedule, setSchedule] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("Tirupati");
  const [shortDesc, setShortDesc] = useState("");

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
      toast({ title: "Club created successfully!" });
      navigate("/organizer");
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
    createMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          <Type className="w-3.5 h-3.5" />
          TRIBE NAME
        </label>
        <Input
          placeholder="e.g. Tirupati Trekking Club"
          className="glass-card rounded-xl"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          data-testid="input-club-name"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          <AlignLeft className="w-3.5 h-3.5" />
          DESCRIPTION
        </label>
        <textarea
          placeholder="What is this tribe about?"
          rows={4}
          className="w-full px-3 py-2 glass-card rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 resize-none"
          value={fullDesc}
          onChange={(e) => setFullDesc(e.target.value)}
          data-testid="input-full-desc"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            <Tag className="w-3.5 h-3.5" />
            CATEGORY
          </label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="glass-card rounded-xl" data-testid="select-category">
              <SelectValue placeholder="Select" />
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
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            <Repeat className="w-3.5 h-3.5" />
            FREQUENCY
          </label>
          <Input
            placeholder="Weekly"
            className="glass-card rounded-xl"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            data-testid="input-schedule"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          <Link className="w-3.5 h-3.5" />
          WHATSAPP LINK
        </label>
        <Input
          placeholder="https://chat.whatsapp.com/..."
          className="glass-card rounded-xl"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          data-testid="input-whatsapp"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          ORGANIZER NAME
        </label>
        <Input
          placeholder="Your name"
          className="glass-card rounded-xl"
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          data-testid="input-organizer-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            LOCATION
          </label>
          <Input
            placeholder="e.g. SV University"
            className="glass-card rounded-xl"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            data-testid="input-location"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            CITY
          </label>
          <Select onValueChange={setCity} value={city}>
            <SelectTrigger className="glass-card rounded-xl" data-testid="select-city">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          SHORT DESCRIPTION
        </label>
        <Input
          placeholder="One-liner about your club"
          className="glass-card rounded-xl"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          data-testid="input-short-desc"
        />
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-neon text-background rounded-xl py-4 font-bold text-lg transition-all disabled:opacity-60"
        data-testid="button-launch-club"
      >
        {createMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating...
          </span>
        ) : (
          "Launch Club"
        )}
      </button>
    </form>
  );
}

function EventForm() {
  const { toast } = useToast();

  const { data: myClub, isLoading: clubLoading } = useQuery<Club>({
    queryKey: ["/api/organizer/my-club"],
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [locationText, setLocationText] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/clubs/${myClub!.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          startsAt: new Date(dateTime).toISOString(),
          locationText,
          maxCapacity: parseInt(maxCapacity) || 50,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Failed to create event" }));
        throw new Error(data.message || "Failed to create event");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Event created successfully!" });
      setTitle("");
      setDescription("");
      setDateTime("");
      setLocationText("");
      setMaxCapacity("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast({ title: "Please enter an event title", variant: "destructive" });
      return;
    }
    if (!dateTime) {
      toast({ title: "Please select a date and time", variant: "destructive" });
      return;
    }
    createEventMutation.mutate();
  };

  if (clubLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-neon" />
      </div>
    );
  }

  if (!myClub) {
    return (
      <div className="glass-card rounded-xl p-8 text-center space-y-3">
        <p className="text-muted-foreground text-sm" data-testid="text-no-club">
          Create a club first to add events.
        </p>
        <button
          onClick={() => {
            const tabBtn = document.querySelector('[data-testid="tab-new-club"]') as HTMLButtonElement;
            tabBtn?.click();
          }}
          className="text-neon text-sm font-semibold"
          data-testid="button-switch-to-club"
        >
          Go to New Club
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          EVENT TITLE
        </label>
        <Input
          placeholder="Event title"
          className="glass-card rounded-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="input-event-title"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          DESCRIPTION
        </label>
        <textarea
          placeholder="Describe the event..."
          rows={4}
          className="w-full px-3 py-2 glass-card rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/30 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="input-event-description"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          DATE & TIME
        </label>
        <Input
          type="datetime-local"
          className="glass-card rounded-xl"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          data-testid="input-event-datetime"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          LOCATION
        </label>
        <Input
          placeholder="Event location"
          className="glass-card rounded-xl"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          data-testid="input-event-location"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          MAX CAPACITY
        </label>
        <Input
          type="number"
          placeholder="50"
          className="glass-card rounded-xl"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          data-testid="input-event-capacity"
        />
      </div>

      <button
        type="submit"
        disabled={createEventMutation.isPending}
        className="w-full bg-neon text-background rounded-xl py-4 font-bold text-lg transition-all disabled:opacity-60"
        data-testid="button-create-event"
      >
        {createEventMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating...
          </span>
        ) : (
          "Create Event"
        )}
      </button>
    </form>
  );
}
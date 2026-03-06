import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Share2, MapPin, Calendar, Users, ArrowRight, Star, MessageCircle, User, Settings, Plus, LayoutDashboard, Clock, Activity, LogOut, Clock3, CheckCircle2, XCircle, Sparkles, Camera, Megaphone, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Club, ClubFaq, ClubScheduleEntry, ClubMoment } from "@shared/schema";

interface ClubEvent {
  id: string;
  title: string;
  startsAt: string;
  locationText: string;
  maxCapacity: number;
  rsvpCount: number;
}

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: club, isLoading, error } = useQuery<Club>({
    queryKey: ["/api/clubs", id],
  });

  if (isLoading) {
    return <ClubDetailSkeleton />;
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="text-4xl mb-4">
            <User className="w-12 h-12 mx-auto text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2" data-testid="text-club-not-found">
            Club not found
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            This club may have been removed or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (club.isActive === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <h2 className="font-display text-xl font-bold text-foreground mb-2" data-testid="text-club-inactive">
            This club is currently inactive
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {club.name} has been temporarily deactivated. Check back later or explore other clubs.
          </p>
          <Button onClick={() => navigate("/explore")} data-testid="button-explore-clubs">
            Explore Other Clubs
          </Button>
        </Card>
      </div>
    );
  }

  return <ClubDetailContent club={club} />;
}

function handleShareClub(club: Club) {
  const url = `${window.location.origin}/club/${club.id}`;
  const text = `Check out ${club.name} on CultFam! ${url}`;

  if (navigator.share) {
    navigator.share({ title: club.name, text: `Check out ${club.name} on CultFam!`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
}

function ClubDetailContent({ club }: { club: Club }) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isOwner = !!(user && club.creatorUserId && user.id === club.creatorUserId);
  const joinFormRef = useRef<HTMLDivElement>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinName, setJoinName] = useState(user?.firstName || "");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinError, setJoinError] = useState("");
  const [activeTab, setActiveTab] = useState("meet-ups");

  const { data: activity } = useQuery<{ recentJoins: number; recentJoinNames: string[]; totalEvents: number; lastEventDate: string | null }>({
    queryKey: ["/api/clubs", club.id, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/activity`);
      if (!res.ok) return { recentJoins: 0, recentJoinNames: [], totalEvents: 0, lastEventDate: null };
      return res.json();
    },
  });

  const { data: ratingsData } = useQuery<{ average: number; count: number; userRating: { rating: number; review: string | null } | null; hasJoined: boolean }>({
    queryKey: ["/api/clubs", club.id, "ratings"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/ratings`, { credentials: "include" });
      if (!res.ok) return { average: 0, count: 0, userRating: null, hasJoined: false };
      return res.json();
    },
  });

  const { data: joinCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/clubs", club.id, "join-count"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/join-count`);
      if (!res.ok) return { count: 0 };
      return res.json();
    },
  });

  const { data: membersPreview = [] } = useQuery<{ name: string; profileImageUrl: string | null }[]>({
    queryKey: ["/api/clubs", club.id, "members-preview"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/members-preview`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: joinStatus } = useQuery<{ status: string | null; requestId: string | null }>({
    queryKey: ["/api/clubs", club.id, "join-status"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/join-status`, { credentials: "include" });
      if (!res.ok) return { status: null, requestId: null };
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/clubs/${club.id}/leave`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to leave");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "join-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/join-requests"] });
      setJoinSuccess(false);
    },
  });

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(ratingsData?.userRating?.rating || 0);
  const [reviewText, setReviewText] = useState(ratingsData?.userRating?.review || "");

  useEffect(() => {
    if (ratingsData?.userRating) {
      setSelectedRating(ratingsData.userRating.rating);
      setReviewText(ratingsData.userRating.review || "");
    }
  }, [ratingsData?.userRating]);

  const ratingMutation = useMutation({
    mutationFn: async (data: { rating: number; review?: string }) => {
      const res = await apiRequest("POST", `/api/clubs/${club.id}/ratings`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "ratings"] });
      setShowRatingForm(false);
    },
  });

  const activeCount = joinCountData?.count ?? Math.max(1, Math.round(club.memberCount * 0.25));
  const avgRating = ratingsData?.average ?? 0;
  const ratingCount = ratingsData?.count ?? 0;

  useEffect(() => {
    setJoinName(user?.firstName || "");
  }, [user]);

  useEffect(() => {
    if (showJoinForm && joinFormRef.current) {
      joinFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showJoinForm]);

  const joinMutation = useMutation({
    mutationFn: async (data: { clubId: string; clubName: string; name: string; phone: string }) => {
      const res = await apiRequest("POST", "/api/join", data);
      return res.json();
    },
    onSuccess: () => {
      setJoinSuccess(true);
      setShowJoinForm(false);
      setJoinName("");
      setJoinPhone("");
      setJoinError("");
      queryClient.invalidateQueries({ queryKey: ["/api/clubs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs-with-activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", club.id, "join-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/join-requests"] });
    },
    onError: async (err: any) => {
      try {
        const msg = err?.message || "Something went wrong. Please try again.";
        setJoinError(msg);
      } catch {
        setJoinError("Something went wrong. Please try again.");
      }
    },
  });

  const foundingSpotsLeft = (club.foundingTotal ?? 20) - (club.foundingTaken ?? 0);
  const foundingProgress = ((club.foundingTaken ?? 0) / (club.foundingTotal ?? 20)) * 100;
  const allFoundingTaken = foundingSpotsLeft <= 0;

  const handleJoinSubmit = () => {
    setJoinError("");
    if (!joinName || joinName.length < 2) {
      setJoinError("Name is required (minimum 2 characters)");
      return;
    }
    if (!joinPhone || joinPhone.replace(/\D/g, "").length < 10) {
      setJoinError("Phone is required (minimum 10 digits)");
      return;
    }
    joinMutation.mutate({
      clubId: club.id,
      clubName: club.name,
      name: joinName,
      phone: joinPhone,
    });
  };

  const tags: string[] = [];
  if (club.highlights && club.highlights.length > 0) {
    tags.push(...club.highlights);
  }
  if (club.vibe === "casual") {
    tags.push("Beginner-friendly");
  }
  if (club.city) {
    tags.push(club.city);
  }
  if (club.timeOfDay) {
    tags.push(club.timeOfDay.charAt(0).toUpperCase() + club.timeOfDay.slice(1));
  }

  const tabs = [
    { id: "meet-ups", label: "Meet-ups" },
    { id: "schedule", label: "Schedule" },
    { id: "moments", label: "Moments" },
    { id: "about", label: "About" },
    { id: "faqs", label: "FAQs" },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8D5B8] via-[#C4A882] to-[#A88860] flex items-center justify-center">
          <span className="text-[90px] select-none relative z-[2]" data-testid="text-club-emoji">{club.emoji}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--cream)]" style={{ top: '30%' }} />

        <button
          onClick={() => navigate("/explore")}
          className="absolute top-14 left-5 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
          style={{ border: '1px solid var(--warm-border)' }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--ink)]" />
        </button>

        <button
          onClick={() => handleShareClub(club)}
          className="absolute top-14 right-5 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
          style={{ border: '1px solid var(--warm-border)' }}
          data-testid="button-share-club"
        >
          <Share2 className="w-4 h-4 text-[var(--ink)]" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-[5]">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-md" style={{ background: 'var(--terra)' }} data-testid="badge-category">
              {club.category}
            </span>
            {club.schedule && (
              <span className="rounded-md px-2.5 py-1 text-[10px] font-medium text-[var(--ink3)]" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="badge-schedule">
                {club.schedule}
              </span>
            )}
          </div>
          <h1
            className="font-display text-4xl font-black text-[var(--ink)] leading-[0.95] tracking-tight"
            data-testid="text-club-name"
          >
            {club.name}
          </h1>
          {club.shortDesc && (
            <p className="font-display text-[13px] italic text-[var(--ink3)] mt-1.5" data-testid="text-club-tagline">
              {club.shortDesc}
            </p>
          )}
        </div>
      </div>

      <div className="mx-6 mt-3 rounded-2xl p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, var(--terra-pale), rgba(201,168,76,0.08))', border: '1.5px solid rgba(196,98,45,0.2)' }} data-testid="card-founding">
        <div>
          <div className="font-display text-[15px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[var(--terra)]" />
            Founding Member Spots
          </div>
          <div className="text-xs text-[var(--muted-warm)] mt-0.5">
            {allFoundingTaken ? "All founding spots taken" : "Join now \u00b7 Get founding badge forever"}
          </div>
        </div>
        <div className="font-mono text-[28px] text-[var(--terra)] tracking-wide leading-none">
          {allFoundingTaken ? "Full" : `${club.foundingTaken ?? 0}/${club.foundingTotal ?? 20}`}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-6 mt-3">
        <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
          <div className="font-mono text-[28px] leading-none tracking-wide text-[var(--terra)]" data-testid="text-member-count">
            {club.memberCount}
          </div>
          <div className="text-[10px] font-semibold text-[var(--muted-warm)] tracking-wider mt-0.5">Members</div>
        </div>
        <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
          <div className="font-mono text-[28px] leading-none tracking-wide text-[var(--ink)]" data-testid="text-active-count">
            {activeCount}
          </div>
          <div className="text-[10px] font-semibold text-[var(--muted-warm)] tracking-wider mt-0.5">Active</div>
        </div>
        <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
          <div className="font-mono text-[28px] leading-none tracking-wide text-[var(--gold)]" data-testid="text-avg-rating">
            {ratingCount > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <div className="text-[10px] font-semibold text-[var(--muted-warm)] tracking-wider mt-0.5">
            {ratingCount > 0 ? `${ratingCount} ${ratingCount === 1 ? "review" : "reviews"}` : "No ratings"}
          </div>
        </div>
      </div>

      {ratingCount > 0 && (
        <div className="mx-6 mt-3 rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="card-reviews-highlight">
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="font-mono text-[32px] leading-none tracking-wide text-[var(--gold)]" data-testid="text-avg-rating-highlight">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[var(--gold)] fill-[var(--gold)]" : "text-[var(--warm-border)]"}`} />
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-bold text-[var(--ink)]">Community Rating</div>
            <div className="text-xs text-[var(--muted-warm)] mt-0.5">
              Based on {ratingCount} {ratingCount === 1 ? "review" : "reviews"} from members
            </div>
          </div>
          <Heart className="w-5 h-5 text-[var(--terra)] shrink-0" />
        </div>
      )}

      {membersPreview.length > 0 && (
        <div className="px-6 mt-4" data-testid="section-members-preview">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="text-xs font-bold text-[var(--muted-warm)] uppercase tracking-wider">Members</h2>
            <Badge variant="secondary" className="text-[10px] no-default-active-elevate" data-testid="badge-total-members">
              {club.memberCount} total
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {membersPreview.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 w-16" data-testid={`member-preview-${i}`}>
                <Avatar className="w-11 h-11">
                  <AvatarImage src={member.profileImageUrl || undefined} alt={member.name} />
                  <AvatarFallback className="text-sm font-semibold" style={{ background: 'var(--terra-pale)', color: 'var(--terra)' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[var(--ink3)] text-center truncate w-full font-medium">{member.name.split(' ')[0]}</span>
              </div>
            ))}
            {club.memberCount > membersPreview.length && (
              <div className="flex flex-col items-center gap-1.5 w-16" data-testid="member-preview-more">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}>
                  <span className="text-xs font-bold text-[var(--muted-warm)]">+{club.memberCount - membersPreview.length}</span>
                </div>
                <span className="text-[10px] text-[var(--muted-warm)] text-center font-medium">more</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex mt-5 overflow-x-auto scrollbar-none" style={{ borderBottom: '1.5px solid var(--warm-border)', scrollbarWidth: 'none' }} data-testid="section-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-[var(--terra)]"
                : "text-[var(--muted-warm)]"
            }`}
            style={{
              borderBottom: activeTab === tab.id ? '2.5px solid var(--terra)' : '2.5px solid transparent',
              marginBottom: '-1.5px',
            }}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "meet-ups" && (
        <>
          {isOwner && (
            <div className="px-6 py-3" data-testid="section-organiser-controls">
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--warm-white)', border: '1.5px solid rgba(196,98,45,0.3)' }}>
                <h3 className="text-xs font-bold text-[var(--terra)] uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  Organiser Controls
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/organizer`)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--terra)] transition-colors"
                    style={{ background: 'var(--terra-pale)' }}
                    data-testid="button-view-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    View Dashboard
                  </button>
                  <button
                    onClick={() => navigate(`/create?tab=event&clubId=${club.id}`)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--terra)] transition-colors"
                    style={{ background: 'var(--terra-pale)' }}
                    data-testid="button-create-event-for-club"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </button>
                  <button
                    onClick={() => navigate(`/organizer`)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--terra)] transition-colors"
                    style={{ background: 'var(--terra-pale)' }}
                    data-testid="button-edit-club"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Club
                  </button>
                </div>
              </div>
            </div>
          )}

          <ClubEvents clubId={club.id} clubName={club.name} isAuthenticated={isAuthenticated} />

          {club.location && (
            <div className="px-6 pt-3.5 pb-1">
              <div className="font-mono text-[22px] text-[var(--ink)] tracking-wider leading-none" data-testid="text-venue-heading">
                Usually Meet At
              </div>
            </div>
          )}
          {club.location && (
            <div className="mx-6 mt-2 rounded-2xl p-3.5 flex items-center gap-3" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="card-venue">
              <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: 'linear-gradient(135deg, #E8D5B8, #C4A882)' }}>
                <MapPin className="w-6 h-6 text-[var(--ink3)]" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-[var(--ink)]">{club.location}</div>
                <div className="text-[11px] text-[var(--muted-warm)] leading-relaxed mt-0.5">
                  {club.schedule && <>{club.schedule}<br /></>}
                  {club.city}
                </div>
              </div>
            </div>
          )}

          {activity && (activity.recentJoins > 0 || activity.totalEvents > 0) && (
            <div className="px-6 py-4" data-testid="section-recent-activity">
              <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--warm-white)', border: '1.5px solid rgba(196,98,45,0.3)' }}>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">Recent Activity</h3>
                {activity.recentJoins > 0 && (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-recent-joins">
                    <Users className="w-4 h-4 text-[var(--terra)]" />
                    <span className="text-[var(--ink)]">
                      <span className="font-semibold text-[var(--terra)]">{activity.recentJoins}</span> new {activity.recentJoins === 1 ? "member" : "members"} this week
                    </span>
                  </div>
                )}
                {activity.totalEvents > 0 && (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-total-events">
                    <Calendar className="w-4 h-4 text-[var(--terra)]" />
                    <span className="text-[var(--ink)]">
                      <span className="font-semibold text-[var(--terra)]">{activity.totalEvents}</span> {activity.totalEvents === 1 ? "event" : "events"} hosted
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "about" && (
        <div className="px-6 py-4 space-y-4">
          {club.organizerName && (
            <div className="flex justify-between items-center gap-4" data-testid="section-leader">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--terra-pale)', border: '2px solid var(--terra)' }}>
                  <span className="text-[var(--terra)] font-bold text-lg">
                    {club.organizerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted-warm)] uppercase tracking-wider font-semibold">Leader</div>
                  <div className="font-display font-bold text-[var(--ink)]">{club.organizerName}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xs font-bold text-[var(--muted-warm)] uppercase tracking-wider mb-2">About</h2>
            <p className="text-sm text-[var(--muted-warm)] leading-relaxed" data-testid="text-club-description">
              {club.fullDesc}
            </p>
          </div>

          {tags.length > 0 && (
            <div data-testid="section-tags">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="rounded-full px-3 py-1.5 text-xs text-[var(--ink3)]" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid={`tag-${i}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap" data-testid="section-health">
            {club.healthLabel && (
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                club.healthStatus === "green" ? "text-[var(--green-accent)]" : club.healthStatus === "yellow" ? "text-chart-4" : "text-destructive"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  club.healthStatus === "green" ? "bg-[var(--green-accent)]" : club.healthStatus === "yellow" ? "bg-chart-4" : "bg-destructive"
                }`} />
                {club.healthLabel}
              </span>
            )}
            {club.activeSince && (
              <span className="text-xs text-[var(--muted-warm)]">Active since {club.activeSince}</span>
            )}
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <ScheduleTab clubId={club.id} fallbackSchedule={club.schedule} />
      )}

      {activeTab === "moments" && (
        <MomentsTab clubId={club.id} />
      )}

      {activeTab === "faqs" && (
        <FaqsTab clubId={club.id} />
      )}

      {isAuthenticated && ratingsData?.hasJoined && (
        <RatingSection
          clubId={club.id}
          showRatingForm={showRatingForm}
          setShowRatingForm={setShowRatingForm}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          reviewText={reviewText}
          setReviewText={setReviewText}
          ratingMutation={ratingMutation}
          userRating={ratingsData?.userRating || null}
        />
      )}

      {joinSuccess || joinStatus?.status === "pending" ? (
        <div className="px-6 py-6">
          <Card className="p-6 text-center space-y-3" data-testid="card-join-pending">
            <div className="text-4xl">
              <Clock3 className="w-10 h-10 mx-auto text-[var(--gold)]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--gold)]">Request Pending</h3>
            <p className="text-sm text-[var(--muted-warm)]">
              Your join request has been sent. The organizer will review and approve it soon.
            </p>
            {club.whatsappNumber && (
              <a
                href={`https://wa.me/${club.whatsappNumber}?text=${encodeURIComponent(`Hi! I just requested to join ${club.name} on CultFam. Please review my request!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white rounded-md px-5 py-3 text-sm font-semibold transition-all"
                style={{ background: "var(--green-accent)", borderColor: "var(--green-accent)" }}
                data-testid="button-message-organizer"
              >
                <MessageCircle className="w-4 h-4" />
                Message Organizer on WhatsApp
              </a>
            )}
          </Card>
        </div>
      ) : joinStatus?.status === "approved" ? (
        <div className="px-6 py-6">
          <Card className="p-6 text-center space-y-3" data-testid="card-member-status">
            <div className="text-4xl">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[var(--green-accent)]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--green-accent)]">You're a Member!</h3>
            <p className="text-sm text-[var(--muted-warm)]">
              You're part of {club.name}. Check out upcoming events and join the community!
            </p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to leave this club?")) {
                  leaveMutation.mutate();
                }
              }}
              disabled={leaveMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-destructive transition-all"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              data-testid="button-leave-club"
            >
              <LogOut className="w-3.5 h-3.5" />
              {leaveMutation.isPending ? "Leaving..." : "Leave Club"}
            </button>
          </Card>
        </div>
      ) : joinStatus?.status === "rejected" ? (
        <div className="px-6 py-6">
          <Card className="p-6 text-center space-y-3" data-testid="card-join-rejected">
            <div className="text-4xl">
              <XCircle className="w-10 h-10 mx-auto text-destructive" />
            </div>
            <h3 className="font-display text-xl font-bold text-destructive">Request Not Approved</h3>
            <p className="text-sm text-[var(--muted-warm)]">
              Your previous join request was not approved. You can submit a new request.
            </p>
            <button
              onClick={() => setShowJoinForm(true)}
              className="rounded-xl px-6 py-3 font-display font-bold text-sm text-white"
              style={{ background: 'var(--ink)' }}
              data-testid="button-rejoin"
            >
              Request Again
            </button>
          </Card>
        </div>
      ) : showJoinForm ? (
        <div ref={joinFormRef} className="px-6 py-6">
          <Card className="p-6 space-y-3" data-testid="form-join">
            <h3 className="font-display text-lg font-bold text-[var(--ink)] mb-1">Join {club.name}</h3>
            <p className="text-xs text-[var(--muted-warm)] mb-1">Your phone number is shared with the organizer so they can add you to the WhatsApp group.</p>
            <input
              type="text"
              placeholder="Your Name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 placeholder:text-[var(--muted-warm)]"
              style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
              data-testid="input-join-name"
            />
            <input
              type="tel"
              placeholder="Phone Number (for WhatsApp group)"
              value={joinPhone}
              onChange={(e) => setJoinPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 placeholder:text-[var(--muted-warm)]"
              style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
              data-testid="input-join-phone"
            />
            {joinError && (
              <p className="text-xs text-destructive font-medium" data-testid="text-join-error">{joinError}</p>
            )}
            <button
              onClick={handleJoinSubmit}
              disabled={joinMutation.isPending}
              className="w-full text-white rounded-xl py-4 font-display font-bold text-lg disabled:opacity-50"
              style={{ background: 'var(--ink)', boxShadow: 'var(--warm-shadow)' }}
              data-testid="button-send-join"
            >
              {joinMutation.isPending ? "Sending..." : "Send Join Request"}
            </button>
          </Card>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-3.5 flex items-center gap-3" style={{ background: 'var(--cream)', borderTop: '1.5px solid var(--warm-border)' }} data-testid="sticky-join-cta">
          {!isAuthenticated ? (
            <a
              href="/api/login"
              className="block w-full text-center rounded-2xl py-4 font-display font-bold italic text-lg tracking-tight transition-all"
              style={{ background: 'var(--ink)', color: 'var(--cream)' }}
              data-testid="button-signin-to-join"
            >
              Sign In to Join
            </a>
          ) : (
            <>
              <div className="flex-1">
                <div className="font-mono text-[32px] leading-none tracking-wide text-[var(--terra)]">FREE</div>
                <div className="text-[10px] font-semibold text-[var(--muted-warm)] tracking-wider">FOUNDING MEMBER</div>
              </div>
              <button
                onClick={() => setShowJoinForm(true)}
                className="flex-[2] rounded-2xl py-4 font-display font-bold italic text-base tracking-tight flex items-center justify-center gap-2 transition-all"
                style={{ background: 'var(--ink)', color: 'var(--cream)' }}
                data-testid="button-join"
              >
                Join the Tribe <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ClubEvents({ clubId, clubName, isAuthenticated }: { clubId: string; clubName: string; isAuthenticated: boolean }) {
  const [, navigate] = useLocation();
  const [justRsvpdId, setJustRsvpdId] = useState<string | null>(null);

  const { data: events = [] } = useQuery<ClubEvent[]>({
    queryKey: ["/api/clubs", clubId, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/events`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clubs", clubId, "events"] });
      setJustRsvpdId(eventId);
    },
  });

  const upcomingEvents = events.filter((e) => new Date(e.startsAt) > new Date());

  return (
    <div className="px-6 py-4" data-testid="section-club-events">
      <h2 className="text-xs font-bold text-[var(--muted-warm)] uppercase tracking-wider mb-3">Upcoming Events</h2>
      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-[var(--muted-warm)]">No upcoming events</p>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.slice(0, 5).map((event) => {
            const d = new Date(event.startsAt);
            const month = d.toLocaleDateString("en-IN", { month: "short" });
            const day = d.getDate();
            return (
              <div
                key={event.id}
                className="rounded-xl overflow-hidden cursor-pointer hover-elevate"
                style={{ background: 'var(--ink)', borderRadius: '20px' }}
                onClick={() => navigate(`/event/${event.id}`)}
                data-testid={`club-event-${event.id}`}
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="rounded-lg p-2 flex flex-col items-center justify-center shrink-0 min-w-[3rem]" style={{ background: 'var(--terra-pale)' }}>
                    <span className="text-xs text-[var(--terra-light)] font-medium">{month}</span>
                    <span className="font-bold text-[var(--cream)] text-lg leading-tight">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-[var(--cream)] text-sm truncate">{event.title}</div>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-warm2)] mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{event.locationText}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--terra-light)] shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RatingSection({
  clubId,
  showRatingForm,
  setShowRatingForm,
  selectedRating,
  setSelectedRating,
  reviewText,
  setReviewText,
  ratingMutation,
  userRating,
}: {
  clubId: string;
  showRatingForm: boolean;
  setShowRatingForm: (v: boolean) => void;
  selectedRating: number;
  setSelectedRating: (v: number) => void;
  reviewText: string;
  setReviewText: (v: string) => void;
  ratingMutation: any;
  userRating: { rating: number; review: string | null } | null;
}) {
  if (!showRatingForm && !userRating) {
    return (
      <div className="px-6 py-3">
        <button
          onClick={() => setShowRatingForm(true)}
          className="w-full rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--terra)] transition-colors"
          style={{ background: 'var(--terra-pale)', border: '1.5px solid rgba(196,98,45,0.2)' }}
          data-testid="button-rate-club"
        >
          <Star className="w-4 h-4" />
          Rate this club
        </button>
      </div>
    );
  }

  if (userRating && !showRatingForm) {
    return (
      <div className="px-6 py-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="card-user-rating">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[var(--muted-warm)] mr-1">Your rating:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= userRating.rating ? "text-[var(--gold)] fill-[var(--gold)]" : "text-[var(--warm-border)]"}`} />
              ))}
            </div>
            <button
              onClick={() => setShowRatingForm(true)}
              className="text-xs font-semibold text-[var(--terra)]"
              data-testid="button-edit-rating"
            >
              Edit
            </button>
          </div>
          {userRating.review && (
            <p className="text-xs text-[var(--muted-warm)] mt-1.5">{userRating.review}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-3">
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }} data-testid="form-rating">
        <h3 className="text-sm font-bold text-[var(--ink)]">Rate this club</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedRating(s)}
              className="p-1"
              data-testid={`button-star-${s}`}
            >
              <Star className={`w-7 h-7 transition-colors ${s <= selectedRating ? "text-[var(--gold)] fill-[var(--gold)]" : "text-[var(--warm-border)]"}`} />
            </button>
          ))}
        </div>
        <textarea
          placeholder="Write a short review (optional)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 placeholder:text-[var(--muted-warm)] resize-none"
          style={{ background: 'var(--cream)', border: '1.5px solid var(--warm-border)' }}
          data-testid="input-review"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (selectedRating > 0) {
                ratingMutation.mutate({ rating: selectedRating, review: reviewText || undefined });
              }
            }}
            disabled={selectedRating === 0 || ratingMutation.isPending}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--terra)' }}
            data-testid="button-submit-rating"
          >
            {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
          </button>
          <button
            onClick={() => setShowRatingForm(false)}
            className="px-4 rounded-lg py-2.5 text-sm font-semibold text-[var(--muted-warm)]"
            style={{ background: 'var(--cream)' }}
            data-testid="button-cancel-rating"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ clubId, fallbackSchedule }: { clubId: string; fallbackSchedule: string }) {
  const { data: entries = [], isLoading } = useQuery<ClubScheduleEntry[]>({
    queryKey: ["/api/clubs", clubId, "schedule"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/schedule`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="px-6 py-4 space-y-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="px-6 py-6 text-center">
        <Clock className="w-8 h-8 mx-auto text-[var(--muted-warm2)] mb-2" />
        <p className="text-sm font-semibold text-[var(--ink3)] mb-1">Schedule coming soon</p>
        {fallbackSchedule && (
          <p className="text-xs text-[var(--muted-warm)]">{fallbackSchedule}</p>
        )}
      </div>
    );
  }

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sorted = [...entries].sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

  return (
    <div className="px-6 py-4 space-y-2" data-testid="section-schedule">
      <h2 className="text-xs font-bold text-[var(--muted-warm)] uppercase tracking-wider mb-3">Weekly Schedule</h2>
      {sorted.map((entry) => (
        <div
          key={entry.id}
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
          data-testid={`schedule-entry-${entry.id}`}
        >
          <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ background: 'var(--terra-pale)' }}>
            <span className="text-[10px] font-bold text-[var(--terra)] uppercase">{entry.dayOfWeek.slice(0, 3)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-bold text-[var(--ink)]">{entry.activity}</div>
            <div className="flex items-center gap-1 text-xs text-[var(--muted-warm)] mt-0.5">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{entry.startTime}{entry.endTime ? ` – ${entry.endTime}` : ""}</span>
            </div>
            {entry.location && (
              <div className="flex items-center gap-1 text-xs text-[var(--muted-warm)] mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{entry.location}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getMomentIcon(caption: string) {
  const lower = caption.toLowerCase();
  if (lower.includes("photo") || lower.includes("pic") || lower.includes("snap")) return Camera;
  if (lower.includes("event") || lower.includes("meet") || lower.includes("session")) return Calendar;
  if (lower.includes("member") || lower.includes("join") || lower.includes("welcome")) return Users;
  if (lower.includes("announce") || lower.includes("update") || lower.includes("news")) return Megaphone;
  if (lower.includes("achieve") || lower.includes("milestone") || lower.includes("record")) return Sparkles;
  return Activity;
}

function MomentsTab({ clubId }: { clubId: string }) {
  const { data: moments = [], isLoading } = useQuery<ClubMoment[]>({
    queryKey: ["/api/clubs", clubId, "moments"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/moments`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="px-6 py-4 space-y-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="px-6 py-6 text-center">
        <Activity className="w-8 h-8 mx-auto text-[var(--muted-warm2)] mb-2" />
        <p className="text-sm font-semibold text-[var(--ink3)]">No moments yet</p>
        <p className="text-xs text-[var(--muted-warm)] mt-1">Highlights and updates will appear here</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-3" data-testid="section-moments">
      <h2 className="text-xs font-bold text-[var(--muted-warm)] uppercase tracking-wider mb-3">Recent Moments</h2>
      {moments.map((moment) => {
        const timeAgo = getRelativeTime(moment.createdAt);
        const MomentIcon = getMomentIcon(moment.caption);
        return (
          <div
            key={moment.id}
            className="rounded-xl p-3.5 flex items-start gap-3"
            style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
            data-testid={`moment-${moment.id}`}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--terra-pale)' }}>
              {moment.emoji ? (
                <span className="text-xl">{moment.emoji}</span>
              ) : (
                <MomentIcon className="w-5 h-5 text-[var(--terra)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--ink)] leading-relaxed">{moment.caption}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock className="w-3 h-3 text-[var(--muted-warm)]" />
                <span className="text-[10px] text-[var(--muted-warm)] font-medium">{timeAgo}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FaqsTab({ clubId }: { clubId: string }) {
  const { data: faqs = [], isLoading } = useQuery<ClubFaq[]>({
    queryKey: ["/api/clubs", clubId, "faqs"],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}/faqs`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="px-6 py-4 space-y-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="px-6 py-6 text-center">
        <MessageCircle className="w-8 h-8 mx-auto text-[var(--muted-warm2)] mb-2" />
        <p className="text-sm font-semibold text-[var(--ink3)]">No FAQs yet</p>
        <p className="text-xs text-[var(--muted-warm)] mt-1">Frequently asked questions will appear here</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4" data-testid="section-faqs">
      <h2 className="text-xs font-bold text-[var(--muted-warm)] uppercase tracking-wider mb-3">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="rounded-xl overflow-visible"
            style={{ background: 'var(--warm-white)', border: '1.5px solid var(--warm-border)' }}
            data-testid={`faq-${faq.id}`}
          >
            <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-[var(--ink)] text-left [&[data-state=open]>svg]:rotate-180">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3 text-sm text-[var(--muted-warm)] leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function getRelativeTime(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function ClubDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="h-72 w-full bg-gradient-to-b from-[#E8D5B8] to-background flex items-center justify-center">
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 px-6 mt-4">
        <Skeleton className="h-20 rounded-[14px]" />
        <Skeleton className="h-20 rounded-[14px]" />
        <Skeleton className="h-20 rounded-[14px]" />
      </div>
      <div className="px-6 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="w-16 h-3 mb-1" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 space-y-2">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      <div className="px-6 py-2 flex gap-2 flex-wrap">
        <Skeleton className="w-20 h-7 rounded-full" />
        <Skeleton className="w-16 h-7 rounded-full" />
        <Skeleton className="w-24 h-7 rounded-full" />
      </div>
    </div>
  );
}

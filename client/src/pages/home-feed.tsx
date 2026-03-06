import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Heart, Share2, Plus, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Club, Event, ClubMoment } from "@shared/schema";
import { Link, useLocation } from "wouter";

interface EventWithClub extends Event {
  clubName?: string;
  clubEmoji?: string;
  rsvpCount?: number;
}

interface FeedMoment extends ClubMoment {
  clubName: string;
  clubEmoji: string;
  clubLocation: string;
}


function CircularProgress({ percent }: { percent: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="var(--terra)"
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-white font-bold text-lg leading-none">{percent}%</span>
        <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: "var(--muted-warm2)" }}>GOAL</span>
      </div>
    </div>
  );
}

function ClubAvatar({ emoji, color, size = 52 }: { emoji: string; color?: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        background: color || "var(--ink2)",
        border: "2.5px solid var(--terra)",
        fontSize: size * 0.45,
      }}
    >
      {emoji}
    </div>
  );
}

export default function HomeFeed() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: userClubs = [] } = useQuery<Club[]>({
    queryKey: ["/api/user/clubs"],
    enabled: !!user,
  });

  const { data: allClubs = [] } = useQuery<(Club & { recentJoins?: number })[]>({
    queryKey: ["/api/clubs-with-activity"],
  });

  const { data: events = [] } = useQuery<EventWithClub[]>({
    queryKey: ["/api/events"],
  });

  const { data: myEvents = [] } = useQuery<EventWithClub[]>({
    queryKey: ["/api/user/events"],
    enabled: !!user,
  });

  const { data: feedMoments = [] } = useQuery<FeedMoment[]>({
    queryKey: ["/api/feed"],
  });

  const unreadCount = unreadData?.count ?? 0;

  const upcomingEvent = events
    .filter(e => !e.isCancelled && new Date(e.startsAt) > new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const happeningSoon = myEvents
    .filter(e => !e.isCancelled && new Date(e.startsAt) > now && new Date(e.startsAt) <= in48h)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const discoverClubs = allClubs.filter(c => !userClubs.some(uc => uc.id === c.id)).slice(0, 6);

  const displayName = user?.firstName || user?.email?.split("@")[0] || "there";
  const initials = displayName.charAt(0).toUpperCase();

  function toggleLike(id: string) {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--cream)" }}>

      {/* Sticky Header */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(245,240,232,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--warm-border)",
        }}
        data-testid="header-home"
      >
        <div className="flex items-center gap-3">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              style={{ border: "2px solid var(--terra)" }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: "var(--terra)" }}
            >
              {initials}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-[11px] font-medium" style={{ color: "var(--muted-warm)" }}>Welcome back,</p>
            <p className="font-display font-bold text-[16px]" style={{ color: "var(--ink)" }} data-testid="text-user-name">
              {displayName}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" style={{ color: "var(--ink)" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white font-bold px-1"
              style={{ fontSize: "9px", background: "var(--terra)" }}
              data-testid="badge-notification-count"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-6">

        {/* Happening Soon Reminder */}
        {user && happeningSoon.length > 0 && (
          <div data-testid="section-happening-soon">
            {happeningSoon.map(event => {
              const eventDate = new Date(event.startsAt);
              const isToday = eventDate.toDateString() === now.toDateString();
              const diffHrs = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="flex items-center gap-4 rounded-2xl p-4 no-underline transition-all active:scale-[0.98]"
                  style={{ background: 'var(--terra)', border: '1.5px solid rgba(255,255,255,0.15)' }}
                  data-testid={`card-happening-soon-${event.id}`}
                >
                  <div className="rounded-xl px-3 py-2 text-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <p className="text-[9px] font-bold uppercase text-white/80 leading-none mb-0.5">
                      {format(eventDate, "MMM")}
                    </p>
                    <p className="text-xl font-black text-white leading-none">{format(eventDate, "d")}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-0.5">
                      {isToday ? "TODAY" : "TOMORROW"} · {diffHrs > 0 ? `in ${diffHrs}h` : "very soon"}
                    </p>
                    <p className="font-display font-bold text-white text-[16px] leading-tight truncate" data-testid={`text-soon-event-${event.id}`}>
                      {event.title}
                    </p>
                    {event.clubName && (
                      <p className="text-[11px] text-white/70 mt-0.5">{event.clubEmoji} {event.clubName}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Streak / Welcome Card */}
        {userClubs.length > 0 ? (
          <div
            className="rounded-[20px] p-5 flex items-center gap-4"
            style={{ background: "var(--ink)" }}
            data-testid="card-streak"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: "var(--terra)" }}>
                  ⚡ Keep Showing Up
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-1 leading-tight">
                Stay Consistent!
              </h2>
              <p className="text-[12px] mb-4" style={{ color: "var(--muted-warm2)" }}>
                Check your upcoming events and keep the momentum going.
              </p>
              <Link
                href="/events"
                className="inline-block rounded-full px-4 py-2 text-[12px] font-bold text-white"
                style={{ background: "var(--terra)" }}
                data-testid="button-view-events"
              >
                View Events
              </Link>
            </div>
            <CircularProgress percent={userClubs.length * 20 > 100 ? 100 : userClubs.length * 20} />
          </div>
        ) : (
          <div
            className="rounded-[20px] p-5"
            style={{ background: "var(--ink)" }}
            data-testid="card-welcome"
          >
            <span className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: "var(--terra)" }}>
              🎉 Welcome to CultFam
            </span>
            <h2 className="font-display font-bold text-2xl text-white mt-1 mb-1 leading-tight">
              Find Your Tribe
            </h2>
            <p className="text-[12px] mb-4" style={{ color: "var(--muted-warm2)" }}>
              Discover hobby clubs in Tirupati and start showing up.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/explore"
                className="inline-block rounded-full px-4 py-2 text-[12px] font-bold text-white"
                style={{ background: "var(--terra)" }}
                data-testid="button-explore-clubs"
              >
                Explore Clubs
              </Link>
              {user && !user.quizCompleted && (
                <Link
                  href="/onboarding"
                  className="inline-block rounded-full px-4 py-2 text-[12px] font-bold"
                  style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
                  data-testid="button-take-quiz"
                >
                  Take Quiz →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* My Clubs */}
        <div data-testid="section-my-clubs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-xl" style={{ color: "var(--ink)" }}>My Clubs</h2>
            <Link
              href="/explore"
              className="flex items-center gap-1 text-[12px] font-bold"
              style={{ color: "var(--terra)" }}
              data-testid="link-view-all-clubs"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {userClubs.length === 0 && !user ? (
              <p className="text-sm" style={{ color: "var(--muted-warm)" }}>Sign in to see your clubs</p>
            ) : userClubs.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted-warm)" }}>Join clubs to see them here</p>
            ) : (
              userClubs.map(club => (
                <button
                  key={club.id}
                  onClick={() => navigate(`/club/${club.id}`)}
                  className="flex flex-col items-center gap-2 shrink-0"
                  style={{ minWidth: 64 }}
                  data-testid={`club-avatar-${club.id}`}
                >
                  <ClubAvatar emoji={club.emoji} color={club.bgColor || undefined} size={56} />
                  <span className="text-[11px] font-semibold text-center leading-tight max-w-[60px] truncate" style={{ color: "var(--ink)" }}>
                    {club.name.split(" ")[0]}
                  </span>
                </button>
              ))
            )}
            <button
              onClick={() => navigate("/explore")}
              className="flex flex-col items-center gap-2 shrink-0"
              style={{ minWidth: 56 }}
              data-testid="button-discover-clubs"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "var(--warm-white)", border: "2px dashed var(--warm-border)" }}
              >
                <Plus className="w-5 h-5" style={{ color: "var(--muted-warm)" }} />
              </div>
              <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: "var(--muted-warm)" }}>
                Discover
              </span>
            </button>
          </div>
        </div>

        {/* Upcoming Event Card */}
        {upcomingEvent ? (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: "var(--ink)" }}
            data-testid={`card-event-${upcomingEvent.id}`}
          >
            <div className="p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2" style={{ color: "var(--terra-light)" }}>
                Happening Tomorrow
              </p>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display font-bold text-[20px] text-white leading-tight flex-1">
                  {upcomingEvent.title}
                </h3>
                <div
                  className="rounded-[10px] px-3 py-2 text-center shrink-0"
                  style={{ background: "var(--terra)", minWidth: 52 }}
                >
                  <p className="text-[10px] font-bold uppercase text-white leading-none mb-0.5">
                    {format(new Date(upcomingEvent.startsAt), "MMM")}
                  </p>
                  <p className="text-2xl font-black text-white leading-none">
                    {format(new Date(upcomingEvent.startsAt), "d")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-warm2)" }}>
                    {upcomingEvent.rsvpCount ?? 0} going
                  </span>
                </div>
                <Link
                  href={`/event/${upcomingEvent.id}`}
                  className="rounded-full px-4 py-2 text-[12px] font-bold"
                  style={{ background: "var(--warm-white)", color: "var(--ink)" }}
                  data-testid="button-register-event"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-[20px] p-5 flex items-center gap-4"
            style={{ background: "var(--ink)" }}
          >
            <div>
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: "var(--terra-light)" }}>
                No upcoming events
              </p>
              <p className="text-white text-sm">Check back soon for new events!</p>
              <Link
                href="/events"
                className="inline-block mt-3 rounded-full px-4 py-2 text-[12px] font-bold text-white"
                style={{ background: "var(--terra)" }}
              >
                Browse Events
              </Link>
            </div>
          </div>
        )}

        {/* Community Feed */}
        {feedMoments.length > 0 && (
          <div data-testid="section-feed">
            {feedMoments.map((moment) => (
              <div
                key={moment.id}
                className="rounded-[20px] overflow-hidden mb-4"
                style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
                data-testid={`post-${moment.id}`}
              >
                <div className="flex items-center gap-3 p-4 pb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                    style={{ background: "var(--ink2)" }}
                  >
                    {moment.clubEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] leading-tight truncate" style={{ color: "var(--ink)" }}>
                      {moment.clubName}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--muted-warm)" }}>
                      {moment.createdAt
                        ? `${formatDistanceToNow(new Date(moment.createdAt))} ago`
                        : "Recently"
                      }
                      {moment.clubLocation ? ` · ${moment.clubLocation}` : ""}
                    </p>
                  </div>
                </div>

                {moment.imageUrl ? (
                  <div className="mx-4 rounded-[12px] overflow-hidden mb-3">
                    <img
                      src={moment.imageUrl}
                      alt={moment.caption}
                      className="w-full object-cover"
                      style={{ maxHeight: 240 }}
                    />
                  </div>
                ) : moment.emoji ? (
                  <div className="mx-4 mb-3 flex items-center gap-2 px-1">
                    <span className="text-2xl">{moment.emoji}</span>
                  </div>
                ) : null}

                <div className="px-4 pb-3">
                  <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--ink)" }}>
                    {moment.caption}
                  </p>
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => toggleLike(moment.id)}
                      className="flex items-center gap-1.5 transition-transform active:scale-90"
                      data-testid={`button-like-${moment.id}`}
                    >
                      <Heart
                        className="w-5 h-5"
                        style={{
                          color: likedPosts.has(moment.id) ? "#e53e3e" : "var(--muted-warm)",
                          fill: likedPosts.has(moment.id) ? "#e53e3e" : "transparent",
                        }}
                      />
                    </button>
                    <button className="flex items-center gap-1.5 ml-auto" data-testid={`button-share-${moment.id}`}>
                      <Share2 className="w-5 h-5" style={{ color: "var(--muted-warm)" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discover New Clubs */}
        {discoverClubs.length > 0 && (
          <div data-testid="section-discover">
            <h2 className="font-display font-bold text-xl mb-3" style={{ color: "var(--ink)" }}>
              Discover New Clubs
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {discoverClubs.map(club => (
                <div
                  key={club.id}
                  className="rounded-[16px] p-4"
                  style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)" }}
                  data-testid={`card-discover-${club.id}`}
                >
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl mb-3"
                    style={{ background: club.bgColor || "var(--ink2)" }}
                  >
                    {club.emoji}
                  </div>
                  <p className="font-bold text-[14px] leading-tight mb-0.5" style={{ color: "var(--ink)" }}>
                    {club.name}
                  </p>
                  <p className="text-[11px] mb-3" style={{ color: "var(--muted-warm)" }}>
                    {club.memberCount >= 1000
                      ? `${(club.memberCount / 1000).toFixed(1)}k Members`
                      : `${club.memberCount} Members`}
                  </p>
                  <Link
                    href={`/club/${club.id}`}
                    className="block w-full text-center rounded-full py-1.5 text-[12px] font-bold"
                    style={{ background: "var(--terra-pale)", color: "var(--terra)" }}
                    data-testid={`button-join-${club.id}`}
                  >
                    Join Club
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

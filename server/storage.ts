import {
  type Club, type InsertClub,
  type JoinRequest, type InsertJoinRequest, type User,
  type QuizAnswers, type InsertQuizAnswers, type Event, type InsertEvent,
  type EventRsvp, type InsertEventRsvp,
  type ClubRating, type ClubFaq, type ClubScheduleEntry, type ClubMoment,
  type MomentComment,
  type EventComment,
  type Notification, type InsertNotification,
  type ClubAnnouncement, type InsertClubAnnouncement,
  type ClubPoll, type InsertClubPoll,
  type PollVote,
  type Kudo,
  type ClubPageSection, type InsertClubPageSection,
  type SectionEvent,
  type ClubProposal, type InsertClubProposal,
  clubs, joinRequests, users, userQuizAnswers, events, eventRsvps,
  clubRatings, clubFaqs, clubScheduleEntries, clubMoments, momentComments, notifications,
  clubAnnouncements, clubPolls, pollVotes, momentLikes, eventComments, kudos,
  clubPageSections, sectionEvents, clubProposals,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, asc, and, gte, ilike, or, ne, arrayOverlaps } from "drizzle-orm";

export interface IStorage {
  getClubs(): Promise<Club[]>;
  getClubsByCategory(category: string): Promise<Club[]>;
  getClub(id: string): Promise<Club | undefined>;
  createClub(club: InsertClub): Promise<Club>;
  updateClub(id: string, data: Partial<InsertClub>): Promise<Club | undefined>;
  incrementMemberCount(clubId: string): Promise<Club | undefined>;
  decrementMemberCount(clubId: string): Promise<Club | undefined>;
  createJoinRequest(request: InsertJoinRequest): Promise<JoinRequest>;
  getJoinRequests(): Promise<JoinRequest[]>;
  getJoinRequestsByClub(clubId: string): Promise<JoinRequest[]>;
  getJoinRequestsByPhone(phone: string): Promise<JoinRequest[]>;
  getJoinRequestsByUser(userId: string): Promise<JoinRequest[]>;
  getJoinRequest(id: string): Promise<JoinRequest | undefined>;
  markJoinRequestDone(id: string): Promise<JoinRequest | undefined>;
  approveJoinRequest(id: string): Promise<JoinRequest | undefined>;
  rejectJoinRequest(id: string): Promise<JoinRequest | undefined>;
  deleteJoinRequest(id: string): Promise<void>;
  leaveClub(clubId: string, userId: string): Promise<void>;
  getPendingJoinRequestCount(clubId: string): Promise<number>;
  getApprovedMembersByClub(clubId: string): Promise<JoinRequest[]>;
  hasExistingJoinRequest(clubId: string, userId: string): Promise<JoinRequest | undefined>;
  getClubsByCreator(creatorUserId: string): Promise<Club[]>;
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  saveQuizAnswers(answers: InsertQuizAnswers): Promise<QuizAnswers>;
  getQuizAnswers(userId: string): Promise<QuizAnswers | undefined>;
  searchClubs(params: { search?: string; category?: string; city?: string; vibe?: string; timeOfDay?: string }): Promise<Club[]>;
  getUserAttendanceStats(userId: string): Promise<{ clubId: string; clubName: string; clubEmoji: string; totalRsvps: number; attended: number }[]>;
  getMemberDirectory(clubId: string): Promise<{ userId: string | null; name: string; profileImageUrl: string | null; joinedAt: Date | null }[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByClub(clubId: string): Promise<Event[]>;
  getUpcomingEvents(city?: string, limit?: number): Promise<(Event & { clubName: string; clubEmoji: string; rsvpCount: number })[]>;
  extendEventSeries(clubId: string, title: string, recurrenceRule: string): Promise<Event[]>;
  createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  cancelRsvp(eventId: string, userId: string): Promise<void>;
  getRsvpsByEvent(eventId: string): Promise<(EventRsvp & { userName: string | null })[]>;
  getUserRsvp(eventId: string, userId: string): Promise<EventRsvp | undefined>;
  getRsvpCount(eventId: string): Promise<number>;
  getRsvpsByUser(userId: string): Promise<(EventRsvp & { eventTitle: string; eventStartsAt: Date; eventLocation: string; clubName: string; clubEmoji: string })[]>;
  getStats(): Promise<{ totalMembers: number; totalClubs: number; upcomingEvents: number }>;
  getCheckedInCount(eventId: string): Promise<number>;
  getEventAttendees(eventId: string): Promise<(EventRsvp & { userName: string | null; checkedIn: boolean | null; checkedInAt: Date | null })[]>;
  getClubActivity(clubId: string): Promise<{ recentJoins: number; recentJoinNames: string[]; totalEvents: number; lastEventDate: Date | null }>;
  getRecentActivityFeed(limit?: number): Promise<{ name: string; clubName: string; clubEmoji: string; createdAt: Date | null }[]>;
  getClubsWithRecentJoins(): Promise<Record<string, number>>;
  getRsvpById(rsvpId: string): Promise<EventRsvp | undefined>;
  getRsvpByToken(token: string): Promise<(EventRsvp & { userName: string | null }) | undefined>;
  checkInRsvpByToken(token: string): Promise<EventRsvp | undefined>;
  checkInRsvpById(rsvpId: string): Promise<EventRsvp | undefined>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  getClubRatings(clubId: string): Promise<ClubRating[]>;
  getClubAverageRating(clubId: string): Promise<{ average: number; count: number }>;
  getUserRating(clubId: string, userId: string): Promise<ClubRating | undefined>;
  upsertRating(clubId: string, userId: string, rating: number, review?: string): Promise<ClubRating>;
  getClubFaqs(clubId: string): Promise<ClubFaq[]>;
  createFaq(clubId: string, question: string, answer: string): Promise<ClubFaq>;
  updateFaq(id: string, question: string, answer: string): Promise<ClubFaq | undefined>;
  deleteFaq(id: string): Promise<void>;
  getClubSchedule(clubId: string): Promise<ClubScheduleEntry[]>;
  createScheduleEntry(clubId: string, data: { dayOfWeek: string; startTime: string; endTime?: string; activity: string; location?: string }): Promise<ClubScheduleEntry>;
  updateScheduleEntry(id: string, data: { dayOfWeek?: string; startTime?: string; endTime?: string; activity?: string; location?: string }): Promise<ClubScheduleEntry | undefined>;
  deleteScheduleEntry(id: string): Promise<void>;
  getClubMoments(clubId: string): Promise<(ClubMoment & { commentCount: number })[]>;
  createMoment(clubId: string, caption: string, emoji?: string, imageUrl?: string, authorUserId?: string, authorName?: string): Promise<ClubMoment>;
  updateMoment(id: string, data: { caption?: string; emoji?: string }): Promise<ClubMoment | undefined>;
  deleteMoment(id: string): Promise<void>;
  getCommentsByMoment(momentId: string): Promise<MomentComment[]>;
  createComment(data: { momentId: string; userId: string; userName: string; userImageUrl?: string | null; content: string }): Promise<MomentComment>;
  deleteComment(commentId: string, userId: string, isOrganiser?: boolean): Promise<void>;
  getMomentById(momentId: string): Promise<ClubMoment | undefined>;
  getJoinRequestCountByClub(clubId: string): Promise<number>;
  hasUserJoinedClub(clubId: string, userId: string): Promise<boolean>;
  getUserJoinStatus(clubId: string, userId: string): Promise<{ status: string | null; requestId: string | null }>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined>;
  cancelEvent(id: string): Promise<Event | undefined>;
  getMembersPreview(clubId: string, limit?: number): Promise<{ userId: string | null; name: string; profileImageUrl: string | null }[]>;
  getAdminAnalytics(): Promise<{ totalUsers: number; totalClubs: number; activeClubs: number; totalEvents: number; totalRsvps: number; totalCheckins: number; totalMoments: number; totalComments: number; newUsersThisWeek: number; newEventsThisWeek: number; newJoinsThisWeek: number; cityCounts: { city: string; count: number }[] }>;
  getAdminActivityFeed(): Promise<{ recentJoins: { name: string; clubName: string; createdAt: Date | null }[]; recentClubs: { name: string; emoji: string; city: string; createdAt: Date | null }[]; recentEvents: { title: string; clubName: string; startsAt: Date }[] }>;
  getAllUsers(): Promise<{ id: string; email: string | null; firstName: string | null; city: string | null; role: string | null; createdAt: Date | null; clubCount: number }[]>;
  getAllEventsAdmin(): Promise<{ id: string; title: string; clubId: string; clubName: string; clubEmoji: string; startsAt: Date; rsvpCount: number; checkedInCount: number; isCancelled: boolean | null; maxCapacity: number }[]>;
  getOrganizerInsights(clubId: string): Promise<{ totalMembers: number; pendingRequests: number; totalEvents: number; avgAttendanceRate: number; topEvent: { title: string; attended: number; total: number } | null; recentJoins: { name: string; date: Date | null }[]; recentRsvps: { userName: string; eventTitle: string; date: Date | null }[] }>;
  getUserApprovedClubs(userId: string): Promise<Club[]>;
  getFeedMoments(limit?: number, userId?: string): Promise<(ClubMoment & { clubName: string; clubEmoji: string; clubLocation: string; commentCount: number; userHasLiked: boolean; authorName: string | null; authorUserId: string | null })[]>;
  getClubAnalytics(clubId: string): Promise<{
    memberGrowth: { week: string; count: number }[];
    perEventStats: { id: string; title: string; date: string; rsvps: number; attended: number; rate: number; isCancelled: boolean | null }[];
    mostActiveMembers: { name: string; rsvpCount: number }[];
    engagementRate: number;
    noShowRate: number;
  }>;
  getClubsForOrganiser(userId: string): Promise<Club[]>;
  isClubManager(clubId: string, userId: string): Promise<boolean>;
  getClubAnnouncements(clubId: string): Promise<ClubAnnouncement[]>;
  createAnnouncement(data: InsertClubAnnouncement): Promise<ClubAnnouncement>;
  deleteAnnouncement(id: string, clubId: string): Promise<void>;
  getClubMemberUserIds(clubId: string): Promise<string[]>;
  getClubPolls(clubId: string, viewerUserId?: string): Promise<(ClubPoll & { voteCounts: number[]; userVote: number | null })[]>;
  createPoll(data: InsertClubPoll): Promise<ClubPoll>;
  deletePoll(id: string, clubId: string): Promise<void>;
  closePoll(id: string, clubId: string): Promise<void>;
  castVote(pollId: string, userId: string, optionIndex: number): Promise<void>;
  addCoOrganiser(clubId: string, userId: string): Promise<void>;
  removeCoOrganiser(clubId: string, userId: string): Promise<void>;
  likeMoment(momentId: string, userId: string): Promise<void>;
  unlikeMoment(momentId: string, userId: string): Promise<void>;
  getMomentLikeStatus(momentId: string, userId: string): Promise<boolean>;
  getPublicClubMembers(clubId: string): Promise<{ userId: string | null; name: string; profileImageUrl: string | null; joinedAt: Date | null; isFoundingMember: boolean | null }[]>;
  getUserFoundingClubs(userId: string): Promise<{ clubId: string; clubName: string; isFoundingMember: boolean | null }[]>;
  getEventComments(eventId: string): Promise<EventComment[]>;
  createEventComment(eventId: string, userId: string, userName: string, userImageUrl: string | null, text: string): Promise<EventComment>;
  approveJoinRequestWithFoundingCheck(requestId: string, clubId: string): Promise<JoinRequest | undefined>;
  getUserAdminDetail(userId: string): Promise<{
    clubs: { clubId: string; clubName: string; clubEmoji: string; joinedAt: Date | null }[];
    events: { id: string; title: string; startsAt: Date; clubName: string }[];
    moments: { id: string; caption: string | null; createdAt: Date | null }[];
    joinRequests: { clubName: string; status: string; createdAt: Date | null }[];
  }>;
  getAllPollsAdmin(): Promise<{ id: string; clubId: string; clubName: string; clubEmoji: string; question: string; options: string[]; isOpen: boolean | null; createdAt: Date | null; votes: number[]; totalVotes: number }[]>;
  closePollAdmin(pollId: string): Promise<void>;
  broadcastNotification(title: string, message: string, linkUrl?: string): Promise<number>;
  getWeeklyGrowth(): Promise<{ week: string; users: number; events: number; moments: number }[]>;
  updateClubHealth(clubId: string, status: string, label: string): Promise<void>;
  createKudo(data: { eventId: string; giverId: string; receiverId: string; kudoType: string }): Promise<Kudo>;
  hasGivenKudo(eventId: string, giverId: string): Promise<boolean>;
  getKudosByReceiver(userId: string): Promise<(Kudo & { eventTitle: string; eventStartsAt: Date })[]>;
  getEventAttendeesForKudo(eventId: string, excludeUserId: string): Promise<{ userId: string; userName: string | null }[]>;
  autoJoinSampleClubs(userId: string): Promise<Club[]>;
  getClubBySlug(slug: string): Promise<Club | undefined>;
  updateClubSlug(clubId: string, slug: string): Promise<Club | undefined>;
  generateSlugForClub(clubId: string): Promise<string | null>;
  getPageSections(clubId: string): Promise<ClubPageSection[]>;
  createPageSection(data: InsertClubPageSection): Promise<ClubPageSection>;
  updatePageSection(id: string, data: Partial<InsertClubPageSection>): Promise<ClubPageSection | undefined>;
  deletePageSection(id: string): Promise<void>;
  reorderPageSections(clubId: string, sectionIds: string[]): Promise<void>;
  getSectionEvents(sectionId: string): Promise<(SectionEvent & { eventTitle: string; eventStartsAt: Date; eventLocation: string })[]>;
  addSectionEvent(sectionId: string, eventId: string, position: number): Promise<SectionEvent>;
  removeSectionEvent(id: string): Promise<void>;
  getPublicPageData(clubId: string): Promise<{
    club: Club;
    sections: (ClubPageSection & { events: { id: string; eventId: string; title: string; startsAt: Date; location: string; position: number }[] })[];
    announcements: ClubAnnouncement[];
    schedule: ClubScheduleEntry[];
    moments: ClubMoment[];
    memberCount: number;
    upcomingEventCount: number;
    pastEventCount: number;
    rating: number | null;
  }>;
  createClubProposal(data: InsertClubProposal): Promise<ClubProposal>;
  getClubProposalsByUser(userId: string): Promise<ClubProposal[]>;
  getAllClubProposals(): Promise<(ClubProposal & { userName: string | null; userEmail: string | null })[]>;
  updateClubProposalStatus(id: string, status: string, reviewNote?: string): Promise<ClubProposal | undefined>;
  getClubProposal(id: string): Promise<ClubProposal | undefined>;
  getPendingProposalCount(): Promise<number>;
  getEventAttendanceReport(eventId: string, clubId: string): Promise<{ userId: string; userName: string | null; status: string; checkedIn: boolean | null; checkedInAt: Date | null; phone: string | null }[]>;
  getClubMembersEnriched(clubId: string): Promise<{ id: string; userId: string | null; name: string; phone: string; profileImageUrl: string | null; bio: string | null; city: string | null; joinedAt: Date | null; isFoundingMember: boolean | null; eventsAttended: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getClubs(): Promise<Club[]> {
    return db.select().from(clubs);
  }

  async getClubsByCategory(category: string): Promise<Club[]> {
    return db.select().from(clubs).where(eq(clubs.category, category));
  }

  async getClub(id: string): Promise<Club | undefined> {
    const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
    return club;
  }

  async getClubBySlug(slug: string): Promise<Club | undefined> {
    const [club] = await db.select().from(clubs).where(eq(clubs.slug, slug));
    return club;
  }

  async updateClubSlug(clubId: string, slug: string): Promise<Club | undefined> {
    const [updated] = await db.update(clubs).set({ slug }).where(eq(clubs.id, clubId)).returning();
    return updated;
  }

  async generateSlugForClub(clubId: string): Promise<string | null> {
    const club = await this.getClub(clubId);
    if (!club) return null;
    let baseSlug = club.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
    if (baseSlug.length < 2) baseSlug = `club-${clubId.slice(0, 8)}`;
    let finalSlug = baseSlug;
    let attempt = 0;
    while (await this.getClubBySlug(finalSlug)) {
      // If the existing slug belongs to this same club, it's fine — return it
      const existing = await this.getClubBySlug(finalSlug);
      if (existing && existing.id === clubId) {
        return finalSlug;
      }
      attempt++;
      finalSlug = `${baseSlug}-${attempt}`;
    }
    await this.updateClubSlug(clubId, finalSlug);
    return finalSlug;
  }

  async createClub(club: InsertClub): Promise<Club> {
    const [created] = await db.insert(clubs).values(club).returning();
    return created;
  }

  async updateClub(id: string, data: Partial<InsertClub>): Promise<Club | undefined> {
    const [updated] = await db.update(clubs).set(data).where(eq(clubs.id, id)).returning();
    return updated;
  }

  async incrementMemberCount(clubId: string): Promise<Club | undefined> {
    const [updated] = await db.update(clubs).set({
      memberCount: sql`${clubs.memberCount} + 1`,
      foundingTaken: sql`CASE WHEN ${clubs.foundingTaken} < ${clubs.foundingTotal} THEN ${clubs.foundingTaken} + 1 ELSE ${clubs.foundingTaken} END`,
    }).where(eq(clubs.id, clubId)).returning();
    return updated;
  }

  async createJoinRequest(request: InsertJoinRequest): Promise<JoinRequest> {
    const [created] = await db.insert(joinRequests).values(request).returning();
    return created;
  }

  async getJoinRequests(): Promise<JoinRequest[]> {
    return db.select().from(joinRequests).orderBy(desc(joinRequests.createdAt));
  }

  async getJoinRequestsByClub(clubId: string): Promise<JoinRequest[]> {
    return db.select().from(joinRequests).where(eq(joinRequests.clubId, clubId)).orderBy(desc(joinRequests.createdAt));
  }

  async getJoinRequestsByPhone(phone: string): Promise<JoinRequest[]> {
    return db.select().from(joinRequests).where(eq(joinRequests.phone, phone)).orderBy(desc(joinRequests.createdAt));
  }

  async markJoinRequestDone(id: string): Promise<JoinRequest | undefined> {
    const [updated] = await db.update(joinRequests).set({ markedDone: true }).where(eq(joinRequests.id, id)).returning();
    return updated;
  }

  async approveJoinRequest(id: string): Promise<JoinRequest | undefined> {
    const [updated] = await db.update(joinRequests).set({ status: "approved", markedDone: true }).where(eq(joinRequests.id, id)).returning();
    return updated;
  }

  async rejectJoinRequest(id: string): Promise<JoinRequest | undefined> {
    const [updated] = await db.update(joinRequests).set({ status: "rejected" }).where(eq(joinRequests.id, id)).returning();
    return updated;
  }

  async deleteJoinRequest(id: string): Promise<void> {
    await db.delete(joinRequests).where(eq(joinRequests.id, id));
  }

  async leaveClub(clubId: string, userId: string): Promise<void> {
    await db.delete(joinRequests)
      .where(and(
        eq(joinRequests.clubId, clubId),
        eq(joinRequests.userId, userId),
        eq(joinRequests.status, "approved")
      ));
  }

  async getJoinRequest(id: string): Promise<JoinRequest | undefined> {
    const [request] = await db.select().from(joinRequests).where(eq(joinRequests.id, id));
    return request;
  }

  async getJoinRequestsByUser(userId: string): Promise<JoinRequest[]> {
    return db.select().from(joinRequests).where(eq(joinRequests.userId, userId)).orderBy(desc(joinRequests.createdAt));
  }

  async getPendingJoinRequestCount(clubId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "pending")));
    return result?.count ?? 0;
  }

  async getApprovedMembersByClub(clubId: string): Promise<JoinRequest[]> {
    return db.select().from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")))
      .orderBy(desc(joinRequests.createdAt));
  }

  async hasExistingJoinRequest(clubId: string, userId: string): Promise<JoinRequest | undefined> {
    const [existing] = await db.select().from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.userId, userId)));
    return existing;
  }

  async decrementMemberCount(clubId: string): Promise<Club | undefined> {
    const [updated] = await db.update(clubs).set({
      memberCount: sql`GREATEST(${clubs.memberCount} - 1, 0)`,
    }).where(eq(clubs.id, clubId)).returning();
    return updated;
  }

  async getClubsByCreator(creatorUserId: string): Promise<Club[]> {
    return db.select().from(clubs).where(eq(clubs.creatorUserId, creatorUserId));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async saveQuizAnswers(answers: InsertQuizAnswers): Promise<QuizAnswers> {
    const existing = await this.getQuizAnswers(answers.userId);
    if (existing) {
      const [updated] = await db.update(userQuizAnswers)
        .set(answers)
        .where(eq(userQuizAnswers.userId, answers.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userQuizAnswers).values(answers).returning();
    return created;
  }

  async getQuizAnswers(userId: string): Promise<QuizAnswers | undefined> {
    const [answers] = await db.select().from(userQuizAnswers).where(eq(userQuizAnswers.userId, userId));
    return answers;
  }

  async searchClubs(params: { search?: string; category?: string; city?: string; vibe?: string; timeOfDay?: string }): Promise<Club[]> {
    const conditions = [];
    if (params.category && params.category !== "All") {
      conditions.push(eq(clubs.category, params.category));
    }
    if (params.city && params.city !== "All Cities") {
      conditions.push(eq(clubs.city, params.city));
    }
    if (params.vibe && params.vibe !== "all") {
      conditions.push(eq(clubs.vibe, params.vibe));
    }
    if (params.timeOfDay && params.timeOfDay !== "all") {
      conditions.push(eq(clubs.timeOfDay, params.timeOfDay));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(clubs.name, `%${params.search}%`),
          ilike(clubs.shortDesc, `%${params.search}%`),
          ilike(clubs.category, `%${params.search}%`)
        )!
      );
    }

    if (conditions.length === 0) {
      return db.select().from(clubs).orderBy(desc(clubs.memberCount));
    }
    return db.select().from(clubs).where(and(...conditions)).orderBy(desc(clubs.memberCount));
  }

  async getUserAttendanceStats(userId: string): Promise<{ clubId: string; clubName: string; clubEmoji: string; totalRsvps: number; attended: number }[]> {
    const results = await db.select({
      clubId: clubs.id,
      clubName: clubs.name,
      clubEmoji: clubs.emoji,
      totalRsvps: sql<number>`count(*)::int`,
      attended: sql<number>`sum(case when ${eventRsvps.checkedIn} = true then 1 else 0 end)::int`,
    })
      .from(eventRsvps)
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(and(eq(eventRsvps.userId, userId), eq(eventRsvps.status, "going")))
      .groupBy(clubs.id, clubs.name, clubs.emoji);
    return results;
  }



  async getMemberDirectory(clubId: string): Promise<{ userId: string | null; name: string; profileImageUrl: string | null; joinedAt: Date | null }[]> {
    return db.select({
      userId: joinRequests.userId,
      name: joinRequests.name,
      profileImageUrl: users.profileImageUrl,
      joinedAt: joinRequests.createdAt,
    })
      .from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")))
      .orderBy(joinRequests.createdAt);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async extendEventSeries(clubId: string, title: string, recurrenceRule: string): Promise<Event[]> {
    const seriesEvents = await db.select().from(events)
      .where(and(eq(events.clubId, clubId), eq(events.title, title), eq(events.recurrenceRule, recurrenceRule)))
      .orderBy(desc(events.startsAt));
    if (seriesEvents.length === 0) return [];
    const latest = seriesEvents[0];
    const baseStartsAt = new Date(latest.startsAt);
    const created: Event[] = [];
    for (let i = 1; i <= 4; i++) {
      const nextStartsAt = new Date(baseStartsAt);
      if (recurrenceRule === "weekly") nextStartsAt.setDate(nextStartsAt.getDate() + 7 * i);
      else if (recurrenceRule === "biweekly") nextStartsAt.setDate(nextStartsAt.getDate() + 14 * i);
      else if (recurrenceRule === "monthly") nextStartsAt.setMonth(nextStartsAt.getMonth() + i);
      const [newEvent] = await db.insert(events).values({
        clubId,
        title: latest.title,
        description: latest.description,
        locationText: latest.locationText,
        locationUrl: latest.locationUrl,
        startsAt: nextStartsAt,
        maxCapacity: latest.maxCapacity,
        coverImageUrl: latest.coverImageUrl,
        recurrenceRule,
      }).returning();
      created.push(newEvent);
    }
    return created;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByClub(clubId: string): Promise<Event[]> {
    return db.select().from(events)
      .where(eq(events.clubId, clubId))
      .orderBy(events.startsAt);
  }

  async getUpcomingEvents(city?: string, limit = 10): Promise<(Event & { clubName: string; clubEmoji: string; rsvpCount: number })[]> {
    const now = new Date();
    const baseQuery = db.select({
      id: events.id,
      clubId: events.clubId,
      title: events.title,
      description: events.description,
      locationText: events.locationText,
      locationUrl: events.locationUrl,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      maxCapacity: events.maxCapacity,
      coverImageUrl: events.coverImageUrl,
      isPublic: events.isPublic,
      isCancelled: events.isCancelled,
      recurrenceRule: events.recurrenceRule,
      createdAt: events.createdAt,
      clubName: clubs.name,
      clubEmoji: clubs.emoji,
      rsvpCount: sql<number>`(SELECT COUNT(*) FROM event_rsvps WHERE event_rsvps.event_id = events.id AND event_rsvps.status = 'going')::int`,
    })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(
        city && city !== "All Cities"
          ? and(gte(events.startsAt, now), eq(clubs.city, city), ne(events.isCancelled, true))
          : and(gte(events.startsAt, now), ne(events.isCancelled, true))
      )
      .orderBy(events.startsAt)
      .limit(limit * 4);

    const rows = await baseQuery;
    const seen = new Set<string>();
    const deduped: typeof rows = [];
    for (const row of rows) {
      if (row.recurrenceRule) {
        const seriesKey = `${row.clubId}__${row.title}__${row.recurrenceRule}`;
        if (seen.has(seriesKey)) continue;
        seen.add(seriesKey);
      }
      deduped.push(row);
      if (deduped.length >= limit) break;
    }
    return deduped;
  }

  async createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const existing = await this.getUserRsvp(rsvp.eventId, rsvp.userId);
    if (existing) {
      const [updated] = await db.update(eventRsvps)
        .set({ status: "going" })
        .where(eq(eventRsvps.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(eventRsvps).values(rsvp).returning();
    return created;
  }

  async cancelRsvp(eventId: string, userId: string): Promise<void> {
    await db.update(eventRsvps)
      .set({ status: "cancelled" })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
  }

  async getRsvpsByEvent(eventId: string): Promise<(EventRsvp & { userName: string | null })[]> {
    const results = await db.select({
      id: eventRsvps.id,
      eventId: eventRsvps.eventId,
      userId: eventRsvps.userId,
      status: eventRsvps.status,
      checkinToken: eventRsvps.checkinToken,
      checkedIn: eventRsvps.checkedIn,
      checkedInAt: eventRsvps.checkedInAt,
      createdAt: eventRsvps.createdAt,
      userName: users.firstName,
    })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "going")));
    return results;
  }

  async getUserRsvp(eventId: string, userId: string): Promise<EventRsvp | undefined> {
    const [rsvp] = await db.select().from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
    return rsvp;
  }

  async getRsvpCount(eventId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "going")));
    return result?.count ?? 0;
  }

  async getRsvpsByUser(userId: string) {
    const results = await db
      .select({
        id: eventRsvps.id,
        eventId: eventRsvps.eventId,
        userId: eventRsvps.userId,
        status: eventRsvps.status,
        checkinToken: eventRsvps.checkinToken,
        checkedIn: eventRsvps.checkedIn,
        checkedInAt: eventRsvps.checkedInAt,
        createdAt: eventRsvps.createdAt,
        eventTitle: events.title,
        eventStartsAt: events.startsAt,
        eventLocation: events.locationText,
        clubName: clubs.name,
        clubEmoji: clubs.emoji,
      })
      .from(eventRsvps)
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(and(eq(eventRsvps.userId, userId), eq(eventRsvps.status, "going")))
      .orderBy(events.startsAt);
    return results;
  }

  async getStats(): Promise<{ totalMembers: number; totalClubs: number; upcomingEvents: number }> {
    const [membersResult] = await db.select({
      count: sql<number>`(SELECT COUNT(DISTINCT phone) FROM join_requests WHERE status = 'approved')::int`,
    }).from(joinRequests);

    const [clubsResult] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(clubs).where(eq(clubs.isActive, true));

    const now = new Date();
    const [eventsResult] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(events).where(gte(events.startsAt, now));

    return {
      totalMembers: membersResult?.count ?? 0,
      totalClubs: clubsResult?.count ?? 0,
      upcomingEvents: eventsResult?.count ?? 0,
    };
  }

  async getCheckedInCount(eventId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.checkedIn, true)));
    return result?.count ?? 0;
  }

  async getEventAttendees(eventId: string): Promise<(EventRsvp & { userName: string | null; checkedIn: boolean | null; checkedInAt: Date | null })[]> {
    const results = await db.select({
      id: eventRsvps.id,
      eventId: eventRsvps.eventId,
      userId: eventRsvps.userId,
      status: eventRsvps.status,
      checkinToken: eventRsvps.checkinToken,
      checkedIn: eventRsvps.checkedIn,
      checkedInAt: eventRsvps.checkedInAt,
      createdAt: eventRsvps.createdAt,
      userName: users.firstName,
    })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "going")));
    return results;
  }

  async getClubActivity(clubId: string): Promise<{ recentJoins: number; recentJoinNames: string[]; totalEvents: number; lastEventDate: Date | null }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [joinCountResult] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(joinRequests).where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved"), gte(joinRequests.createdAt, sevenDaysAgo)));

    const recentNames = await db.select({ name: joinRequests.name })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved"), gte(joinRequests.createdAt, sevenDaysAgo)))
      .orderBy(desc(joinRequests.createdAt))
      .limit(3);

    const [eventCountResult] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(events).where(eq(events.clubId, clubId));

    const [lastEvent] = await db.select({ startsAt: events.startsAt })
      .from(events)
      .where(eq(events.clubId, clubId))
      .orderBy(desc(events.startsAt))
      .limit(1);

    return {
      recentJoins: joinCountResult?.count ?? 0,
      recentJoinNames: recentNames.map(r => r.name.split(" ")[0]),
      totalEvents: eventCountResult?.count ?? 0,
      lastEventDate: lastEvent?.startsAt ?? null,
    };
  }

  async getRecentActivityFeed(limit = 10): Promise<{ name: string; clubName: string; clubEmoji: string; createdAt: Date | null }[]> {
    const results = await db.select({
      name: joinRequests.name,
      clubName: joinRequests.clubName,
      clubId: joinRequests.clubId,
      createdAt: joinRequests.createdAt,
    })
      .from(joinRequests)
      .where(eq(joinRequests.status, "approved"))
      .orderBy(desc(joinRequests.createdAt))
      .limit(limit);

    const clubIds = Array.from(new Set(results.map(r => r.clubId)));
    const clubsData = clubIds.length > 0
      ? await db.select({ id: clubs.id, emoji: clubs.emoji }).from(clubs).where(
          sql`${clubs.id} IN (${sql.join(clubIds.map(id => sql`${id}`), sql`, `)})`
        )
      : [];
    const emojiMap = Object.fromEntries(clubsData.map(c => [c.id, c.emoji]));

    return results.map(r => ({
      name: r.name.split(" ")[0],
      clubName: r.clubName,
      clubEmoji: emojiMap[r.clubId] || "🎯",
      createdAt: r.createdAt,
    }));
  }

  async getClubsWithRecentJoins(): Promise<Record<string, number>> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const results = await db.select({
      clubId: joinRequests.clubId,
      count: sql<number>`count(*)::int`,
    })
      .from(joinRequests)
      .where(and(eq(joinRequests.status, "approved"), gte(joinRequests.createdAt, sevenDaysAgo)))
      .groupBy(joinRequests.clubId);

    return Object.fromEntries(results.map(r => [r.clubId, r.count]));
  }

  async getRsvpById(rsvpId: string): Promise<EventRsvp | undefined> {
    const [rsvp] = await db.select().from(eventRsvps).where(eq(eventRsvps.id, rsvpId));
    return rsvp;
  }

  async getRsvpByToken(token: string): Promise<(EventRsvp & { userName: string | null }) | undefined> {
    const [result] = await db.select({
      id: eventRsvps.id,
      eventId: eventRsvps.eventId,
      userId: eventRsvps.userId,
      status: eventRsvps.status,
      checkinToken: eventRsvps.checkinToken,
      checkedIn: eventRsvps.checkedIn,
      checkedInAt: eventRsvps.checkedInAt,
      createdAt: eventRsvps.createdAt,
      userName: users.firstName,
    })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(and(eq(eventRsvps.checkinToken, token), eq(eventRsvps.status, "going")));
    return result;
  }

  async checkInRsvpByToken(token: string): Promise<EventRsvp | undefined> {
    const [updated] = await db.update(eventRsvps)
      .set({ checkedIn: true, checkedInAt: new Date() })
      .where(and(eq(eventRsvps.checkinToken, token), eq(eventRsvps.status, "going")))
      .returning();
    return updated;
  }

  async checkInRsvpById(rsvpId: string): Promise<EventRsvp | undefined> {
    const [updated] = await db.update(eventRsvps)
      .set({ checkedIn: true, checkedInAt: new Date() })
      .where(and(eq(eventRsvps.id, rsvpId), eq(eventRsvps.status, "going")))
      .returning();
    return updated;
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getClubRatings(clubId: string): Promise<ClubRating[]> {
    return db.select().from(clubRatings).where(eq(clubRatings.clubId, clubId)).orderBy(desc(clubRatings.createdAt));
  }

  async getClubAverageRating(clubId: string): Promise<{ average: number; count: number }> {
    const [result] = await db.select({
      average: sql<number>`COALESCE(AVG(${clubRatings.rating})::numeric(2,1), 0)::float`,
      count: sql<number>`count(*)::int`,
    }).from(clubRatings).where(eq(clubRatings.clubId, clubId));
    return { average: result?.average ?? 0, count: result?.count ?? 0 };
  }

  async getUserRating(clubId: string, userId: string): Promise<ClubRating | undefined> {
    const [rating] = await db.select().from(clubRatings)
      .where(and(eq(clubRatings.clubId, clubId), eq(clubRatings.userId, userId)));
    return rating;
  }

  async upsertRating(clubId: string, userId: string, rating: number, review?: string): Promise<ClubRating> {
    const existing = await this.getUserRating(clubId, userId);
    if (existing) {
      const [updated] = await db.update(clubRatings)
        .set({ rating, review: review || null })
        .where(eq(clubRatings.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(clubRatings).values({ clubId, userId, rating, review: review || null }).returning();
    return created;
  }

  async getClubFaqs(clubId: string): Promise<ClubFaq[]> {
    return db.select().from(clubFaqs).where(eq(clubFaqs.clubId, clubId)).orderBy(clubFaqs.sortOrder);
  }

  async createFaq(clubId: string, question: string, answer: string): Promise<ClubFaq> {
    const [created] = await db.insert(clubFaqs).values({ clubId, question, answer }).returning();
    return created;
  }

  async updateFaq(id: string, question: string, answer: string): Promise<ClubFaq | undefined> {
    const [updated] = await db.update(clubFaqs).set({ question, answer }).where(eq(clubFaqs.id, id)).returning();
    return updated;
  }

  async deleteFaq(id: string): Promise<void> {
    await db.delete(clubFaqs).where(eq(clubFaqs.id, id));
  }

  async getClubSchedule(clubId: string): Promise<ClubScheduleEntry[]> {
    return db.select().from(clubScheduleEntries).where(eq(clubScheduleEntries.clubId, clubId));
  }

  async createScheduleEntry(clubId: string, data: { dayOfWeek: string; startTime: string; endTime?: string; activity: string; location?: string }): Promise<ClubScheduleEntry> {
    const [created] = await db.insert(clubScheduleEntries).values({ clubId, ...data }).returning();
    return created;
  }

  async updateScheduleEntry(id: string, data: { dayOfWeek?: string; startTime?: string; endTime?: string; activity?: string; location?: string }): Promise<ClubScheduleEntry | undefined> {
    const [updated] = await db.update(clubScheduleEntries).set(data).where(eq(clubScheduleEntries.id, id)).returning();
    return updated;
  }

  async deleteScheduleEntry(id: string): Promise<void> {
    await db.delete(clubScheduleEntries).where(eq(clubScheduleEntries.id, id));
  }

  async getClubMoments(clubId: string): Promise<(ClubMoment & { commentCount: number })[]> {
    const rows = await db.select().from(clubMoments).where(eq(clubMoments.clubId, clubId)).orderBy(desc(clubMoments.createdAt));
    if (rows.length === 0) return [];
    const ids = rows.map(r => r.id);
    const counts = await db
      .select({ momentId: momentComments.momentId, count: sql<number>`count(*)::int` })
      .from(momentComments)
      .where(sql`${momentComments.momentId} = ANY(${sql.raw(`ARRAY[${ids.map(id => `'${id}'`).join(",")}]`)})`)
      .groupBy(momentComments.momentId);
    const countMap: Record<string, number> = {};
    for (const c of counts) countMap[c.momentId] = c.count;
    return rows.map(r => ({ ...r, commentCount: countMap[r.id] ?? 0 }));
  }

  async createMoment(clubId: string, caption: string, emoji?: string, imageUrl?: string, authorUserId?: string, authorName?: string): Promise<ClubMoment> {
    const [created] = await db.insert(clubMoments).values({ clubId, caption, emoji: emoji || null, imageUrl: imageUrl || null, authorUserId: authorUserId || null, authorName: authorName || null }).returning();
    return created;
  }

  async updateMoment(id: string, data: { caption?: string; emoji?: string }): Promise<ClubMoment | undefined> {
    const [updated] = await db.update(clubMoments).set(data).where(eq(clubMoments.id, id)).returning();
    return updated;
  }

  async deleteMoment(id: string): Promise<void> {
    await db.delete(momentComments).where(eq(momentComments.momentId, id));
    await db.delete(clubMoments).where(eq(clubMoments.id, id));
  }

  async getMomentById(momentId: string): Promise<ClubMoment | undefined> {
    const [row] = await db.select().from(clubMoments).where(eq(clubMoments.id, momentId));
    return row;
  }

  async getCommentsByMoment(momentId: string): Promise<MomentComment[]> {
    return db.select().from(momentComments)
      .where(eq(momentComments.momentId, momentId))
      .orderBy(momentComments.createdAt);
  }

  async createComment(data: { momentId: string; userId: string; userName: string; userImageUrl?: string | null; content: string }): Promise<MomentComment> {
    const [created] = await db.insert(momentComments).values({
      momentId: data.momentId,
      userId: data.userId,
      userName: data.userName,
      userImageUrl: data.userImageUrl ?? null,
      content: data.content,
    }).returning();
    return created;
  }

  async deleteComment(commentId: string, userId: string, isOrganiser = false): Promise<void> {
    if (isOrganiser) {
      await db.delete(momentComments).where(eq(momentComments.id, commentId));
    } else {
      await db.delete(momentComments).where(and(eq(momentComments.id, commentId), eq(momentComments.userId, userId)));
    }
  }

  async getJoinRequestCountByClub(clubId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")));
    return result?.count ?? 0;
  }

  async hasUserJoinedClub(clubId: string, userId: string): Promise<boolean> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.userId, userId), eq(joinRequests.status, "approved")));
    return (result?.count ?? 0) > 0;
  }

  async getUserJoinStatus(clubId: string, userId: string): Promise<{ status: string | null; requestId: string | null }> {
    const [result] = await db.select({ status: joinRequests.status, id: joinRequests.id })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.userId, userId)))
      .orderBy(desc(joinRequests.createdAt))
      .limit(1);
    return { status: result?.status ?? null, requestId: result?.id ?? null };
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result?.count ?? 0;
  }

  async updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return updated;
  }

  async cancelEvent(id: string): Promise<Event | undefined> {
    const [updated] = await db.update(events)
      .set({ isCancelled: true })
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async getMembersPreview(clubId: string, limit = 10): Promise<{ userId: string | null; name: string; profileImageUrl: string | null }[]> {
    const results = await db.select({
      userId: joinRequests.userId,
      name: joinRequests.name,
      profileImageUrl: users.profileImageUrl,
    })
      .from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")))
      .orderBy(desc(joinRequests.createdAt))
      .limit(limit);
    return results;
  }

  async getAdminAnalytics() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [clubCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clubs);
    const [activeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clubs).where(ne(clubs.isActive, false));
    const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(events);
    const [rsvpCount] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRsvps);
    const [checkinCount] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRsvps).where(eq(eventRsvps.checkedIn, true));
    const [momentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clubMoments);
    const [commentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(momentComments);
    const [newUsersRow] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, sevenDaysAgo));
    const [newEventsRow] = await db.select({ count: sql<number>`count(*)::int` }).from(events).where(gte(events.createdAt, sevenDaysAgo));
    const [newJoinsRow] = await db.select({ count: sql<number>`count(*)::int` }).from(joinRequests).where(and(eq(joinRequests.status, "approved"), gte(joinRequests.createdAt, sevenDaysAgo)));

    const cityRows = await db.select({
      city: clubs.city,
      count: sql<number>`count(*)::int`,
    }).from(clubs).groupBy(clubs.city).orderBy(sql`count(*) desc`);

    return {
      totalUsers: userCount.count,
      totalClubs: clubCount.count,
      activeClubs: activeCount.count,
      totalEvents: eventCount.count,
      totalRsvps: rsvpCount.count,
      totalCheckins: checkinCount.count,
      totalMoments: momentCount.count,
      totalComments: commentCount.count,
      newUsersThisWeek: newUsersRow.count,
      newEventsThisWeek: newEventsRow.count,
      newJoinsThisWeek: newJoinsRow.count,
      cityCounts: cityRows.map(r => ({ city: r.city, count: r.count })),
    };
  }

  async getAdminActivityFeed() {
    const recentJoinsRows = await db
      .select({ name: joinRequests.name, clubName: clubs.name, createdAt: joinRequests.createdAt })
      .from(joinRequests)
      .innerJoin(clubs, eq(joinRequests.clubId, clubs.id))
      .where(eq(joinRequests.status, "approved"))
      .orderBy(desc(joinRequests.createdAt))
      .limit(5);
    const recentClubsRows = await db
      .select({ name: clubs.name, emoji: clubs.emoji, city: clubs.city, createdAt: clubs.createdAt })
      .from(clubs)
      .orderBy(desc(clubs.createdAt))
      .limit(3);
    const recentEventsRows = await db
      .select({ title: events.title, clubName: clubs.name, startsAt: events.startsAt })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .orderBy(desc(events.createdAt))
      .limit(3);
    return {
      recentJoins: recentJoinsRows,
      recentClubs: recentClubsRows,
      recentEvents: recentEventsRows,
    };
  }

  async getAllUsers() {
    const results = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      city: users.city,
      role: users.role,
      createdAt: users.createdAt,
      clubCount: sql<number>`(select count(*)::int from ${joinRequests} where ${joinRequests.userId} = ${users.id} and ${joinRequests.status} = 'approved')`,
    }).from(users).orderBy(desc(users.createdAt));
    return results;
  }

  async getAllEventsAdmin() {
    const results = await db.select({
      id: events.id,
      title: events.title,
      clubId: events.clubId,
      clubName: clubs.name,
      clubEmoji: clubs.emoji,
      startsAt: events.startsAt,
      isCancelled: events.isCancelled,
      maxCapacity: events.maxCapacity,
      rsvpCount: sql<number>`(select count(*)::int from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id})`,
      checkedInCount: sql<number>`(select count(*)::int from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.checkedIn} = true)`,
    })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .orderBy(desc(events.startsAt));
    return results;
  }

  async getOrganizerInsights(clubId: string) {
    const [memberResult] = await db.select({ count: sql<number>`count(*)::int` }).from(joinRequests).where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")));
    const [pendingResult] = await db.select({ count: sql<number>`count(*)::int` }).from(joinRequests).where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "pending")));
    const clubEvents = await db.select({ id: events.id, title: events.title }).from(events).where(eq(events.clubId, clubId));

    let avgAttendanceRate = 0;
    let topEvent: { title: string; attended: number; total: number } | null = null;

    if (clubEvents.length > 0) {
      const eventIds = clubEvents.map(e => e.id);
      const attendanceStats = await db.select({
        eventId: eventRsvps.eventId,
        rsvpCount: sql<number>`count(*)::int`,
        checkinCount: sql<number>`sum(case when ${eventRsvps.checkedIn} then 1 else 0 end)::int`,
      })
        .from(eventRsvps)
        .where(sql`${eventRsvps.eventId} in ${eventIds}`)
        .groupBy(eventRsvps.eventId);

      let totalRate = 0;
      let ratedEvents = 0;
      let bestAttendance = -1;

      for (const stat of attendanceStats) {
        if (stat.rsvpCount > 0) {
          const rate = (stat.checkinCount || 0) / stat.rsvpCount;
          totalRate += rate;
          ratedEvents++;
          if ((stat.checkinCount || 0) > bestAttendance) {
            bestAttendance = stat.checkinCount || 0;
            const ev = clubEvents.find(e => e.id === stat.eventId);
            topEvent = { title: ev?.title || "Unknown", attended: stat.checkinCount || 0, total: stat.rsvpCount };
          }
        }
      }
      avgAttendanceRate = ratedEvents > 0 ? Math.round((totalRate / ratedEvents) * 100) : 0;
    }

    const recentJoins = await db.select({
      name: joinRequests.name,
      date: joinRequests.createdAt,
    })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")))
      .orderBy(desc(joinRequests.createdAt))
      .limit(5);

    const recentRsvps = await db.select({
      userName: users.firstName,
      eventTitle: events.title,
      date: eventRsvps.createdAt,
    })
      .from(eventRsvps)
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .innerJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(events.clubId, clubId))
      .orderBy(desc(eventRsvps.createdAt))
      .limit(5);

    return {
      totalMembers: memberResult.count,
      pendingRequests: pendingResult.count,
      totalEvents: clubEvents.length,
      avgAttendanceRate,
      topEvent,
      recentJoins: recentJoins.map(r => ({ name: r.name, date: r.date })),
      recentRsvps: recentRsvps.map(r => ({ userName: r.userName || "Unknown", eventTitle: r.eventTitle, date: r.date })),
    };
  }

  async getUserApprovedClubs(userId: string): Promise<Club[]> {
    const result = await db
      .select({ club: clubs })
      .from(joinRequests)
      .innerJoin(clubs, eq(joinRequests.clubId, clubs.id))
      .where(and(eq(joinRequests.userId, userId), eq(joinRequests.status, "approved")));
    return result.map(r => r.club);
  }

  async getFeedMoments(limit = 10, userId?: string): Promise<(ClubMoment & { clubName: string; clubEmoji: string; clubLocation: string; commentCount: number; userHasLiked: boolean; authorName: string | null; authorUserId: string | null })[]> {
    const rows = await db
      .select({
        id: clubMoments.id,
        clubId: clubMoments.clubId,
        caption: clubMoments.caption,
        imageUrl: clubMoments.imageUrl,
        emoji: clubMoments.emoji,
        likesCount: clubMoments.likesCount,
        createdAt: clubMoments.createdAt,
        authorUserId: clubMoments.authorUserId,
        authorName: clubMoments.authorName,
        clubName: clubs.name,
        clubEmoji: clubs.emoji,
        clubLocation: clubs.location,
      })
      .from(clubMoments)
      .innerJoin(clubs, eq(clubMoments.clubId, clubs.id))
      .orderBy(desc(clubMoments.createdAt))
      .limit(limit);
    if (rows.length === 0) return [];
    const ids = rows.map(r => r.id);
    const counts = await db
      .select({ momentId: momentComments.momentId, count: sql<number>`count(*)::int` })
      .from(momentComments)
      .where(sql`${momentComments.momentId} = ANY(${sql.raw(`ARRAY[${ids.map(id => `'${id}'`).join(",")}]`)})`)
      .groupBy(momentComments.momentId);
    const countMap: Record<string, number> = {};
    for (const c of counts) countMap[c.momentId] = c.count;
    let likedSet = new Set<string>();
    if (userId) {
      const likedRows = await db
        .select({ momentId: momentLikes.momentId })
        .from(momentLikes)
        .where(and(eq(momentLikes.userId, userId), sql`${momentLikes.momentId} = ANY(${sql.raw(`ARRAY[${ids.map(id => `'${id}'`).join(",")}]`)})`));
      for (const row of likedRows) likedSet.add(row.momentId);
    }
    return rows.map(r => ({ ...r, commentCount: countMap[r.id] ?? 0, userHasLiked: likedSet.has(r.id) }));
  }

  async getClubAnalytics(clubId: string) {
    // ── 1. Member growth — last 8 weeks ─────────────────────────────────────
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const recentJoins = await db
      .select({ createdAt: joinRequests.createdAt })
      .from(joinRequests)
      .where(and(
        eq(joinRequests.clubId, clubId),
        eq(joinRequests.status, "approved"),
        gte(joinRequests.createdAt, eightWeeksAgo),
      ));

    const now = new Date();
    const memberGrowth: { week: string; count: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - w * 7 - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = recentJoins.filter(j =>
        j.createdAt && new Date(j.createdAt) >= weekStart && new Date(j.createdAt) < weekEnd
      ).length;
      const label = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      memberGrowth.push({ week: label, count });
    }

    // ── 2. Per-event stats ───────────────────────────────────────────────────
    const clubEvents = await db
      .select({ id: events.id, title: events.title, startsAt: events.startsAt, isCancelled: events.isCancelled })
      .from(events)
      .where(eq(events.clubId, clubId))
      .orderBy(desc(events.startsAt));

    const perEventStats: { id: string; title: string; date: string; rsvps: number; attended: number; rate: number; isCancelled: boolean | null }[] = [];
    for (const evt of clubEvents.slice(0, 10)) {
      const [row] = await db
        .select({
          total: sql<number>`count(*)::int`,
          attended: sql<number>`coalesce(sum(case when ${eventRsvps.checkedIn} then 1 else 0 end), 0)::int`,
        })
        .from(eventRsvps)
        .where(eq(eventRsvps.eventId, evt.id));
      const rsvps = row?.total ?? 0;
      const attended = row?.attended ?? 0;
      const rate = rsvps > 0 ? Math.round((attended / rsvps) * 100) : 0;
      perEventStats.push({
        id: evt.id,
        title: evt.title,
        date: evt.startsAt ? new Date(evt.startsAt).toISOString() : "",
        rsvps,
        attended,
        rate,
        isCancelled: evt.isCancelled,
      });
    }

    // ── 3. Most active members — top 5 by RSVP count ────────────────────────
    const topRsvpers = await db
      .select({
        userId: eventRsvps.userId,
        rsvpCount: sql<number>`count(*)::int`,
      })
      .from(eventRsvps)
      .innerJoin(events, eq(events.id, eventRsvps.eventId))
      .where(eq(events.clubId, clubId))
      .groupBy(eventRsvps.userId)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    const mostActiveMembers: { name: string; rsvpCount: number }[] = [];
    for (const row of topRsvpers) {
      const [u] = await db
        .select({ firstName: users.firstName })
        .from(users)
        .where(eq(users.id, row.userId));
      mostActiveMembers.push({ name: u?.firstName ?? "Member", rsvpCount: row.rsvpCount });
    }

    // ── 4. Engagement rate ───────────────────────────────────────────────────
    const [engRow] = await db
      .select({ engaged: sql<number>`count(distinct ${eventRsvps.userId})::int` })
      .from(eventRsvps)
      .innerJoin(events, eq(events.id, eventRsvps.eventId))
      .where(eq(events.clubId, clubId));

    const [membRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")));

    const totalMembers = membRow?.count ?? 0;
    const engagementRate = totalMembers > 0
      ? Math.round(((engRow?.engaged ?? 0) / totalMembers) * 100)
      : 0;

    // ── 5. No-show rate ──────────────────────────────────────────────────────
    const pastWithRsvps = perEventStats.filter(e => !e.isCancelled && e.rsvps > 0);
    let noShowRate = 0;
    if (pastWithRsvps.length > 0) {
      const totalRate = pastWithRsvps.reduce((sum, e) => sum + (e.rsvps - e.attended) / e.rsvps, 0);
      noShowRate = Math.round((totalRate / pastWithRsvps.length) * 100);
    }

    return { memberGrowth, perEventStats, mostActiveMembers, engagementRate, noShowRate };
  }

  async getClubsForOrganiser(userId: string): Promise<Club[]> {
    const created = await db.select().from(clubs).where(eq(clubs.creatorUserId, userId));
    const coManaged = await db.select().from(clubs).where(
      sql`${clubs.coOrganiserUserIds} @> ARRAY[${userId}]::text[]`
    );
    const seen = new Set<string>();
    const result: Club[] = [];
    for (const c of [...created, ...coManaged]) {
      if (!seen.has(c.id)) { seen.add(c.id); result.push(c); }
    }
    return result;
  }

  async isClubManager(clubId: string, userId: string): Promise<boolean> {
    const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
    if (!club) return false;
    if (club.creatorUserId === userId) return true;
    return (club.coOrganiserUserIds ?? []).includes(userId);
  }

  async getClubAnnouncements(clubId: string): Promise<ClubAnnouncement[]> {
    return db.select().from(clubAnnouncements)
      .where(eq(clubAnnouncements.clubId, clubId))
      .orderBy(desc(clubAnnouncements.createdAt));
  }

  async createAnnouncement(data: InsertClubAnnouncement): Promise<ClubAnnouncement> {
    const [created] = await db.insert(clubAnnouncements).values(data).returning();
    return created;
  }

  async deleteAnnouncement(id: string, clubId: string): Promise<void> {
    await db.delete(clubAnnouncements).where(
      and(eq(clubAnnouncements.id, id), eq(clubAnnouncements.clubId, clubId))
    );
  }

  async getClubMemberUserIds(clubId: string): Promise<string[]> {
    const rows = await db.select({ userId: joinRequests.userId })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")));
    return rows.map(r => r.userId).filter(Boolean) as string[];
  }

  async getClubPolls(clubId: string, viewerUserId?: string): Promise<(ClubPoll & { voteCounts: number[]; userVote: number | null })[]> {
    const polls = await db.select().from(clubPolls)
      .where(eq(clubPolls.clubId, clubId))
      .orderBy(desc(clubPolls.createdAt));
    const result = [];
    for (const poll of polls) {
      const allVotes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, poll.id));
      const voteCounts = (poll.options ?? []).map((_: string, idx: number) =>
        allVotes.filter(v => v.optionIndex === idx).length
      );
      const userVoteRow = viewerUserId
        ? allVotes.find(v => v.userId === viewerUserId)
        : undefined;
      result.push({ ...poll, voteCounts, userVote: userVoteRow?.optionIndex ?? null });
    }
    return result;
  }

  async createPoll(data: InsertClubPoll): Promise<ClubPoll> {
    const [created] = await db.insert(clubPolls).values(data).returning();
    return created;
  }

  async deletePoll(id: string, clubId: string): Promise<void> {
    await db.delete(clubPolls).where(and(eq(clubPolls.id, id), eq(clubPolls.clubId, clubId)));
  }

  async closePoll(id: string, clubId: string): Promise<void> {
    await db.update(clubPolls).set({ isOpen: false })
      .where(and(eq(clubPolls.id, id), eq(clubPolls.clubId, clubId)));
  }

  async castVote(pollId: string, userId: string, optionIndex: number): Promise<void> {
    const existing = await db.select().from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    if (existing.length > 0) {
      await db.update(pollVotes).set({ optionIndex })
        .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    } else {
      await db.insert(pollVotes).values({ pollId, userId, optionIndex });
    }
  }

  async addCoOrganiser(clubId: string, userId: string): Promise<void> {
    await db.update(clubs).set({
      coOrganiserUserIds: sql`array_append(coalesce(${clubs.coOrganiserUserIds}, ARRAY[]::text[]), ${userId})`
    }).where(eq(clubs.id, clubId));
  }

  async likeMoment(momentId: string, userId: string): Promise<void> {
    try {
      await db.insert(momentLikes).values({ momentId, userId });
      await db.update(clubMoments).set({ likesCount: sql`${clubMoments.likesCount} + 1` }).where(eq(clubMoments.id, momentId));
    } catch {
      // Unique constraint violation = already liked, ignore
    }
  }

  async unlikeMoment(momentId: string, userId: string): Promise<void> {
    const deleted = await db.delete(momentLikes).where(and(eq(momentLikes.momentId, momentId), eq(momentLikes.userId, userId))).returning();
    if (deleted.length > 0) {
      await db.update(clubMoments).set({ likesCount: sql`GREATEST(${clubMoments.likesCount} - 1, 0)` }).where(eq(clubMoments.id, momentId));
    }
  }

  async getMomentLikeStatus(momentId: string, userId: string): Promise<boolean> {
    const [row] = await db.select().from(momentLikes).where(and(eq(momentLikes.momentId, momentId), eq(momentLikes.userId, userId)));
    return !!row;
  }

  async getPublicClubMembers(clubId: string): Promise<{ userId: string | null; name: string; profileImageUrl: string | null; joinedAt: Date | null; isFoundingMember: boolean | null }[]> {
    const rows = await db.select({
      userId: joinRequests.userId,
      name: joinRequests.name,
      profileImageUrl: users.profileImageUrl,
      joinedAt: joinRequests.createdAt,
      isFoundingMember: joinRequests.isFoundingMember,
    }).from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")))
      .orderBy(joinRequests.createdAt)
      .limit(100);
    return rows;
  }

  async getUserFoundingClubs(userId: string): Promise<{ clubId: string; clubName: string; isFoundingMember: boolean | null }[]> {
    const rows = await db.select({
      clubId: joinRequests.clubId,
      clubName: joinRequests.clubName,
      isFoundingMember: joinRequests.isFoundingMember,
    }).from(joinRequests)
      .where(and(eq(joinRequests.userId, userId), eq(joinRequests.status, "approved")));
    return rows;
  }

  async getEventComments(eventId: string): Promise<EventComment[]> {
    return db.select().from(eventComments).where(eq(eventComments.eventId, eventId)).orderBy(eventComments.createdAt);
  }

  async createEventComment(eventId: string, userId: string, userName: string, userImageUrl: string | null, text: string): Promise<EventComment> {
    const [created] = await db.insert(eventComments).values({ eventId, userId, userName, userImageUrl, text }).returning();
    return created;
  }

  async approveJoinRequestWithFoundingCheck(requestId: string, clubId: string): Promise<JoinRequest | undefined> {
    const club = await this.getClub(clubId);
    if (!club) return undefined;
    const isFoundingMember = (club.foundingTaken ?? 0) < (club.foundingTotal ?? 20);
    const [updated] = await db.update(joinRequests)
      .set({ status: "approved", isFoundingMember })
      .where(eq(joinRequests.id, requestId))
      .returning();
    if (updated) {
      await this.incrementMemberCount(clubId);
    }
    return updated;
  }

  async autoJoinSampleClubs(userId: string): Promise<Club[]> {
    const sampleClubs = await db.select().from(clubs).orderBy(asc(clubs.createdAt)).limit(3);
    const joined: Club[] = [];
    for (const club of sampleClubs) {
      const existing = await this.hasExistingJoinRequest(club.id, userId);
      if (existing?.status === "approved") {
        joined.push(club);
        continue;
      }
      if (existing && existing.status !== "approved") {
        await db.update(joinRequests).set({ status: "approved", isFoundingMember: false }).where(eq(joinRequests.id, existing.id));
        await this.incrementMemberCount(club.id);
        joined.push(club);
        continue;
      }
      const [request] = await db.insert(joinRequests).values({
        clubId: club.id,
        clubName: club.name,
        userId,
        name: "Member",
        phone: "0000000000",
        status: "pending",
      }).returning();
      await this.approveJoinRequestWithFoundingCheck(request.id, club.id);
      joined.push(club);
    }
    return joined;
  }

  async removeCoOrganiser(clubId: string, userId: string): Promise<void> {
    await db.update(clubs).set({
      coOrganiserUserIds: sql`array_remove(coalesce(${clubs.coOrganiserUserIds}, ARRAY[]::text[]), ${userId})`
    }).where(eq(clubs.id, clubId));
  }

  async getUserAdminDetail(userId: string) {
    const userClubs = await db
      .select({ clubId: joinRequests.clubId, clubName: clubs.name, clubEmoji: clubs.emoji, joinedAt: joinRequests.createdAt })
      .from(joinRequests)
      .innerJoin(clubs, eq(joinRequests.clubId, clubs.id))
      .where(and(eq(joinRequests.userId, userId), eq(joinRequests.status, "approved")))
      .orderBy(desc(joinRequests.createdAt));

    const userEvents = await db
      .select({ id: events.id, title: events.title, startsAt: events.startsAt, clubName: clubs.name })
      .from(eventRsvps)
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(eq(eventRsvps.userId, userId))
      .orderBy(desc(events.startsAt))
      .limit(10);

    const userClubIds = userClubs.map(c => c.clubId);
    const userMoments = userClubIds.length > 0
      ? await db
          .select({ id: clubMoments.id, caption: clubMoments.caption, createdAt: clubMoments.createdAt })
          .from(clubMoments)
          .where(sql`${clubMoments.clubId} = ANY(${userClubIds})`)
          .orderBy(desc(clubMoments.createdAt))
          .limit(5)
      : [];

    const userJoinRequests = await db
      .select({ clubName: clubs.name, status: joinRequests.status, createdAt: joinRequests.createdAt })
      .from(joinRequests)
      .innerJoin(clubs, eq(joinRequests.clubId, clubs.id))
      .where(eq(joinRequests.userId, userId))
      .orderBy(desc(joinRequests.createdAt));

    return {
      clubs: userClubs,
      events: userEvents,
      moments: userMoments,
      joinRequests: userJoinRequests,
    };
  }

  async getAllPollsAdmin() {
    const allPolls = await db
      .select({
        id: clubPolls.id,
        clubId: clubPolls.clubId,
        clubName: clubs.name,
        clubEmoji: clubs.emoji,
        question: clubPolls.question,
        options: clubPolls.options,
        isOpen: clubPolls.isOpen,
        createdAt: clubPolls.createdAt,
      })
      .from(clubPolls)
      .innerJoin(clubs, eq(clubPolls.clubId, clubs.id))
      .orderBy(desc(clubPolls.createdAt));

    const result = await Promise.all(allPolls.map(async (poll) => {
      const allVotes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, poll.id));
      const votes = poll.options.map((_, i) => allVotes.filter(v => v.optionIndex === i).length);
      return { ...poll, votes, totalVotes: allVotes.length };
    }));

    return result;
  }

  async closePollAdmin(pollId: string): Promise<void> {
    await db.update(clubPolls).set({ isOpen: false }).where(eq(clubPolls.id, pollId));
  }

  async broadcastNotification(title: string, message: string, linkUrl?: string): Promise<number> {
    const allUsers = await db.select({ id: users.id }).from(users);
    await Promise.all(allUsers.map(u =>
      db.insert(notifications).values({
        userId: u.id,
        type: "broadcast",
        title,
        message,
        linkUrl: linkUrl || null,
        isRead: false,
      })
    ));
    return allUsers.length;
  }

  async getWeeklyGrowth(): Promise<{ week: string; users: number; events: number; moments: number }[]> {
    const weeks: { week: string; users: number; events: number; moments: number }[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const [uRow] = await db.select({ count: sql<number>`count(*)::int` })
        .from(users).where(and(gte(users.createdAt, weekStart), sql`${users.createdAt} < ${weekEnd}`));
      const [eRow] = await db.select({ count: sql<number>`count(*)::int` })
        .from(events).where(and(gte(events.createdAt, weekStart), sql`${events.createdAt} < ${weekEnd}`));
      const [mRow] = await db.select({ count: sql<number>`count(*)::int` })
        .from(clubMoments).where(and(gte(clubMoments.createdAt, weekStart), sql`${clubMoments.createdAt} < ${weekEnd}`));

      const label = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      weeks.push({ week: label, users: uRow.count, events: eRow.count, moments: mRow.count });
    }

    return weeks;
  }

  async updateClubHealth(clubId: string, status: string, label: string): Promise<void> {
    await db.update(clubs).set({ healthStatus: status, healthLabel: label }).where(eq(clubs.id, clubId));
  }

  async createKudo(data: { eventId: string; giverId: string; receiverId: string; kudoType: string }): Promise<Kudo> {
    const [kudo] = await db.insert(kudos).values(data).returning();
    return kudo;
  }

  async hasGivenKudo(eventId: string, giverId: string): Promise<boolean> {
    const [row] = await db.select({ id: kudos.id }).from(kudos)
      .where(and(eq(kudos.eventId, eventId), eq(kudos.giverId, giverId)));
    return !!row;
  }

  async getKudosByReceiver(userId: string): Promise<(Kudo & { eventTitle: string; eventStartsAt: Date })[]> {
    const rows = await db.select({
      id: kudos.id, eventId: kudos.eventId, giverId: kudos.giverId,
      receiverId: kudos.receiverId, kudoType: kudos.kudoType, createdAt: kudos.createdAt,
      eventTitle: events.title, eventStartsAt: events.startsAt,
    }).from(kudos)
      .innerJoin(events, eq(kudos.eventId, events.id))
      .where(eq(kudos.receiverId, userId))
      .orderBy(desc(kudos.createdAt));
    return rows as any;
  }

  async getEventAttendeesForKudo(eventId: string, excludeUserId: string): Promise<{ userId: string; userName: string | null }[]> {
    const rows = await db.select({
      userId: eventRsvps.userId,
      userName: users.firstName,
    }).from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.checkedIn, true),
        ne(eventRsvps.userId, excludeUserId),
      ));
    return rows.map(r => ({ userId: r.userId, userName: r.userName }));
  }



  async getPageSections(clubId: string): Promise<ClubPageSection[]> {
    return db.select().from(clubPageSections)
      .where(eq(clubPageSections.clubId, clubId))
      .orderBy(asc(clubPageSections.position));
  }

  async createPageSection(data: InsertClubPageSection): Promise<ClubPageSection> {
    const [created] = await db.insert(clubPageSections).values(data).returning();
    return created;
  }

  async updatePageSection(id: string, data: Partial<InsertClubPageSection>): Promise<ClubPageSection | undefined> {
    const [updated] = await db.update(clubPageSections).set(data).where(eq(clubPageSections.id, id)).returning();
    return updated;
  }

  async deletePageSection(id: string): Promise<void> {
    await db.delete(sectionEvents).where(eq(sectionEvents.sectionId, id));
    await db.delete(clubPageSections).where(eq(clubPageSections.id, id));
  }

  async reorderPageSections(clubId: string, sectionIds: string[]): Promise<void> {
    for (let i = 0; i < sectionIds.length; i++) {
      await db.update(clubPageSections)
        .set({ position: i })
        .where(and(eq(clubPageSections.id, sectionIds[i]), eq(clubPageSections.clubId, clubId)));
    }
  }

  async getSectionEvents(sectionId: string): Promise<(SectionEvent & { eventTitle: string; eventStartsAt: Date; eventLocation: string })[]> {
    const rows = await db.select({
      id: sectionEvents.id,
      sectionId: sectionEvents.sectionId,
      eventId: sectionEvents.eventId,
      position: sectionEvents.position,
      createdAt: sectionEvents.createdAt,
      eventTitle: events.title,
      eventStartsAt: events.startsAt,
      eventLocation: events.locationText,
    })
      .from(sectionEvents)
      .innerJoin(events, eq(sectionEvents.eventId, events.id))
      .where(eq(sectionEvents.sectionId, sectionId))
      .orderBy(asc(sectionEvents.position));
    return rows as any;
  }

  async addSectionEvent(sectionId: string, eventId: string, position: number): Promise<SectionEvent> {
    const [created] = await db.insert(sectionEvents).values({ sectionId, eventId, position }).returning();
    return created;
  }

  async removeSectionEvent(id: string): Promise<void> {
    await db.delete(sectionEvents).where(eq(sectionEvents.id, id));
  }

  async getPublicPageData(clubId: string): Promise<{
    club: Club;
    sections: (ClubPageSection & { events: { id: string; eventId: string; title: string; startsAt: Date; location: string; position: number }[] })[];
    announcements: ClubAnnouncement[];
    schedule: ClubScheduleEntry[];
    moments: ClubMoment[];
    memberCount: number;
    upcomingEventCount: number;
    pastEventCount: number;
    rating: number | null;
  }> {
    const club = await this.getClub(clubId);
    if (!club) throw new Error("Club not found");

    const sections = await this.getPageSections(clubId);
    const sectionsWithEvents = await Promise.all(
      sections.filter(s => s.isVisible !== false).map(async (s) => {
        const evts = await this.getSectionEvents(s.id);
        return {
          ...s,
          events: evts.map(e => ({
            id: e.id,
            eventId: e.eventId,
            title: e.eventTitle,
            startsAt: e.eventStartsAt,
            location: e.eventLocation,
            position: e.position,
          })),
        };
      })
    );

    const announcements = await this.getClubAnnouncements(clubId);
    const schedule = await this.getClubSchedule(clubId);
    const moments = (await this.getClubMoments(clubId)).slice(0, 6);

    const now = new Date();
    const clubEvents = await this.getEventsByClub(clubId);
    const activeEvents = clubEvents.filter(e => !e.isCancelled);
    const upcomingEventCount = activeEvents.filter(e => new Date(e.startsAt) > now).length;
    const pastEventCount = activeEvents.filter(e => new Date(e.startsAt) <= now).length;

    return {
      club,
      sections: sectionsWithEvents,
      announcements,
      schedule,
      moments,
      memberCount: club.memberCount,
      upcomingEventCount,
      pastEventCount,
      rating: await (async () => {
        const { average, count } = await this.getClubAverageRating(clubId);
        return count > 0 ? average : null;
      })(),
    };
  }

  async createClubProposal(data: InsertClubProposal): Promise<ClubProposal> {
    const [created] = await db.insert(clubProposals).values(data).returning();
    return created;
  }

  async getClubProposalsByUser(userId: string): Promise<ClubProposal[]> {
    return db.select().from(clubProposals).where(eq(clubProposals.userId, userId)).orderBy(desc(clubProposals.createdAt));
  }

  async getAllClubProposals(): Promise<(ClubProposal & { userName: string | null; userEmail: string | null })[]> {
    const rows = await db
      .select({
        id: clubProposals.id,
        userId: clubProposals.userId,
        clubName: clubProposals.clubName,
        category: clubProposals.category,
        vibe: clubProposals.vibe,
        shortDesc: clubProposals.shortDesc,
        city: clubProposals.city,
        schedule: clubProposals.schedule,
        motivation: clubProposals.motivation,
        status: clubProposals.status,
        reviewNote: clubProposals.reviewNote,
        createdAt: clubProposals.createdAt,
        userName: users.firstName,
        userEmail: users.email,
      })
      .from(clubProposals)
      .leftJoin(users, eq(clubProposals.userId, users.id))
      .orderBy(desc(clubProposals.createdAt));
    return rows;
  }

  async updateClubProposalStatus(id: string, status: string, reviewNote?: string): Promise<ClubProposal | undefined> {
    const updateData: Record<string, any> = { status };
    if (reviewNote !== undefined) updateData.reviewNote = reviewNote;
    const [updated] = await db.update(clubProposals).set(updateData).where(eq(clubProposals.id, id)).returning();
    return updated;
  }

  async getClubProposal(id: string): Promise<ClubProposal | undefined> {
    const [proposal] = await db.select().from(clubProposals).where(eq(clubProposals.id, id));
    return proposal;
  }

  async getPendingProposalCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(clubProposals).where(eq(clubProposals.status, "pending"));
    return result?.count ?? 0;
  }

  async getClubMembersEnriched(clubId: string): Promise<{ id: string; userId: string | null; name: string; phone: string; profileImageUrl: string | null; bio: string | null; city: string | null; interests: string[] | null; joinedAt: Date | null; isFoundingMember: boolean | null; eventsAttended: number }[]> {
    const attendanceSubquery = db
      .select({
        userId: eventRsvps.userId,
        count: sql<number>`count(*)::int`.as("count"),
      })
      .from(eventRsvps)
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .where(and(eq(events.clubId, clubId), eq(eventRsvps.checkedIn, true)))
      .groupBy(eventRsvps.userId)
      .as("attendance");

    const rows = await db
      .select({
        id: joinRequests.id,
        userId: joinRequests.userId,
        name: joinRequests.name,
        phone: joinRequests.phone,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        city: users.city,
        interests: users.interests,
        joinedAt: joinRequests.createdAt,
        isFoundingMember: joinRequests.isFoundingMember,
        eventsAttended: sql<number>`coalesce(${attendanceSubquery.count}, 0)`.as("events_attended"),
      })
      .from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .leftJoin(attendanceSubquery, eq(joinRequests.userId, attendanceSubquery.userId))
      .where(and(eq(joinRequests.clubId, clubId), eq(joinRequests.status, "approved")))
      .orderBy(desc(joinRequests.createdAt));

    return rows;
  }

  async getEventAttendanceReport(eventId: string, clubId: string): Promise<{ userId: string; userName: string | null; status: string; checkedIn: boolean | null; checkedInAt: Date | null; phone: string | null }[]> {
    const rows = await db.select({
      userId: eventRsvps.userId,
      userName: users.firstName,
      status: eventRsvps.status,
      checkedIn: eventRsvps.checkedIn,
      checkedInAt: eventRsvps.checkedInAt,
      phone: joinRequests.phone,
    })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .leftJoin(joinRequests, and(
        eq(eventRsvps.userId, joinRequests.userId),
        eq(joinRequests.clubId, clubId),
        eq(joinRequests.status, "approved"),
      ))
      .where(eq(eventRsvps.eventId, eventId))
      .orderBy(asc(eventRsvps.status), asc(users.firstName));
    return rows;
  }
}

export const storage = new DatabaseStorage();

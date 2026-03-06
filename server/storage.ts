import {
  type Club, type InsertClub,
  type JoinRequest, type InsertJoinRequest, type User,
  type QuizAnswers, type InsertQuizAnswers, type Event, type InsertEvent,
  type EventRsvp, type InsertEventRsvp,
  type ClubRating, type ClubFaq, type ClubScheduleEntry, type ClubMoment,
  type Notification, type InsertNotification,
  clubs, joinRequests, users, userQuizAnswers, events, eventRsvps,
  clubRatings, clubFaqs, clubScheduleEntries, clubMoments, notifications
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, ilike, or, ne } from "drizzle-orm";

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
  getPendingJoinRequestCount(clubId: string): Promise<number>;
  getApprovedMembersByClub(clubId: string): Promise<JoinRequest[]>;
  hasExistingJoinRequest(clubId: string, userId: string): Promise<JoinRequest | undefined>;
  getClubsByCreator(creatorUserId: string): Promise<Club[]>;
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  saveQuizAnswers(answers: InsertQuizAnswers): Promise<QuizAnswers>;
  getQuizAnswers(userId: string): Promise<QuizAnswers | undefined>;
  searchClubs(params: { search?: string; category?: string; city?: string; vibe?: string }): Promise<Club[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByClub(clubId: string): Promise<Event[]>;
  getUpcomingEvents(city?: string, limit?: number): Promise<(Event & { clubName: string; clubEmoji: string; rsvpCount: number })[]>;
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
  getClubMoments(clubId: string): Promise<ClubMoment[]>;
  createMoment(clubId: string, caption: string, emoji?: string): Promise<ClubMoment>;
  deleteMoment(id: string): Promise<void>;
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
  getMembersPreview(clubId: string, limit?: number): Promise<{ name: string; profileImageUrl: string | null }[]>;
  getAdminAnalytics(): Promise<{ totalUsers: number; totalClubs: number; activeClubs: number; totalEvents: number; totalRsvps: number; totalCheckins: number; cityCounts: { city: string; count: number }[] }>;
  getAllUsers(): Promise<{ id: string; email: string | null; firstName: string | null; city: string | null; role: string | null; createdAt: Date | null; clubCount: number }[]>;
  getAllEventsAdmin(): Promise<{ id: string; title: string; clubName: string; clubEmoji: string; startsAt: Date; rsvpCount: number; checkedInCount: number; isCancelled: boolean | null; maxCapacity: number }[]>;
  getOrganizerInsights(clubId: string): Promise<{ totalMembers: number; pendingRequests: number; totalEvents: number; avgAttendanceRate: number; topEvent: { title: string; attended: number; total: number } | null; recentJoins: { name: string; date: Date | null }[]; recentRsvps: { userName: string; eventTitle: string; date: Date | null }[] }>;
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

  async searchClubs(params: { search?: string; category?: string; city?: string; vibe?: string }): Promise<Club[]> {
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

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
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
      .limit(limit);

    return baseQuery;
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

  async getClubMoments(clubId: string): Promise<ClubMoment[]> {
    return db.select().from(clubMoments).where(eq(clubMoments.clubId, clubId)).orderBy(desc(clubMoments.createdAt));
  }

  async createMoment(clubId: string, caption: string, emoji?: string): Promise<ClubMoment> {
    const [created] = await db.insert(clubMoments).values({ clubId, caption, emoji: emoji || null }).returning();
    return created;
  }

  async deleteMoment(id: string): Promise<void> {
    await db.delete(clubMoments).where(eq(clubMoments.id, id));
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

  async getMembersPreview(clubId: string, limit = 10): Promise<{ name: string; profileImageUrl: string | null }[]> {
    const results = await db.select({
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
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [clubCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clubs);
    const [activeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clubs).where(ne(clubs.isActive, false));
    const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(events);
    const [rsvpCount] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRsvps);
    const [checkinCount] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRsvps).where(eq(eventRsvps.checkedIn, true));

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
      cityCounts: cityRows.map(r => ({ city: r.city, count: r.count })),
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
      let totalRate = 0;
      let ratedEvents = 0;
      let bestAttendance = -1;

      for (const ev of clubEvents) {
        const [rsvpC] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRsvps).where(eq(eventRsvps.eventId, ev.id));
        const [checkinC] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRsvps).where(and(eq(eventRsvps.eventId, ev.id), eq(eventRsvps.checkedIn, true)));
        if (rsvpC.count > 0) {
          const rate = checkinC.count / rsvpC.count;
          totalRate += rate;
          ratedEvents++;
          if (checkinC.count > bestAttendance) {
            bestAttendance = checkinC.count;
            topEvent = { title: ev.title, attended: checkinC.count, total: rsvpC.count };
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
}

export const storage = new DatabaseStorage();

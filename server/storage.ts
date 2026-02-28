import {
  type Club, type InsertClub, type ClubSubmission, type InsertClubSubmission,
  type JoinRequest, type InsertJoinRequest, type User, type InsertUser,
  type QuizAnswers, type InsertQuizAnswers, type Event, type InsertEvent,
  type EventRsvp, type InsertEventRsvp,
  clubs, clubSubmissions, joinRequests, users, userQuizAnswers, events, eventRsvps
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, ilike, or } from "drizzle-orm";

export interface IStorage {
  getClubs(): Promise<Club[]>;
  getClubsByCategory(category: string): Promise<Club[]>;
  getClub(id: string): Promise<Club | undefined>;
  createClub(club: InsertClub): Promise<Club>;
  updateClub(id: string, data: Partial<InsertClub>): Promise<Club | undefined>;
  incrementMemberCount(clubId: string): Promise<Club | undefined>;
  createClubSubmission(submission: InsertClubSubmission): Promise<ClubSubmission>;
  getClubSubmission(id: string): Promise<ClubSubmission | undefined>;
  getClubSubmissions(): Promise<ClubSubmission[]>;
  createJoinRequest(request: InsertJoinRequest): Promise<JoinRequest>;
  getJoinRequests(): Promise<JoinRequest[]>;
  getJoinRequestsByClub(clubId: string): Promise<JoinRequest[]>;
  getJoinRequestsByPhone(phone: string): Promise<JoinRequest[]>;
  markJoinRequestDone(id: string): Promise<JoinRequest | undefined>;
  markClubSubmissionDone(id: string): Promise<ClubSubmission | undefined>;
  getClubByWhatsapp(whatsappNumber: string): Promise<Club | undefined>;
  getClubsByOrganizer(whatsappNumber: string): Promise<Club[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createOrUpdateUserByPhone(phone: string, name: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
  checkInRsvp(eventId: string, userId: string): Promise<EventRsvp | undefined>;
  getCheckedInCount(eventId: string): Promise<number>;
  getEventAttendees(eventId: string): Promise<(EventRsvp & { userName: string | null; checkedIn: boolean | null; checkedInAt: Date | null })[]>;
  getClubActivity(clubId: string): Promise<{ recentJoins: number; recentJoinNames: string[]; totalEvents: number; lastEventDate: Date | null }>;
  getRecentActivityFeed(limit?: number): Promise<{ name: string; clubName: string; clubEmoji: string; createdAt: Date | null }[]>;
  getClubsWithRecentJoins(): Promise<Record<string, number>>;
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

  async createClubSubmission(submission: InsertClubSubmission): Promise<ClubSubmission> {
    const [created] = await db.insert(clubSubmissions).values(submission).returning();
    return created;
  }

  async getClubSubmission(id: string): Promise<ClubSubmission | undefined> {
    const [submission] = await db.select().from(clubSubmissions).where(eq(clubSubmissions.id, id));
    return submission;
  }

  async getClubSubmissions(): Promise<ClubSubmission[]> {
    return db.select().from(clubSubmissions).orderBy(desc(clubSubmissions.createdAt));
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

  async markClubSubmissionDone(id: string): Promise<ClubSubmission | undefined> {
    const [updated] = await db.update(clubSubmissions).set({ markedDone: true }).where(eq(clubSubmissions.id, id)).returning();
    return updated;
  }

  async getClubByWhatsapp(whatsappNumber: string): Promise<Club | undefined> {
    const [club] = await db.select().from(clubs).where(eq(clubs.whatsappNumber, whatsappNumber));
    return club;
  }

  async getClubsByOrganizer(whatsappNumber: string): Promise<Club[]> {
    return db.select().from(clubs).where(eq(clubs.whatsappNumber, whatsappNumber));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createOrUpdateUserByPhone(phone: string, name: string): Promise<User> {
    const existing = await this.getUserByPhone(phone);
    if (existing) {
      const [updated] = await db.update(users).set({ name }).where(eq(users.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(users).values({
      username: `user_${phone}`,
      password: "otp_auth",
      phone,
      name,
    }).returning();
    return created;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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
      createdAt: events.createdAt,
      clubName: clubs.name,
      clubEmoji: clubs.emoji,
      rsvpCount: sql<number>`(SELECT COUNT(*) FROM event_rsvps WHERE event_rsvps.event_id = events.id AND event_rsvps.status = 'going')::int`,
    })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(
        city && city !== "All Cities"
          ? and(gte(events.startsAt, now), eq(clubs.city, city))
          : gte(events.startsAt, now)
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
      userName: users.name,
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
      count: sql<number>`(SELECT COUNT(DISTINCT phone) FROM join_requests)::int`,
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

  async checkInRsvp(eventId: string, userId: string): Promise<EventRsvp | undefined> {
    const [updated] = await db.update(eventRsvps)
      .set({ checkedIn: true, checkedInAt: new Date() })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId), eq(eventRsvps.status, "going")))
      .returning();
    return updated;
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
      userName: users.name,
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
    }).from(joinRequests).where(and(eq(joinRequests.clubId, clubId), gte(joinRequests.createdAt, sevenDaysAgo)));

    const recentNames = await db.select({ name: joinRequests.name })
      .from(joinRequests)
      .where(and(eq(joinRequests.clubId, clubId), gte(joinRequests.createdAt, sevenDaysAgo)))
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
      .where(gte(joinRequests.createdAt, sevenDaysAgo))
      .groupBy(joinRequests.clubId);

    return Object.fromEntries(results.map(r => [r.clubId, r.count]));
  }
}

export const storage = new DatabaseStorage();

import { type Club, type InsertClub, type ClubSubmission, type InsertClubSubmission, type JoinRequest, type InsertJoinRequest, type User, type InsertUser, clubs, clubSubmissions, joinRequests, users } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getClubs(): Promise<Club[]>;
  getClubsByCategory(category: string): Promise<Club[]>;
  getClub(id: string): Promise<Club | undefined>;
  createClub(club: InsertClub): Promise<Club>;
  updateClub(id: string, data: Partial<InsertClub>): Promise<Club | undefined>;
  incrementMemberCount(clubId: string): Promise<Club | undefined>;
  createClubSubmission(submission: InsertClubSubmission): Promise<ClubSubmission>;
  getClubSubmissions(): Promise<ClubSubmission[]>;
  createJoinRequest(request: InsertJoinRequest): Promise<JoinRequest>;
  getJoinRequests(): Promise<JoinRequest[]>;
  getJoinRequestsByClub(clubId: string): Promise<JoinRequest[]>;
  markJoinRequestDone(id: string): Promise<JoinRequest | undefined>;
  markClubSubmissionDone(id: string): Promise<ClubSubmission | undefined>;
  getClubByWhatsapp(whatsappNumber: string): Promise<Club | undefined>;
  getClubsByOrganizer(whatsappNumber: string): Promise<Club[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createOrUpdateUserByPhone(phone: string, name: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
}

export const storage = new DatabaseStorage();

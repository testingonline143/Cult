import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  emoji: text("emoji").notNull(),
  shortDesc: text("short_desc").notNull(),
  fullDesc: text("full_desc").notNull(),
  organizerName: text("organizer_name").notNull(),
  organizerYears: text("organizer_years"),
  organizerAvatar: text("organizer_avatar"),
  organizerResponse: text("organizer_response"),
  memberCount: integer("member_count").notNull().default(0),
  schedule: text("schedule").notNull(),
  location: text("location").notNull(),
  activeSince: text("active_since"),
  whatsappNumber: text("whatsapp_number"),
  healthStatus: text("health_status").notNull().default("green"),
  healthLabel: text("health_label").notNull().default("Very Active"),
  lastActive: text("last_active"),
  foundingTaken: integer("founding_taken").default(0),
  foundingTotal: integer("founding_total").default(20),
  bgColor: text("bg_color"),
  timeOfDay: text("time_of_day").notNull().default("morning"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const joinRequests = pgTable("join_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull(),
  clubName: text("club_name").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  markedDone: boolean("marked_done").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clubSubmissions = pgTable("club_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubName: text("club_name").notNull(),
  organizerName: text("organizer_name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  category: text("category").notNull(),
  meetupFrequency: text("meetup_frequency"),
  markedDone: boolean("marked_done").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  name: text("name"),
});

export const insertClubSchema = createInsertSchema(clubs).omit({ id: true, createdAt: true });
export const insertJoinRequestSchema = createInsertSchema(joinRequests).omit({ id: true, createdAt: true });
export const insertClubSubmissionSchema = createInsertSchema(clubSubmissions).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });

export type Club = typeof clubs.$inferSelect;
export type InsertClub = z.infer<typeof insertClubSchema>;
export type JoinRequest = typeof joinRequests.$inferSelect;
export type InsertJoinRequest = z.infer<typeof insertJoinRequestSchema>;
export type ClubSubmission = typeof clubSubmissions.$inferSelect;
export type InsertClubSubmission = z.infer<typeof insertClubSubmissionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const CATEGORIES = [
  "Trekking",
  "Books",
  "Cycling",
  "Photography",
  "Fitness",
  "Art",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  Trekking: "🏔️",
  Books: "📚",
  Cycling: "🚴",
  Photography: "📷",
  Fitness: "💪",
  Art: "🎨",
};

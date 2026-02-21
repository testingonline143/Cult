import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  emoji: text("emoji").notNull(),
  schedule: text("schedule").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  meetingPoint: text("meeting_point").notNull(),
  activityLevel: text("activity_level").notNull().default("Moderate"),
  foundingSpots: integer("founding_spots"),
  timeOfDay: text("time_of_day").notNull().default("morning"),
  imageUrl: text("image_url"),
  organizerName: text("organizer_name"),
  organizerYears: integer("organizer_years"),
  responseTime: text("response_time"),
  lastMet: text("last_met"),
});

export const clubSubmissions = pgTable("club_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubName: text("club_name").notNull(),
  organizerName: text("organizer_name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({ id: true });
export const insertClubSubmissionSchema = createInsertSchema(clubSubmissions).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });

export type Club = typeof clubs.$inferSelect;
export type InsertClub = z.infer<typeof insertClubSchema>;
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
  "Writing",
  "Music",
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  Trekking: "mountain",
  Books: "book-open",
  Cycling: "bike",
  Photography: "camera",
  Fitness: "dumbbell",
  Art: "palette",
  Writing: "pen-tool",
  Music: "music",
};

export type Category = (typeof CATEGORIES)[number];

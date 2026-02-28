import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export { users, sessions } from "./models/auth";
export type { User, UpsertUser } from "./models/auth";

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
  city: text("city").notNull().default("Tirupati"),
  vibe: text("vibe").notNull().default("casual"),
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
  highlights: text("highlights").array(),
  creatorUserId: varchar("creator_user_id"),
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

export const userQuizAnswers = pgTable("user_quiz_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  interests: text("interests").array().notNull(),
  experienceLevel: text("experience_level").notNull(),
  vibePreference: text("vibe_preference").notNull(),
  availability: text("availability").array().notNull(),
  collegeOrWork: text("college_or_work"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  locationText: text("location_text").notNull(),
  locationUrl: text("location_url"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  maxCapacity: integer("max_capacity").notNull(),
  coverImageUrl: text("cover_image_url"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("going"),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({ id: true, createdAt: true });
export const insertJoinRequestSchema = createInsertSchema(joinRequests).omit({ id: true, createdAt: true });
export const insertQuizAnswersSchema = createInsertSchema(userQuizAnswers).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true, createdAt: true });

export type Club = typeof clubs.$inferSelect;
export type InsertClub = z.infer<typeof insertClubSchema>;
export type JoinRequest = typeof joinRequests.$inferSelect;
export type InsertJoinRequest = z.infer<typeof insertJoinRequestSchema>;
export type QuizAnswers = typeof userQuizAnswers.$inferSelect;
export type InsertQuizAnswers = z.infer<typeof insertQuizAnswersSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;

export const CATEGORIES = [
  "Trekking",
  "Books",
  "Cycling",
  "Photography",
  "Fitness",
  "Art",
  "Football",
  "Cricket",
  "Chess",
  "Music",
  "Gaming",
  "Dance",
  "Cooking",
  "Yoga",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  Trekking: "🏔️",
  Books: "📚",
  Cycling: "🚴",
  Photography: "📷",
  Fitness: "💪",
  Art: "🎨",
  Football: "⚽",
  Cricket: "🏏",
  Chess: "♟️",
  Music: "🎵",
  Gaming: "🎮",
  Dance: "💃",
  Cooking: "🍳",
  Yoga: "🧘",
};

export const CITIES = [
  "Tirupati",
  "Chennai",
  "Bengaluru",
  "Hyderabad",
  "Kochi",
] as const;

export type City = (typeof CITIES)[number];

export const HOBBY_ICONS: { name: string; emoji: string }[] = [
  { name: "Football", emoji: "⚽" },
  { name: "Cricket", emoji: "🏏" },
  { name: "Chess", emoji: "♟️" },
  { name: "Music", emoji: "🎵" },
  { name: "Books", emoji: "📚" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Dance", emoji: "💃" },
  { name: "Photography", emoji: "📷" },
  { name: "Trekking", emoji: "🏔️" },
  { name: "Art", emoji: "🎨" },
  { name: "Cooking", emoji: "🍳" },
  { name: "Yoga", emoji: "🧘" },
];

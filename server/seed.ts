import { db } from "./db";
import { clubs } from "@shared/schema";
import { log } from "./index";

const SEED_CLUBS = [
  {
    name: "Tirumala Trekkers",
    description: "Weekly treks around Tirumala hills, Talakona waterfalls, and the Eastern Ghats. All fitness levels welcome. We provide guidance for beginners and challenging routes for experienced trekkers.",
    category: "Trekking",
    emoji: "mountain",
    schedule: "Every Sunday, 6:00 AM",
    memberCount: 84,
    meetingPoint: "Alipiri Gate",
    activityLevel: "Very Active",
    foundingSpots: 4,
    timeOfDay: "morning",
    organizerName: "Ravi Kumar",
    organizerYears: 3,
    responseTime: "within 2 hrs",
    lastMet: "3 days ago",
  },
  {
    name: "Tirupati Reads",
    description: "A warm book club meeting monthly to discuss fiction, non-fiction, and Telugu literature. Come for the books, stay for the chai and conversations that follow.",
    category: "Books",
    emoji: "book-open",
    schedule: "First Saturday, 5:00 PM",
    memberCount: 52,
    meetingPoint: "Cafe Tirupati",
    activityLevel: "Very Active",
    foundingSpots: 9,
    timeOfDay: "evening",
    organizerName: "Priya Sharma",
    organizerYears: 2,
    responseTime: "within 4 hrs",
    lastMet: "1 week ago",
  },
  {
    name: "Tirupati Cyclists",
    description: "Early morning rides through Tirupati city and surrounding villages. Routes from 20km to 60km. Helmets mandatory, good vibes guaranteed.",
    category: "Cycling",
    emoji: "bike",
    schedule: "Sat & Sun, 5:30 AM",
    memberCount: 67,
    meetingPoint: "RTC Bus Stand",
    activityLevel: "Very Active",
    foundingSpots: 6,
    timeOfDay: "morning",
    organizerName: "Venkat Reddy",
    organizerYears: 4,
    responseTime: "within 1 hr",
    lastMet: "2 days ago",
  },
  {
    name: "Lens & Light Tirupati",
    description: "Photography walks around Tirupati's temples, markets, and nature. Phone cameras to DSLRs welcome. Monthly photo walks plus editing workshops and print exhibitions.",
    category: "Photography",
    emoji: "camera",
    schedule: "2nd Sunday, 6:00 AM",
    memberCount: 39,
    meetingPoint: "Govindaraja Temple Gate",
    activityLevel: "Moderate",
    foundingSpots: 12,
    timeOfDay: "morning",
    organizerName: "Anitha Devi",
    organizerYears: 2,
    responseTime: "within 6 hrs",
    lastMet: "2 weeks ago",
  },
  {
    name: "Tirupati Fitness Tribe",
    description: "Outdoor bootcamp, yoga, and running at Bairagipatteda Park. Free community fitness for all ages and levels. No equipment needed, just show up ready to move.",
    category: "Fitness",
    emoji: "dumbbell",
    schedule: "Mon-Sat, 6:00 AM",
    memberCount: 120,
    meetingPoint: "Bairagipatteda Park",
    activityLevel: "Very Active",
    foundingSpots: null,
    timeOfDay: "morning",
    organizerName: "Suresh Babu",
    organizerYears: 5,
    responseTime: "within 1 hr",
    lastMet: "today",
  },
  {
    name: "Telugu Writers Circle",
    description: "For aspiring Telugu writers — poetry, short stories, essays. Share your work in a safe, encouraging space. Monthly anthology publications and open mic events.",
    category: "Books",
    emoji: "pen-tool",
    schedule: "3rd Sunday, 4:00 PM",
    memberCount: 28,
    meetingPoint: "District Library",
    activityLevel: "Moderate",
    foundingSpots: 14,
    timeOfDay: "evening",
    organizerName: "Lakshmi Naidu",
    organizerYears: 1,
    responseTime: "within 8 hrs",
    lastMet: "3 weeks ago",
  },
  {
    name: "Tirupati Sketchers",
    description: "Urban sketching and watercolour sessions across Tirupati's temples, streets, and markets. Bring your sketchbook and discover the city through art.",
    category: "Art",
    emoji: "palette",
    schedule: "2nd & 4th Sunday, 9:00 AM",
    memberCount: 22,
    meetingPoint: "TTD Kalyanamastu",
    activityLevel: "Quiet",
    foundingSpots: 16,
    timeOfDay: "weekends",
    organizerName: "Kiran Mohan",
    organizerYears: 1,
    responseTime: "within 12 hrs",
    lastMet: "1 month ago",
  },
];

export async function seedDatabase() {
  try {
    const existing = await db.select().from(clubs);
    if (existing.length > 0) {
      log("Database already seeded, skipping...", "seed");
      return;
    }

    await db.insert(clubs).values(SEED_CLUBS);
    log(`Seeded ${SEED_CLUBS.length} clubs`, "seed");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSubmissionSchema, insertJoinRequestSchema, insertQuizAnswersSchema, insertEventSchema, CATEGORY_EMOJI } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const MOCK_OTP = "123456";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/clubs", async (req, res) => {
    try {
      const { category, search, city, vibe } = req.query as Record<string, string | undefined>;
      if (search || city || vibe || (category && category !== "all")) {
        const clubs = await storage.searchClubs({ search, category, city, vibe });
        return res.json(clubs);
      }
      const clubs = await storage.getClubs();
      res.json(clubs);
    } catch (err) {
      console.error("Error fetching clubs:", err);
      res.status(500).json({ message: "Failed to fetch clubs" });
    }
  });

  app.get("/api/clubs/:id", async (req, res) => {
    try {
      const club = await storage.getClub(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }
      res.json(club);
    } catch (err) {
      console.error("Error fetching club:", err);
      res.status(500).json({ message: "Failed to fetch club" });
    }
  });

  app.post("/api/join", async (req, res) => {
    try {
      const validated = insertJoinRequestSchema.parse(req.body);
      if (!validated.name || validated.name.length < 2) {
        return res.status(400).json({ success: false, message: "Name is required (minimum 2 characters)" });
      }
      if (!validated.phone || validated.phone.replace(/\D/g, "").length < 10) {
        return res.status(400).json({ success: false, message: "Phone is required (minimum 10 digits)" });
      }
      const request = await storage.createJoinRequest(validated);
      const updatedClub = await storage.incrementMemberCount(validated.clubId);
      res.json({ success: true, message: "Request saved", data: request, club: updatedClub });
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      console.error("Error creating join request:", err);
      res.status(500).json({ success: false, message: "Failed to save join request" });
    }
  });

  app.get("/api/admin/join-requests", async (_req, res) => {
    try {
      const requests = await storage.getJoinRequests();
      res.json(requests);
    } catch (err) {
      console.error("Error fetching join requests:", err);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.get("/api/admin/club-submissions", async (_req, res) => {
    try {
      const submissions = await storage.getClubSubmissions();
      res.json(submissions);
    } catch (err) {
      console.error("Error fetching club submissions:", err);
      res.status(500).json({ message: "Failed to fetch club submissions" });
    }
  });

  app.patch("/api/admin/join-requests/:id/done", async (req, res) => {
    try {
      const updated = await storage.markJoinRequestDone(req.params.id);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error marking join request done:", err);
      res.status(500).json({ message: "Failed to update" });
    }
  });

  app.patch("/api/admin/club-submissions/:id/done", async (req, res) => {
    try {
      const updated = await storage.markClubSubmissionDone(req.params.id);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error marking submission done:", err);
      res.status(500).json({ message: "Failed to update" });
    }
  });

  app.post("/api/admin/club-submissions/:id/approve", async (req, res) => {
    try {
      const submission = await storage.getClubSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ success: false, message: "Submission not found" });
      }
      if (submission.markedDone) {
        return res.status(400).json({ success: false, message: "Submission already processed" });
      }
      const emoji = CATEGORY_EMOJI[submission.category] || "🎯";
      const club = await storage.createClub({
        name: submission.clubName,
        category: submission.category,
        emoji,
        shortDesc: `New ${submission.category.toLowerCase()} club in Tirupati. ${submission.meetupFrequency ? `Meets ${submission.meetupFrequency}.` : ""}`.trim(),
        fullDesc: `${submission.clubName} is a newly formed ${submission.category.toLowerCase()} community in Tirupati, organized by ${submission.organizerName}. Join us and be a founding member!`,
        organizerName: submission.organizerName,
        organizerYears: "New organizer",
        organizerAvatar: "🧑",
        organizerResponse: "Responds within 24 hrs",
        memberCount: 1,
        schedule: submission.meetupFrequency || "To be announced",
        location: "Tirupati",
        city: "Tirupati",
        vibe: "casual",
        activeSince: new Date().getFullYear().toString(),
        whatsappNumber: submission.whatsappNumber,
        healthStatus: "green",
        healthLabel: "Very Active",
        lastActive: "Just started",
        foundingTaken: 1,
        foundingTotal: 20,
        bgColor: "#f0f9f0",
        timeOfDay: "morning",
        isActive: true,
      });
      await storage.markClubSubmissionDone(submission.id);
      res.json({ success: true, message: "Club created and live!", club });
    } catch (err) {
      console.error("Error approving submission:", err);
      res.status(500).json({ success: false, message: "Failed to approve submission" });
    }
  });

  app.post("/api/club-submissions", async (req, res) => {
    try {
      const validated = insertClubSubmissionSchema.parse(req.body);
      const submission = await storage.createClubSubmission(validated);
      res.status(201).json({ success: true, message: "Submission received", data: submission });
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      console.error("Error creating club submission:", err);
      res.status(500).json({ success: false, message: "Failed to submit club" });
    }
  });

  // OTP Auth
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone || phone.replace(/\D/g, "").length < 10) {
        return res.status(400).json({ success: false, message: "Valid phone number required" });
      }
      otpStore.set(phone, { otp: MOCK_OTP, expiresAt: Date.now() + 5 * 60 * 1000 });
      console.log(`OTP for ${phone}: ${MOCK_OTP}`);
      res.json({ success: true, message: "OTP sent" });
    } catch (err) {
      console.error("Error sending OTP:", err);
      res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, otp, name, city } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone and OTP required" });
      }
      const stored = otpStore.get(phone);
      if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }
      otpStore.delete(phone);
      const user = await storage.createOrUpdateUserByPhone(phone, name || "User");
      if (city) {
        await storage.updateUser(user.id, { city });
      }
      const quizAnswers = await storage.getQuizAnswers(user.id);
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          city: city || user.city,
          bio: user.bio,
          profilePhotoUrl: user.profilePhotoUrl,
          hasRealProfile: user.hasRealProfile,
          quizCompleted: !!quizAnswers || user.quizCompleted,
        },
      });
    } catch (err) {
      console.error("Error verifying OTP:", err);
      res.status(500).json({ success: false, message: "Failed to verify OTP" });
    }
  });

  // User profile routes (require x-user-id header matching a real user)
  app.get("/api/user/join-requests", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.phone) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const requests = await storage.getJoinRequestsByPhone(user.phone);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching user join requests:", err);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const existingUser = await storage.getUser(userId);
      if (!existingUser || !existingUser.phone) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const { name, bio } = req.body;
      if (!name || name.length < 2) {
        return res.status(400).json({ success: false, message: "Name is required (minimum 2 characters)" });
      }
      const updates: Record<string, any> = { name };
      if (bio !== undefined) {
        updates.bio = bio.slice(0, 200);
      }
      const hasRealProfile = !!(existingUser.phone && (bio || existingUser.bio) && (bio || existingUser.bio).length > 10);
      updates.hasRealProfile = hasRealProfile;

      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          city: user.city,
          bio: user.bio,
          profilePhotoUrl: user.profilePhotoUrl,
          hasRealProfile: user.hasRealProfile,
          quizCompleted: user.quizCompleted,
        },
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ success: false, message: "Failed to update profile" });
    }
  });

  // Quiz routes
  app.post("/api/quiz", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const validated = insertQuizAnswersSchema.parse({ ...req.body, userId });
      const answers = await storage.saveQuizAnswers(validated);
      await storage.updateUser(userId, { quizCompleted: true });
      if (req.body.city) {
        await storage.updateUser(userId, { city: req.body.city });
      }
      res.json({ success: true, answers });
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      console.error("Error saving quiz:", err);
      res.status(500).json({ success: false, message: "Failed to save quiz answers" });
    }
  });

  app.get("/api/quiz/matches", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const quizAnswers = await storage.getQuizAnswers(userId);
      if (!quizAnswers) {
        return res.status(404).json({ message: "No quiz answers found" });
      }
      const user = await storage.getUser(userId);
      const allClubs = await storage.getClubs();
      const scored = allClubs.map((club) => {
        let score = 0;
        const interestMatch = quizAnswers.interests.some(
          (i) => i.toLowerCase() === club.category.toLowerCase()
        );
        if (interestMatch) score += 50;
        if (club.vibe === quizAnswers.vibePreference) score += 25;
        if (user?.city && club.city === user.city) score += 15;
        if (club.memberCount > 0) score += Math.min(10, club.memberCount);
        return { ...club, matchScore: Math.min(score, 99) };
      });
      scored.sort((a, b) => b.matchScore - a.matchScore);
      res.json(scored.slice(0, 6));
    } catch (err) {
      console.error("Error fetching matches:", err);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getUpcomingEvents(city, limit);
      res.json(events);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const rsvps = await storage.getRsvpsByEvent(event.id);
      const club = await storage.getClub(event.clubId);
      res.json({ ...event, rsvps, club });
    } catch (err) {
      console.error("Error fetching event:", err);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.get("/api/clubs/:id/events", async (req, res) => {
    try {
      const clubEvents = await storage.getEventsByClub(req.params.id);
      const eventsWithRsvps = await Promise.all(
        clubEvents.map(async (event) => {
          const rsvpCount = await storage.getRsvpCount(event.id);
          return { ...event, rsvpCount };
        })
      );
      res.json(eventsWithRsvps);
    } catch (err) {
      console.error("Error fetching club events:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/clubs/:id/events", async (req, res) => {
    try {
      const whatsappNumber = req.headers["x-organizer-whatsapp"] as string;
      if (!whatsappNumber) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const club = await storage.getClub(req.params.id);
      if (!club) {
        return res.status(404).json({ success: false, message: "Club not found" });
      }
      if (club.whatsappNumber !== whatsappNumber) {
        return res.status(403).json({ success: false, message: "Not authorized for this club" });
      }
      const eventData = {
        title: req.body.title,
        description: req.body.description || "",
        clubId: req.params.id,
        startsAt: new Date(req.body.startsAt),
        endsAt: req.body.endsAt ? new Date(req.body.endsAt) : null,
        locationText: req.body.locationText,
        maxCapacity: parseInt(req.body.maxCapacity) || 20,
      };
      const event = await storage.createEvent(eventData);
      res.status(201).json({ success: true, event });
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ success: false, message: "Failed to create event" });
    }
  });

  app.post("/api/events/:id/rsvp", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      const existingRsvp = await storage.getUserRsvp(event.id, userId);
      if (existingRsvp && existingRsvp.status === "going") {
        return res.json({ success: true, rsvp: existingRsvp, alreadyRsvpd: true });
      }
      const rsvpCount = await storage.getRsvpCount(event.id);
      if (rsvpCount >= event.maxCapacity) {
        return res.status(400).json({ success: false, message: "Event is full" });
      }
      const rsvp = await storage.createRsvp({ eventId: event.id, userId, status: "going" });
      res.json({ success: true, rsvp });
    } catch (err) {
      console.error("Error creating RSVP:", err);
      res.status(500).json({ success: false, message: "Failed to RSVP" });
    }
  });

  app.delete("/api/events/:id/rsvp", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      await storage.cancelRsvp(req.params.id, userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling RSVP:", err);
      res.status(500).json({ success: false, message: "Failed to cancel RSVP" });
    }
  });

  // Organizer routes
  app.post("/api/organizer/login", async (req, res) => {
    try {
      const { whatsappNumber, otp } = req.body;
      if (!whatsappNumber || !otp) {
        return res.status(400).json({ success: false, message: "WhatsApp number and OTP required" });
      }
      const stored = otpStore.get(whatsappNumber);
      if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }
      otpStore.delete(whatsappNumber);
      const clubs = await storage.getClubsByOrganizer(whatsappNumber);
      if (clubs.length === 0) {
        return res.status(404).json({ success: false, message: "No club found for this WhatsApp number" });
      }
      res.json({ success: true, club: clubs[0] });
    } catch (err) {
      console.error("Error organizer login:", err);
      res.status(500).json({ success: false, message: "Failed to login" });
    }
  });

  app.get("/api/organizer/club/:whatsappNumber", async (req, res) => {
    try {
      const clubs = await storage.getClubsByOrganizer(req.params.whatsappNumber);
      if (clubs.length === 0) {
        return res.status(404).json({ message: "No club found" });
      }
      res.json(clubs[0]);
    } catch (err) {
      console.error("Error fetching organizer club:", err);
      res.status(500).json({ message: "Failed to fetch club" });
    }
  });

  app.get("/api/organizer/join-requests/:clubId", async (req, res) => {
    try {
      const requests = await storage.getJoinRequestsByClub(req.params.clubId);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching organizer join requests:", err);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.patch("/api/organizer/join-requests/:id/contacted", async (req, res) => {
    try {
      const updated = await storage.markJoinRequestDone(req.params.id);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error marking contacted:", err);
      res.status(500).json({ message: "Failed to update" });
    }
  });

  app.patch("/api/organizer/club/:id", async (req, res) => {
    try {
      const { shortDesc, schedule, location, healthStatus } = req.body;
      const updated = await storage.updateClub(req.params.id, {
        shortDesc, schedule, location, healthStatus,
      });
      if (!updated) return res.status(404).json({ message: "Club not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error updating club:", err);
      res.status(500).json({ message: "Failed to update club" });
    }
  });

  let statsCache: { data: any; expiresAt: number } | null = null;

  app.get("/api/stats", async (_req, res) => {
    try {
      if (statsCache && Date.now() < statsCache.expiresAt) {
        return res.json(statsCache.data);
      }
      const stats = await storage.getStats();
      statsCache = { data: stats, expiresAt: Date.now() + 5 * 60 * 1000 };
      res.json(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/user/events", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const rsvps = await storage.getRsvpsByUser(userId);
      res.json(rsvps);
    } catch (err) {
      console.error("Error fetching user events:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  return httpServer;
}

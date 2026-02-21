import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSubmissionSchema, insertJoinRequestSchema, CATEGORY_EMOJI } from "@shared/schema";
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
      const category = req.query.category as string | undefined;
      if (category && category !== "all") {
        const clubs = await storage.getClubsByCategory(category);
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
      const { phone, otp, name } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone and OTP required" });
      }
      const stored = otpStore.get(phone);
      if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }
      otpStore.delete(phone);
      const user = await storage.createOrUpdateUserByPhone(phone, name || "User");
      res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone } });
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
      const { name } = req.body;
      if (!name || name.length < 2) {
        return res.status(400).json({ success: false, message: "Name is required (minimum 2 characters)" });
      }
      const user = await storage.createOrUpdateUserByPhone(existingUser.phone, name);
      res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone } });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ success: false, message: "Failed to update profile" });
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

  return httpServer;
}

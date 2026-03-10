import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import multer from "multer";
import QRCode from "qrcode";
import { storage } from "./storage";
import { insertJoinRequestSchema, insertQuizAnswersSchema, insertEventSchema, CATEGORY_EMOJI } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import type { RequestHandler } from "express";
import { isCrawler, readHtmlTemplate, buildOgHtml, buildClubSvg, buildEventSvg } from "./og";

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve("uploads"),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

const isAdmin: RequestHandler = (req: any, res, next) => {
  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId) {
    return res.status(403).json({ message: "Admin not configured" });
  }
  const userId = req.user?.claims?.sub;
  if (userId !== adminId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

function requireClubManager(clubIdParam = "clubId"): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const clubId = req.params[clubIdParam];
      const ok = await storage.isClubManager(clubId, userId);
      if (!ok) return res.status(403).json({ message: "Forbidden: not a club manager" });
      next();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

function requireClubCreator(clubIdParam = "clubId"): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const clubId = req.params[clubIdParam];
      const club = await storage.getClub(clubId);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Forbidden: creator only" });
      }
      next();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

function requireRole(...roles: string[]): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }
      next();
    } catch (err) {
      console.error("Error checking role:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAuthRoutes(app);

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

  app.post("/api/join", isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertJoinRequestSchema.parse(req.body);
      if (!validated.name || validated.name.length < 2) {
        return res.status(400).json({ success: false, message: "Name is required (minimum 2 characters)" });
      }
      if (!validated.phone || validated.phone.replace(/\D/g, "").length < 10) {
        return res.status(400).json({ success: false, message: "Phone is required (minimum 10 digits)" });
      }
      const userId = req.user.claims.sub;
      const existing = await storage.hasExistingJoinRequest(validated.clubId, userId);
      if (existing) {
        if (existing.status === "pending") {
          return res.status(400).json({ success: false, message: "You already have a pending request for this club" });
        }
        if (existing.status === "approved") {
          return res.status(400).json({ success: false, message: "You are already a member of this club" });
        }
        if (existing.status === "rejected") {
          await storage.deleteJoinRequest(existing.id);
        }
      }
      const { answer1, answer2 } = req.body;
      const request = await storage.createJoinRequest({ ...validated, userId, status: "pending", answer1: answer1 || null, answer2: answer2 || null });
      await storage.approveJoinRequestWithFoundingCheck(request.id, validated.clubId);
      const club = await storage.getClub(validated.clubId);
      res.json({ success: true, message: "You've joined the club!", data: request, club });
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      console.error("Error creating join request:", err);
      res.status(500).json({ success: false, message: "Failed to save join request" });
    }
  });

  app.post("/api/onboarding/quick-join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const joinedClubs = await storage.autoJoinSampleClubs(userId);
      res.json({ clubs: joinedClubs });
    } catch (err) {
      console.error("Error auto-joining sample clubs:", err);
      res.status(500).json({ message: "Failed to auto-join clubs" });
    }
  });

  app.get("/api/admin/status", isAuthenticated, async (req: any, res) => {
    const configured = !!(process.env.ADMIN_USER_ID && process.env.ADMIN_USER_ID.trim().length > 0);
    const isCurrentUserAdmin = configured && req.user?.claims?.sub === process.env.ADMIN_USER_ID;
    res.json({ configured, isCurrentUserAdmin });
  });

  app.get("/api/admin/join-requests", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const requests = await storage.getJoinRequests();
      res.json(requests);
    } catch (err) {
      console.error("Error fetching join requests:", err);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.patch("/api/admin/join-requests/:id/done", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updated = await storage.markJoinRequestDone(req.params.id as string);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error marking join request done:", err);
      res.status(500).json({ message: "Failed to update" });
    }
  });

  app.get("/api/admin/clubs", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const clubs = await storage.getClubs();
      res.json(clubs);
    } catch (err) {
      console.error("Error fetching admin clubs:", err);
      res.status(500).json({ message: "Failed to fetch clubs" });
    }
  });

  app.patch("/api/admin/clubs/:id/deactivate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateClub(req.params.id as string, { isActive: false });
      if (!updated) return res.status(404).json({ message: "Club not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error deactivating club:", err);
      res.status(500).json({ message: "Failed to deactivate club" });
    }
  });

  app.patch("/api/admin/clubs/:id/activate", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateClub(req.params.id as string, { isActive: true });
      if (!updated) return res.status(404).json({ message: "Club not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error activating club:", err);
      res.status(500).json({ message: "Failed to activate club" });
    }
  });

  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching admin analytics:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("Error fetching admin users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["user", "organiser", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const updated = await storage.updateUserRole(req.params.id as string, role);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error updating user role:", err);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.get("/api/admin/events", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const events = await storage.getAllEventsAdmin();
      res.json(events);
    } catch (err) {
      console.error("Error fetching admin events:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/admin/activity-feed", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const feed = await storage.getAdminActivityFeed();
      res.json(feed);
    } catch (err) {
      console.error("Error fetching admin activity feed:", err);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  app.post("/api/admin/join-requests/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { clubId } = req.body;
      if (!clubId) return res.status(400).json({ message: "clubId required" });
      const updated = await storage.approveJoinRequestWithFoundingCheck(req.params.id, clubId);
      if (!updated) return res.status(404).json({ message: "Request not found" });
      if (updated.userId) {
        const club = await storage.getClub(updated.clubId);
        await storage.createNotification({
          userId: updated.userId,
          type: "join_approved",
          title: "Membership Approved!",
          message: `You've been approved to join ${club?.name || updated.clubName}. Welcome aboard!`,
          linkUrl: `/club/${updated.clubId}`,
          isRead: false,
        });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error admin approving join request:", err);
      res.status(500).json({ message: "Failed to approve request" });
    }
  });

  app.post("/api/admin/join-requests/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updated = await storage.rejectJoinRequest(req.params.id as string);
      if (!updated) return res.status(404).json({ message: "Request not found" });
      if (updated.userId) {
        const club = await storage.getClub(updated.clubId);
        await storage.createNotification({
          userId: updated.userId,
          type: "join_rejected",
          title: "Membership Update",
          message: `Your request to join ${club?.name || updated.clubName} was not approved at this time.`,
          linkUrl: `/club/${updated.clubId}`,
          isRead: false,
        });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error admin rejecting join request:", err);
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  app.patch("/api/admin/events/:eventId/restore", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
      const updated = await storage.updateEvent(req.params.eventId, { isCancelled: false });
      res.json(updated);
    } catch (err) {
      console.error("Error restoring event:", err);
      res.status(500).json({ message: "Failed to restore event" });
    }
  });

  app.get("/api/admin/users/:id/detail", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const detail = await storage.getUserAdminDetail(req.params.id as string);
      res.json(detail);
    } catch (err) {
      console.error("Error fetching user detail:", err);
      res.status(500).json({ message: "Failed to fetch user detail" });
    }
  });

  app.get("/api/admin/polls", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const polls = await storage.getAllPollsAdmin();
      res.json(polls);
    } catch (err) {
      console.error("Error fetching admin polls:", err);
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  app.patch("/api/admin/polls/:id/close", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.closePollAdmin(req.params.id as string);
      res.json({ success: true });
    } catch (err) {
      console.error("Error closing poll:", err);
      res.status(500).json({ message: "Failed to close poll" });
    }
  });

  app.post("/api/admin/broadcast", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { title, message, linkUrl } = req.body;
      if (!title || typeof title !== "string" || title.trim().length < 2) {
        return res.status(400).json({ message: "Title is required (min 2 chars)" });
      }
      if (!message || typeof message !== "string" || message.trim().length < 5) {
        return res.status(400).json({ message: "Message is required (min 5 chars)" });
      }
      const sent = await storage.broadcastNotification(title.trim(), message.trim(), linkUrl || undefined);
      res.json({ sent });
    } catch (err) {
      console.error("Error broadcasting notification:", err);
      res.status(500).json({ message: "Failed to send broadcast" });
    }
  });

  app.get("/api/admin/growth", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const growth = await storage.getWeeklyGrowth();
      res.json(growth);
    } catch (err) {
      console.error("Error fetching growth data:", err);
      res.status(500).json({ message: "Failed to fetch growth data" });
    }
  });

  app.patch("/api/admin/clubs/:id/health", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status, label } = req.body;
      if (!status || !label) return res.status(400).json({ message: "status and label required" });
      await storage.updateClubHealth(req.params.id as string, status, label);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating club health:", err);
      res.status(500).json({ message: "Failed to update club health" });
    }
  });

  app.post("/api/clubs/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUserForCheck = await storage.getUser(userId);
      if (
        currentUserForCheck &&
        currentUserForCheck.role !== "organiser" &&
        currentUserForCheck.role !== "admin" &&
        currentUserForCheck.wantsToCreate !== true
      ) {
        return res.status(403).json({ success: false, message: "Not authorised to create clubs" });
      }
      const { name, category, shortDesc, fullDesc, schedule, location, organizerName, whatsappNumber, city } = req.body;

      if (!name || name.length < 3) {
        return res.status(400).json({ success: false, message: "Club name must be at least 3 characters" });
      }
      if (!category) {
        return res.status(400).json({ success: false, message: "Category is required" });
      }
      if (!organizerName || organizerName.length < 2) {
        return res.status(400).json({ success: false, message: "Organizer name must be at least 2 characters" });
      }

      const emoji = CATEGORY_EMOJI[category] || "🎯";
      const club = await storage.createClub({
        name,
        category,
        emoji,
        shortDesc: shortDesc || `New ${category.toLowerCase()} club in ${city || "Tirupati"}.`,
        fullDesc: fullDesc || `${name} is a newly formed ${category.toLowerCase()} community in ${city || "Tirupati"}, organized by ${organizerName}. Join us and be a founding member!`,
        organizerName,
        organizerYears: "New organizer",
        organizerAvatar: "🧑",
        organizerResponse: "Responds within 24 hrs",
        memberCount: 1,
        schedule: schedule || "To be announced",
        location: location || city || "Tirupati",
        city: city || "Tirupati",
        vibe: "casual",
        activeSince: new Date().getFullYear().toString(),
        whatsappNumber: whatsappNumber || null,
        healthStatus: "green",
        healthLabel: "Very Active",
        lastActive: "Just started",
        foundingTaken: 1,
        foundingTotal: 20,
        bgColor: "#f0f9f0",
        timeOfDay: "morning",
        isActive: true,
        creatorUserId: userId,
      });

      const currentUser = await storage.getUser(userId);
      if (currentUser && currentUser.role === "user") {
        await storage.updateUserRole(userId, "organiser");
      }

      const existingRequest = await storage.hasExistingJoinRequest(club.id, userId);
      if (!existingRequest) {
        const creatorName = currentUser
          ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || organizerName
          : organizerName;
        const joinReq = await storage.createJoinRequest({
          clubId: club.id,
          clubName: club.name,
          name: creatorName,
          phone: "organiser",
          userId,
          status: "pending",
          isFoundingMember: true,
        });
        await storage.approveJoinRequestWithFoundingCheck(joinReq.id, club.id);
      }

      res.status(201).json({ success: true, message: "Club created and live!", club });
    } catch (err) {
      console.error("Error creating club:", err);
      res.status(500).json({ success: false, message: "Failed to create club" });
    }
  });

  app.get("/api/organizer/my-club", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      if (clubs.length === 0) {
        return res.status(404).json({ message: "No club found" });
      }
      res.json(clubs[0]);
    } catch (err) {
      console.error("Error fetching organizer club:", err);
      res.status(500).json({ message: "Failed to fetch club" });
    }
  });

  app.get("/api/organizer/my-clubs", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsForOrganiser(userId);
      res.json(clubs);
    } catch (err) {
      console.error("Error fetching organizer clubs:", err);
      res.status(500).json({ message: "Failed to fetch clubs" });
    }
  });

  app.get("/api/user/join-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getJoinRequestsByUser(userId);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching user join requests:", err);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.get("/api/user/clubs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userClubs = await storage.getUserApprovedClubs(userId);
      res.json(userClubs);
    } catch (err) {
      console.error("Error fetching user clubs:", err);
      res.status(500).json({ message: "Failed to fetch user clubs" });
    }
  });

  app.patch("/api/user/become-creator", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.becomeCreator(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error setting creator intent:", err);
      res.status(500).json({ message: "Failed to update creator status" });
    }
  });

  app.get("/api/feed", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub as string | undefined;
      const moments = await storage.getFeedMoments(10, userId);
      res.json(moments);
    } catch (err) {
      console.error("Error fetching feed:", err);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, bio, city } = req.body;
      if (!name || name.length < 2) {
        return res.status(400).json({ success: false, message: "Name is required (minimum 2 characters)" });
      }
      const updates: Record<string, any> = { firstName: name };
      if (bio !== undefined) {
        updates.bio = bio.slice(0, 200);
      }
      if (city !== undefined && city.trim().length > 0) {
        updates.city = city.trim();
      }

      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, user });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ success: false, message: "Failed to update profile" });
    }
  });

  app.post("/api/upload/image", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided" });
      }
      const url = `/uploads/${req.file.filename}`;
      res.json({ success: true, url });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ success: false, message: "Failed to upload image" });
    }
  });

  app.post("/api/user/photo", isAuthenticated, upload.single("photo"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided" });
      }
      const url = `/uploads/${req.file.filename}`;
      const user = await storage.updateUser(userId, { profileImageUrl: url });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, url, user });
    } catch (err) {
      console.error("Error uploading photo:", err);
      res.status(500).json({ success: false, message: "Failed to upload photo" });
    }
  });

  app.post("/api/quiz", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get("/api/quiz/matches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get("/api/events", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getUpcomingEvents(city, limit);
      const eventsWithRsvps = await Promise.all(
        events.map(async (event) => {
          const rsvps = await storage.getRsvpsByEvent(event.id);
          return { ...event, rsvps };
        })
      );
      res.json(eventsWithRsvps);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const rsvps = await storage.getRsvpsByEvent(event.id);
      const club = await storage.getClub(event.clubId);
      const waitlistCount = await storage.getWaitlistCount(event.id);
      let myRsvp = null;
      if (req.user?.claims?.sub) {
        myRsvp = await storage.getUserRsvp(event.id, req.user.claims.sub);
      }
      res.json({ ...event, rsvps, club, waitlistCount, myRsvp });
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

  app.post("/api/clubs/:id/events", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club) {
        return res.status(404).json({ success: false, message: "Club not found" });
      }
      if (club.creatorUserId !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized for this club" });
      }
      const recurrenceRule = req.body.recurrenceRule && req.body.recurrenceRule !== "none" ? req.body.recurrenceRule : null;
      const baseStartsAt = new Date(req.body.startsAt);
      const baseEndsAt = req.body.endsAt ? new Date(req.body.endsAt) : null;
      const eventData = {
        title: req.body.title,
        description: req.body.description || "",
        clubId: req.params.id,
        startsAt: baseStartsAt,
        endsAt: baseEndsAt,
        locationText: req.body.locationText,
        maxCapacity: parseInt(req.body.maxCapacity) || 20,
        recurrenceRule,
      };
      const event = await storage.createEvent(eventData);
      if (recurrenceRule) {
        for (let i = 1; i <= 4; i++) {
          const nextStartsAt = new Date(baseStartsAt);
          if (recurrenceRule === "weekly") nextStartsAt.setDate(nextStartsAt.getDate() + 7 * i);
          else if (recurrenceRule === "biweekly") nextStartsAt.setDate(nextStartsAt.getDate() + 14 * i);
          else if (recurrenceRule === "monthly") nextStartsAt.setMonth(nextStartsAt.getMonth() + i);
          let nextEndsAt = null;
          if (baseEndsAt) {
            const duration = baseEndsAt.getTime() - baseStartsAt.getTime();
            nextEndsAt = new Date(nextStartsAt.getTime() + duration);
          }
          await storage.createEvent({ ...eventData, startsAt: nextStartsAt, endsAt: nextEndsAt });
        }
      }
      const approvedMembers = await storage.getApprovedMembersByClub(req.params.id);
      for (const member of approvedMembers) {
        if (member.userId && member.userId !== userId) {
          await storage.createNotification({
            userId: member.userId,
            type: "new_event",
            title: "New Event!",
            message: `${club.name} just posted a new event: ${event.title}`,
            linkUrl: `/event/${event.id}`,
            isRead: false,
          });
        }
      }
      res.status(201).json({ success: true, event });
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ success: false, message: "Failed to create event" });
    }
  });

  app.post("/api/events/:id/rsvp", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      const club = await storage.getClub(event.clubId);
      const isClubCreator = club && club.creatorUserId === userId;
      if (!isClubCreator) {
        const isMember = await storage.hasUserJoinedClub(event.clubId, userId);
        if (!isMember) {
          return res.status(403).json({ success: false, message: "You must be an approved member of this club to RSVP. Join the club first!" });
        }
      }
      const existingRsvp = await storage.getUserRsvp(event.id, userId);
      if (existingRsvp && existingRsvp.status === "going") {
        return res.json({ success: true, rsvp: existingRsvp, alreadyRsvpd: true });
      }
      if (existingRsvp && existingRsvp.status === "waitlisted") {
        const position = await storage.getUserWaitlistPosition(event.id, userId);
        return res.json({ success: true, rsvp: existingRsvp, waitlisted: true, position });
      }
      const rsvpCount = await storage.getRsvpCount(event.id);
      if (rsvpCount >= event.maxCapacity) {
        const rsvp = await storage.createRsvp({ eventId: event.id, userId, status: "waitlisted" });
        const position = await storage.getUserWaitlistPosition(event.id, userId);
        return res.json({ success: true, rsvp, waitlisted: true, position });
      }
      const rsvp = await storage.createRsvp({ eventId: event.id, userId, status: "going" });
      const eventDate = new Date(event.startsAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      await storage.createNotification({
        userId,
        type: "rsvp_confirmed",
        title: "You're in!",
        message: `You're registered for ${event.title} on ${eventDate}. See you there!`,
        linkUrl: `/event/${event.id}`,
        isRead: false,
      });
      res.json({ success: true, rsvp });
    } catch (err) {
      console.error("Error creating RSVP:", err);
      res.status(500).json({ success: false, message: "Failed to RSVP" });
    }
  });

  app.delete("/api/events/:id/rsvp", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingRsvp = await storage.getUserRsvp(req.params.id, userId);
      await storage.cancelRsvp(req.params.id, userId);
      if (existingRsvp?.status === "going") {
        const promoted = await storage.promoteFirstFromWaitlist(req.params.id);
        if (promoted) {
          const event = await storage.getEvent(req.params.id);
          const eventDate = event ? new Date(event.startsAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";
          await storage.createNotification({
            userId: promoted.userId,
            type: "waitlist_promoted",
            title: "You're off the waitlist!",
            message: `A spot opened up for ${event?.title || "the event"}${eventDate ? ` on ${eventDate}` : ""}. You're now confirmed!`,
            linkUrl: `/event/${req.params.id}`,
            isRead: false,
          });
        }
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling RSVP:", err);
      res.status(500).json({ success: false, message: "Failed to cancel RSVP" });
    }
  });

  app.get("/api/organizer/join-requests/:clubId", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      const club = clubs.find(c => c.id === req.params.clubId);
      if (!club) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const requests = await storage.getJoinRequestsByClub(req.params.clubId);
      res.json(requests);
    } catch (err) {
      console.error("Error fetching organizer join requests:", err);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.patch("/api/organizer/join-requests/:id/contacted", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const request = await storage.getJoinRequest(req.params.id);
      if (!request) return res.status(404).json({ message: "Not found" });
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      if (!clubs.some(c => c.id === request.clubId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updated = await storage.markJoinRequestDone(req.params.id as string);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error marking contacted:", err);
      res.status(500).json({ message: "Failed to update" });
    }
  });

  app.patch("/api/organizer/join-requests/:id/approve", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const request = await storage.getJoinRequest(req.params.id);
      if (!request) return res.status(404).json({ message: "Not found" });
      if (request.status === "approved") return res.json(request);
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      if (!clubs.some(c => c.id === request.clubId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updated = await storage.approveJoinRequestWithFoundingCheck(req.params.id, request.clubId);
      if (updated) {
        if (updated.userId) {
          const club = await storage.getClub(updated.clubId);
          await storage.createNotification({
            userId: updated.userId,
            type: "join_approved",
            title: "Membership Approved!",
            message: `You've been approved to join ${club?.name || updated.clubName}. Welcome aboard!`,
            linkUrl: `/club/${updated.clubId}`,
            isRead: false,
          });
        }
      }
      res.json(updated);
    } catch (err) {
      console.error("Error approving join request:", err);
      res.status(500).json({ message: "Failed to approve" });
    }
  });

  app.patch("/api/organizer/join-requests/:id/reject", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const request = await storage.getJoinRequest(req.params.id);
      if (!request) return res.status(404).json({ message: "Not found" });
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      if (!clubs.some(c => c.id === request.clubId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updated = await storage.rejectJoinRequest(req.params.id as string);
      if (updated && updated.userId) {
        const club = await storage.getClub(updated.clubId);
        await storage.createNotification({
          userId: updated.userId,
          type: "join_rejected",
          title: "Membership Update",
          message: `Your request to join ${club?.name || updated.clubName} was not approved at this time.`,
          linkUrl: `/club/${updated.clubId}`,
          isRead: false,
        });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error rejecting join request:", err);
      res.status(500).json({ message: "Failed to reject" });
    }
  });

  app.delete("/api/organizer/clubs/:clubId/members/:requestId", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      if (!clubs.some(c => c.id === req.params.clubId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const request = await storage.getJoinRequest(req.params.requestId);
      if (!request || request.clubId !== req.params.clubId) {
        return res.status(404).json({ message: "Member not found" });
      }
      if (request.status === "approved") {
        await storage.decrementMemberCount(req.params.clubId);
      }
      await storage.deleteJoinRequest(req.params.requestId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error removing member:", err);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  app.get("/api/organizer/clubs/:clubId/members", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clubs = await storage.getClubsByCreator(userId);
      if (!clubs.some(c => c.id === req.params.clubId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const members = await storage.getApprovedMembersByClub(req.params.clubId);
      res.json(members);
    } catch (err) {
      console.error("Error fetching members:", err);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/organizer/clubs/:clubId/pending-count", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const count = await storage.getPendingJoinRequestCount(req.params.clubId);
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: "Failed to get count" });
    }
  });

  app.get("/api/organizer/clubs/:clubId/insights", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const insights = await storage.getOrganizerInsights(req.params.clubId);
      res.json(insights);
    } catch (err) {
      console.error("Error fetching organizer insights:", err);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.get("/api/organizer/clubs/:clubId/analytics", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const analytics = await storage.getClubAnalytics(req.params.clubId);
      res.json(analytics);
    } catch (err) {
      console.error("Error fetching club analytics:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.delete("/api/clubs/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.hasExistingJoinRequest(req.params.id, userId);
      if (!existing) {
        return res.status(404).json({ message: "You are not a member of this club" });
      }
      if (existing.status === "approved") {
        await storage.decrementMemberCount(req.params.id);
      }
      await storage.deleteJoinRequest(existing.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error leaving club:", err);
      res.status(500).json({ message: "Failed to leave club" });
    }
  });

  app.get("/api/clubs/:id/join-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.getUserJoinStatus(req.params.id, userId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  app.patch("/api/organizer/club/:id", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { shortDesc, fullDesc, schedule, location, healthStatus, highlights, organizerName, whatsappNumber, joinQuestion1, joinQuestion2 } = req.body;
      const updateData: Record<string, any> = {};
      if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
      if (fullDesc !== undefined) updateData.fullDesc = fullDesc;
      if (schedule !== undefined) updateData.schedule = schedule;
      if (location !== undefined) updateData.location = location;
      if (healthStatus !== undefined) updateData.healthStatus = healthStatus;
      if (highlights !== undefined) updateData.highlights = highlights;
      if (organizerName !== undefined) updateData.organizerName = organizerName;
      if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
      if (joinQuestion1 !== undefined) updateData.joinQuestion1 = joinQuestion1 || null;
      if (joinQuestion2 !== undefined) updateData.joinQuestion2 = joinQuestion2 || null;
      const updated = await storage.updateClub(req.params.id, updateData);
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

  app.get("/api/rsvps/:rsvpId/qr", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rsvp = await storage.getRsvpById(req.params.rsvpId);
      if (!rsvp) {
        return res.status(404).json({ message: "RSVP not found" });
      }
      if (rsvp.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const payload = JSON.stringify({
        token: rsvp.checkinToken,
        eventId: rsvp.eventId,
        userId: rsvp.userId,
      });
      const qrBuffer = await QRCode.toBuffer(payload, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      res.set("Content-Type", "image/png");
      res.send(qrBuffer);
    } catch (err) {
      console.error("Error generating QR:", err);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  app.post("/api/checkin", isAuthenticated, async (req: any, res) => {
    try {
      const organizerUserId = req.user.claims.sub;
      const { token, eventId } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
      }
      if (!eventId) {
        return res.status(400).json({ success: false, message: "Event ID is required" });
      }
      const rsvp = await storage.getRsvpByToken(token);
      if (!rsvp) {
        return res.status(404).json({ success: false, message: "Invalid ticket — RSVP not found" });
      }
      if (rsvp.eventId !== eventId) {
        return res.status(400).json({ success: false, message: "This ticket is for a different event" });
      }
      const event = await storage.getEvent(rsvp.eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      const club = await storage.getClub(event.clubId);
      if (!club || club.creatorUserId !== organizerUserId) {
        return res.status(403).json({ success: false, message: "Only the event organizer can scan check-ins" });
      }
      if (rsvp.checkedIn) {
        return res.json({ success: true, alreadyCheckedIn: true, name: rsvp.userName, checkedInAt: rsvp.checkedInAt });
      }
      const updated = await storage.checkInRsvpByToken(token);
      res.json({ success: true, name: rsvp.userName, checkedInAt: updated?.checkedInAt });
    } catch (err) {
      console.error("Error checking in:", err);
      res.status(500).json({ success: false, message: "Failed to check in" });
    }
  });

  app.post("/api/checkin/manual", isAuthenticated, async (req: any, res) => {
    try {
      const organizerUserId = req.user.claims.sub;
      const { rsvpId, eventId } = req.body;
      if (!rsvpId || !eventId) {
        return res.status(400).json({ success: false, message: "rsvpId and eventId are required" });
      }
      const rsvp = await storage.getRsvpById(rsvpId);
      if (!rsvp) {
        return res.status(404).json({ success: false, message: "RSVP not found" });
      }
      if (rsvp.eventId !== eventId) {
        return res.status(400).json({ success: false, message: "RSVP does not match this event" });
      }
      const event = await storage.getEvent(rsvp.eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      const club = await storage.getClub(event.clubId);
      if (!club || club.creatorUserId !== organizerUserId) {
        return res.status(403).json({ success: false, message: "Only the event organizer can manually check in attendees" });
      }
      if (rsvp.checkedIn) {
        return res.json({ success: true, alreadyCheckedIn: true });
      }
      const updated = await storage.checkInRsvpById(rsvpId);
      res.json({ success: true, checkedInAt: updated?.checkedInAt });
    } catch (err) {
      console.error("Error manual check-in:", err);
      res.status(500).json({ success: false, message: "Failed to check in" });
    }
  });

  app.get("/api/events/:id/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const club = await storage.getClub(event.clubId);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Only the club organizer can view attendance" });
      }
      const attendees = await storage.getEventAttendees(req.params.id);
      const checkedIn = attendees.filter(a => a.checkedIn).length;
      const totalRsvps = attendees.length;
      res.json({
        totalRsvps,
        checkedIn,
        notYetArrived: totalRsvps - checkedIn,
        attendees: attendees.map(a => ({
          rsvpId: a.id,
          name: a.userName,
          checkedIn: !!a.checkedIn,
          checkedInAt: a.checkedInAt,
        })),
      });
    } catch (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/events/:id/attendees", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const club = await storage.getClub(event.clubId);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Only the club organizer can view attendees" });
      }
      const attendees = await storage.getEventAttendees(req.params.id);
      const checkedInCount = await storage.getCheckedInCount(req.params.id);
      res.json({ attendees, checkedInCount, totalRsvps: attendees.length });
    } catch (err) {
      console.error("Error fetching attendees:", err);
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  app.get("/api/user/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rsvps = await storage.getRsvpsByUser(userId);
      res.json(rsvps);
    } catch (err) {
      console.error("Error fetching user events:", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/club/:id", async (req, res, next) => {
    try {
      const ua = req.headers["user-agent"] || "";
      const isBot = /bot|crawl|spider|facebook|whatsapp|telegram|twitter|slack|linkedin|discord/i.test(ua);
      if (!isBot) {
        return next();
      }
      const club = await storage.getClub(req.params.id);
      if (!club) {
        return next();
      }
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const safeDesc = esc(club.shortDesc);
      const safeName = esc(club.name);
      const html = `<!DOCTYPE html><html><head>
        <title>${club.emoji} ${safeName} - CultFam</title>
        <meta property="og:title" content="${club.emoji} ${safeName} - CultFam" />
        <meta property="og:description" content="${safeDesc}" />
        <meta property="og:type" content="website" />
        <meta name="description" content="${safeDesc}" />
      </head><body><p>${club.emoji} ${safeName} — ${safeDesc}</p></body></html>`;
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (err) {
      next();
    }
  });

  app.get("/event/:id", async (req, res, next) => {
    try {
      const ua = req.headers["user-agent"] || "";
      const isBot = /bot|crawl|spider|facebook|whatsapp|telegram|twitter|slack|linkedin|discord/i.test(ua);
      if (!isBot) {
        return next();
      }
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return next();
      }
      const club = await storage.getClub(event.clubId);
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const safeTitle = esc(event.title);
      const clubEmoji = club?.emoji || "📅";
      const clubName = club?.name || "CultFam";
      const safeClubName = esc(clubName);
      const d = new Date(event.startsAt);
      const dateStr = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const safeLocation = esc(event.locationText);
      const desc = `${dateStr} · ${timeStr} · ${safeLocation}`;
      const html = `<!DOCTYPE html><html><head>
        <title>${clubEmoji} ${safeTitle} — ${safeClubName}</title>
        <meta property="og:title" content="${clubEmoji} ${safeTitle} — ${safeClubName}" />
        <meta property="og:description" content="${desc}" />
        <meta property="og:type" content="website" />
        <meta name="description" content="${desc}" />
      </head><body><p>${clubEmoji} ${safeTitle} — ${desc}</p></body></html>`;
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (err) {
      next();
    }
  });

  app.get("/api/clubs/:id/activity", async (req, res) => {
    try {
      const activity = await storage.getClubActivity(req.params.id);
      res.json(activity);
    } catch (err) {
      console.error("Error fetching club activity:", err);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.get("/api/activity/feed", async (_req, res) => {
    try {
      const feed = await storage.getRecentActivityFeed(10);
      res.json(feed);
    } catch (err) {
      console.error("Error fetching activity feed:", err);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  app.get("/api/clubs-with-activity", async (req, res) => {
    try {
      const { category, search, city, vibe, timeOfDay } = req.query as Record<string, string | undefined>;
      let clubsList;
      if (search || city || vibe || timeOfDay || (category && category !== "all")) {
        clubsList = await storage.searchClubs({ search, category, city, vibe, timeOfDay });
      } else {
        clubsList = await storage.getClubs();
      }
      const recentJoins = await storage.getClubsWithRecentJoins();
      const clubsWithActivity = clubsList.map(club => ({
        ...club,
        recentJoins: recentJoins[club.id] || 0,
      }));
      res.json(clubsWithActivity);
    } catch (err) {
      console.error("Error fetching clubs with activity:", err);
      res.status(500).json({ message: "Failed to fetch clubs" });
    }
  });

  app.get("/api/clubs/:id/ratings", async (req: any, res) => {
    try {
      const { average, count } = await storage.getClubAverageRating(req.params.id);
      let userRating = null;
      let hasJoined = false;
      if (req.user?.claims?.sub) {
        userRating = await storage.getUserRating(req.params.id, req.user.claims.sub);
        hasJoined = await storage.hasUserJoinedClub(req.params.id, req.user.claims.sub);
      }
      res.json({ average, count, userRating, hasJoined });
    } catch (err) {
      console.error("Error fetching ratings:", err);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.post("/api/clubs/:id/ratings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hasJoined = await storage.hasUserJoinedClub(req.params.id, userId);
      if (!hasJoined) {
        return res.status(403).json({ message: "You must join this club before rating" });
      }
      const { rating, review } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      const result = await storage.upsertRating(req.params.id, userId, rating, review);
      const { average, count } = await storage.getClubAverageRating(req.params.id);
      res.json({ success: true, rating: result, average, count });
    } catch (err) {
      console.error("Error submitting rating:", err);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });

  app.get("/api/clubs/:id/faqs", async (req, res) => {
    try {
      const faqs = await storage.getClubFaqs(req.params.id);
      res.json(faqs);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.post("/api/clubs/:id/faqs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer are required" });
      }
      const faq = await storage.createFaq(req.params.id, question, answer);
      res.status(201).json(faq);
    } catch (err) {
      console.error("Error creating FAQ:", err);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.patch("/api/clubs/:id/faqs/:faqId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { question, answer } = req.body;
      const existingFaqs = await storage.getClubFaqs(req.params.id);
      if (!existingFaqs.some(f => f.id === req.params.faqId)) {
        return res.status(404).json({ message: "FAQ not found in this club" });
      }
      const faq = await storage.updateFaq(req.params.faqId, question, answer);
      res.json(faq);
    } catch (err) {
      console.error("Error updating FAQ:", err);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  app.delete("/api/clubs/:id/faqs/:faqId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const existingFaqs = await storage.getClubFaqs(req.params.id);
      if (!existingFaqs.some(f => f.id === req.params.faqId)) {
        return res.status(404).json({ message: "FAQ not found in this club" });
      }
      await storage.deleteFaq(req.params.faqId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  app.get("/api/clubs/:id/schedule", async (req, res) => {
    try {
      const schedule = await storage.getClubSchedule(req.params.id);
      res.json(schedule);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.post("/api/clubs/:id/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { dayOfWeek, startTime, endTime, activity, location } = req.body;
      if (!dayOfWeek || !startTime || !activity) {
        return res.status(400).json({ message: "Day, start time, and activity are required" });
      }
      const entry = await storage.createScheduleEntry(req.params.id, { dayOfWeek, startTime, endTime, activity, location });
      res.status(201).json(entry);
    } catch (err) {
      console.error("Error creating schedule entry:", err);
      res.status(500).json({ message: "Failed to create schedule entry" });
    }
  });

  app.patch("/api/clubs/:id/schedule/:entryId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const schedule = await storage.getClubSchedule(req.params.id);
      if (!schedule.some(s => s.id === req.params.entryId)) {
        return res.status(404).json({ message: "Schedule entry not found in this club" });
      }
      const { dayOfWeek, startTime, endTime, activity, location } = req.body;
      const entry = await storage.updateScheduleEntry(req.params.entryId, { dayOfWeek, startTime, endTime, activity, location });
      res.json(entry);
    } catch (err) {
      console.error("Error updating schedule entry:", err);
      res.status(500).json({ message: "Failed to update schedule entry" });
    }
  });

  app.delete("/api/clubs/:id/schedule/:entryId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const schedule = await storage.getClubSchedule(req.params.id);
      if (!schedule.some(s => s.id === req.params.entryId)) {
        return res.status(404).json({ message: "Schedule entry not found in this club" });
      }
      await storage.deleteScheduleEntry(req.params.entryId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting schedule entry:", err);
      res.status(500).json({ message: "Failed to delete schedule entry" });
    }
  });

  app.get("/api/clubs/:id/moments", async (req, res) => {
    try {
      const moments = await storage.getClubMoments(req.params.id);
      res.json(moments);
    } catch (err) {
      console.error("Error fetching moments:", err);
      res.status(500).json({ message: "Failed to fetch moments" });
    }
  });

  app.post("/api/clubs/:id/moments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club) return res.status(404).json({ message: "Club not found" });
      const isCreator = club.creatorUserId === userId;
      const isCoOrganiser = Array.isArray(club.coOrganiserUserIds) && club.coOrganiserUserIds.includes(userId);
      const joinStatus = await storage.getUserJoinStatus(req.params.id, userId);
      const isApprovedMember = joinStatus.status === "approved";
      if (!isCreator && !isCoOrganiser && !isApprovedMember) {
        return res.status(403).json({ message: "Only approved club members can post moments" });
      }
      const { caption, emoji, imageUrl } = req.body;
      if (!caption) {
        return res.status(400).json({ message: "Caption is required" });
      }
      const user = await storage.getUser(userId);
      const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Member";
      const moment = await storage.createMoment(req.params.id, caption, emoji, imageUrl, userId, authorName);
      res.status(201).json(moment);
    } catch (err) {
      console.error("Error creating moment:", err);
      res.status(500).json({ message: "Failed to create moment" });
    }
  });

  app.patch("/api/clubs/:id/moments/:momentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club) return res.status(404).json({ message: "Club not found" });
      const isCreator = club.creatorUserId === userId;
      const isCoOrganiser = Array.isArray(club.coOrganiserUserIds) && club.coOrganiserUserIds.includes(userId);
      const moments = await storage.getClubMoments(req.params.id);
      const moment = moments.find(m => m.id === req.params.momentId);
      if (!moment) return res.status(404).json({ message: "Moment not found in this club" });
      const isMomentAuthor = moment.authorUserId === userId;
      if (!isCreator && !isCoOrganiser && !isMomentAuthor) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { caption, emoji } = req.body;
      if (!caption || !caption.trim()) {
        return res.status(400).json({ message: "Caption is required" });
      }
      const updated = await storage.updateMoment(req.params.momentId, { caption: caption.trim(), emoji: emoji || null });
      res.json(updated);
    } catch (err) {
      console.error("Error updating moment:", err);
      res.status(500).json({ message: "Failed to update moment" });
    }
  });

  app.delete("/api/clubs/:id/moments/:momentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.id);
      if (!club) return res.status(404).json({ message: "Club not found" });
      const isCreator = club.creatorUserId === userId;
      const isCoOrganiser = Array.isArray(club.coOrganiserUserIds) && club.coOrganiserUserIds.includes(userId);
      const moments = await storage.getClubMoments(req.params.id);
      const moment = moments.find(m => m.id === req.params.momentId);
      if (!moment) return res.status(404).json({ message: "Moment not found in this club" });
      const isMomentAuthor = moment.authorUserId === userId;
      if (!isCreator && !isCoOrganiser && !isMomentAuthor) {
        return res.status(403).json({ message: "Not authorized" });
      }
      await storage.deleteMoment(req.params.momentId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting moment:", err);
      res.status(500).json({ message: "Failed to delete moment" });
    }
  });

  app.get("/api/moments/:momentId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByMoment(req.params.momentId);
      res.json(comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/moments/:momentId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const content = (req.body.content || "").trim();
      if (!content) return res.status(400).json({ message: "Comment cannot be empty" });
      const moment = await storage.getMomentById(req.params.momentId);
      if (!moment) return res.status(404).json({ message: "Moment not found" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Member";
      const comment = await storage.createComment({
        momentId: req.params.momentId,
        userId,
        userName,
        userImageUrl: user.profileImageUrl ?? null,
        content,
      });
      res.status(201).json(comment);
    } catch (err) {
      console.error("Error creating comment:", err);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/moments/:momentId/comments/:commentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moment = await storage.getMomentById(req.params.momentId);
      if (!moment) return res.status(404).json({ message: "Moment not found" });
      const club = await storage.getClub(moment.clubId);
      const isOrganiser = club?.creatorUserId === userId;
      await storage.deleteComment(req.params.commentId, userId, isOrganiser);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifs = await storage.getNotificationsByUser(userId);
      res.json(notifs);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (err) {
      console.error("Error fetching unread count:", err);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      const notification = notifications.find(n => n.id === req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      const updated = await storage.markNotificationRead(req.params.id);
      if (!updated) return res.status(404).json({ message: "Notification not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error marking notification read:", err);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.patch("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error marking all notifications read:", err);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.patch("/api/clubs/:clubId/events/:eventId", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.clubId);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const event = await storage.getEvent(req.params.eventId);
      if (!event || event.clubId !== req.params.clubId) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.isCancelled) {
        return res.status(400).json({ message: "Cannot edit a cancelled event" });
      }
      const updateData: any = {};
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.locationText) updateData.locationText = req.body.locationText;
      if (req.body.locationUrl !== undefined) updateData.locationUrl = req.body.locationUrl;
      if (req.body.startsAt) updateData.startsAt = new Date(req.body.startsAt);
      if (req.body.endsAt !== undefined) updateData.endsAt = req.body.endsAt ? new Date(req.body.endsAt) : null;
      if (req.body.maxCapacity) updateData.maxCapacity = parseInt(req.body.maxCapacity);
      if (req.body.coverImageUrl !== undefined) updateData.coverImageUrl = req.body.coverImageUrl;
      const updated = await storage.updateEvent(req.params.eventId, updateData);
      res.json({ success: true, event: updated });
    } catch (err) {
      console.error("Error updating event:", err);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/clubs/:clubId/events/:eventId", isAuthenticated, requireRole("organiser", "admin"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const club = await storage.getClub(req.params.clubId);
      if (!club || club.creatorUserId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const event = await storage.getEvent(req.params.eventId);
      if (!event || event.clubId !== req.params.clubId) {
        return res.status(404).json({ message: "Event not found" });
      }
      await storage.cancelEvent(req.params.eventId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling event:", err);
      res.status(500).json({ message: "Failed to cancel event" });
    }
  });

  app.delete("/api/admin/events/:eventId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.isCancelled) {
        return res.status(400).json({ message: "Event is already cancelled" });
      }
      await storage.cancelEvent(req.params.eventId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error admin cancelling event:", err);
      res.status(500).json({ message: "Failed to cancel event" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const userClubs = await storage.getUserApprovedClubs(req.params.id);
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "CultFam Member";
      res.json({
        id: user.id,
        name,
        bio: user.bio ?? null,
        city: user.city ?? null,
        profileImageUrl: user.profileImageUrl ?? null,
        role: user.role ?? "member",
        clubs: userClubs.map(c => ({ id: c.id, name: c.name, emoji: c.emoji, category: c.category })),
      });
    } catch (err) {
      console.error("Error fetching public user profile:", err);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.get("/api/clubs/:id/members-preview", async (req, res) => {
    try {
      const members = await storage.getMembersPreview(req.params.id, 10);
      res.json(members);
    } catch (err) {
      console.error("Error fetching members preview:", err);
      res.status(500).json({ message: "Failed to fetch members preview" });
    }
  });

  app.get("/api/clubs/:id/members", async (req, res) => {
    try {
      const members = await storage.getPublicClubMembers(req.params.id);
      res.json(members);
    } catch (err) {
      console.error("Error fetching member directory:", err);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/user/attendance-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserAttendanceStats(userId);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching attendance stats:", err);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  app.get("/api/clubs/:id/join-count", async (req, res) => {
    try {
      const count = await storage.getJoinRequestCountByClub(req.params.id);
      res.json({ count });
    } catch (err) {
      console.error("Error fetching join count:", err);
      res.status(500).json({ message: "Failed to get join count" });
    }
  });

  // ── ANNOUNCEMENTS ────────────────────────────────────────────────────────

  app.get("/api/clubs/:clubId/announcements", async (req, res) => {
    try {
      const announcements = await storage.getClubAnnouncements(req.params.clubId);
      res.json(announcements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/organizer/clubs/:clubId/announcements", isAuthenticated, requireClubManager(), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { title, body, isPinned, notifyMembers } = req.body;
      if (!title?.trim() || !body?.trim()) {
        return res.status(400).json({ message: "Title and body are required" });
      }
      const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Organiser";
      const announcement = await storage.createAnnouncement({
        clubId: req.params.clubId,
        authorUserId: userId,
        authorName,
        title: title.trim(),
        body: body.trim(),
        isPinned: !!isPinned,
      });
      if (notifyMembers) {
        const memberIds = await storage.getClubMemberUserIds(req.params.clubId);
        const club = await storage.getClub(req.params.clubId);
        await Promise.all(memberIds.map(memberId =>
          storage.createNotification({
            userId: memberId,
            type: "announcement",
            title: `${club?.name ?? "Club"}: ${title.trim()}`,
            message: body.trim().slice(0, 120),
            linkUrl: `/clubs/${req.params.clubId}`,
          })
        ));
      }
      res.json(announcement);
    } catch (err) {
      console.error("Error creating announcement:", err);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.delete("/api/organizer/clubs/:clubId/announcements/:id", isAuthenticated, requireClubManager(), async (req: any, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id, req.params.clubId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting announcement:", err);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // ── POLLS ────────────────────────────────────────────────────────────────

  app.get("/api/clubs/:clubId/polls", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const polls = await storage.getClubPolls(req.params.clubId, userId);
      res.json(polls);
    } catch (err) {
      console.error("Error fetching polls:", err);
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  app.post("/api/organizer/clubs/:clubId/polls", isAuthenticated, requireClubManager(), async (req: any, res) => {
    try {
      const { question, options } = req.body;
      if (!question?.trim()) return res.status(400).json({ message: "Question is required" });
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: "At least 2 options required" });
      }
      const poll = await storage.createPoll({
        clubId: req.params.clubId,
        question: question.trim(),
        options: options.map((o: string) => o.trim()).filter(Boolean),
      });
      res.json(poll);
    } catch (err) {
      console.error("Error creating poll:", err);
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  app.delete("/api/organizer/clubs/:clubId/polls/:pollId", isAuthenticated, requireClubManager(), async (req: any, res) => {
    try {
      await storage.deletePoll(req.params.pollId, req.params.clubId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting poll:", err);
      res.status(500).json({ message: "Failed to delete poll" });
    }
  });

  app.patch("/api/organizer/clubs/:clubId/polls/:pollId/close", isAuthenticated, requireClubManager(), async (req: any, res) => {
    try {
      await storage.closePoll(req.params.pollId, req.params.clubId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error closing poll:", err);
      res.status(500).json({ message: "Failed to close poll" });
    }
  });

  app.post("/api/polls/:pollId/vote", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { optionIndex } = req.body;
      if (optionIndex === undefined || optionIndex === null) {
        return res.status(400).json({ message: "optionIndex is required" });
      }
      await storage.castVote(req.params.pollId, userId, Number(optionIndex));
      res.json({ success: true });
    } catch (err) {
      console.error("Error casting vote:", err);
      res.status(500).json({ message: "Failed to cast vote" });
    }
  });

  // ── CO-ORGANISERS ────────────────────────────────────────────────────────

  app.get("/api/organizer/clubs/:clubId/co-organisers", isAuthenticated, requireClubCreator(), async (req: any, res) => {
    try {
      const club = await storage.getClub(req.params.clubId);
      if (!club) return res.status(404).json({ message: "Club not found" });
      const ids = club.coOrganiserUserIds ?? [];
      const members = await Promise.all(ids.map(id => storage.getUser(id)));
      res.json(members.filter(Boolean).map(u => ({
        userId: u!.id,
        name: [u!.firstName, u!.lastName].filter(Boolean).join(" ") || "Member",
        profileImageUrl: u!.profileImageUrl,
      })));
    } catch (err) {
      console.error("Error fetching co-organisers:", err);
      res.status(500).json({ message: "Failed to fetch co-organisers" });
    }
  });

  app.post("/api/organizer/clubs/:clubId/co-organisers", isAuthenticated, requireClubCreator(), async (req: any, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: "userId is required" });
      const club = await storage.getClub(req.params.clubId);
      if (!club) return res.status(404).json({ message: "Club not found" });
      if ((club.coOrganiserUserIds ?? []).includes(userId)) {
        return res.status(400).json({ message: "Already a co-organiser" });
      }
      await storage.addCoOrganiser(req.params.clubId, userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error adding co-organiser:", err);
      res.status(500).json({ message: "Failed to add co-organiser" });
    }
  });

  app.delete("/api/organizer/clubs/:clubId/co-organisers/:userId", isAuthenticated, requireClubCreator(), async (req: any, res) => {
    try {
      await storage.removeCoOrganiser(req.params.clubId, req.params.userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error removing co-organiser:", err);
      res.status(500).json({ message: "Failed to remove co-organiser" });
    }
  });

  app.get("/api/og-image/club/:id", async (req, res) => {
    try {
      const club = await storage.getClub(req.params.id as string);
      if (!club) return res.status(404).send("Not found");
      const svg = buildClubSvg({
        emoji: club.emoji,
        name: club.name,
        category: club.category,
        shortDesc: club.shortDesc,
        organizerName: club.organizerName ?? undefined,
      });
      res.set({
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      });
      res.send(svg);
    } catch (err) {
      console.error("Error generating club OG image:", err);
      res.status(500).send("Error");
    }
  });

  app.get("/api/og-image/event/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id as string);
      if (!event) return res.status(404).send("Not found");
      let clubName: string | undefined;
      let clubEmoji: string | undefined;
      if (event.clubId) {
        const club = await storage.getClub(event.clubId);
        clubName = club?.name;
        clubEmoji = club?.emoji;
      }
      const svg = buildEventSvg({
        title: event.title,
        startsAt: new Date(event.startsAt),
        locationText: event.locationText,
        clubName,
        clubEmoji,
      });
      res.set({
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      });
      res.send(svg);
    } catch (err) {
      console.error("Error generating event OG image:", err);
      res.status(500).send("Error");
    }
  });

  app.post("/api/moments/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.likeMoment(req.params.id, userId);
      const moment = await storage.getMomentById(req.params.id);
      res.json({ success: true, likesCount: moment?.likesCount ?? 0 });
    } catch (err) {
      console.error("Error liking moment:", err);
      res.status(500).json({ message: "Failed to like moment" });
    }
  });

  app.delete("/api/moments/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unlikeMoment(req.params.id, userId);
      const moment = await storage.getMomentById(req.params.id);
      res.json({ success: true, likesCount: moment?.likesCount ?? 0 });
    } catch (err) {
      console.error("Error unliking moment:", err);
      res.status(500).json({ message: "Failed to unlike moment" });
    }
  });

  app.get("/api/moments/:id/like-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const liked = await storage.getMomentLikeStatus(req.params.id, userId);
      res.json({ liked });
    } catch (err) {
      res.status(500).json({ message: "Failed to get like status" });
    }
  });

  app.get("/api/events/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getEventComments(req.params.id);
      res.json(comments);
    } catch (err) {
      console.error("Error fetching event comments:", err);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/events/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { text } = req.body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ message: "Comment text is required" });
      }
      if (text.trim().length > 300) {
        return res.status(400).json({ message: "Comment too long (max 300 chars)" });
      }
      const user = await storage.getUser(userId);
      const userName = user?.firstName || user?.email?.split("@")[0] || "Member";
      const comment = await storage.createEventComment(req.params.id, userId, userName, user?.profileImageUrl ?? null, text.trim());
      res.status(201).json(comment);
    } catch (err) {
      console.error("Error creating event comment:", err);
      res.status(500).json({ message: "Failed to post comment" });
    }
  });

  app.get("/api/user/founding-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const foundingClubs = await storage.getUserFoundingClubs(userId);
      res.json({ clubs: foundingClubs });
    } catch (err) {
      console.error("Error fetching founding status:", err);
      res.status(500).json({ message: "Failed to fetch founding status" });
    }
  });

  app.get("/club/:id", async (req, res, next) => {
    try {
      if (!isCrawler(req.headers["user-agent"])) return next();
      const club = await storage.getClub(req.params.id as string);
      if (!club) return next();
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const template = await readHtmlTemplate();
      const html = buildOgHtml(template, {
        title: `${club.emoji} ${club.name} | CultFam Tirupati`,
        description: club.shortDesc,
        imageUrl: `${baseUrl}/api/og-image/club/${club.id}`,
        url: `${baseUrl}/club/${club.id}`,
        type: "website",
      });
      res.status(200).set("Content-Type", "text/html").end(html);
    } catch (err) {
      console.error("Error serving club OG page:", err);
      next();
    }
  });

  app.get("/event/:id", async (req, res, next) => {
    try {
      if (!isCrawler(req.headers["user-agent"])) return next();
      const event = await storage.getEvent(req.params.id as string);
      if (!event) return next();
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const d = new Date(event.startsAt);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateStr = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
      const fallbackDesc = event.description
        ?? `${dateStr} at ${event.locationText}`;
      const template = await readHtmlTemplate();
      const html = buildOgHtml(template, {
        title: `${event.title} | CultFam`,
        description: fallbackDesc.slice(0, 200),
        imageUrl: `${baseUrl}/api/og-image/event/${event.id}`,
        url: `${baseUrl}/event/${event.id}`,
        type: "website",
      });
      res.status(200).set("Content-Type", "text/html").end(html);
    } catch (err) {
      console.error("Error serving event OG page:", err);
      next();
    }
  });

  app.get("/api/events/:id/attendees-for-kudo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const attendees = await storage.getEventAttendeesForKudo(id, userId);
      res.json(attendees);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  app.get("/api/events/:id/kudos/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const hasGiven = await storage.hasGivenKudo(id, userId);
      res.json({ hasGiven });
    } catch (err) {
      res.status(500).json({ message: "Failed to check kudo status" });
    }
  });

  app.post("/api/events/:id/kudos", isAuthenticated, async (req: any, res) => {
    try {
      const giverId = req.user.claims.sub;
      const { id: eventId } = req.params;
      const { receiverId, kudoType } = req.body;

      if (!receiverId || !kudoType) {
        return res.status(400).json({ message: "receiverId and kudoType are required" });
      }
      const validTypes = ["Most Welcoming", "Most Energetic", "Best Conversation", "Always On Time"];
      if (!validTypes.includes(kudoType)) {
        return res.status(400).json({ message: "Invalid kudo type" });
      }

      const event = await storage.getEvent(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });

      const alreadyGiven = await storage.hasGivenKudo(eventId, giverId);
      if (alreadyGiven) return res.status(409).json({ message: "You have already given a kudo for this event" });

      const giver = await storage.getUser(giverId);
      const kudo = await storage.createKudo({ eventId, giverId, receiverId, kudoType });

      await storage.createNotification({
        userId: receiverId,
        type: "kudo",
        title: "You received a kudo! 🏅",
        message: `Someone at ${event.title} gave you a "${kudoType}" kudo.`,
        linkUrl: `/profile`,
        isRead: false,
      });

      res.status(201).json(kudo);
    } catch (err: any) {
      if (err?.code === "23505") {
        return res.status(409).json({ message: "You have already given a kudo for this event" });
      }
      console.error("Error creating kudo:", err);
      res.status(500).json({ message: "Failed to create kudo" });
    }
  });

  app.get("/api/user/kudos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userKudos = await storage.getKudosByReceiver(userId);
      res.json(userKudos);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch kudos" });
    }
  });

  return httpServer;
}

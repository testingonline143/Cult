import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSubmissionSchema, insertJoinRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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
      res.json({ success: true, message: "Request saved", data: request });
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      console.error("Error creating join request:", err);
      res.status(500).json({ success: false, message: "Failed to save join request" });
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

  return httpServer;
}

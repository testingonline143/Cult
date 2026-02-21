import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSubmissionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/clubs", async (_req, res) => {
    try {
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

  app.post("/api/club-submissions", async (req, res) => {
    try {
      const validated = insertClubSubmissionSchema.parse(req.body);
      const submission = await storage.createClubSubmission(validated);
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating club submission:", err);
      res.status(500).json({ message: "Failed to submit club" });
    }
  });

  return httpServer;
}

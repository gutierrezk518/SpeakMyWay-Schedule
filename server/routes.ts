import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCardSchema, 
  insertSettingsSchema, 
  insertRoutineSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // API endpoints
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json(user);
  });

  // Card routes
  app.get("/api/cards", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const language = (req.query.language as string) || "en";
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cards = await storage.getCards(userId, language);
    return res.json(cards);
  });

  app.get("/api/cards/category/:category", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const language = (req.query.language as string) || "en";
    const category = req.params.category;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cards = await storage.getCardsByCategory(userId, category, language);
    return res.json(cards);
  });

  app.get("/api/cards/subcategory/:category/:subcategory", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const language = (req.query.language as string) || "en";
    const { category, subcategory } = req.params;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cards = await storage.getCardsBySubcategory(userId, category, subcategory, language);
    return res.json(cards);
  });

  app.get("/api/cards/most-used", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const language = (req.query.language as string) || "en";
    const limit = parseInt(req.query.limit as string) || 12;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cards = await storage.getMostUsedCards(userId, limit, language);
    return res.json(cards);
  });

  app.post("/api/cards", async (req: Request, res: Response) => {
    try {
      const cardData = insertCardSchema.parse(req.body);
      const card = await storage.createCard(cardData);
      return res.status(201).json(card);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.patch("/api/cards/:id/usage", async (req: Request, res: Response) => {
    const cardId = parseInt(req.params.id);
    
    if (isNaN(cardId)) {
      return res.status(400).json({ message: "Invalid card ID" });
    }
    
    try {
      const updatedCard = await storage.updateCardUsage(cardId);
      return res.json(updatedCard);
    } catch (error) {
      return res.status(404).json({ message: "Card not found" });
    }
  });

  // Settings routes
  app.get("/api/settings/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const settings = await storage.getSettings(userId);
    
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    
    return res.json(settings);
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const settingsData = insertSettingsSchema.parse(req.body);
      const settings = await storage.createSettings(settingsData);
      return res.status(201).json(settings);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.patch("/api/settings/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const updatedSettings = await storage.updateSettings(userId, req.body);
      return res.json(updatedSettings);
    } catch (error) {
      return res.status(404).json({ message: "Settings not found" });
    }
  });

  // Routine routes
  app.get("/api/routines", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const routines = await storage.getRoutines(userId);
    return res.json(routines);
  });

  app.get("/api/routines/:id", async (req: Request, res: Response) => {
    const routineId = parseInt(req.params.id);
    
    if (isNaN(routineId)) {
      return res.status(400).json({ message: "Invalid routine ID" });
    }
    
    const routine = await storage.getRoutine(routineId);
    
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    
    return res.json(routine);
  });

  app.post("/api/routines", async (req: Request, res: Response) => {
    try {
      const routineData = insertRoutineSchema.parse(req.body);
      const routine = await storage.createRoutine(routineData);
      return res.status(201).json(routine);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.patch("/api/routines/:id", async (req: Request, res: Response) => {
    const routineId = parseInt(req.params.id);
    
    if (isNaN(routineId)) {
      return res.status(400).json({ message: "Invalid routine ID" });
    }
    
    try {
      const updatedRoutine = await storage.updateRoutine(routineId, req.body);
      return res.json(updatedRoutine);
    } catch (error) {
      return res.status(404).json({ message: "Routine not found" });
    }
  });

  app.delete("/api/routines/:id", async (req: Request, res: Response) => {
    const routineId = parseInt(req.params.id);
    
    if (isNaN(routineId)) {
      return res.status(400).json({ message: "Invalid routine ID" });
    }
    
    const deleted = await storage.deleteRoutine(routineId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Routine not found" });
    }
    
    return res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}

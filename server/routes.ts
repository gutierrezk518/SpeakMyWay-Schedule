import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCardSchema, 
  insertSettingsSchema, 
  insertRoutineSchema,
  insertCategorySchema,
  insertSubcategorySchema,
  insertCoreWordSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import * as csvParser from "csv-parse/sync";
import { setupAuth } from "./auth";

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
      
      // Ensure GDPR compliance by requiring consent
      if (userData.consentGiven !== true) {
        return res.status(400).json({ message: "User consent is required" });
      }
      
      // Set the created timestamp if not provided
      if (!userData.createdAt) {
        userData.createdAt = new Date().toISOString();
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
  
  // GDPR-related consent endpoints
  app.post("/api/users/:id/consent", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Validate consent data
      const consentData = {
        consentGiven: Boolean(req.body.consentGiven),
        consentDate: req.body.consentDate || new Date().toISOString(),
        marketingConsent: Boolean(req.body.marketingConsent),
        dataRetentionConsent: Boolean(req.body.dataRetentionConsent)
      };
      
      // Update user with consent information
      const updatedUser = await storage.updateUser(userId, consentData);
      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update user consent" });
    }
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

  // Category routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    const type = req.query.type as string;
    const categories = await storage.getCategories(type);
    return res.json(categories);
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const category = await storage.getCategory(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    return res.json(category);
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      return res.status(201).json(category);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.patch("/api/categories/:id", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    try {
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      return res.json(updatedCategory);
    } catch (error) {
      return res.status(404).json({ message: "Category not found" });
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const deleted = await storage.deleteCategory(categoryId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    return res.status(204).end();
  });

  // Subcategory routes
  app.get("/api/subcategories", async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    if (categoryId !== undefined && isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const subcategories = categoryId !== undefined
      ? await storage.getSubcategories(categoryId)
      : await storage.getAllSubcategories();
      
    return res.json(subcategories);
  });

  app.get("/api/subcategories/:id", async (req: Request, res: Response) => {
    const subcategoryId = parseInt(req.params.id);
    
    if (isNaN(subcategoryId)) {
      return res.status(400).json({ message: "Invalid subcategory ID" });
    }
    
    const subcategory = await storage.getSubcategory(subcategoryId);
    
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    
    return res.json(subcategory);
  });

  app.post("/api/subcategories", async (req: Request, res: Response) => {
    try {
      const subcategoryData = insertSubcategorySchema.parse(req.body);
      const subcategory = await storage.createSubcategory(subcategoryData);
      return res.status(201).json(subcategory);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.patch("/api/subcategories/:id", async (req: Request, res: Response) => {
    const subcategoryId = parseInt(req.params.id);
    
    if (isNaN(subcategoryId)) {
      return res.status(400).json({ message: "Invalid subcategory ID" });
    }
    
    try {
      const updatedSubcategory = await storage.updateSubcategory(subcategoryId, req.body);
      return res.json(updatedSubcategory);
    } catch (error) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
  });

  app.delete("/api/subcategories/:id", async (req: Request, res: Response) => {
    const subcategoryId = parseInt(req.params.id);
    
    if (isNaN(subcategoryId)) {
      return res.status(400).json({ message: "Invalid subcategory ID" });
    }
    
    const deleted = await storage.deleteSubcategory(subcategoryId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    
    return res.status(204).end();
  });

  // Core Words routes
  app.get("/api/corewords", async (req: Request, res: Response) => {
    const coreWords = await storage.getCoreWords();
    return res.json(coreWords);
  });

  app.get("/api/corewords/:id", async (req: Request, res: Response) => {
    const coreWordId = parseInt(req.params.id);
    
    if (isNaN(coreWordId)) {
      return res.status(400).json({ message: "Invalid core word ID" });
    }
    
    const coreWord = await storage.getCoreWord(coreWordId);
    
    if (!coreWord) {
      return res.status(404).json({ message: "Core word not found" });
    }
    
    return res.json(coreWord);
  });

  app.post("/api/corewords", async (req: Request, res: Response) => {
    try {
      const coreWordData = insertCoreWordSchema.parse(req.body);
      const coreWord = await storage.createCoreWord(coreWordData);
      return res.status(201).json(coreWord);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.patch("/api/corewords/:id", async (req: Request, res: Response) => {
    const coreWordId = parseInt(req.params.id);
    
    if (isNaN(coreWordId)) {
      return res.status(400).json({ message: "Invalid core word ID" });
    }
    
    try {
      const updatedCoreWord = await storage.updateCoreWord(coreWordId, req.body);
      return res.json(updatedCoreWord);
    } catch (error) {
      return res.status(404).json({ message: "Core word not found" });
    }
  });

  app.delete("/api/corewords/:id", async (req: Request, res: Response) => {
    const coreWordId = parseInt(req.params.id);
    
    if (isNaN(coreWordId)) {
      return res.status(400).json({ message: "Invalid core word ID" });
    }
    
    const deleted = await storage.deleteCoreWord(coreWordId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Core word not found" });
    }
    
    return res.status(204).end();
  });

  // Enhanced Card routes for the updated schema
  app.get("/api/cards/schedule", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const language = (req.query.language as string) || "en";
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cards = await storage.getScheduleCards(userId, language);
    return res.json(cards);
  });

  app.get("/api/cards/communication", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const language = (req.query.language as string) || "en";
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const cards = await storage.getCommunicationCards(userId, language);
    return res.json(cards);
  });

  app.get("/api/cards/:id", async (req: Request, res: Response) => {
    const cardId = parseInt(req.params.id);
    
    if (isNaN(cardId)) {
      return res.status(400).json({ message: "Invalid card ID" });
    }
    
    const card = await storage.getCard(cardId);
    
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    
    return res.json(card);
  });

  app.patch("/api/cards/:id", async (req: Request, res: Response) => {
    const cardId = parseInt(req.params.id);
    
    if (isNaN(cardId)) {
      return res.status(400).json({ message: "Invalid card ID" });
    }
    
    try {
      const updatedCard = await storage.updateCard(cardId, req.body);
      return res.json(updatedCard);
    } catch (error) {
      return res.status(404).json({ message: "Card not found" });
    }
  });

  app.delete("/api/cards/:id", async (req: Request, res: Response) => {
    const cardId = parseInt(req.params.id);
    
    if (isNaN(cardId)) {
      return res.status(400).json({ message: "Invalid card ID" });
    }
    
    const deleted = await storage.deleteCard(cardId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Card not found" });
    }
    
    return res.status(204).end();
  });

  // CSV Import/Export endpoints
  const upload = multer({ storage: multer.memoryStorage() });
  
  app.post("/api/import/categories", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileContent = req.file.buffer.toString();
      const records = csvParser.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const results = [];
      
      for (const record of records) {
        try {
          // Transform CSV values to appropriate types
          const categoryData = {
            name: record.name,
            nameEs: record.nameEs || null,
            icon: record.icon,
            color: record.color || "blue-500",
            type: record.type || "vocabulary",
            sortOrder: parseInt(record.sortOrder) || 0
          };
          
          const category = await storage.createCategory(categoryData);
          results.push({
            success: true,
            data: category
          });
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            record
          });
        }
      }
      
      return res.status(200).json({
        totalImported: results.filter(r => r.success).length,
        totalErrors: results.filter(r => !r.success).length,
        details: results
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Error processing CSV file",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.post("/api/import/subcategories", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileContent = req.file.buffer.toString();
      const records = csvParser.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const results = [];
      
      for (const record of records) {
        try {
          // Transform CSV values to appropriate types
          const subcategoryData = {
            categoryId: parseInt(record.categoryId),
            name: record.name,
            nameEs: record.nameEs || null,
            icon: record.icon || null,
            color: record.color || null,
            sortOrder: parseInt(record.sortOrder) || 0
          };
          
          const subcategory = await storage.createSubcategory(subcategoryData);
          results.push({
            success: true,
            data: subcategory
          });
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            record
          });
        }
      }
      
      return res.status(200).json({
        totalImported: results.filter(r => r.success).length,
        totalErrors: results.filter(r => !r.success).length,
        details: results
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Error processing CSV file",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.post("/api/import/corewords", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileContent = req.file.buffer.toString();
      const records = csvParser.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const results = [];
      
      for (const record of records) {
        try {
          // Transform CSV values to appropriate types
          const coreWordData = {
            text: record.text,
            textEs: record.textEs || null,
            icon: record.icon,
            canBePlural: record.canBePlural === "true",
            color: record.color || null,
            sortOrder: parseInt(record.sortOrder) || 0
          };
          
          const coreWord = await storage.createCoreWord(coreWordData);
          results.push({
            success: true,
            data: coreWord
          });
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            record
          });
        }
      }
      
      return res.status(200).json({
        totalImported: results.filter(r => r.success).length,
        totalErrors: results.filter(r => !r.success).length,
        details: results
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Error processing CSV file",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.post("/api/import/cards", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileContent = req.file.buffer.toString();
      const records = csvParser.parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const results = [];
      
      for (const record of records) {
        try {
          // Transform CSV values to appropriate types
          const cardData = {
            text: record.text,
            speechText: record.speechText || record.text,
            textEs: record.textEs || null,
            speechTextEs: record.speechTextEs || record.textEs,
            category: record.category,
            subcategory: record.subcategory,
            icon: record.icon,
            bgColor: record.bgColor || "gray-100",
            canBePlural: record.canBePlural === "true",
            language: record.language || "en",
            isScheduleCard: record.isScheduleCard === "true",
            isCommunicationCard: record.isCommunicationCard === "true",
            userId: req.query.userId ? parseInt(req.query.userId as string) : null,
            usageCount: 0
          };
          
          const card = await storage.createCard(cardData);
          results.push({
            success: true,
            data: card
          });
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            record
          });
        }
      }
      
      return res.status(200).json({
        totalImported: results.filter(r => r.success).length,
        totalErrors: results.filter(r => !r.success).length,
        details: results
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Error processing CSV file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

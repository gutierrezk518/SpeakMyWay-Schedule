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
  insertCoreWordSchema,
  insertLoginHistorySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import * as csvParser from "csv-parse/sync";
import { setupAuth } from "./auth";
import { isAdmin } from "./middleware/admin";
import { createVerificationToken, verifyEmailToken, generateVerificationUrl } from "./utils/email-verification";
import { sendEmail, sendPasswordResetEmail } from "./utils/email-service";
import { welcomeEmail, welcomeEmailText, passwordResetEmail, passwordResetEmailText } from "./utils/email-templates";
import { createPasswordResetToken, verifyPasswordResetToken, usePasswordResetToken, generatePasswordResetUrl } from "./utils/password-reset";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);
  
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
      
      // Ensure email field is always set to be the same as username
      if (!userData.email) {
        userData.email = userData.username;
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // If user has email, send a verification email
      if (user.email) {
        try {
          // Create verification token
          const token = await createVerificationToken(user.id, user.email);
          
          // Generate verification URL
          const verificationUrl = generateVerificationUrl(token);
          
          // Get user's display name or username
          const name = user.displayName || user.username;
          
          // Send welcome email with verification link
          await sendEmail({
            to: user.email,
            subject: `Welcome to SpeakMyWay, ${name}!`,
            htmlBody: welcomeEmail(name, verificationUrl),
            textBody: welcomeEmailText(name, verificationUrl),
          });
          
          // Log the success but don't wait for it to complete
          console.log(`Welcome email sent to ${user.email} for user ${user.id}`);
        } catch (emailError) {
          // Log the error but don't fail registration
          console.error("Failed to send welcome email:", emailError);
        }
      }
      
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

  // Set up authentication
  setupAuth(app);

  // Admin routes - protected by isAdmin middleware
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  app.get("/api/admin/users/count", isAdmin, async (req: Request, res: Response) => {
    try {
      const count = await storage.getUserCount();
      return res.json({ count });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve user count" });
    }
  });

  app.get("/api/admin/users/new", isAdmin, async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const count = await storage.getNewUsersCount(days);
      return res.json({ count, days });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve new user count" });
    }
  });

  app.get("/api/admin/users/active", isAdmin, async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const count = await storage.getActiveUsersCount(days);
      return res.json({ count, days });
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve active user count" });
    }
  });

  app.get("/api/admin/users/most-active", isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getMostActiveUsers(limit);
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve most active users" });
    }
  });
  
  // DELETE endpoint for admins to delete a user
  app.delete("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists first
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting your own account while logged in as admin
      if (req.user && req.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account while logged in" });
      }
      
      // Delete the user and all associated data
      const deleted = await storage.deleteUser(userId);
      
      if (deleted) {
        return res.status(200).json({ message: "User deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ 
        message: "Failed to delete user", 
        error: (error as Error).message 
      });
    }
  });
  
  // POST endpoint for admins to send password reset email to a user
  app.post("/api/admin/users/:id/send-password-reset", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists first
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has an email address
      if (!user.email) {
        return res.status(400).json({ message: "User does not have an email address" });
      }
      
      // Import password reset utilities to avoid circular dependencies
      const { createPasswordResetToken, generatePasswordResetUrl } = await import('./utils/password-reset');
      
      // Generate password reset token
      const token = await createPasswordResetToken(userId);
      
      // Generate reset URL
      const resetUrl = generatePasswordResetUrl(token);
      
      // Send password reset email
      const displayName = user.displayName || '';
      const emailSent = await sendPasswordResetEmail(user.email, displayName, resetUrl);
      
      if (emailSent) {
        return res.status(200).json({ 
          message: `Password reset email sent to ${user.email}`,
          success: true
        });
      } else {
        return res.status(500).json({ 
          message: "Failed to send password reset email. Check server logs for details.",
          success: false
        });
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return res.status(500).json({ 
        message: "Failed to send password reset email",
        error: (error as Error).message 
      });
    }
  });
  
  app.patch("/api/admin/users/:id/admin", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { isAdmin: makeAdmin } = req.body;
      if (typeof makeAdmin !== 'boolean') {
        return res.status(400).json({ message: "isAdmin must be a boolean value" });
      }
      
      const user = await storage.makeUserAdmin(userId, makeAdmin);
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update user admin status" });
    }
  });
  
  app.get("/api/admin/users/:id/login-history", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const loginHistory = await storage.getUserLoginHistory(userId);
      return res.json(loginHistory);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve login history" });
    }
  });
  
  app.post("/api/admin/login-history", isAdmin, async (req: Request, res: Response) => {
    try {
      const loginData = insertLoginHistorySchema.parse(req.body);
      const history = await storage.recordLogin(loginData);
      return res.status(201).json(history);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  // Endpoint for admin to send welcome email to a user
  app.post("/api/admin/users/:id/send-welcome-email", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user details
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.email) {
        return res.status(400).json({ message: "User does not have an email address" });
      }
      
      // Import email service here to avoid circular dependencies
      const { sendEmail, generateWelcomeEmailTemplate } = await import('./utils/email-service');
      
      // Generate and send welcome email
      const { html, text } = generateWelcomeEmailTemplate(user.username, user.id);
      
      // If we're in development mode without verified email, we'll see the logs
      // but return success for better testing experience
      const isDev = process.env.NODE_ENV === 'development' && !process.env.VERIFIED_EMAIL;
      
      const emailResult = await sendEmail({
        to: user.email,
        subject: `Welcome to SpeakMyWay, ${user.username}!`,
        htmlBody: html,
        textBody: text
      });
      
      if (emailResult) {
        if (isDev) {
          return res.status(200).json({ 
            message: `Welcome email preview generated for ${user.email}. Check server logs.`,
            note: "In development mode, emails are logged but not sent. Verify emails in AWS SES to send real emails."
          });
        }
        return res.status(200).json({ message: `Welcome email sent to ${user.email}` });
      } else {
        // More informative error in development
        if (isDev) {
          return res.status(200).json({
            message: "Email not sent - running in development mode",
            note: "To send real emails, verify sender and recipient emails in AWS SES and set the VERIFIED_EMAIL environment variable"
          });
        }
        return res.status(500).json({ message: "Failed to send welcome email. Check server logs for details." });
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return res.status(500).json({ message: "Failed to send welcome email" });
    }
  });
  
  // Endpoint to check AWS SES email verification status
  app.post("/api/admin/check-email-verification", isAdmin, async (req: Request, res: Response) => {
    try {
      const { emails } = req.body;
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: "Please provide an array of email addresses to check" });
      }
      
      // Import verification check utility
      const { checkEmailVerificationStatus } = await import('./utils/check-ses-verification');
      
      // Check verification status
      const verificationStatus = await checkEmailVerificationStatus(emails);
      
      return res.status(200).json({ 
        verification: verificationStatus,
        region: process.env.AWS_REGION || 'us-east-2',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking email verification:', error);
      return res.status(500).json({ 
        message: "Failed to check email verification status",
        error: (error as Error).message 
      });
    }
  });
  
  // Special endpoint for testing emails with custom recipient address
  app.post("/api/admin/test-email", isAdmin, async (req: Request, res: Response) => {
    try {
      const { recipientEmail, provider } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
      // Import our email test utilities 
      const { sendTestEmail } = await import('./utils/email-tests');
      
      // Send the test email with the specified provider or default
      const emailResult = await sendTestEmail(
        recipientEmail, 
        provider === 'sendgrid' ? 'resend' : undefined // Switched to resend instead of sendgrid
      );
      
      if (emailResult) {
        return res.status(200).json({ 
          message: `Test email sent to ${recipientEmail}${provider ? ` via ${provider}` : ''}`,
          success: true
        });
      } else {
        return res.status(500).json({ 
          message: "Failed to send test email. Check server logs for details.",
          success: false
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      return res.status(500).json({ 
        message: "Failed to send test email",
        error: (error as Error).message 
      });
    }
  });
  
  // Special endpoint for testing welcome emails with custom recipient address
  app.post("/api/admin/test-welcome-email", isAdmin, async (req: Request, res: Response) => {
    try {
      const { recipientEmail, username } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
      // Import our email test utilities 
      const { sendTestWelcomeEmail } = await import('./utils/email-tests');
      
      // Send the test welcome email
      const emailResult = await sendTestWelcomeEmail(
        recipientEmail,
        username || 'TestUser'
      );
      
      if (emailResult) {
        return res.status(200).json({ 
          message: `Welcome email sent to ${recipientEmail}`,
          success: true
        });
      } else {
        return res.status(500).json({ 
          message: "Failed to send welcome email. Check server logs for details.",
          success: false
        });
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return res.status(500).json({ 
        message: "Failed to send welcome email",
        error: (error as Error).message 
      });
    }
  });
  
  // Temporary public endpoint for testing welcome email
  app.post("/api/public-test-welcome-email", async (req: Request, res: Response) => {
    try {
      const { recipientEmail, username = "TestUser" } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
      // Import our email test utilities 
      const { sendTestWelcomeEmail } = await import('./utils/email-tests');
      
      // Send the test welcome email
      const emailResult = await sendTestWelcomeEmail(
        recipientEmail,
        username || 'TestUser'
      );
      
      if (emailResult) {
        return res.status(200).json({ 
          message: `Welcome email sent to ${recipientEmail}`,
          success: true
        });
      } else {
        return res.status(500).json({ 
          message: "Failed to send welcome email. Check server logs for details.",
          success: false
        });
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return res.status(500).json({ 
        message: "Failed to send welcome email",
        error: (error as Error).message 
      });
    }
  });
  
  // Password reset endpoints
  
  // Request password reset
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    try {
      // Find user by email (which is stored in username field)
      const user = await storage.getUserByUsername(email);
      
      if (!user) {
        // For security reasons, don't reveal whether the email exists
        // Just return a generic success message
        return res.json({ message: "If your email exists in our system, you will receive a password reset link shortly." });
      }
      
      // Generate password reset token
      const token = await createPasswordResetToken(user.id);
      
      // Create reset URL
      const resetUrl = generatePasswordResetUrl(token);
      
      // Send password reset email
      const displayName = user.displayName || '';
      await sendPasswordResetEmail(email, displayName, resetUrl);
      
      return res.json({ message: "If your email exists in our system, you will receive a password reset link shortly." });
    } catch (error) {
      console.error("Password reset request error:", error);
      // Still return a generic success message to avoid revealing email existence
      return res.json({ message: "If your email exists in our system, you will receive a password reset link shortly." });
    }
  });
  
  // Verify password reset token
  app.get("/api/verify-reset-token", async (req: Request, res: Response) => {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    
    try {
      const userId = await verifyPasswordResetToken(token);
      
      if (userId) {
        return res.json({ valid: true, userId });
      } else {
        return res.json({ valid: false, message: "Invalid or expired reset token" });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(500).json({ valid: false, message: "Failed to verify reset token" });
    }
  });
  
  // Reset password with token
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    
    try {
      // Verify token and get userId
      const userId = await verifyPasswordResetToken(token);
      
      if (!userId) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash the new password
      const { hashPassword } = await import('./auth');
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user's password
      await storage.updateUser(userId, { password: hashedPassword });
      
      // Mark token as used
      await usePasswordResetToken(token);
      
      return res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ message: "Failed to reset password" });
    }
  });
  
  // Email verification endpoints
  
  // Send verification email
  app.post("/api/send-verification", async (req: Request, res: Response) => {
    const { email, userId } = req.body;
    
    if (!email || !userId) {
      return res.status(400).json({ message: "Email and userId are required" });
    }
    
    try {
      // Get user info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      // Create verification token
      const token = await createVerificationToken(userId, email);
      
      // Generate verification URL
      const verificationUrl = generateVerificationUrl(token);
      
      // Get user's display name or username
      const name = user.displayName || user.username;
      
      // Send verification email
      const emailSent = await sendEmail({
        to: email,
        subject: "Verify your SpeakMyWay email address",
        htmlBody: welcomeEmail(name, verificationUrl),
        textBody: welcomeEmailText(name, verificationUrl),
      });
      
      if (emailSent) {
        return res.status(200).json({ message: "Verification email sent successfully" });
      } else {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      return res.status(500).json({ message: "Failed to send verification email" });
    }
  });
  
  // Verify email with token
  app.get("/verify-email", async (req: Request, res: Response) => {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).send(`
        <html>
          <head>
            <title>Email Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Failed</h1>
            <p>The verification link is invalid. Please request a new verification email.</p>
            <a href="/">Go to Homepage</a>
          </body>
        </html>
      `);
    }
    
    try {
      const verified = await verifyEmailToken(token);
      
      if (verified) {
        return res.status(200).send(`
          <html>
            <head>
              <title>Email Verified</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                .success { color: #2e7d32; }
              </style>
            </head>
            <body>
              <h1 class="success">Email Verified Successfully!</h1>
              <p>Your email has been verified. You can now use all features of SpeakMyWay.</p>
              <a href="/">Go to Homepage</a>
            </body>
          </html>
        `);
      } else {
        return res.status(400).send(`
          <html>
            <head>
              <title>Email Verification Failed</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                .error { color: #d32f2f; }
              </style>
            </head>
            <body>
              <h1 class="error">Verification Failed</h1>
              <p>The verification link is expired or has already been used. Please request a new verification email.</p>
              <a href="/">Go to Homepage</a>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      return res.status(500).send(`
        <html>
          <head>
            <title>Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <h1 class="error">Something went wrong</h1>
            <p>There was an error processing your verification. Please try again later.</p>
            <a href="/">Go to Homepage</a>
          </body>
        </html>
      `);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

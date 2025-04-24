import { 
  User, 
  InsertUser, 
  Card, 
  InsertCard, 
  Settings, 
  InsertSettings, 
  Routine, 
  InsertRoutine,
  Category,
  InsertCategory,
  Subcategory,
  InsertSubcategory,
  CoreWord,
  InsertCoreWord,
  EmailVerificationToken,
  InsertEmailVerificationToken,
  PasswordResetToken,
  InsertPasswordResetToken,
  LoginHistory,
  InsertLoginHistory
} from "@shared/schema";

import session from "express-session";

// Interface for storage operations
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  // Category operations
  getCategories(type?: string): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Subcategory operations
  getSubcategories(categoryId: number): Promise<Subcategory[]>;
  getSubcategory(id: number): Promise<Subcategory | undefined>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory>;
  deleteSubcategory(id: number): Promise<boolean>;
  
  // Core Word operations
  getCoreWords(): Promise<CoreWord[]>;
  getCoreWord(id: number): Promise<CoreWord | undefined>;
  createCoreWord(coreWord: InsertCoreWord): Promise<CoreWord>;
  updateCoreWord(id: number, coreWord: Partial<InsertCoreWord>): Promise<CoreWord>;
  deleteCoreWord(id: number): Promise<boolean>;
  
  // Card operations
  getCards(userId: number, language: string): Promise<Card[]>;
  getCardsByCategory(userId: number, category: string, language: string): Promise<Card[]>;
  getCardsBySubcategory(userId: number, category: string, subcategory: string, language: string): Promise<Card[]>;
  getScheduleCards(userId: number, language: string): Promise<Card[]>;
  getCommunicationCards(userId: number, language: string): Promise<Card[]>;
  getMostUsedCards(userId: number, limit: number, language: string): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<InsertCard>): Promise<Card>;
  updateCardUsage(id: number): Promise<Card>;
  deleteCard(id: number): Promise<boolean>;
  
  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Routine operations
  getRoutines(userId: number): Promise<Routine[]>;
  getRoutine(id: number): Promise<Routine | undefined>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: number, routine: Partial<InsertRoutine>): Promise<Routine>;
  deleteRoutine(id: number): Promise<boolean>;
  
  // Email verification operations
  createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  markEmailVerificationTokenUsed(token: string, clickedAt?: Date): Promise<boolean>;
  getActiveEmailVerificationTokensByUser(userId: number): Promise<EmailVerificationToken[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cards: Map<number, Card>;
  private settings: Map<number, Settings>;
  private routines: Map<number, Routine>;
  private userIdCounter: number;
  private cardIdCounter: number;
  private settingsIdCounter: number;
  private routineIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.cards = new Map();
    this.settings = new Map();
    this.routines = new Map();
    this.userIdCounter = 1;
    this.cardIdCounter = 1;
    this.settingsIdCounter = 1;
    this.routineIdCounter = 1;
    
    // Create an in-memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Add created timestamp if not present
    const createdAt = insertUser.createdAt || new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: false, 
      isEnterprise: false,
      createdAt 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: User = { ...existingUser, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Card operations
  async getCards(userId: number, language: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => (card.userId === userId || card.userId === null) && card.language === language
    );
  }

  async getCardsByCategory(userId: number, category: string, language: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => 
        (card.userId === userId || card.userId === null) && 
        card.category === category &&
        card.language === language
    );
  }

  async getCardsBySubcategory(userId: number, category: string, subcategory: string, language: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => 
        (card.userId === userId || card.userId === null) && 
        card.category === category &&
        card.subcategory === subcategory &&
        card.language === language
    );
  }

  async getMostUsedCards(userId: number, limit: number, language: string): Promise<Card[]> {
    return Array.from(this.cards.values())
      .filter((card) => (card.userId === userId || card.userId === null) && card.language === language)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.cardIdCounter++;
    const card: Card = { ...insertCard, id, usageCount: 0 };
    this.cards.set(id, card);
    return card;
  }

  async updateCardUsage(id: number): Promise<Card> {
    const card = this.cards.get(id);
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const updatedCard: Card = { ...card, usageCount: card.usageCount + 1 };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settingsIdCounter++;
    const settings: Settings = { ...insertSettings, id };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: number, updatedSettings: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings(userId);
    
    if (!existingSettings) {
      throw new Error(`Settings for user ${userId} not found`);
    }
    
    const newSettings: Settings = { ...existingSettings, ...updatedSettings };
    this.settings.set(existingSettings.id, newSettings);
    return newSettings;
  }

  // Routine operations
  async getRoutines(userId: number): Promise<Routine[]> {
    return Array.from(this.routines.values()).filter(
      (routine) => routine.userId === userId
    );
  }

  async getRoutine(id: number): Promise<Routine | undefined> {
    return this.routines.get(id);
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const id = this.routineIdCounter++;
    const routine: Routine = { ...insertRoutine, id };
    this.routines.set(id, routine);
    return routine;
  }

  async updateRoutine(id: number, updatedRoutine: Partial<InsertRoutine>): Promise<Routine> {
    const existingRoutine = this.routines.get(id);
    
    if (!existingRoutine) {
      throw new Error(`Routine with id ${id} not found`);
    }
    
    const newRoutine: Routine = { ...existingRoutine, ...updatedRoutine };
    this.routines.set(id, newRoutine);
    return newRoutine;
  }

  async deleteRoutine(id: number): Promise<boolean> {
    if (!this.routines.has(id)) {
      return false;
    }
    
    return this.routines.delete(id);
  }
  
  // Category operations (stubs to satisfy interface)
  async getCategories(_type?: string): Promise<Category[]> {
    return [];
  }
  
  async getCategory(_id: number): Promise<Category | undefined> {
    return undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    return { ...category, id: 1 };
  }
  
  async updateCategory(_id: number, category: Partial<InsertCategory>): Promise<Category> {
    return { ...category as any, id: 1 };
  }
  
  async deleteCategory(_id: number): Promise<boolean> {
    return true;
  }
  
  // Subcategory operations (stubs to satisfy interface)
  async getSubcategories(_categoryId: number): Promise<Subcategory[]> {
    return [];
  }
  
  async getSubcategory(_id: number): Promise<Subcategory | undefined> {
    return undefined;
  }
  
  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    return { ...subcategory, id: 1 };
  }
  
  async updateSubcategory(_id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory> {
    return { ...subcategory as any, id: 1 };
  }
  
  async deleteSubcategory(_id: number): Promise<boolean> {
    return true;
  }
  
  // Core Words operations (stubs to satisfy interface)
  async getCoreWords(): Promise<CoreWord[]> {
    return [];
  }
  
  async getCoreWord(_id: number): Promise<CoreWord | undefined> {
    return undefined;
  }
  
  async createCoreWord(coreWord: InsertCoreWord): Promise<CoreWord> {
    return { ...coreWord, id: 1 };
  }
  
  async updateCoreWord(_id: number, coreWord: Partial<InsertCoreWord>): Promise<CoreWord> {
    return { ...coreWord as any, id: 1 };
  }
  
  async deleteCoreWord(_id: number): Promise<boolean> {
    return true;
  }
  
  // Card additional operations (stubs to satisfy interface)
  async getScheduleCards(userId: number, language: string): Promise<Card[]> {
    return this.getCards(userId, language).then(cards => 
      cards.filter(card => card.isScheduleCard)
    );
  }
  
  async getCommunicationCards(userId: number, language: string): Promise<Card[]> {
    return this.getCards(userId, language).then(cards => 
      cards.filter(card => card.isCommunicationCard)
    );
  }
  
  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }
  
  async updateCard(id: number, updatedCard: Partial<InsertCard>): Promise<Card> {
    const card = this.cards.get(id);
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const newCard = { ...card, ...updatedCard };
    this.cards.set(id, newCard);
    return newCard;
  }
  
  async deleteCard(id: number): Promise<boolean> {
    if (!this.cards.has(id)) {
      return false;
    }
    
    return this.cards.delete(id);
  }
  
  // Email verification operations (stubs to satisfy interface)
  async createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<EmailVerificationToken> {
    return {
      ...token,
      id: 1,
      used: false,
      createdAt: new Date().toISOString(),
      clickedAt: null
    };
  }
  
  async getEmailVerificationToken(_token: string): Promise<EmailVerificationToken | undefined> {
    return undefined;
  }
  
  async markEmailVerificationTokenUsed(_token: string, clickedAt?: Date): Promise<boolean> {
    return true;
  }
  
  async getActiveEmailVerificationTokensByUser(_userId: number): Promise<EmailVerificationToken[]> {
    return [];
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage instead of MemStorage for persistent data
export const storage = new DatabaseStorage();

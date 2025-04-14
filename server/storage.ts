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
  InsertCoreWord
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

  constructor() {
    this.users = new Map();
    this.cards = new Map();
    this.settings = new Map();
    this.routines = new Map();
    this.userIdCounter = 1;
    this.cardIdCounter = 1;
    this.settingsIdCounter = 1;
    this.routineIdCounter = 1;
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
    const user: User = { ...insertUser, id, isPremium: false, isEnterprise: false };
    this.users.set(id, user);
    return user;
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
}

// Import the DatabaseStorage class
import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage instead of MemStorage for persistent data
export const storage = new DatabaseStorage();

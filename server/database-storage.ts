import { IStorage } from './storage';
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
  users,
  cards,
  categories,
  subcategories,
  coreWords,
  settings,
  routines
} from '@shared/schema';
import { db } from './db';
import { eq, and, isNull, desc, or } from 'drizzle-orm';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return user;
  }
  
  // Card operations
  async getCards(userId: number, language: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(
        and(
          or(eq(cards.userId, userId), isNull(cards.userId)),
          eq(cards.language, language)
        )
      );
  }

  async getCardsByCategory(userId: number, category: string, language: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(
        and(
          or(eq(cards.userId, userId), isNull(cards.userId)),
          eq(cards.category, category),
          eq(cards.language, language)
        )
      );
  }

  async getCardsBySubcategory(userId: number, category: string, subcategory: string, language: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(
        and(
          or(eq(cards.userId, userId), isNull(cards.userId)),
          eq(cards.category, category),
          eq(cards.subcategory, subcategory),
          eq(cards.language, language)
        )
      );
  }

  async getMostUsedCards(userId: number, limit: number, language: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(
        and(
          or(eq(cards.userId, userId), isNull(cards.userId)),
          eq(cards.language, language)
        )
      )
      .orderBy(desc(cards.usageCount))
      .limit(limit);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const [card] = await db
      .insert(cards)
      .values(insertCard)
      .returning();
    return card;
  }

  async updateCardUsage(id: number): Promise<Card> {
    const [card] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id));
    
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const [updatedCard] = await db
      .update(cards)
      .set({ usageCount: card.usageCount + 1 })
      .where(eq(cards.id, id))
      .returning();
    
    return updatedCard;
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [userSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));
    
    return userSettings;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [settingsRecord] = await db
      .insert(settings)
      .values(insertSettings)
      .returning();
    
    return settingsRecord;
  }

  async updateSettings(userId: number, updatedSettings: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings(userId);
    
    if (!existingSettings) {
      throw new Error(`Settings for user ${userId} not found`);
    }
    
    const [newSettings] = await db
      .update(settings)
      .set(updatedSettings)
      .where(eq(settings.id, existingSettings.id))
      .returning();
    
    return newSettings;
  }

  // Routine operations
  async getRoutines(userId: number): Promise<Routine[]> {
    return await db
      .select()
      .from(routines)
      .where(eq(routines.userId, userId));
  }

  async getRoutine(id: number): Promise<Routine | undefined> {
    const [routine] = await db
      .select()
      .from(routines)
      .where(eq(routines.id, id));
    
    return routine;
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const [routine] = await db
      .insert(routines)
      .values(insertRoutine)
      .returning();
    
    return routine;
  }

  async updateRoutine(id: number, updatedRoutine: Partial<InsertRoutine>): Promise<Routine> {
    const [routine] = await db
      .update(routines)
      .set(updatedRoutine)
      .where(eq(routines.id, id))
      .returning();
    
    if (!routine) {
      throw new Error(`Routine with id ${id} not found`);
    }
    
    return routine;
  }

  async deleteRoutine(id: number): Promise<boolean> {
    const result = await db
      .delete(routines)
      .where(eq(routines.id, id));
    
    return result.rowCount > 0;
  }

  // Category operations
  async getCategories(type?: string): Promise<Category[]> {
    if (type) {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.type, type))
        .orderBy(categories.sortOrder);
    }
    
    return await db
      .select()
      .from(categories)
      .orderBy(categories.sortOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    
    return category;
  }

  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(updatedCategory)
      .where(eq(categories.id, id))
      .returning();
    
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id));
    
    return result.rowCount > 0;
  }

  // Subcategory operations
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    return await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId))
      .orderBy(subcategories.sortOrder);
  }

  async getAllSubcategories(): Promise<Subcategory[]> {
    return await db
      .select()
      .from(subcategories)
      .orderBy(subcategories.sortOrder);
  }

  async getSubcategory(id: number): Promise<Subcategory | undefined> {
    const [subcategory] = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, id));
    
    return subcategory;
  }

  async createSubcategory(insertSubcategory: InsertSubcategory): Promise<Subcategory> {
    const [subcategory] = await db
      .insert(subcategories)
      .values(insertSubcategory)
      .returning();
    
    return subcategory;
  }

  async updateSubcategory(id: number, updatedSubcategory: Partial<InsertSubcategory>): Promise<Subcategory> {
    const [subcategory] = await db
      .update(subcategories)
      .set(updatedSubcategory)
      .where(eq(subcategories.id, id))
      .returning();
    
    if (!subcategory) {
      throw new Error(`Subcategory with id ${id} not found`);
    }
    
    return subcategory;
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    const result = await db
      .delete(subcategories)
      .where(eq(subcategories.id, id));
    
    return result.rowCount > 0;
  }

  // Core Words operations
  async getCoreWords(): Promise<CoreWord[]> {
    return await db
      .select()
      .from(coreWords)
      .orderBy(coreWords.sortOrder);
  }

  async getCoreWord(id: number): Promise<CoreWord | undefined> {
    const [coreWord] = await db
      .select()
      .from(coreWords)
      .where(eq(coreWords.id, id));
    
    return coreWord;
  }

  async createCoreWord(insertCoreWord: InsertCoreWord): Promise<CoreWord> {
    const [coreWord] = await db
      .insert(coreWords)
      .values(insertCoreWord)
      .returning();
    
    return coreWord;
  }

  async updateCoreWord(id: number, updatedCoreWord: Partial<InsertCoreWord>): Promise<CoreWord> {
    const [coreWord] = await db
      .update(coreWords)
      .set(updatedCoreWord)
      .where(eq(coreWords.id, id))
      .returning();
    
    if (!coreWord) {
      throw new Error(`Core word with id ${id} not found`);
    }
    
    return coreWord;
  }

  async deleteCoreWord(id: number): Promise<boolean> {
    const result = await db
      .delete(coreWords)
      .where(eq(coreWords.id, id));
    
    return result.rowCount > 0;
  }

  // Additional card operations
  async getScheduleCards(userId: number, language: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(
        and(
          or(eq(cards.userId, userId), isNull(cards.userId)),
          eq(cards.language, language),
          eq(cards.isScheduleCard, true)
        )
      );
  }

  async getCommunicationCards(userId: number, language: string): Promise<Card[]> {
    return await db
      .select()
      .from(cards)
      .where(
        and(
          or(eq(cards.userId, userId), isNull(cards.userId)),
          eq(cards.language, language),
          eq(cards.isCommunicationCard, true)
        )
      );
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id));
    
    return card;
  }

  async updateCard(id: number, updatedCard: Partial<InsertCard>): Promise<Card> {
    const [card] = await db
      .update(cards)
      .set(updatedCard)
      .where(eq(cards.id, id))
      .returning();
    
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    return card;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await db
      .delete(cards)
      .where(eq(cards.id, id));
    
    return result.rowCount > 0;
  }
}
import { users, cards, settings, routines } from "@shared/schema";
import { 
  User, 
  InsertUser, 
  Card, 
  InsertCard, 
  Settings, 
  InsertSettings, 
  Routine, 
  InsertRoutine 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, or } from "drizzle-orm";
import { IStorage } from "./storage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      eq(users.username, username.toLowerCase())
    );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure all required fields have values
    const userToInsert = {
      ...insertUser,
      username: insertUser.username.toLowerCase(),
      displayName: insertUser.displayName ?? null,
      language: insertUser.language ?? "en",
      isPremium: false,
      isEnterprise: false
    };
    
    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .returning();
    return user;
  }

  // Card operations
  async getCards(userId: number, language: string): Promise<Card[]> {
    return db.select().from(cards)
      .where(and(
        or(eq(cards.userId, userId), isNull(cards.userId)),
        eq(cards.language, language)
      ));
  }

  async getCardsByCategory(userId: number, category: string, language: string): Promise<Card[]> {
    return db.select().from(cards)
      .where(and(
        or(eq(cards.userId, userId), isNull(cards.userId)),
        eq(cards.category, category),
        eq(cards.language, language)
      ));
  }

  async getCardsBySubcategory(userId: number, category: string, subcategory: string, language: string): Promise<Card[]> {
    return db.select().from(cards)
      .where(and(
        or(eq(cards.userId, userId), isNull(cards.userId)),
        eq(cards.category, category),
        eq(cards.subcategory, subcategory),
        eq(cards.language, language)
      ));
  }

  async getMostUsedCards(userId: number, limit: number, language: string): Promise<Card[]> {
    return db.select().from(cards)
      .where(and(
        or(eq(cards.userId, userId), isNull(cards.userId)),
        eq(cards.language, language)
      ))
      .orderBy(desc(cards.usageCount))
      .limit(limit);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    // Ensure all fields have proper values
    const cardToInsert = {
      ...insertCard,
      language: insertCard.language ?? "en",
      userId: insertCard.userId ?? null,
      canBePlural: insertCard.canBePlural ?? false,
      isCustom: insertCard.isCustom ?? false,
      usageCount: 0
    };
    
    const [card] = await db
      .insert(cards)
      .values(cardToInsert)
      .returning();
    return card;
  }

  async updateCardUsage(id: number): Promise<Card> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    // Ensure usageCount is a number (not null) with default fallback
    const currentUsage = card.usageCount ?? 0;
    
    const [updatedCard] = await db
      .update(cards)
      .set({ usageCount: currentUsage + 1 })
      .where(eq(cards.id, id))
      .returning();
    
    return updatedCard;
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    // Ensure coreWords is included (null if not provided)
    const settingsToInsert = {
      ...insertSettings,
      coreWords: insertSettings.coreWords ?? null
    };

    const [setting] = await db
      .insert(settings)
      .values(settingsToInsert)
      .returning();
    return setting;
  }

  async updateSettings(userId: number, updatedSettings: Partial<InsertSettings>): Promise<Settings> {
    const [existingSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    
    if (!existingSettings) {
      throw new Error(`Settings for user ${userId} not found`);
    }
    
    const [newSettings] = await db
      .update(settings)
      .set(updatedSettings)
      .where(eq(settings.userId, userId))
      .returning();
    
    return newSettings;
  }

  // Routine operations
  async getRoutines(userId: number): Promise<Routine[]> {
    return db.select().from(routines).where(eq(routines.userId, userId));
  }

  async getRoutine(id: number): Promise<Routine | undefined> {
    const [routine] = await db.select().from(routines).where(eq(routines.id, id));
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
    const [existingRoutine] = await db.select().from(routines).where(eq(routines.id, id));
    
    if (!existingRoutine) {
      throw new Error(`Routine with id ${id} not found`);
    }
    
    const [newRoutine] = await db
      .update(routines)
      .set(updatedRoutine)
      .where(eq(routines.id, id))
      .returning();
    
    return newRoutine;
  }

  async deleteRoutine(id: number): Promise<boolean> {
    const result = await db.delete(routines).where(eq(routines.id, id));
    // For Postgres, result will have a count property that tells us how many rows were affected
    return !!result;
  }
}
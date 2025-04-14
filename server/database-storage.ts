import { 
  users, 
  cards, 
  settings, 
  routines, 
  categories, 
  subcategories, 
  coreWords 
} from "@shared/schema";
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

  // Category operations
  async getCategories(type?: string): Promise<Category[]> {
    if (type) {
      return db.select().from(categories).where(eq(categories.type, type)).orderBy(categories.sortOrder);
    }
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    // Add default values if needed
    const categoryToInsert = {
      ...insertCategory,
      nameEs: insertCategory.nameEs ?? null,
      sortOrder: insertCategory.sortOrder ?? 0
    };
    
    const [category] = await db
      .insert(categories)
      .values(categoryToInsert)
      .returning();
    return category;
  }

  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category> {
    const [existingCategory] = await db.select().from(categories).where(eq(categories.id, id));
    
    if (!existingCategory) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    const [category] = await db
      .update(categories)
      .set(updatedCategory)
      .where(eq(categories.id, id))
      .returning();
    
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return !!result;
  }

  // Subcategory operations
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    return db.select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId))
      .orderBy(subcategories.sortOrder);
  }

  async getAllSubcategories(): Promise<Subcategory[]> {
    return db.select().from(subcategories).orderBy(subcategories.sortOrder);
  }

  async getSubcategory(id: number): Promise<Subcategory | undefined> {
    const [subcategory] = await db.select().from(subcategories).where(eq(subcategories.id, id));
    return subcategory;
  }

  async createSubcategory(insertSubcategory: InsertSubcategory): Promise<Subcategory> {
    // Add default values if needed
    const subcategoryToInsert = {
      ...insertSubcategory,
      nameEs: insertSubcategory.nameEs ?? null,
      icon: insertSubcategory.icon ?? null,
      color: insertSubcategory.color ?? null,
      sortOrder: insertSubcategory.sortOrder ?? 0
    };
    
    const [subcategory] = await db
      .insert(subcategories)
      .values(subcategoryToInsert)
      .returning();
    return subcategory;
  }

  async updateSubcategory(id: number, updatedSubcategory: Partial<InsertSubcategory>): Promise<Subcategory> {
    const [existingSubcategory] = await db.select().from(subcategories).where(eq(subcategories.id, id));
    
    if (!existingSubcategory) {
      throw new Error(`Subcategory with id ${id} not found`);
    }
    
    const [subcategory] = await db
      .update(subcategories)
      .set(updatedSubcategory)
      .where(eq(subcategories.id, id))
      .returning();
    
    return subcategory;
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    const result = await db.delete(subcategories).where(eq(subcategories.id, id));
    return !!result;
  }

  // Core Word operations
  async getCoreWords(): Promise<CoreWord[]> {
    return db.select().from(coreWords).orderBy(coreWords.sortOrder);
  }

  async getCoreWord(id: number): Promise<CoreWord | undefined> {
    const [coreWord] = await db.select().from(coreWords).where(eq(coreWords.id, id));
    return coreWord;
  }

  async createCoreWord(insertCoreWord: InsertCoreWord): Promise<CoreWord> {
    // Add default values if needed
    const coreWordToInsert = {
      ...insertCoreWord,
      textEs: insertCoreWord.textEs ?? null,
      color: insertCoreWord.color ?? null,
      sortOrder: insertCoreWord.sortOrder ?? 0
    };
    
    const [coreWord] = await db
      .insert(coreWords)
      .values(coreWordToInsert)
      .returning();
    return coreWord;
  }

  async updateCoreWord(id: number, updatedCoreWord: Partial<InsertCoreWord>): Promise<CoreWord> {
    const [existingCoreWord] = await db.select().from(coreWords).where(eq(coreWords.id, id));
    
    if (!existingCoreWord) {
      throw new Error(`Core word with id ${id} not found`);
    }
    
    const [coreWord] = await db
      .update(coreWords)
      .set(updatedCoreWord)
      .where(eq(coreWords.id, id))
      .returning();
    
    return coreWord;
  }

  async deleteCoreWord(id: number): Promise<boolean> {
    const result = await db.delete(coreWords).where(eq(coreWords.id, id));
    return !!result;
  }

  // Enhanced Card operations for the updated schema
  async getScheduleCards(userId: number, language: string): Promise<Card[]> {
    return db.select().from(cards)
      .where(and(
        or(eq(cards.userId, userId), isNull(cards.userId)),
        eq(cards.language, language),
        eq(cards.isScheduleCard, true)
      ));
  }

  async getCommunicationCards(userId: number, language: string): Promise<Card[]> {
    return db.select().from(cards)
      .where(and(
        or(eq(cards.userId, userId), isNull(cards.userId)),
        eq(cards.language, language),
        eq(cards.isCommunicationCard, true)
      ));
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async updateCard(id: number, updatedCard: Partial<InsertCard>): Promise<Card> {
    const [existingCard] = await db.select().from(cards).where(eq(cards.id, id));
    
    if (!existingCard) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const [card] = await db
      .update(cards)
      .set(updatedCard)
      .where(eq(cards.id, id))
      .returning();
    
    return card;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id));
    return !!result;
  }
}
import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Categories for organizing communication cards
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEs: text("name_es"), // Spanish translation
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Subcategories for more specific organization
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEs: text("name_es"), // Spanish translation
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
});

// Core words that appear across multiple categories
export const coreWords = pgTable("core_words", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  textEs: text("text_es"), // Spanish translation
  icon: text("icon").notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  canBePlural: boolean("can_be_plural").default(false),
});

// Communication cards/vocabulary items
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  language: text("language").default("en"),
  userId: integer("user_id"), // NULL for shared cards, specific user ID for custom cards
  icon: text("icon").notNull(),
  text: text("text").notNull(),
  textEs: text("text_es"), // Spanish translation
  canBePlural: boolean("can_be_plural").default(false),
  speechText: text("speech_text"), // Custom pronunciation text
  speechTextEs: text("speech_text_es"), // Spanish custom pronunciation
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  usageCount: integer("usage_count").default(0),
  isFavorite: boolean("is_favorite").default(false),
  isCustom: boolean("is_custom").default(false),
  isCommunicationCard: boolean("is_communication_card").default(true),
});

// Settings for individual users (voice, display preferences, etc.)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coreWords: jsonb("core_words").notNull(),
  voiceSettings: jsonb("voice_settings").notNull(),
  displaySettings: jsonb("display_settings").notNull(),
});

// User routines/schedules
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  activityCards: jsonb("activity_cards").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Define relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
}));

// Zod schemas for validation
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertSubcategorySchema = createInsertSchema(subcategories).omit({ id: true });
export const insertCoreWordSchema = createInsertSchema(coreWords).omit({ id: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true });

// Types for TypeScript
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;

export type InsertCoreWord = z.infer<typeof insertCoreWordSchema>;
export type CoreWord = typeof coreWords.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;
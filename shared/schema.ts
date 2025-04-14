import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  language: text("language").default("en"),
  isPremium: boolean("is_premium").default(false),
  isEnterprise: boolean("is_enterprise").default(false),
});

// Vocabulary Cards
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  icon: text("icon").notNull(),
  canBePlural: boolean("can_be_plural").default(false),
  language: text("language").default("en"),
  usageCount: integer("usage_count").default(0),
  isCustom: boolean("is_custom").default(false),
});

// User settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  voiceSettings: jsonb("voice_settings").notNull(),
  displaySettings: jsonb("display_settings").notNull(),
  coreWords: jsonb("core_words"),
});

// Saved routines for scheduler
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  activities: jsonb("activities").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  language: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  userId: true,
  text: true,
  category: true,
  subcategory: true,
  icon: true,
  canBePlural: true,
  language: true,
  isCustom: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  voiceSettings: true,
  displaySettings: true,
  coreWords: true,
});

export const insertRoutineSchema = createInsertSchema(routines).pick({
  userId: true,
  name: true,
  activities: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;

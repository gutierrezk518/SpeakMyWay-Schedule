import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  birthday: text("birthday"),
  language: text("language").default("en"),
  isPremium: boolean("is_premium").default(false),
  isEnterprise: boolean("is_enterprise").default(false),
  consentGiven: boolean("consent_given").default(false),
  consentDate: text("consent_date"),
  marketingConsent: boolean("marketing_consent").default(false),
  dataRetentionConsent: boolean("data_retention_consent").default(false),
  isAdmin: boolean("is_admin").default(false), // Admin flag for admin dashboard access
  lastLogin: timestamp("last_login"), // Track user's last login time
  lastLoginIp: text("last_login_ip"), // Store IP for security purposes
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Define user relations
export const usersRelations = relations(users, ({ many }) => ({
  loginHistory: many(userLoginHistory),
  passwordResets: many(passwordResetTokens)
}));

// User login history for analytics and security
export const userLoginHistory = pgTable("user_login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  loginTime: timestamp("login_time").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  device: text("device"),
  browser: text("browser"),
  success: boolean("success").default(true),
});

export const userLoginHistoryRelations = relations(userLoginHistory, ({ one }) => ({
  user: one(users, {
    fields: [userLoginHistory.userId],
    references: [users.id], 
  }),
}));

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEs: text("name_es"), // Spanish name
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(), // 'vocabulary' or 'schedule'
  sortOrder: integer("sort_order").default(0),
});

// Subcategories
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: text("name").notNull(),
  nameEs: text("name_es"), // Spanish name
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
});

// Core Words
export const coreWords = pgTable("core_words", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  textEs: text("text_es"), // Spanish text
  icon: text("icon").notNull(),
  canBePlural: boolean("can_be_plural").default(false),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
});

// Activity Cards - Enhanced with multilingual support and speech text
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  // English content
  text: text("text").notNull(),
  speechText: text("speech_text"), // What should be spoken in English (e.g., "Eat Breakfast")
  // Spanish content
  textEs: text("text_es"), // Spanish text
  speechTextEs: text("speech_text_es"), // What should be spoken in Spanish
  // Organization
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  // Display
  icon: text("icon").notNull(),
  bgColor: text("bg_color").default("gray-100"),
  // Other properties
  canBePlural: boolean("can_be_plural").default(false),
  language: text("language").default("en"),
  usageCount: integer("usage_count").default(0),
  isCustom: boolean("is_custom").default(false),
  isScheduleCard: boolean("is_schedule_card").default(true),
  isCommunicationCard: boolean("is_communication_card").default(true),
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
  email: true,
  birthday: true,
  language: true,
  consentGiven: true,
  consentDate: true,
  marketingConsent: true,
  dataRetentionConsent: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  nameEs: true, 
  icon: true,
  color: true,
  type: true,
  sortOrder: true,
});

export const insertSubcategorySchema = createInsertSchema(subcategories).pick({
  categoryId: true,
  name: true,
  nameEs: true,
  icon: true,
  color: true,
  sortOrder: true,
});

export const insertCoreWordSchema = createInsertSchema(coreWords).pick({
  text: true,
  textEs: true,
  icon: true,
  canBePlural: true,
  color: true,
  sortOrder: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  userId: true,
  text: true,
  speechText: true,
  textEs: true,
  speechTextEs: true,
  category: true,
  subcategory: true,
  icon: true,
  bgColor: true,
  canBePlural: true,
  language: true,
  isCustom: true,
  isScheduleCard: true,
  isCommunicationCard: true,
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

// Insert schemas for new tables
export const insertLoginHistorySchema = createInsertSchema(userLoginHistory).pick({
  userId: true,
  ipAddress: true,
  userAgent: true,
  device: true,
  browser: true,
  success: true
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expires: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

// Types for new admin-related tables
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistory = typeof userLoginHistory.$inferSelect;

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

import { pgTable, foreignKey, serial, integer, jsonb, unique, text, boolean, timestamp, index, varchar, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const settings = pgTable("settings", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	voiceSettings: jsonb("voice_settings").notNull(),
	displaySettings: jsonb("display_settings").notNull(),
	coreWords: jsonb("core_words"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "settings_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	displayName: text("display_name"),
	email: text(),
	birthday: text(),
	language: text().default('en'),
	isPremium: boolean("is_premium").default(false),
	isEnterprise: boolean("is_enterprise").default(false),
	consentGiven: boolean("consent_given").default(false),
	consentDate: text("consent_date"),
	marketingConsent: boolean("marketing_consent").default(false),
	dataRetentionConsent: boolean("data_retention_consent").default(false),
	createdAt: text("created_at").default('2025-04-18T15:06:06.076Z').notNull(),
	isAdmin: boolean("is_admin").default(false),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	lastLoginIp: text("last_login_ip"),
	emailVerified: boolean("email_verified").default(false),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const coreWords = pgTable("core_words", {
	id: serial().primaryKey().notNull(),
	text: text().notNull(),
	textEs: text("text_es"),
	icon: text().notNull(),
	canBePlural: boolean("can_be_plural").default(false),
	color: text(),
	sortOrder: integer("sort_order").default(0),
});

export const subcategories = pgTable("subcategories", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	name: text().notNull(),
	nameEs: text("name_es"),
	icon: text(),
	color: text(),
	sortOrder: integer("sort_order").default(0),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "subcategories_category_id_categories_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	nameEs: text("name_es"),
	icon: text().notNull(),
	color: text().notNull(),
	type: text().notNull(),
	sortOrder: integer("sort_order").default(0),
});

export const cards = pgTable("cards", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	text: text().notNull(),
	speechText: text("speech_text"),
	textEs: text("text_es"),
	speechTextEs: text("speech_text_es"),
	category: text().notNull(),
	subcategory: text().notNull(),
	icon: text().notNull(),
	bgColor: text("bg_color").default('gray-100'),
	canBePlural: boolean("can_be_plural").default(false),
	language: text().default('en'),
	usageCount: integer("usage_count").default(0),
	isCustom: boolean("is_custom").default(false),
	isScheduleCard: boolean("is_schedule_card").default(true),
	isCommunicationCard: boolean("is_communication_card").default(true),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cards_user_id_users_id_fk"
		}),
]);

export const routines = pgTable("routines", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	activities: jsonb().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "routines_user_id_users_id_fk"
		}),
]);

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const userLoginHistory = pgTable("user_login_history", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	loginTime: timestamp("login_time", { mode: 'string' }).defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	device: text(),
	browser: text(),
	success: boolean().default(true),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_login_history_user_id_fkey"
		}),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
	used: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_fkey"
		}),
	unique("password_reset_tokens_token_key").on(table.token),
]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
	used: boolean().default(false),
	clickedAt: timestamp("clicked_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_verification_tokens_user_id_fkey"
		}),
	unique("email_verification_tokens_token_key").on(table.token),
]);

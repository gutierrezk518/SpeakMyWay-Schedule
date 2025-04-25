import { relations } from "drizzle-orm/relations";
import { users, settings, categories, subcategories, cards, routines, userLoginHistory, passwordResetTokens, emailVerificationTokens } from "./schema";

export const settingsRelations = relations(settings, ({one}) => ({
	user: one(users, {
		fields: [settings.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	settings: many(settings),
	cards: many(cards),
	routines: many(routines),
	userLoginHistories: many(userLoginHistory),
	passwordResetTokens: many(passwordResetTokens),
	emailVerificationTokens: many(emailVerificationTokens),
}));

export const subcategoriesRelations = relations(subcategories, ({one}) => ({
	category: one(categories, {
		fields: [subcategories.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	subcategories: many(subcategories),
}));

export const cardsRelations = relations(cards, ({one}) => ({
	user: one(users, {
		fields: [cards.userId],
		references: [users.id]
	}),
}));

export const routinesRelations = relations(routines, ({one}) => ({
	user: one(users, {
		fields: [routines.userId],
		references: [users.id]
	}),
}));

export const userLoginHistoryRelations = relations(userLoginHistory, ({one}) => ({
	user: one(users, {
		fields: [userLoginHistory.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({one}) => ({
	user: one(users, {
		fields: [emailVerificationTokens.userId],
		references: [users.id]
	}),
}));
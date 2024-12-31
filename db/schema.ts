import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Create enum for user roles first
export const userRoleEnum = pgEnum('user_role', ['creator', 'client']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: userRoleEnum("role").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorProfiles = pgTable("creator_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  // Social media handles
  instagram: text("instagram"),
  youtube: text("youtube"),
  tiktok: text("tiktok"),
  twitter: text("twitter"),
  // Social stats
  instagramFollowers: integer("instagram_followers"),
  youtubeSubscribers: integer("youtube_subscribers"),
  tiktokFollowers: integer("tiktok_followers"),
  twitterFollowers: integer("twitter_followers"),
  // Content metrics
  averageViews: integer("average_views"),
  engagementRate: text("engagement_rate"),
  contentCategories: text("content_categories").array(),
  // Portfolio
  showcaseContent: text("showcase_content").array(),
  // Rates and availability
  ratePerPost: text("rate_per_post"),
  availability: boolean("is_available").default(true),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles);
export const selectCreatorProfileSchema = createSelectSchema(creatorProfiles);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type NewCreatorProfile = typeof creatorProfiles.$inferInsert;
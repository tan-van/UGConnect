import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Create enum for user roles first
export const userRoleEnum = pgEnum('user_role', ['creator', 'client']);

// Create enum for job status
export const jobStatusEnum = pgEnum('job_status', ['open', 'in_progress', 'completed']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: userRoleEnum("role").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar_url"),
  completedOnboarding: boolean("completed_onboarding").default(false),
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
  // Verification status
  instagramVerified: boolean("instagram_verified").default(false),
  youtubeVerified: boolean("youtube_verified").default(false),
  tiktokVerified: boolean("tiktok_verified").default(false),
  twitterVerified: boolean("twitter_verified").default(false),
  // Verification timestamps
  instagramVerifiedAt: timestamp("instagram_verified_at"),
  youtubeVerifiedAt: timestamp("youtube_verified_at"),
  tiktokVerifiedAt: timestamp("tiktok_verified_at"),
  twitterVerifiedAt: timestamp("twitter_verified_at"),
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

// New jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  budget: text("budget").notNull(),
  location: text("location"),
  remote: boolean("remote").default(false),
  type: text("type").notNull(), // e.g., 'one-time', 'ongoing'
  clientId: integer("client_id").references(() => users.id).notNull(),
  status: jobStatusEnum("status").default('open').notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New job applications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  coverLetter: text("cover_letter"),
  status: text("status").default('pending').notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
  postedJobs: many(jobs),
  jobApplications: many(jobApplications),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.clientId],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  creator: one(users, {
    fields: [jobApplications.creatorId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles);
export const selectCreatorProfileSchema = createSelectSchema(creatorProfiles);
export const insertJobSchema = createInsertSchema(jobs);
export const selectJobSchema = createSelectSchema(jobs);
export const insertJobApplicationSchema = createInsertSchema(jobApplications);
export const selectJobApplicationSchema = createSelectSchema(jobApplications);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type NewCreatorProfile = typeof creatorProfiles.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
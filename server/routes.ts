import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, creatorProfiles } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Update user's onboarding status
  app.post("/api/user/complete-onboarding", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await db
        .update(users)
        .set({ completedOnboarding: true })
        .where(eq(users.id, req.user.id));

      res.json({ message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Get creator profile
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const [profile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, req.user.id))
        .limit(1);

      res.json(profile || {});
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update creator profile
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: "Only creators can update their profile" });
    }

    try {
      const [existingProfile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, req.user.id))
        .limit(1);

      const profileData = {
        userId: req.user.id,
        instagram: req.body.instagram || null,
        youtube: req.body.youtube || null,
        tiktok: req.body.tiktok || null,
        twitter: req.body.twitter || null,
        instagramFollowers: req.body.instagramFollowers || null,
        youtubeSubscribers: req.body.youtubeSubscribers || null,
        tiktokFollowers: req.body.tiktokFollowers || null,
        twitterFollowers: req.body.twitterFollowers || null,
        averageViews: req.body.averageViews || null,
        engagementRate: req.body.engagementRate || null,
        contentCategories: req.body.contentCategories || [],
        showcaseContent: req.body.showcaseContent || [],
        ratePerPost: req.body.ratePerPost || null,
        availability: req.body.availability ?? true,
        lastUpdated: new Date(),
      };

      let profile;
      if (existingProfile) {
        [profile] = await db
          .update(creatorProfiles)
          .set(profileData)
          .where(eq(creatorProfiles.userId, req.user.id))
          .returning();
      } else {
        [profile] = await db
          .insert(creatorProfiles)
          .values(profileData)
          .returning();
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Initiate social media verification
  app.post("/api/profile/verify/:platform", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: "Only creators can verify their profiles" });
    }

    const platform = req.params.platform;
    const validPlatforms = ['instagram', 'youtube', 'tiktok', 'twitter'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    try {
      const [profile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, req.user.id))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (!profile[platform]) {
        return res.status(400).json({ message: `${platform} handle not set` });
      }

      // Here we would normally initiate the actual verification process
      // For now, we'll simulate it by marking as verified
      const verificationData = {
        [`${platform}Verified`]: true,
        [`${platform}VerifiedAt`]: new Date(),
      };

      const [updatedProfile] = await db
        .update(creatorProfiles)
        .set(verificationData)
        .where(eq(creatorProfiles.userId, req.user.id))
        .returning();

      res.json({
        message: `${platform} verification initiated successfully`,
        profile: updatedProfile,
      });
    } catch (error) {
      console.error(`Error verifying ${platform}:`, error);
      res.status(500).json({ message: `Failed to verify ${platform}` });
    }
  });

  // Check verification status
  app.get("/api/profile/verification-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const [profile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, req.user.id))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const verificationStatus = {
        instagram: {
          verified: profile.instagramVerified,
          verifiedAt: profile.instagramVerifiedAt,
        },
        youtube: {
          verified: profile.youtubeVerified,
          verifiedAt: profile.youtubeVerifiedAt,
        },
        tiktok: {
          verified: profile.tiktokVerified,
          verifiedAt: profile.tiktokVerifiedAt,
        },
        twitter: {
          verified: profile.twitterVerified,
          verifiedAt: profile.twitterVerifiedAt,
        },
      };

      res.json(verificationStatus);
    } catch (error) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
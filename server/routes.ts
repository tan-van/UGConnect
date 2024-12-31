import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, creatorProfiles, jobs } from "@db/schema";
import { eq } from "drizzle-orm";

// Social media platform OAuth configurations
const platformConfigs = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    redirectUri: `${process.env.APP_URL}/api/connect/instagram/callback`,
    scope: 'basic',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.YOUTUBE_CLIENT_ID,
    redirectUri: `${process.env.APP_URL}/api/connect/youtube/callback`,
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: process.env.TWITTER_CLIENT_ID,
    redirectUri: `${process.env.APP_URL}/api/connect/twitter/callback`,
    scope: 'users.read tweet.read',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    clientId: process.env.TIKTOK_CLIENT_ID,
    redirectUri: `${process.env.APP_URL}/api/connect/tiktok/callback`,
    scope: 'user.info.basic',
  },
};

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add jobs route
  app.get("/api/jobs", async (req, res) => {
    try {
      const { type } = req.query;

      let query = db
        .select({
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          requirements: jobs.requirements,
          budget: jobs.budget,
          location: jobs.location,
          remote: jobs.remote,
          type: jobs.type,
          status: jobs.status,
          featured: jobs.featured,
          createdAt: jobs.createdAt,
          client: {
            displayName: users.displayName,
          },
        })
        .from(jobs)
        .innerJoin(users, eq(jobs.clientId, users.id))
        .where(eq(jobs.status, 'open'));

      if (type) {
        query = query.where(eq(jobs.type, type as string));
      }

      // If no jobs exist yet, insert some placeholder data
      const jobsData = await query;

      if (jobsData.length === 0) {
        // Insert some placeholder jobs
        const [client] = await db
          .select()
          .from(users)
          .where(eq(users.role, 'client'))
          .limit(1);

        if (client) {
          const placeholderJobs = [
            {
              title: "Looking for Gaming Content Creator",
              description: "We're seeking an energetic gaming content creator to produce entertaining gameplay videos and streaming content. Must have experience with popular gaming titles and engaging commentary.",
              requirements: ["3+ years gaming content creation", "Strong presence on YouTube or Twitch", "Experience with video editing"],
              budget: "$2000-3000 per video",
              location: "Remote",
              remote: true,
              type: "ongoing",
              clientId: client.id,
              status: 'open',
              featured: true,
            },
            {
              title: "Beauty Product Review Creator Needed",
              description: "Seeking a beauty influencer to create authentic product reviews and tutorials. Must have experience in beauty content creation and a genuine following in the beauty community.",
              requirements: ["Minimum 10k followers", "Experience with beauty products", "Professional camera setup"],
              budget: "$500 per review",
              location: "Los Angeles",
              remote: false,
              type: "one-time",
              clientId: client.id,
              status: 'open',
              featured: false,
            },
            {
              title: "Tech Review Content Partnership",
              description: "Looking for a tech-savvy content creator to review our latest smart home products. Must have experience in tech reviews and a good understanding of smart home technology.",
              requirements: ["Tech background", "High production quality", "1M+ total views"],
              budget: "$3000-5000 per month",
              location: "San Francisco",
              remote: true,
              type: "ongoing",
              clientId: client.id,
              status: 'open',
              featured: true,
            }
          ];

          await db.insert(jobs).values(placeholderJobs);

          // Fetch the newly inserted jobs
          jobsData = await query;
        }
      }

      res.json(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

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

  // Social media connection endpoints
  app.get("/api/connect/:platform", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { platform } = req.params;
    const config = platformConfigs[platform as keyof typeof platformConfigs];

    if (!config) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    if (!config.clientId) {
      return res.status(500).json({ message: `${platform} client ID not configured` });
    }

    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      platform,
      timestamp: Date.now(),
    })).toString('base64');

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    res.json({ authUrl: authUrl.toString() });
  });

  // Get creator profile by username
  app.get("/api/creators/:username", async (req, res) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, req.params.username))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: "Creator not found" });
      }

      if (user.role !== 'creator') {
        return res.status(404).json({ message: "User is not a creator" });
      }

      const [profile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, user.id))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Creator profile not found" });
      }

      const creatorData = {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        ...profile,
      };

      res.json(creatorData);
    } catch (error) {
      console.error("Error fetching creator profile:", error);
      res.status(500).json({ message: "Failed to fetch creator profile" });
    }
  });

  // List all creators
  app.get("/api/creators", async (req, res) => {
    try {
      const creators = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          bio: users.bio,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.role, 'creator'));

      res.json(creators);
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ message: "Failed to fetch creators" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
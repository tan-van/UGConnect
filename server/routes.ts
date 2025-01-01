import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, creatorProfiles, reviews } from "@db/schema";
import { eq, and, desc, avg } from "drizzle-orm";
import * as crypto from 'crypto';

async function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') + '.' + salt);
    });
  });
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add jobs route
  // Get single job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const job = await db
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
          clientId: jobs.clientId
        })
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .limit(1);

      if (!job || job.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job[0]);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const { type, clientId } = req.query;

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

      // Apply clientId filter if provided
      if (clientId) {
        query = query.where(eq(jobs.clientId, parseInt(clientId as string)));
      }

      // Only apply type filter if it's not 'all' and clientId is not provided
      if (type && type !== 'all' && !clientId) {
        const jobType = type as string;
        query = query.where(eq(jobs.type, jobType));
      }

      // If no jobs exist yet, insert some placeholder data
      let jobsData = await query;

      if (jobsData.length === 0 && (!type || type === 'all') && !clientId) {
        // First, check if we have any clients
        const [client] = await db
          .select()
          .from(users)
          .where(eq(users.role, 'client'))
          .limit(1);

        // If no clients exist, create some sample users first
        if (!client) {
          const sampleUsers = [
            {
              username: "techbrand",
              password: await hash("password123"),
              email: "tech@brand.com",
              role: 'client' as const,
              displayName: "Tech Brand Inc.",
              bio: "Leading tech company looking for creative content creators",
              completedOnboarding: true,
              createdAt: new Date(),
            },
            {
              username: "beautycorp",
              password: await hash("password123"),
              email: "beauty@corp.com",
              role: 'client' as const,
              displayName: "Beauty Corp",
              bio: "Premium beauty brand seeking influencers",
              completedOnboarding: true,
              createdAt: new Date(),
            },
            {
              username: "gamingstar",
              password: await hash("password123"),
              email: "creator@gaming.com",
              role: 'creator' as const,
              displayName: "Gaming Star",
              bio: "Professional gaming content creator with 500K+ followers",
              completedOnboarding: true,
              createdAt: new Date(),
            },
            {
              username: "beautyinfluencer",
              password: await hash("password123"),
              email: "creator@beauty.com",
              role: 'creator' as const,
              displayName: "Beauty Guru",
              bio: "Beauty and lifestyle content creator, 1M+ followers across platforms",
              completedOnboarding: true,
              createdAt: new Date(),
            },
          ];

          const insertedUsers = await db.insert(users).values(sampleUsers).returning();

          // Create creator profiles for creator users
          const creatorUsers = insertedUsers.filter(user => user.role === 'creator');
          const creatorProfileData = creatorUsers.map(user => ({
            userId: user.id,
            instagram: `${user.username}`,
            youtube: `${user.username}`,
            tiktok: `${user.username}`,
            twitter: `${user.username}`,
            instagramFollowers: Math.floor(Math.random() * 500000) + 100000,
            youtubeSubscribers: Math.floor(Math.random() * 1000000) + 50000,
            tiktokFollowers: Math.floor(Math.random() * 800000) + 200000,
            twitterFollowers: Math.floor(Math.random() * 300000) + 50000,
            averageViews: Math.floor(Math.random() * 100000) + 10000,
            engagementRate: (Math.random() * 5 + 1).toFixed(2) + "%",
            contentCategories: user.username.includes('gaming')
              ? ['Gaming', 'Entertainment', 'Technology']
              : ['Beauty', 'Lifestyle', 'Fashion'],
            showcaseContent: [
              'https://example.com/content1',
              'https://example.com/content2',
              'https://example.com/content3',
            ],
            ratePerPost: user.username.includes('gaming')
              ? "$1000-2000 per video"
              : "$800-1500 per post",
            availability: true,
            lastUpdated: new Date(),
          }));

          await db.insert(creatorProfiles).values(creatorProfileData);

          // Get the client users for creating jobs
          const clientUsers = insertedUsers.filter(user => user.role === 'client');

          // Create sample jobs
          const sampleJobs = clientUsers.flatMap(client => [
            {
              title: "Looking for Gaming Content Creator",
              description: "We're seeking an energetic gaming content creator to produce entertaining gameplay videos and streaming content. Must have experience with popular gaming titles and engaging commentary.",
              requirements: ["3+ years gaming content creation", "Strong presence on YouTube or Twitch", "Experience with video editing"],
              budget: "$2000-3000 per video",
              location: "Remote",
              remote: true,
              type: "ongoing",
              clientId: client.id,
              status: 'open' as const,
              featured: true,
              createdAt: new Date(),
              updatedAt: new Date(),
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
              status: 'open' as const,
              featured: false,
              createdAt: new Date(),
              updatedAt: new Date(),
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
              status: 'open' as const,
              featured: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ]);

          await db.insert(jobs).values(sampleJobs);

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

  // Add this after the GET /api/jobs endpoint
  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const jobId = parseInt(req.params.id);
      const job = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .limit(1);

      if (!job || job.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job[0].clientId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await db.delete(jobs).where(eq(jobs.id, jobId));
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: "Only clients can post jobs" });
    }

    try {
      const [job] = await db
        .insert(jobs)
        .values({
          ...req.body,
          clientId: req.user.id,
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
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

  // Add after the GET /api/profile endpoint
  app.post("/api/profile/initialize", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: "Only creators can initialize profiles" });
    }

    try {
      const [existingProfile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, req.user.id))
        .limit(1);

      if (existingProfile) {
        return res.json(existingProfile);
      }

      // Create default profile
      const [profile] = await db
        .insert(creatorProfiles)
        .values({
          userId: req.user.id,
          instagram: "",
          youtube: "",
          tiktok: "",
          twitter: "",
          instagramFollowers: 0,
          youtubeSubscribers: 0,
          tiktokFollowers: 0,
          twitterFollowers: 0,
          averageViews: 0,
          engagementRate: "0%",
          contentCategories: [],
          showcaseContent: [],
          ratePerPost: "$0",
          availability: true,
          lastUpdated: new Date(),
        })
        .returning();

      res.json(profile);
    } catch (error) {
      console.error("Error initializing profile:", error);
      res.status(500).json({ message: "Failed to initialize profile" });
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
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      ...profile,
    };

    res.json(creatorData);
  });

  // List all creators with their profiles
  app.get("/api/creators", async (req, res) => {
    try {
      console.log("Fetching creators...");
      let creators = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          bio: users.bio,
          avatar: users.avatar,
          profile: {
            instagram: creatorProfiles.instagram,
            youtube: creatorProfiles.youtube,
            tiktok: creatorProfiles.tiktok,
            twitter: creatorProfiles.twitter,
            instagramFollowers: creatorProfiles.instagramFollowers,
            youtubeSubscribers: creatorProfiles.youtubeSubscribers,
            tiktokFollowers: creatorProfiles.tiktokFollowers,
            twitterFollowers: creatorProfiles.twitterFollowers,
            averageViews: creatorProfiles.averageViews,
            engagementRate: creatorProfiles.engagementRate,
            contentCategories: creatorProfiles.contentCategories,
            ratePerPost: creatorProfiles.ratePerPost,
            availability: creatorProfiles.availability,
          }
        })
        .from(users)
        .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
        .where(eq(users.role, 'creator'));

      console.log("Initial creators count:", creators.length);

      // If no creators exist, create sample data
      if (creators.length === 0) {
        console.log("No creators found, creating sample data...");
        const sampleUsers = [
          {
            username: "gamingstar",
            password: await hash("password123"),
            email: "creator@gaming.com",
            role: 'creator' as const,
            displayName: "Gaming Star",
            bio: "Professional gaming content creator with 500K+ followers",
            completedOnboarding: true,
            createdAt: new Date(),
          },
          {
            username: "beautyinfluencer",
            password: await hash("password123"),
            email: "creator@beauty.com",
            role: 'creator' as const,
            displayName: "Beauty Guru",
            bio: "Beauty and lifestyle content creator, 1M+ followers across platforms",
            completedOnboarding: true,
            createdAt: new Date(),
          },
          {
            username: "techreviewer",
            password: await hash("password123"),
            email: "creator@tech.com",
            role: 'creator' as const,
            displayName: "Tech Reviewer",
            bio: "In-depth tech reviews and unboxings, 750K+ subscribers",
            completedOnboarding: true,
            createdAt: new Date(),
          },
          {
            username: "fitnessguru",
            password: await hash("password123"),
            email: "creator@fitness.com",
            role: 'creator' as const,
            displayName: "Fitness Guru",
            bio: "Certified personal trainer sharing workouts, nutrition tips, and wellness advice",
            completedOnboarding: true,
            createdAt: new Date(),
          }
        ];

        console.log("Creating sample users...");
        const insertedUsers = await db.insert(users).values(sampleUsers).returning();
        console.log("Created users count:", insertedUsers.length);

        const creatorProfileData = insertedUsers.map(user => {
          let categories, ratePerPost;

          switch(user.username) {
            case 'gamingstar':
              categories = ['Gaming', 'Entertainment', 'Technology'];
              ratePerPost = "$1000-2000 per video";
              break;
            case 'beautyinfluencer':
              categories = ['Beauty', 'Lifestyle', 'Fashion'];
              ratePerPost = "$800-1500 per post";
              break;
            case 'techreviewer':
              categories = ['Technology', 'Reviews', 'Education'];
              ratePerPost = "$1500-2500 per review";
              break;
            case 'fitnessguru':
              categories = ['Fitness', 'Health', 'Wellness'];
              ratePerPost = "$900-1800 per workout video";
              break;
            default:
              categories = ['Lifestyle', 'General'];
              ratePerPost = "$500-1000 per post";
          }

          return {
            userId: user.id,
            instagram: `${user.username}`,
            youtube: `${user.username}`,
            tiktok: `${user.username}`,
            twitter: `${user.username}`,
            instagramFollowers: Math.floor(Math.random() * 500000) + 100000,
            youtubeSubscribers: Math.floor(Math.random() * 1000000) + 50000,
            tiktokFollowers: Math.floor(Math.random() * 800000) + 200000,
            twitterFollowers: Math.floor(Math.random() * 300000) + 50000,
            averageViews: Math.floor(Math.random() * 100000) + 10000,
            engagementRate: (Math.random() * 5 + 1).toFixed(2) + "%",
            contentCategories: categories,
            ratePerPost,
            availability: true,
            lastUpdated: new Date(),
          };
        });

        console.log("Creating creator profiles...");
        await db.insert(creatorProfiles).values(creatorProfileData);

        // Fetch the newly created creators
        creators = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            bio: users.bio,
            avatar: users.avatar,
            profile: {
              instagram: creatorProfiles.instagram,
              youtube: creatorProfiles.youtube,
              tiktok: creatorProfiles.tiktok,
              twitter: creatorProfiles.twitter,
              instagramFollowers: creatorProfiles.instagramFollowers,
              youtubeSubscribers: creatorProfiles.youtubeSubscribers,
              tiktokFollowers: creatorProfiles.tiktokFollowers,
              twitterFollowers: creatorProfiles.twitterFollowers,
              averageViews: creatorProfiles.averageViews,
              engagementRate: creatorProfiles.engagementRate,
              contentCategories: creatorProfiles.contentCategories,
              ratePerPost: creatorProfiles.ratePerPost,
              availability: creatorProfiles.availability,
            }
          })
          .from(users)
          .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
          .where(eq(users.role, 'creator'));
      }

      console.log("Final creators count:", creators.length);
      res.json(creators);
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ message: "Failed to fetch creators" });
    }
  });


  // Add after the GET /api/creators endpoint
  app.get("/api/creators/spotlight", async (_req, res) => {
    try {
      console.log("Fetching spotlight creators...");
      const creators = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          bio: users.bio,
          avatar: users.avatar,
          profile: {
            instagram: creatorProfiles.instagram,
            youtube: creatorProfiles.youtube,
            tiktok: creatorProfiles.tiktok,
            twitter: creatorProfiles.twitter,
            instagramFollowers: creatorProfiles.instagramFollowers,
            youtubeSubscribers: creatorProfiles.youtubeSubscribers,
            tiktokFollowers: creatorProfiles.tiktokFollowers,
            twitterFollowers: creatorProfiles.twitterFollowers,
            averageViews: creatorProfiles.averageViews,
            engagementRate: creatorProfiles.engagementRate,
            contentCategories: creatorProfiles.contentCategories,
          }
        })
        .from(users)
        .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
        .where(eq(users.role, 'creator'));
      
      console.log("Found creators:", creators);

      console.log("Initial creators query result:", creators);

      // If no creators exist, create sample data
      if (!creators || creators.length === 0) {
        console.log("No creators found, creating sample data...");
        const sampleUsers = [
          {
            username: "techstar",
            password: await hash("password123"),
            email: "tech@star.com",
            role: 'creator' as const,
            displayName: "Tech Star",
            bio: "Top tech reviewer with over 2M followers",
            completedOnboarding: true,
            createdAt: new Date(),
          },
          {
            username: "lifestylepro",
            password: await hash("password123"),
            email: "lifestyle@pro.com",
            role: 'creator' as const,
            displayName: "Lifestyle Pro",
            bio: "Lifestyle and wellness content creator with 1.5M+ engaged followers",
            completedOnboarding: true,
            createdAt: new Date(),
          }
        ];

        console.log("Creating sample users...");
        const insertedUsers = await db.insert(users).values(sampleUsers).returning();

        const creatorProfileData = [
          {
            userId: insertedUsers[0].id,
            instagram: "techstar",
            youtube: "techstar",
            tiktok: "techstar",
            twitter: "techstar",
            instagramFollowers: 800000,
            youtubeSubscribers: 1200000,
            tiktokFollowers: 500000,
            twitterFollowers: 300000,
            averageViews: 250000,
            engagementRate: "4.8%",
            contentCategories: ['Technology', 'Reviews', 'Education'],
            ratePerPost: "$2000-3000 per video",
            availability: true,
            lastUpdated: new Date(),
          },
          {
            userId: insertedUsers[1].id,
            instagram: "lifestylepro",
            youtube: "lifestylepro",
            tiktok: "lifestylepro",
            twitter: "lifestylepro",
            instagramFollowers: 600000,
            youtubeSubscribers: 900000,
            tiktokFollowers: 700000,
            twitterFollowers: 200000,
            averageViews: 180000,
            engagementRate: "5.2%",
            contentCategories: ['Lifestyle', 'Wellness', 'Fashion'],
            ratePerPost: "$1500-2500 per post",
            availability: true,
            lastUpdated: new Date(),
          }
        ];

        console.log("Creating creator profiles...");
        await db.insert(creatorProfiles).values(creatorProfileData);

        // Fetch the newly created creators
        const newCreators = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            bio: users.bio,
            avatar: users.avatar,
            profile: {
              instagram: creatorProfiles.instagram,
              youtube: creatorProfiles.youtube,
              tiktok: creatorProfiles.tiktok,
              twitter: creatorProfiles.twitter,
              instagramFollowers: creatorProfiles.instagramFollowers,
              youtubeSubscribers: creatorProfiles.youtubeSubscribers,
              tiktokFollowers: creatorProfiles.tiktokFollowers,
              twitterFollowers: creatorProfiles.twitterFollowers,
              averageViews: creatorProfiles.averageViews,
              engagementRate: creatorProfiles.engagementRate,
              contentCategories: creatorProfiles.contentCategories,
            }
          })
          .from(users)
          .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
          .where(eq(users.role, 'creator'));

        creators = newCreators;
      }

      // Calculate total reach and sort creators
      if (!creators || creators.length === 0) {
        return res.json([]);
      }

      const sortedCreators = creators
        .filter(creator => creator.profile) // Only include creators with profiles
        .map(creator => ({
          ...creator,
          totalReach: (creator.profile.instagramFollowers || 0) +
                     (creator.profile.youtubeSubscribers || 0) +
                     (creator.profile.tiktokFollowers || 0) +
                     (creator.profile.twitterFollowers || 0),
          engagementRate: parseFloat((creator.profile.engagementRate || '0').replace('%', ''))
        }))
        .sort((a, b) => b.totalReach - a.totalReach)
        .slice(0, 2); // Get only top 2 creators

      console.log('Returning spotlight creators:', sortedCreators);
      res.json(sortedCreators);
    } catch (error) {
      console.error("Error fetching spotlight creators:", error);
      res.status(500).json({ message: "Failed to fetch spotlight creators" });
    }
  });

  // Create a review
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: "Only clients can leave reviews" });
    }

    try {
      const { creatorId, rating, review } = req.body;

      if (!creatorId || !rating || !review) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate rating is between 1 and 5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      // Check if the creator exists and is actually a creator
      console.log('Looking up creator with ID:', creatorId);

      const [creator] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, Number(creatorId)),
          eq(users.role, 'creator')
        ))
        .limit(1);

      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      // Create the review
      const [newReview] = await db
        .insert(reviews)
        .values({
          creatorId: Number(creatorId),
          clientId: req.user.id,
          rating,
          review,
          createdAt: new Date(),
        })
        .returning();

      res.json({
        message: "Review submitted successfully",
        review: newReview,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Get reviews for a creator
  app.get("/api/creators/:creatorId/reviews", async (req, res) => {
    try {
      const { creatorId } = req.params;
      const { limit = '10', offset = '0' } = req.query;

      // First, check if creator exists
      const [creator] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, parseInt(creatorId)), eq(users.role, 'creator')))
        .limit(1);

      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      // Get reviews with client information
      const creatorReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          review: reviews.review,
          helpfulVotes: reviews.helpfulVotes,
          createdAt: reviews.createdAt,
          client: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.clientId, users.id))
        .where(eq(reviews.creatorId, parseInt(creatorId)))
        .orderBy(desc(reviews.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // Get aggregate rating data
      // Calculate total reviews and average rating
      const totalReviews = creatorReviews.length;
      const averageRating = totalReviews > 0
        ? (creatorReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

      res.json({
        reviews: creatorReviews,
        averageRating,
        totalReviews
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Mark a review as helpful
  app.post("/api/reviews/:reviewId/helpful", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { reviewId } = req.params;

      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, parseInt(reviewId)))
        .limit(1);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Increment helpful votes
      const [updatedReview] = await db
        .update(reviews)
        .set({
          helpfulVotes: review.helpfulVotes + 1,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, parseInt(reviewId)))
        .returning();

      res.json(updatedReview);
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      res.status(500).json({ message: "Failed to mark review as helpful" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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
  tiktok: {    authUrl: 'https://www.tiktok.com/auth/authorize/',
    clientId: process.env.TIKTOK_CLIENT_ID,
    redirectUri: `${process.env.APP_URL}/api/connect/tiktok/callback`,
    scope: 'user.info.basic',
  },
};

import { jobs } from "@db/schema";
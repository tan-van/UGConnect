import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { jobs, applications, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Jobs routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const allJobs = await db.query.jobs.findMany({
        orderBy: desc(jobs.createdAt),
        with: {
          employer: true
        }
      });
      res.json(allJobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'employer') {
      return res.status(403).send("Only employers can post jobs");
    }

    try {
      const [job] = await db.insert(jobs)
        .values({
          ...req.body,
          employerId: req.user.id
        })
        .returning();
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // Applications routes
  app.post("/api/jobs/:jobId/apply", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'seeker') {
      return res.status(403).send("Only job seekers can apply");
    }

    try {
      const [application] = await db.insert(applications)
        .values({
          jobId: parseInt(req.params.jobId),
          seekerId: req.user.id,
          coverLetter: req.body.coverLetter
        })
        .returning();
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      let query;
      if (req.user.role === 'employer') {
        query = db.query.applications.findMany({
          where: eq(applications.jobId, req.query.jobId as string),
          with: {
            seeker: true,
            job: true
          }
        });
      } else {
        query = db.query.applications.findMany({
          where: eq(applications.seekerId, req.user.id),
          with: {
            job: {
              with: {
                employer: true
              }
            }
          }
        });
      }
      const userApplications = await query;
      res.json(userApplications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

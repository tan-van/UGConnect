import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { jobs, applications, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

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

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const [job] = await db.query.jobs.findMany({
        where: eq(jobs.id, parseInt(req.params.id)),
        with: {
          employer: true
        },
        limit: 1
      });

      if (!job) {
        return res.status(404).send("Job not found");
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
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

  // New endpoint for updating application status
  app.put("/api/applications/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'employer') {
      return res.status(403).send("Only employers can update application status");
    }

    const { status } = req.body;
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).send("Invalid status");
    }

    try {
      const [application] = await db
        .update(applications)
        .set({ status })
        .where(eq(applications.id, parseInt(req.params.id)))
        .returning();

      if (!application) {
        return res.status(404).send("Application not found");
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      let userApplications;

      if (req.user.role === 'employer') {
        userApplications = await db.query.applications.findMany({
          with: {
            seeker: true,
            job: true
          },
          where: (applications, { eq }) =>
            eq(applications.jobId, req.query.jobId ? parseInt(req.query.jobId as string) : applications.jobId)
        });
      } else {
        userApplications = await db.query.applications.findMany({
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

      res.json(userApplications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
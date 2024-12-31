import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Creator profile routes will be added here

  const httpServer = createServer(app);
  return httpServer;
}
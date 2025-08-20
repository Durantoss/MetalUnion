import type { Express } from "express";
import { registerHealthRoutes } from "../healthCheck";

export function setupHealthRoutes(app: Express) {
  registerHealthRoutes(app);
}
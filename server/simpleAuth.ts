// Simplified authentication without passport for now
import type { Express, Request, Response, NextFunction } from "express";

export function setupAuth(app: Express) {
  // Simple login route without complex auth
  app.get("/api/login", (req: Request, res: Response) => {
    // For now, just redirect to a success page or show a message
    res.json({ message: "Authentication temporarily disabled for testing", success: false });
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/me", (req: Request, res: Response) => {
    res.json({ authenticated: false, user: null });
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For now, allow all requests and attach demo user
  (req as any).user = { id: 'demo-user', stagename: 'DemoUser' };
  next();
}
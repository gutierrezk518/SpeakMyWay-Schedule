import { NextFunction, Request, Response } from "express";

/**
 * Middleware to check if the current user is an admin
 * This will be used to protect admin routes
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized - Please login" });
  }

  // Check if user has admin privileges
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  // User is authenticated and is an admin
  next();
}
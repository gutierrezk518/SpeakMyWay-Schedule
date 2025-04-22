import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the current user is an admin
 * This will be used to protect admin routes
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Then check if user has admin privileges
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  // User is authenticated and has admin privileges, proceed
  next();
}
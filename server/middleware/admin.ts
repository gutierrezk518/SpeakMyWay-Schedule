import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the current user is an admin
 * This will be used to protect admin routes
 * 
 * Note: Since authentication is now handled client-side, 
 * this is a temporary bypass solution that allows all admin access
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Since authentication is now handled client-side, we'll temporarily allow admin access
  // This should be replaced with a proper token-based admin verification system

  // TODO: Implement proper admin verification once authentication system is finalized
  // For now, we allow all requests to proceed
  next();
}
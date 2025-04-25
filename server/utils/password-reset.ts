import { randomBytes } from 'crypto';
import { storage } from '../storage';
import { InsertPasswordResetToken } from '@shared/schema';

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  
  // Set expiration date (1 hour from now)
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  
  // Store token in database
  await storage.createPasswordResetToken({
    userId,
    token,
    expires
  });
  
  return token;
}

/**
 * Verify a password reset token
 * Returns userId if token is valid, or null if token is invalid or expired
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  try {
    // Find the token in the database
    const tokenRecord = await storage.getPasswordResetToken(token);
    
    // If token doesn't exist, verification fails
    if (!tokenRecord) {
      return null;
    }
    
    // Check if token has already been used
    if (tokenRecord.used) {
      return null;
    }
    
    // Check if token is expired
    const now = new Date();
    const expires = new Date(tokenRecord.expires);
    if (now > expires) {
      return null;
    }
    
    // Return the user ID
    return tokenRecord.userId;
  } catch (error) {
    console.error('Error verifying password reset token:', error);
    return null;
  }
}

/**
 * Mark a password reset token as used
 */
export async function usePasswordResetToken(token: string): Promise<boolean> {
  try {
    return await storage.markPasswordResetTokenUsed(token);
  } catch (error) {
    console.error('Error marking password reset token as used:', error);
    return false;
  }
}

/**
 * Generate a password reset URL for a token
 */
export function generatePasswordResetUrl(token: string): string {
  // Use the app's base URL from environment or default to localhost in development
  const baseUrl = process.env.APP_URL || 
                 (process.env.NODE_ENV === 'production' 
                  ? 'https://speakmyway.replit.app' 
                  : 'http://localhost:5000');
  
  return `${baseUrl}/reset-password?token=${token}`;
}
import { randomBytes } from 'crypto';
import { storage } from '../storage';
import { InsertEmailVerificationToken } from '@shared/schema';

/**
 * Create a verification token for a user's email
 */
export async function createVerificationToken(userId: number, email: string): Promise<string> {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  
  // Set expiration date (24 hours from now)
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  
  // Store token in database
  await storage.createEmailVerificationToken({
    userId,
    token,
    expires: expires, // Pass Date object directly, transformation handles conversion
    used: false
  });
  
  return token;
}

/**
 * Generate a verification URL for a token
 */
export function generateVerificationUrl(token: string): string {
  // Use the app's base URL from environment or default to localhost in development
  const baseUrl = process.env.APP_URL || 
                 (process.env.NODE_ENV === 'production' 
                  ? 'https://speakmyway.replit.app' 
                  : 'http://localhost:5000');
  
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  try {
    // Find the token in the database
    const tokenRecord = await storage.getEmailVerificationToken(token);
    
    // If token doesn't exist, verification fails
    if (!tokenRecord) {
      return false;
    }
    
    // Check if token has already been used
    if (tokenRecord.used) {
      return false;
    }
    
    // Check if token is expired
    const now = new Date();
    const expires = new Date(tokenRecord.expires);
    if (now > expires) {
      return false;
    }
    
    // Mark token as used with timestamp
    await storage.markEmailVerificationTokenUsed(token);
    
    // Update user's email verification status
    await storage.updateUser(tokenRecord.userId, { emailVerified: true });
    
    return true;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return false;
  }
}
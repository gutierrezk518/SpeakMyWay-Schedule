import { randomBytes } from 'crypto';
import { InsertEmailVerificationToken } from '@shared/schema';
import { storage } from '../storage';

// Creates a verification token for a user
export async function createVerificationToken(userId: number, email: string): Promise<string> {
  // Generate a random token
  const token = randomBytes(32).toString('hex');
  
  // Set expiration to 24 hours from now
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  
  // Create token in database
  await storage.createEmailVerificationToken({
    userId,
    token,
    expires, // Drizzle will handle the Date object correctly
    used: false
  });
  
  return token;
}

// Verifies a token and marks it as used
export async function verifyToken(token: string): Promise<boolean> {
  const verificationToken = await storage.getEmailVerificationToken(token);
  
  if (!verificationToken) {
    return false;
  }
  
  // Check if token is expired
  const now = new Date();
  const expires = new Date(verificationToken.expires);
  
  if (now > expires) {
    return false;
  }
  
  // Check if token has already been used
  if (verificationToken.used) {
    return false;
  }
  
  // Mark token as used
  await storage.markEmailVerificationTokenUsed(token);
  
  // Update user's email verification status
  await storage.updateUser(verificationToken.userId, {
    emailVerified: true
  });
  
  return true;
}

// Generate verification URL with token
export function generateVerificationUrl(token: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/verify-email?token=${token}`;
}
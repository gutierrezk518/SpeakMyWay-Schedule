import { sendPasswordResetEmail } from './email-service';
import { storage } from '../storage';
import { createPasswordResetToken, generatePasswordResetUrl } from './password-reset';

/**
 * Send a password reset email to a user by their user ID
 * @param userId - The user's ID
 * @returns A success boolean
 */
export async function sendPasswordResetToUser(userId: number): Promise<boolean> {
  try {
    // Get user information
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Create a reset token
    const token = await createPasswordResetToken(userId);
    
    // Generate reset URL
    const resetUrl = generatePasswordResetUrl(token);
    
    // Send the email
    const success = await sendPasswordResetEmail(
      user.username, // username is the email address
      user.displayName || '',
      resetUrl
    );
    
    return success;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send a password reset email to a user by their email address
 * @param email - The user's email address
 * @returns A success boolean
 */
export async function sendPasswordResetByEmail(email: string): Promise<boolean> {
  try {
    // Find user by email
    const user = await storage.getUserByUsername(email);
    if (!user) {
      // Don't throw error, just return false for security reasons
      return false;
    }
    
    return await sendPasswordResetToUser(user.id);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
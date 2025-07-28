import { sendEmailWithResend } from './resend-service';
import { welcomeEmail, welcomeEmailText } from './email-templates';
import { generateVerificationUrl } from './email-verification';

/**
 * Send a test email to verify email configuration
 */
export async function sendTestEmail(
  recipientEmail: string,
  provider: 'resend' | undefined = undefined
): Promise<boolean> {
  try {
    console.log(`Sending test email to ${recipientEmail}...`);
    
    // Use Resend service (default)
    if (!provider || provider === 'resend') {
      const subject = 'Test Email from SpeakMyWay';
      const text = `This is a test email sent from SpeakMyWay at ${new Date().toISOString()}.\n\nIf you received this, email delivery is working correctly!`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #4F46E5;">Test Email from SpeakMyWay</h2>
          <p>This is a test email sent from SpeakMyWay at ${new Date().toISOString()}.</p>
          <p>If you received this, email delivery is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This is an automated test email. No action is required.</p>
        </div>
      `;
      
      return await sendEmailWithResend({
        to: recipientEmail,
        subject,
        textBody: text,
        htmlBody: html
      });
    }
    
    throw new Error(`Unsupported email provider: ${provider}`);
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

/**
 * Send a test welcome email (with a sample verification link)
 */
export async function sendTestWelcomeEmail(
  recipientEmail: string,
  username: string = 'TestUser'
): Promise<boolean> {
  try {
    console.log(`Sending test welcome email to ${recipientEmail}...`);
    
    // Create a sample verification URL (this won't be usable, just for display)
    const sampleToken = 'sample-verification-token-for-test-email';
    const verificationUrl = generateVerificationUrl(sampleToken);
    
    // Generate welcome email content
    const htmlBody = welcomeEmail(username, verificationUrl);
    const textBody = welcomeEmailText(username, verificationUrl);
    
    return await sendEmailWithResend({
      to: recipientEmail,
      subject: `Welcome to SpeakMyWay, ${username}!`,
      textBody,
      htmlBody
    });
  } catch (error) {
    console.error('Error sending test welcome email:', error);
    return false;
  }
}
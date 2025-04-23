import { sendEmail } from './email-service';
import { sendEmailWithSendGrid } from './sendgrid-service';

/**
 * Send a test email through the default email provider (AWS SES with SendGrid fallback)
 */
export async function sendTestEmail(recipientEmail: string, provider?: 'aws' | 'sendgrid'): Promise<boolean> {
  const currentTime = new Date().toLocaleTimeString();
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #4F46E5; text-align: center;">SpeakMyWay Email Test</h1>
      <p style="font-size: 16px; line-height: 1.5;">This is a test email from SpeakMyWay.</p>
      <p style="font-size: 16px; line-height: 1.5;">If you're receiving this email, it means our email system is configured correctly.</p>
      <p style="font-size: 16px; line-height: 1.5;">No action is needed on your part.</p>
      <div style="background-color: #f5f7ff; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px;">Sent at: ${currentTime}</p>
        <p style="margin: 5px 0 0; font-size: 14px;">Provider: ${provider || 'default (AWS with SendGrid fallback)'}</p>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 20px; text-align: center;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
  
  const textBody = `
        SpeakMyWay Email Test
        This is a test email from SpeakMyWay.
        If you're receiving this email, it means our email system is configured correctly.
        No action is needed on your part.
        
        Sent at: ${currentTime}
        Provider: ${provider || 'default (AWS with SendGrid fallback)'}
        
        This is an automated message. Please do not reply to this email.
  `;
  
  const subject = `SpeakMyWay Email Test - ${currentTime}`;
  
  const emailOptions = {
    to: recipientEmail,
    subject,
    htmlBody,
    textBody
  };
  
  // If a specific provider is requested, use it directly
  if (provider === 'sendgrid') {
    return await sendEmailWithSendGrid(emailOptions);
  }
  
  // Default: use the regular sendEmail which has fallback logic built in
  return await sendEmail(emailOptions);
}
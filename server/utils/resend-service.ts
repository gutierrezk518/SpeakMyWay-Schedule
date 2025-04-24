import { Resend } from 'resend';

// Check if Resend API key is available
const RESEND_API_KEY_EXISTS = !!process.env.RESEND_API_KEY;

if (!RESEND_API_KEY_EXISTS) {
  console.warn('Resend API key not found. Email functionality will not work.');
}

// Initialize Resend only if API key exists
const resend = RESEND_API_KEY_EXISTS ? new Resend(process.env.RESEND_API_KEY) : null;

// Use a reliable sender email from Resend's verified domains (onresend.com)
const FROM_EMAIL = 'onboarding@resend.dev';
const FROM_NAME = 'SpeakMyWay';

// Development mode will log emails instead of sending them
const DEV_MODE = process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY;

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmailWithResend({ to, subject, htmlBody, textBody }: EmailOptions): Promise<boolean> {
  const toAddresses = Array.isArray(to) ? to : [to];
  
  // If in development mode without API key, just log the email details
  if (DEV_MODE) {
    console.log('=== DEV MODE: Email would be sent with the following details ===');
    console.log(`From: ${FROM_NAME} <${FROM_EMAIL}>`);
    console.log(`To: ${toAddresses.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log('Text body preview:', textBody.substring(0, 150) + '...');
    console.log('=== Set RESEND_API_KEY env var to send real emails ===');
    return true;
  }
  
  if (!RESEND_API_KEY_EXISTS || !resend) {
    console.error('Cannot send email: Resend API key not configured');
    return false;
  }
  
  try {
    // Send to the first email in the list (Resend doesn't support multiple recipients in one call)
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toAddresses[0],
      subject: subject,
      html: htmlBody,
      text: textBody,
    });
    
    if (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
    
    console.log(`Email sent successfully via Resend to ${toAddresses[0]}`, data);
    
    // If there are multiple recipients, send separate emails to each (after the first one)
    if (toAddresses.length > 1) {
      for (let i = 1; i < toAddresses.length; i++) {
        await resend.emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: toAddresses[i],
          subject: subject,
          html: htmlBody,
          text: textBody,
        });
        console.log(`Email sent successfully via Resend to ${toAddresses[i]}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
}
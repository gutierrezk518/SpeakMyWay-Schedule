import { 
  SESClient, 
  SendEmailCommand, 
  SendEmailCommandInput 
} from "@aws-sdk/client-ses";
import { sendEmailWithSendGrid } from "./sendgrid-service";

// Check if AWS credentials exist
const AWS_CREDENTIALS_EXIST = !!(process.env.AWS_ACCESS_KEY_ID && 
                               process.env.AWS_SECRET_ACCESS_KEY && 
                               process.env.AWS_REGION);

if (!AWS_CREDENTIALS_EXIST) {
  console.warn('AWS SES credentials missing. Using SendGrid or fallback to development mode.');
}

// Only create SES client if credentials exist
const sesClient = AWS_CREDENTIALS_EXIST ? new SESClient({
  region: process.env.AWS_REGION || 'us-east-2', // AWS SES region (Ohio)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}) : null;

// In AWS SES sandbox mode, both sender and recipient must be verified
// Use a plain email format without the friendly name to avoid potential parsing issues
const FROM_EMAIL = process.env.VERIFIED_EMAIL || 'info@speakmyway.com';

// Development mode will log emails instead of sending them if true
// Force development mode with FORCE_DEV_EMAIL=true environment variable
const DEV_MODE = process.env.FORCE_DEV_EMAIL === 'true' || 
                (process.env.NODE_ENV === 'development' && !process.env.VERIFIED_EMAIL);

// Check if SendGrid is available as a fallback option
const SENDGRID_AVAILABLE = !!process.env.SENDGRID_API_KEY;

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody: string;
}

export async function sendEmail({ to, subject, htmlBody, textBody }: EmailOptions): Promise<boolean> {
  const toAddresses = Array.isArray(to) ? to : [to];
  
  // If in development mode without a verified email, just log the email details
  if (DEV_MODE) {
    console.log('=== DEV MODE: Email would be sent with the following details ===');
    console.log(`From: ${FROM_EMAIL}`);
    console.log(`To: ${toAddresses.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log('Text body preview:', textBody.substring(0, 150) + '...');
    console.log('=== Set VERIFIED_EMAIL env var with an email verified in AWS SES to send real emails ===');
    return true;
  }
  
  // Try AWS SES first if available
  if (AWS_CREDENTIALS_EXIST && sesClient) {
    try {
      const params: SendEmailCommandInput = {
        Source: FROM_EMAIL,
        Destination: {
          ToAddresses: toAddresses,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      };

      // Debug SES configuration
      console.log('=== AWS SES Configuration ===');
      console.log(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
      console.log(`From Email: ${FROM_EMAIL}`);
      console.log(`Access Key ID: ${process.env.AWS_ACCESS_KEY_ID ? 'Set (first 4 chars: ' + process.env.AWS_ACCESS_KEY_ID.substring(0, 4) + '...)' : 'Not set'}`);
      console.log(`Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? 'Set (length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'Not set'}`);
      console.log(`Verified Email Env Var: ${process.env.VERIFIED_EMAIL || 'Not set'}`);
      console.log('=== End AWS SES Configuration ===');

      const result = await sesClient.send(new SendEmailCommand(params));
      console.log(`Email sent successfully via AWS SES to ${toAddresses.join(', ')}`);
      return true;
    } catch (error: any) {
      // Check for AWS SES verification errors
      if (error.message && error.message.includes('not verified')) {
        console.error('AWS SES EMAIL VERIFICATION ERROR:', error.message);
        console.error('To fix this:');
        console.error('1. Go to AWS SES console and verify both sender and recipient email addresses');
        console.error('2. Once verified, set the VERIFIED_EMAIL environment variable to your verified sender email');
        console.error('3. For testing, use a recipient email that you can verify in AWS SES console');
        
        // Try SendGrid as fallback if available
        if (SENDGRID_AVAILABLE) {
          console.log('Attempting to send email via SendGrid instead...');
          return await sendEmailWithSendGrid({ to, subject, htmlBody, textBody });
        }
      } else {
        console.error('Failed to send email via AWS SES:', error);
        
        // Try SendGrid as fallback if available
        if (SENDGRID_AVAILABLE) {
          console.log('Attempting to send email via SendGrid instead...');
          return await sendEmailWithSendGrid({ to, subject, htmlBody, textBody });
        }
      }
      return false;
    }
  } else if (SENDGRID_AVAILABLE) {
    // If AWS SES is not available but SendGrid is, use SendGrid
    console.log('AWS SES not configured, attempting to send via SendGrid...');
    return await sendEmailWithSendGrid({ to, subject, htmlBody, textBody });
  } else {
    console.error('No email provider configured. Cannot send email.');
    return false;
  }
}

// Template for welcome emails
export function generateWelcomeEmailTemplate(username: string, userId: number): { html: string; text: string } {
  const appUrl = process.env.APP_URL || 'https://speakmyway.app';
  const currentYear = new Date().getFullYear();
  const supportEmail = 'support@speakmyway.app';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>Welcome to SpeakMyWay</title>
      <style>
        @media only screen and (max-width: 480px) {
          .mobile-padding {
            padding: 10px !important;
          }
          .mobile-font {
            font-size: 16px !important;
          }
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .header {
          background-color: #4F46E5;
          padding: 24px;
          text-align: center;
          color: white;
        }
        .logo {
          margin-bottom: 16px;
        }
        .content {
          padding: 32px 24px;
        }
        .welcome-text {
          font-size: 18px;
          margin-bottom: 24px;
        }
        .feature-box {
          background-color: #f5f7ff;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .feature-list {
          padding-left: 20px;
        }
        .feature-list li {
          margin-bottom: 10px;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          padding: 12px 32px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 16px;
        }
        .button:hover {
          background-color: #4338ca;
        }
        .divider {
          height: 1px;
          background-color: #eaeaea;
          margin: 24px 0;
        }
        .help-section {
          background-color: #f5f7ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .footer {
          background-color: #f5f7ff;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .social-icons {
          margin: 16px 0;
        }
        .social-icon {
          display: inline-block;
          margin: 0 8px;
        }
        a {
          color: #4F46E5;
          text-decoration: underline;
        }
        .info-badge {
          display: inline-block;
          background-color: #e5e7eb;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- You can add a logo image here -->
          <!-- <img src="${appUrl}/logo.png" alt="SpeakMyWay Logo" width="180" height="auto" class="logo"> -->
          <h1 style="margin: 0; font-size: 28px;">Welcome to SpeakMyWay!</h1>
        </div>
        
        <div class="content">
          <p class="welcome-text">Hello <strong>${username}</strong>,</p>
          
          <p>We're thrilled to welcome you to SpeakMyWay - your personalized AAC (Augmentative and Alternative Communication) application designed for neurodivergent children!</p>
          
          <div class="feature-box">
            <p><strong>Your account info:</strong></p>
            <p>Username: <strong>${username}</strong></p>
            <p>User ID: <span class="info-badge">${userId}</span></p>
          </div>
          
          <p><strong>With SpeakMyWay, you can:</strong></p>
          <ul class="feature-list">
            <li>Create custom communication cards with personalized images and text</li>
            <li>Set up and organize daily routines for better predictability</li>
            <li>Choose from different voice options to match preferences</li>
            <li>Switch between languages for multilingual support</li>
            <li>Track progress and usage patterns over time</li>
          </ul>
          
          <div class="button-container">
            <a href="${appUrl}/schedule" class="button">Get Started Now</a>
          </div>
          
          <div class="help-section">
            <p><strong>Need help getting started?</strong></p>
            <p>Check out our <a href="${appUrl}/help">quick start guide</a> or contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a> if you have any questions.</p>
          </div>
          
          <div class="divider"></div>
          
          <p>Thank you for choosing SpeakMyWay to support communication needs. We're excited to be part of your journey!</p>
          
          <p>Warmly,<br>The SpeakMyWay Team</p>
        </div>
        
        <div class="footer">
          <p>© ${currentYear} SpeakMyWay. All rights reserved.</p>
          <p>
            <a href="${appUrl}/privacy">Privacy Policy</a> | 
            <a href="${appUrl}/terms">Terms of Service</a> | 
            <a href="${appUrl}/contact">Contact Us</a>
          </p>
          <p>This is a transactional email regarding your SpeakMyWay account.</p>
          <!-- You can add social media icons here -->
          <!-- <div class="social-icons">
            <a href="#" class="social-icon"><img src="${appUrl}/twitter-icon.png" alt="Twitter" width="24"></a>
            <a href="#" class="social-icon"><img src="${appUrl}/facebook-icon.png" alt="Facebook" width="24"></a>
            <a href="#" class="social-icon"><img src="${appUrl}/instagram-icon.png" alt="Instagram" width="24"></a>
          </div> -->
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
WELCOME TO SPEAKMYWAY!

Hello ${username},

We're thrilled to welcome you to SpeakMyWay - your personalized AAC (Augmentative and Alternative Communication) application designed for neurodivergent children!

YOUR ACCOUNT INFO:
Username: ${username}
User ID: ${userId}

WITH SPEAKMYWAY, YOU CAN:
- Create custom communication cards with personalized images and text
- Set up and organize daily routines for better predictability
- Choose from different voice options to match preferences
- Switch between languages for multilingual support
- Track progress and usage patterns over time

GET STARTED NOW: ${appUrl}/schedule

NEED HELP GETTING STARTED?
Check out our quick start guide at ${appUrl}/help or contact our support team at ${supportEmail} if you have any questions.

Thank you for choosing SpeakMyWay to support communication needs. We're excited to be part of your journey!

Warmly,
The SpeakMyWay Team

---
© ${currentYear} SpeakMyWay. All rights reserved.
Privacy Policy: ${appUrl}/privacy
Terms of Service: ${appUrl}/terms
Contact Us: ${appUrl}/contact

This is a transactional email regarding your SpeakMyWay account.
  `;

  return { html, text };
}
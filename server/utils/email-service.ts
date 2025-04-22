import { 
  SESClient, 
  SendEmailCommand, 
  SendEmailCommandInput 
} from "@aws-sdk/client-ses";

if (!process.env.AWS_ACCESS_KEY_ID || 
    !process.env.AWS_SECRET_ACCESS_KEY || 
    !process.env.AWS_REGION) {
  console.warn('AWS SES credentials missing. Email functionality will not work.');
}

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// The FROM email address must be verified in SES
const FROM_EMAIL = 'notifications@speakmyway.app'; // Replace with your verified email

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody: string;
}

export async function sendEmail({ to, subject, htmlBody, textBody }: EmailOptions): Promise<boolean> {
  try {
    const toAddresses = Array.isArray(to) ? to : [to];
    
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

    await sesClient.send(new SendEmailCommand(params));
    console.log(`Email sent successfully to ${toAddresses.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Template for welcome emails
export function generateWelcomeEmailTemplate(username: string, userId: number): { html: string; text: string } {
  const appUrl = process.env.APP_URL || 'https://speakmyway.app';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SpeakMyWay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          padding: 20px;
          text-align: center;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin-top: 15px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to SpeakMyWay!</h1>
      </div>
      <div class="content">
        <p>Hello ${username},</p>
        <p>Welcome to SpeakMyWay - your personalized AAC (Augmentative and Alternative Communication) application!</p>
        <p>Your account has been successfully created with User ID: <strong>${userId}</strong></p>
        <p>With SpeakMyWay, you can:</p>
        <ul>
          <li>Create custom communication cards</li>
          <li>Organize daily routines</li>
          <li>Customize your experience with different voices and languages</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <a href="${appUrl}/schedule" class="button">Go to My Dashboard</a>
        <p style="margin-top: 20px;">Thank you for choosing SpeakMyWay!</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} SpeakMyWay. All rights reserved.</p>
        <p>This email was sent to confirm your registration with SpeakMyWay.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to SpeakMyWay!

Hello ${username},

Welcome to SpeakMyWay - your personalized AAC (Augmentative and Alternative Communication) application!

Your account has been successfully created with User ID: ${userId}

With SpeakMyWay, you can:
- Create custom communication cards
- Organize daily routines
- Customize your experience with different voices and languages

If you have any questions or need assistance, please don't hesitate to contact our support team.

Visit your dashboard at: ${appUrl}/schedule

Thank you for choosing SpeakMyWay!

© ${new Date().getFullYear()} SpeakMyWay. All rights reserved.
This email was sent to confirm your registration with SpeakMyWay.
  `;

  return { html, text };
}
import { sendEmail } from './email-service';
import { sendEmailWithSendGrid } from './sendgrid-service';

// This utility is used for testing email functionality

/**
 * Generates a test email template
 */
export function createTestEmailTemplate(): { html: string; text: string } {
  const currentYear = new Date().getFullYear();
  const serverTime = new Date().toLocaleString();
  const environment = process.env.NODE_ENV || 'development';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        .env-badge { 
          display: inline-block; 
          background-color: ${environment === 'production' ? '#10b981' : '#f59e0b'}; 
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
        .info-section {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .info-item {
          margin-bottom: 8px;
        }
        code {
          background-color: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SpeakMyWay Email Test</h1>
        </div>
        <div class="content">
          <p>This is a test email from SpeakMyWay.</p>
          <p>If you're receiving this email, it means our email delivery system is working correctly!</p>
          
          <div class="info-section">
            <div class="info-item"><strong>Server Time:</strong> ${serverTime}</div>
            <div class="info-item"><strong>Environment:</strong> <span class="env-badge">${environment}</span></div>
            <div class="info-item"><strong>Sender:</strong> <code>${process.env.VERIFIED_EMAIL || 'info@speakmyway.com'}</code></div>
          </div>
          
          <p>This email was sent using ${process.env.AWS_REGION ? `AWS SES in the ${process.env.AWS_REGION} region` : 'the development email service'}.</p>
        </div>
        <div class="footer">
          <p>© ${currentYear} SpeakMyWay. All rights reserved.</p>
          <p>This is a test email and can be safely ignored.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    SpeakMyWay Email Test
    
    This is a test email from SpeakMyWay.
    
    If you're receiving this email, it means our email delivery system is working correctly!
    
    Server Time: ${serverTime}
    Environment: ${environment}
    Sender: ${process.env.VERIFIED_EMAIL || 'info@speakmyway.com'}
    
    This email was sent using ${process.env.AWS_REGION ? `AWS SES in the ${process.env.AWS_REGION} region` : 'the development email service'}.
    
    © ${currentYear} SpeakMyWay. All rights reserved.
    This is a test email and can be safely ignored.
  `;
  
  return { html, text };
}

/**
 * Send a test email using specified provider
 * @param recipientEmail Email address to send test to
 * @param provider Optional provider override ('sendgrid' or undefined for default)
 * @returns Promise<boolean> Success status
 */
export async function sendTestEmail(
  recipientEmail: string, 
  provider?: 'sendgrid'
): Promise<boolean> {
  // Get the email template
  const { html, text } = createTestEmailTemplate();
  const timestamp = new Date().toLocaleTimeString();
  
  // Force development mode for tests if the FORCE_DEV_EMAIL env var is set
  if (process.env.FORCE_DEV_EMAIL === 'true') {
    console.log('=== FORCED DEV MODE: Email details ===');
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: SpeakMyWay Email Test - ${timestamp}`);
    console.log('Text body preview:', text.substring(0, 150) + '...');
    console.log('=== End of forced dev mode email ===');
    return true;
  }
  
  // If provider is specifically set to sendgrid, use SendGrid
  if (provider === 'sendgrid') {
    console.log(`Sending test email to ${recipientEmail} via SendGrid...`);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not found but SendGrid provider requested');
      return false;
    }
    
    return await sendEmailWithSendGrid({
      to: recipientEmail,
      subject: `SpeakMyWay Email Test - ${timestamp} (SendGrid)`,
      htmlBody: html,
      textBody: text
    });
  }
  
  // Otherwise use the default email service (which handles fallbacks)
  console.log(`Sending test email to ${recipientEmail} via default provider...`);
  return await sendEmail({
    to: recipientEmail,
    subject: `SpeakMyWay Email Test - ${timestamp}`,
    htmlBody: html,
    textBody: text
  });
}
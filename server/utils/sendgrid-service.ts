import sgMail from '@sendgrid/mail';

// Check if SendGrid API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid initialized as backup email provider');
} else {
  console.warn('SendGrid API key not found. SendGrid email functionality will not work.');
}

// Use a plain email format without the friendly name
const FROM_EMAIL = process.env.VERIFIED_EMAIL || 'info@speakmyway.com';

// Development mode will log emails instead of sending them if true
const DEV_MODE = process.env.NODE_ENV === 'development' && !process.env.SENDGRID_API_KEY;

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody: string;
}

export async function sendEmailWithSendGrid({ to, subject, htmlBody, textBody }: EmailOptions): Promise<boolean> {
  const toAddresses = Array.isArray(to) ? to : [to];
  
  // If in development mode without an API key, just log the email details
  if (DEV_MODE) {
    console.log('=== DEV MODE (SendGrid): Email would be sent with the following details ===');
    console.log(`From: ${FROM_EMAIL}`);
    console.log(`To: ${toAddresses.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log('Text body preview:', textBody.substring(0, 150) + '...');
    console.log('=== Set SENDGRID_API_KEY env var to send real emails with SendGrid ===');
    return true;
  }
  
  // Proceed with actual email sending
  try {
    const msg = {
      to: toAddresses,
      from: FROM_EMAIL,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };
    
    await sgMail.send(msg);
    console.log(`Email sent successfully via SendGrid to ${toAddresses.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send email via SendGrid:', error);
    
    if (error.response) {
      console.error('SendGrid API error details:', error.response.body);
    }
    
    return false;
  }
}
import { sendEmail, generateWelcomeEmailTemplate } from './email-service';

/**
 * Utility script to test email functionality
 * Usage: 
 * - Set AWS credentials in environment variables
 * - Run: npx tsx server/utils/test-email.ts recipient@example.com
 */
async function testEmail() {
  try {
    // Check for required environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || 
        !process.env.AWS_SECRET_ACCESS_KEY || 
        !process.env.AWS_REGION) {
      console.error('Error: Missing required AWS environment variables!');
      console.error('Make sure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are set.');
      process.exit(1);
    }

    // Get recipient email from command line arguments
    const testEmail = process.argv[2];
    if (!testEmail) {
      console.error('Error: No test email address provided!');
      console.error('Usage: npx tsx server/utils/test-email.ts recipient@example.com');
      process.exit(1);
    }

    console.log(`Sending test email to ${testEmail}...`);

    // Generate a test welcome email
    const { html, text } = generateWelcomeEmailTemplate('TestUser', 12345);

    // Send the test email
    const result = await sendEmail({
      to: testEmail,
      subject: 'Welcome to SpeakMyWay, TestUser! [TEST EMAIL]',
      htmlBody: html,
      textBody: text
    });

    if (result) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.error('❌ Failed to send test email.');
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

// Run the test
testEmail();
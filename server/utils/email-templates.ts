/**
 * Email templates for the application
 * These templates follow WCAG guidelines for accessibility
 * and are designed to work across different email clients
 */

// Welcome email template with verification link
export function welcomeEmail(name: string, verificationUrl: string): string {
  // Using system fonts that work across different email clients
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SpeakMyWay</title>
  <style type="text/css">
    /* Use email-safe fonts */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #4b70c1;
      color: #ffffff;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 30px;
      background-color: #f7f9fc;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4b70c1;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
    /* Ensure good contrast for accessibility */
    a {
      color: #035eab;
      font-weight: bold;
    }
    h1, h2 {
      color: #333333;
    }
    /* Responsive design */
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
      }
      .content {
        padding: 15px !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SpeakMyWay!</h1>
    </div>
    <div class="content">
      <h2>Hello${name ? ', ' + name : ''}!</h2>
      <p>Thank you for registering with SpeakMyWay, your personalized communication assistant.</p>
      <p>We're excited to help you create personalized communication cards and schedules!</p>
      
      <p>To get started, please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 14px;">
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>
      
      <p>Here are some of the features you can look forward to:</p>
      <ul>
        <li>Create personalized communication cards</li>
        <li>Build daily schedules with visual supports</li>
        <li>Customize voice settings for your preferences</li>
        <li>Access your content from any device</li>
      </ul>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Happy communicating!</p>
      <p>The SpeakMyWay Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SpeakMyWay. All rights reserved.</p>
      <p>This email was sent to you because you registered for a SpeakMyWay account.</p>
      <p>If you didn't create this account, please ignore this email or contact support.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Password reset email template
export function passwordResetEmail(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your SpeakMyWay Password</title>
  <style type="text/css">
    /* Use email-safe fonts */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #4b70c1;
      color: #ffffff;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 30px;
      background-color: #f7f9fc;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4b70c1;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
    /* Ensure good contrast for accessibility */
    a {
      color: #035eab;
      font-weight: bold;
    }
    h1, h2 {
      color: #333333;
    }
    /* Responsive design */
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
      }
      .content {
        padding: 15px !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hello${name ? ', ' + name : ''}!</h2>
      <p>We received a request to reset your password for your SpeakMyWay account.</p>
      <p>To reset your password, please click the button below:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 14px;">
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      
      <p>This link will expire in 24 hours for security reasons.</p>
      
      <p>If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
      
      <p>The SpeakMyWay Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SpeakMyWay. All rights reserved.</p>
      <p>This email was sent to you because a password reset was requested for your account.</p>
    </div>
  </div>
</body>
</html>
  `;
}
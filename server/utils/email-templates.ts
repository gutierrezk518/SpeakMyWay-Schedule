/**
 * Generate a welcome email with verification link
 * @param name - User's name
 * @param verificationUrl - URL for email verification
 * @returns HTML content for the email
 */
export function welcomeEmail(name: string, verificationUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your SpeakMyWay Email</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .logo {
      max-width: 150px;
      margin: 20px 0;
    }
    .container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 30px;
      background-color: #ffffff;
    }
    h1 {
      color: #4A6FA5;
      font-size: 24px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background-color: #4A6FA5;
      color: #ffffff !important;
      font-weight: bold;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777777;
      text-align: center;
    }
    a {
      color: #4A6FA5;
      text-decoration: underline;
    }
    @media only screen and (max-width: 480px) {
      .container {
        padding: 20px;
      }
      h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to SpeakMyWay!</h1>
    
    <p>Hello${name ? ' ' + name : ''},</p>
    
    <p>Thank you for joining SpeakMyWay - the premier AAC (Augmentative and Alternative Communication) application custom-designed for children with unique communication needs!</p>
    
    <p>To activate your account and access all our great features, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify My Email</a>
    </div>
    
    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    
    <p>This link will expire in 24 hours for security reasons.</p>
    
    <p>With SpeakMyWay, you can:</p>
    <ul style="margin-left: 20px; padding-left: 0;">
      <li>Create custom communication cards with personalized images and text</li>
      <li>Set up and organize daily routines for better predictability</li>
      <li>Choose from different voice options to match preferences</li>
      <li>Switch between languages for multilingual support</li>
      <li>Track progress and usage patterns over time</li>
    </ul>
    
    <p>If you didn't create this account, you can safely ignore this email.</p>
    
    <p>Thank you,<br>The SpeakMyWay Team</p>
  </div>
  
  <div class="footer">
    <p>This email was sent to verify your account. If you have questions or need support, please contact us at support@speakmyway.app</p>
    <p>&copy; ${new Date().getFullYear()} SpeakMyWay. All rights reserved.</p>
  </div>
</body>
</html>`;
}

/**
 * Plain text version of welcome email for email clients that don't support HTML
 */
export function welcomeEmailText(name: string, verificationUrl: string): string {
  return `WELCOME TO SPEAKMYWAY!

Hello${name ? ' ' + name : ''},

We're thrilled to welcome you to SpeakMyWay - your personalized AAC (Augmentative and Alternative Communication) application designed for neurodivergent children!

Before you can start using all features of SpeakMyWay, please verify your email address by visiting this link:
${verificationUrl}

This link will expire in 24 hours for security reasons.

WITH SPEAKMYWAY, YOU CAN:
- Create custom communication cards with personalized images and text
- Set up and organize daily routines for better predictability
- Choose from different voice options to match preferences
- Switch between languages for multilingual support
- Track progress and usage patterns over time

If you didn't create this account, you can safely ignore this email.

Thank you,
The SpeakMyWay Team

---
This email was sent to verify your account. If you have questions or need support, please contact us at support@speakmyway.app
© ${new Date().getFullYear()} SpeakMyWay. All rights reserved.`;
}
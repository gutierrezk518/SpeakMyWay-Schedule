/**
 * Email templates for the application
 */

/**
 * Welcome email template (HTML)
 */
export function welcomeEmail(name: string, verificationUrl: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>Verify Your Email - SpeakMyWay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #4F46E5;
          color: white;
          border-radius: 5px 5px 0 0;
          margin: -20px -20px 20px;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 4px;
          margin-top: 20px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          color: #777777;
          font-size: 12px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .header {
            margin: -10px -10px 10px;
          }
          .content {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SpeakMyWay</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p> We're thrilled to welcome you to SpeakMyWay - your suite of personalized tools for both speech development and fun! </p>
          
          <p>To complete your registration and verify your email address, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify My Email</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          
          <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <p>Welcome aboard!</p>
          
          <p>Best regards,<br>
          The SpeakMyWay Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} SpeakMyWay. All rights reserved.</p>
          <p>If you did not create an account with SpeakMyWay, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Welcome email template (plain text)
 */
export function welcomeEmailText(name: string, verificationUrl: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
Welcome to SpeakMyWay

Hello,

We're thrilled to welcome you to SpeakMyWay - your suite of personalized tools for both speech development and fun!

To complete your registration and verify your email address, please click the link below:

${verificationUrl}

This verification link will expire in 24 hours.

Welcome aboard!

Best regards,
The SpeakMyWay Team

© ${currentYear} SpeakMyWay. All rights reserved.

If you did not create an account with SpeakMyWay, please ignore this email.
  `;
}

/**
 * Password reset email template (HTML)
 */
export function passwordResetEmail(name: string, resetUrl: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>Reset Your Password - SpeakMyWay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #4F46E5;
          color: white;
          border-radius: 5px 5px 0 0;
          margin: -20px -20px 20px;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 4px;
          margin-top: 20px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          color: #777777;
          font-size: 12px;
        }
        .info {
          background-color: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #4F46E5;
          margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .header {
            margin: -10px -10px 10px;
          }
          .content {
            padding: 10px;
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
          <p>Hello ${name || 'there'},</p>
          
          <p>We received a request to reset your password for your SpeakMyWay account. If you didn't make this request, you can ignore this email.</p>
          
          <p>To reset your password, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          
          <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
          
          <div class="info">
            <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
          </div>
          
          <p>If you didn't request a password reset, please contact our support team immediately.</p>
          
          <p>Best regards,<br>
          The SpeakMyWay Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} SpeakMyWay. All rights reserved.</p>
          <p>For security reasons, this email was sent to the email address associated with your SpeakMyWay account.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Password reset email template (plain text)
 */
export function passwordResetEmailText(name: string, resetUrl: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
Reset Your Password - SpeakMyWay

Hello,

We received a request to reset your password for your SpeakMyWay account. If you didn't make this request, you can ignore this email.

To reset your password, please click the link below:

${resetUrl}

Important: This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please contact our support team immediately.

Best regards,
The SpeakMyWay Team

© ${currentYear} SpeakMyWay. All rights reserved.

For security reasons, this email was sent to the email address associated with your SpeakMyWay account.
  `;
}
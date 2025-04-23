import { SESClient, GetIdentityVerificationAttributesCommand } from "@aws-sdk/client-ses";

// This utility checks if email addresses are verified in AWS SES
export async function checkEmailVerificationStatus(emailAddresses: string[]): Promise<Record<string, boolean>> {
  // Check if AWS credentials exist
  if (!(process.env.AWS_ACCESS_KEY_ID && 
        process.env.AWS_SECRET_ACCESS_KEY && 
        process.env.AWS_REGION)) {
    console.warn('AWS SES credentials missing. Cannot check verification status.');
    return Object.fromEntries(emailAddresses.map(email => [email, false]));
  }

  // Create SES client
  const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-2', // AWS SES region (Ohio)
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Get verification attributes for the specified identities
    const command = new GetIdentityVerificationAttributesCommand({
      Identities: emailAddresses,
    });

    const response = await sesClient.send(command);
    
    console.log('SES verification response:', JSON.stringify(response, null, 2));
    
    // Create a result object mapping each email to its verification status
    const result: Record<string, boolean> = {};
    
    // Process the response
    if (response.VerificationAttributes) {
      for (const email of emailAddresses) {
        const verification = response.VerificationAttributes[email];
        // Email is verified if VerificationStatus is "Success"
        result[email] = verification?.VerificationStatus === 'Success';
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error checking email verification status:', error);
    // Return all emails as unverified on error
    return Object.fromEntries(emailAddresses.map(email => [email, false]));
  }
}
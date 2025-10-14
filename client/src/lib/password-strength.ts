export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  score: PasswordStrength;
  percentage: number;
  color: string;
  checks: {
    minLength: boolean;
    hasNumber: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasSpecialChar: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // All four basic requirements must be met for a valid password
  const hasAllRequired = checks.minLength && checks.hasNumber && checks.hasUpperCase && checks.hasLowerCase;

  // Calculate score based on checks
  let strength = 0;
  if (checks.minLength) strength += 25;
  if (checks.hasNumber) strength += 25;
  if (checks.hasUpperCase) strength += 25;
  if (checks.hasLowerCase) strength += 25;
  if (checks.hasSpecialChar) strength += 20; // Bonus for special characters

  // Determine score and color
  let score: PasswordStrength;
  let color: string;

  if (!hasAllRequired || strength < 50) {
    // Less than all required = weak
    score = "weak";
    color = "rgb(239, 68, 68)"; // red-500
  } else if (strength < 80) {
    // Has all required but no special chars = fair
    score = "fair";
    color = "rgb(234, 179, 8)"; // yellow-500
  } else if (strength < 100) {
    // Has all required = good
    score = "good";
    color = "rgb(59, 130, 246)"; // blue-500
  } else {
    // Has all required + special chars + good length = strong
    score = "strong";
    color = "rgb(34, 197, 94)"; // green-500
  }

  return {
    score,
    percentage: strength,
    color,
    checks,
  };
}

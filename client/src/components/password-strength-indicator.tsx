import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, criteria: [] };
    
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    
    const criteria = [
      { met: hasMinLength, text: "At least 8 characters" },
      { met: hasUppercase, text: "Contains uppercase letter" },
      { met: hasLowercase, text: "Contains lowercase letter" },
      { met: hasNumbers, text: "Contains number" },
      { met: hasSpecialChars, text: "Contains special character" }
    ];
    
    // Calculate overall score (0-4)
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase && hasLowercase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;
    
    // Additional length bonus
    if (password.length >= 12) score = Math.min(4, score + 1);
    
    return {
      score,
      criteria
    };
  }, [password]);
  
  const strengthText = useMemo(() => {
    if (!password) return "";
    switch (strength.score) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  }, [strength.score, password]);
  
  const strengthColor = useMemo(() => {
    if (!password) return "bg-gray-200";
    switch (strength.score) {
      case 0: return "bg-red-500";
      case 1: return "bg-red-400";
      case 2: return "bg-yellow-500";
      case 3: return "bg-green-400";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  }, [strength.score, password]);
  
  if (!password) return null;
  
  return (
    <div className="mt-2 space-y-2">
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${strengthColor} transition-all duration-300 ease-in-out`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        
        {password && (
          <p className="text-xs flex justify-between">
            <span>Strength:</span>
            <span className={
              strength.score <= 1 ? "text-red-500" : 
              strength.score === 2 ? "text-yellow-500" : 
              "text-green-500"
            }>
              {strengthText}
            </span>
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {strength.criteria?.map((criterion, index) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${criterion.met ? 'bg-green-500' : 'bg-gray-300'}`}>
              {criterion.met && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={criterion.met ? 'text-gray-700' : 'text-gray-500'}>
              {criterion.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
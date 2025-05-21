import React from 'react';
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConsentCheckboxesProps {
  privacyConsent: boolean;
  setPrivacyConsent: (value: boolean) => void;
  marketingConsent: boolean;
  setMarketingConsent: (value: boolean) => void;
}

export function ConsentCheckboxes({
  privacyConsent,
  setPrivacyConsent,
  marketingConsent,
  setMarketingConsent
}: ConsentCheckboxesProps) {
  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="privacy-policy" 
          checked={privacyConsent}
          onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
          className="mt-1"
          required
        />
        <div className="grid gap-1.5 leading-none">
          <Label 
            htmlFor="privacy-policy" 
            className="text-sm font-normal"
          >
            I agree to the{" "}
            <a 
              href="/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a 
              href="/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
            <span className="text-destructive ml-1">*</span>
          </Label>
        </div>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="marketing-consent" 
          checked={marketingConsent}
          onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
          className="mt-1"
        />
        <div className="grid gap-1.5 leading-none">
          <Label 
            htmlFor="marketing-consent" 
            className="text-sm font-normal"
          >
            I agree to receive occasional marketing communications about product updates and features
          </Label>
        </div>
      </div>
    </div>
  );
}
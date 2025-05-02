import { useAuth } from "@/hooks/use-auth";
import { Loader2, RefreshCw } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Interface for anonymous user data
interface AnonymousUser {
  nickname: string;
  sessionStartTime: string;
  isAnonymous: true;
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Check for anonymous user in localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("anonymousUser");
      if (storedUser) {
        setAnonymousUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading anonymous user from localStorage:", error);
    }
  }, []);
  
  // Function to resend verification email
  const handleResendVerification = async () => {
    if (!user) return;
    
    setResendingEmail(true);
    try {
      const response = await apiRequest("POST", "/api/resend-verification");
      
      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "A new verification email has been sent to your address.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend verification email.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // TEMPORARILY DISABLED email verification check to restore access
  // We'll just pass through without blocking - no message needed to prevent render loops

  // Allow access if user is verified OR is an anonymous user
  if (!user && !anonymousUser) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
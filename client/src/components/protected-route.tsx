import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

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
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  
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

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Render verification required page if user is logged in but not verified
  if (user && !user.emailVerified) {
    return (
      <Route path={path}>
        <div className="container flex items-center justify-center min-h-screen py-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Email Verification Required</CardTitle>
              <CardDescription>
                Please verify your email address to access the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center my-6">
                <div className="rounded-full bg-primary/10 p-6">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to: <strong>{user.email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Please check your inbox and click the verification link to activate your account.
                If you don't see the email, please check your spam folder.
              </p>
              <p className="text-sm text-muted-foreground">
                The verification link will expire in 24 hours.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => window.location.reload()}
              >
                I've Verified My Email
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Route>
    );
  }

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
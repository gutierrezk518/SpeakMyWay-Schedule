import { useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();

  // If user is already logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your personalized experience
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => window.location.href = "/api/login"}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in to your account
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center p-6 bg-gray-50 border-t rounded-b-lg">
          <div className="text-sm text-muted-foreground text-center">
            <p>Learn more about our</p>
            <a href="/privacy-policy" className="underline underline-offset-2 hover:text-primary">
              Privacy Policy
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
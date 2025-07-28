import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            Email verification is handled by Supabase Auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center my-6">
            <div className="rounded-full p-6 bg-blue-100">
              <AlertCircle className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Email verification is now handled automatically by Supabase. 
            Please check your email and follow the verification link provided by Supabase.
          </p>
          <Button 
            onClick={() => setLocation("/auth")} 
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
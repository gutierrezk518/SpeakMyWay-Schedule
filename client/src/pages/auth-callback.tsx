import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallback() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's a hash fragment with tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          // Exchange the tokens for a session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (data.session) {
            // Success! Show success message briefly then redirect
            setStatus("success");

            // Wait a moment to show success, then redirect
            setTimeout(() => {
              setLocation("/");
            }, 1500);
          } else {
            throw new Error("No session created");
          }
        } else if (type === 'recovery') {
          // Password recovery flow - redirect to reset password page
          setLocation("/reset-password");
        } else {
          // No tokens found, redirect to home
          setLocation("/");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Failed to complete authentication");

        // Redirect to auth page after showing error
        setTimeout(() => {
          setLocation("/auth");
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Please wait while we confirm your email address"}
            {status === "success" && "Redirecting you to your dashboard..."}
            {status === "error" && (errorMessage || "Redirecting you to login...")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-muted-foreground">
                This should only take a moment
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmailPage() {
  const [_, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Extract token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. No token provided.");
          return;
        }

        // Send token to API for verification
        const response = await apiRequest("GET", `/api/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been successfully verified.");
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Your Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address..."}
            {status === "success" && "Your email has been successfully verified."}
            {status === "error" && "We encountered a problem verifying your email."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center my-6">
            <div className={`rounded-full p-6 ${
              status === "loading" ? "bg-primary/10" : 
              status === "success" ? "bg-green-100" : 
              "bg-red-100"
            }`}>
              {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
              {status === "success" && <CheckCircle className="h-12 w-12 text-green-600" />}
              {status === "error" && <XCircle className="h-12 w-12 text-red-600" />}
            </div>
          </div>

          {message && (
            <p className={`text-sm ${
              status === "error" ? "text-red-500" : "text-muted-foreground"
            }`}>
              {message}
            </p>
          )}

          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              You can now access all features of the application.
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-muted-foreground">
              If the problem persists, please contact support or try registering again.
            </p>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => setLocation(status === "success" ? "/" : "/auth")}
            disabled={status === "loading"}
          >
            {status === "success" ? "Go to App" : "Return to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
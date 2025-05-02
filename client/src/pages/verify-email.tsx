import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/verify-email");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. No token provided.");
          return;
        }

        // Call API to verify email
        const response = await apiRequest("GET", `/api/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
          
          // Refresh user data
          queryClient.invalidateQueries({queryKey: ['/api/user']});
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify your email. The link may be expired or invalid.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again later.");
        console.error("Email verification error:", error);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Your Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we confirm your email address."}
            {status === "success" && "Your email has been confirmed successfully."}
            {status === "error" && "We encountered a problem verifying your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center my-6">
            <div className={`rounded-full p-6 ${
              status === "loading" ? "bg-blue-100" : 
              status === "success" ? "bg-green-100" : "bg-red-100"
            }`}>
              {status === "loading" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
              {status === "success" && <CheckCircle className="h-12 w-12 text-green-600" />}
              {status === "error" && <AlertCircle className="h-12 w-12 text-red-600" />}
            </div>
          </div>
          
          {message && (
            <p className="text-sm text-muted-foreground">
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
              If you continue to have problems, please contact support.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={() => setLocation("/")}
          >
            {status === "success" ? "Go to Home" : "Back to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
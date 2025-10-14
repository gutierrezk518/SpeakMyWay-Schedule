import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Redirect, Link } from "wouter";

export default function AuthTestPage() {
  const { user, logout } = useAuth();

  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Display user information to verify auth is working
  return (
    <div className="container mx-auto p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Test Page</CardTitle>
          <CardDescription>
            This page displays your user information to verify authentication is working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">User Information</h3>
            <pre className="bg-card p-4 rounded overflow-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={logout}>
              Log Out
            </Button>
            <Link href="/">
              <Button variant="outline">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
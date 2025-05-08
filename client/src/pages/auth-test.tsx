import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

export default function AuthTestPage() {
  return (
    <div className="container mx-auto p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Test Page</CardTitle>
          <CardDescription>
            Authentication has been temporarily disabled while migrating to Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Authentication Status</h3>
            <p>Authentication has been removed from the application.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
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
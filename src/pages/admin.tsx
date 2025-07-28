import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Admin() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>
            Administrative features are not available in this frontend-only version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center my-6">
            <div className="rounded-full p-6 bg-yellow-100">
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Admin functionality requires a backend server, which has been removed for this Vercel deployment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
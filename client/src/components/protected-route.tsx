import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState } from "react";

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

  // Allow access if user is logged in OR is an anonymous user
  if (!user && !anonymousUser) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
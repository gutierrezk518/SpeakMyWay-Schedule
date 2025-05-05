import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  birthday?: string;
  consentGiven: boolean;
  consentDate: string;
  marketingConsent?: boolean;
  dataRetentionConsent?: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Modified for Replit Auth
  const loginMutation = useMutation({
    mutationFn: async (_credentials: LoginData) => {
      // Replit Auth is handled by redirecting to their login page
      // We'll just redirect the user to the login endpoint
      window.location.href = "/api/login";
      // Return a dummy object to satisfy the typing
      return {} as User;
    },
    onSuccess: () => {
      // We won't actually get here in Replit Auth flow as it involves redirects
      // But we keep it for API consistency
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Modified for Replit Auth - registration is handled the same way as login
  const registerMutation = useMutation({
    mutationFn: async (_userData: RegisterData) => {
      // With Replit Auth, registration is handled by Replit
      // We'll redirect to the login page which will handle both login and registration
      window.location.href = "/api/login";
      // Return a dummy object to satisfy the typing
      return {} as User;
    },
    onSuccess: () => {
      // We won't actually get here in Replit Auth flow as it involves redirects
      // But we keep it for API consistency
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Modified for Replit Auth
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Instead of making an AJAX request, redirect to the logout endpoint
      window.location.href = "/api/logout";
      // This won't actually reach the server before the redirect
    },
    onSuccess: () => {
      // We won't get here due to page redirect
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Refetch user data when auth mutations complete
  useEffect(() => {
    if (loginMutation.isSuccess || registerMutation.isSuccess || logoutMutation.isSuccess) {
      refetch();
    }
  }, [loginMutation.isSuccess, registerMutation.isSuccess, logoutMutation.isSuccess, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
import { createContext, useContext, ReactNode } from 'react';

// Simple placeholder type without Supabase dependencies
type MockUser = {
  id: string;
  email?: string | null;
  role?: string;
};

type AuthContextType = {
  user: MockUser | null;
  session: any | null;
  isLoading: boolean;
  signIn: () => Promise<any>;
  signUp: () => Promise<any>;
  logout: () => Promise<void>;
  setUser: (user: MockUser | null) => void;
  resetPassword: (email: string) => Promise<{ error: null }>;
};

// Create a mock context with stub methods
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  logout: async () => {},
  setUser: () => {},
  resetPassword: async () => ({ error: null }),
});

// Simple provider that doesn't do anything but render children
export function AuthProvider({ children }: { children: ReactNode }) {
  // Create a default value that matches the context type
  const defaultValue = {
    user: null,
    session: null,
    isLoading: false,
    signIn: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    logout: async () => {},
    setUser: () => {},
    resetPassword: async () => ({ error: null }),
  };
  
  return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>;
}

// Hook that returns the mock context
export function useAuth() {
  return useContext(AuthContext);
}
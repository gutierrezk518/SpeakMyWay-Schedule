import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define User type
interface User {
  id: number;
  email: string;
  username: string;
  isAdmin?: boolean;
  displayName?: string;
}

// Define the LocalAuth context type
interface LocalAuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context
const LocalAuthContext = createContext<LocalAuthContextType | null>(null);

// LocalAuth provider component
export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simple validation - in a real app, this would be a server call
      if (email && password) {
        // For this simplified version, we're using localStorage for persistence
        // Find if user exists by email
        const existingUser = localStorage.getItem('registeredUsers') 
          ? JSON.parse(localStorage.getItem('registeredUsers') || '[]').find((u: any) => u.email === email)
          : null;
        
        if (existingUser && existingUser.password === password) {
          // Create a user object without the password
          const { password, ...safeUser } = existingUser;
          setUser(safeUser);
          localStorage.setItem('user', JSON.stringify(safeUser));
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${safeUser.username}!`,
          });
          
          return true;
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Registration function
  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simple validation - in a real app, this would be a server call
      if (email && username && password) {
        // For this simplified version, we're using localStorage for persistence
        // Check if user already exists
        const registeredUsers = localStorage.getItem('registeredUsers') 
          ? JSON.parse(localStorage.getItem('registeredUsers') || '[]') 
          : [];
        
        if (registeredUsers.some((u: any) => u.email === email)) {
          toast({
            title: "Registration failed",
            description: "Email already exists",
            variant: "destructive",
          });
          return false;
        }
        
        // Create a new user
        const newUser = {
          id: Date.now(), // Simple ID generation
          email,
          username,
          password, // In a real app, this would be hashed
          isAdmin: false,
        };
        
        // Add to registered users
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Log the user in
        const { password: _, ...safeUser } = newUser;
        setUser(safeUser);
        localStorage.setItem('user', JSON.stringify(safeUser));
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${username}!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration error",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <LocalAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </LocalAuthContext.Provider>
  );
}

// Hook to use the LocalAuth context
export function useLocalAuth() {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error("useLocalAuth must be used within a LocalAuthProvider");
  }
  return context;
}
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const LOCAL_STORAGE_KEY = 'speakMyWayUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate backend validation
      const users = JSON.parse(localStorage.getItem('speakMyWayUsers') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        // Create a user object without the password
        const { password, ...safeUser } = foundUser;
        
        // Store user in localStorage and state
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeUser));
        setUser(safeUser);
        
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
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Get existing users or initialize empty array
      const users = JSON.parse(localStorage.getItem('speakMyWayUsers') || '[]');
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        toast({
          title: "Registration failed",
          description: "An account with this email already exists",
          variant: "destructive",
        });
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        username,
        password, // In a real app, this would be hashed
        createdAt: new Date().toISOString(),
      };
      
      // Save to "database"
      users.push(newUser);
      localStorage.setItem('speakMyWayUsers', JSON.stringify(users));
      
      // Create a user object without the password
      const { password: _, ...safeUser } = newUser;
      
      // Log user in
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${username}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setIsLoading(false);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useLocalAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  
  return context;
}
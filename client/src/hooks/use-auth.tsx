import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Auth types
type User = {
  id: number;
  username: string;
  isAdmin: boolean;
};

type Client = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  client: Client | null;
  isLoading: boolean;
  loginAdmin: (username: string, password: string) => Promise<void>;
  loginClient: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check for stored auth data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedClient = localStorage.getItem("client");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    
    if (storedClient) {
      try {
        setClient(JSON.parse(storedClient));
      } catch (e) {
        localStorage.removeItem("client");
      }
    }
    
    setIsLoading(false);
  }, []);

  const loginAdmin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/admin", { username, password });
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLocation("/dashboard");
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginClient = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/client", { email, password });
      const clientData = await response.json();
      
      setClient(clientData);
      localStorage.setItem("client", JSON.stringify(clientData));
      setLocation("/client/orders");
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${clientData.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      setUser(null);
      localStorage.removeItem("user");
      setLocation("/login");
    } else if (client) {
      setClient(null);
      localStorage.removeItem("client");
      setLocation("/client/login");
    }
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    client,
    isLoading,
    loginAdmin,
    loginClient,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

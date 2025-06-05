import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { Storage } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = Storage.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple demo authentication - in real app, this would validate against a server
      const storedUsers = JSON.parse(
        localStorage.getItem("expense_tracker_users") || "[]",
      );
      const existingUser = storedUsers.find(
        (u: any) => u.email === email && u.password === password,
      );

      if (existingUser) {
        const { password: _, ...userWithoutPassword } = existingUser;
        setUser(userWithoutPassword);
        Storage.saveUser(userWithoutPassword);
        return true;
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const storedUsers = JSON.parse(
        localStorage.getItem("expense_tracker_users") || "[]",
      );
      const existingUser = storedUsers.find((u: any) => u.email === email);

      if (existingUser) {
        return false; // User already exists
      }

      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In real app, this would be hashed
        name,
        createdAt: new Date().toISOString(),
      };

      storedUsers.push(newUser);
      localStorage.setItem(
        "expense_tracker_users",
        JSON.stringify(storedUsers),
      );

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      Storage.saveUser(userWithoutPassword);

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    Storage.clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

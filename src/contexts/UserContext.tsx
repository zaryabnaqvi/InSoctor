import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/services/api.service";

export type UserRole = "admin" | "analyst" | "viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await apiClient.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await apiClient.login({ email, password });
      localStorage.setItem('auth_token', token);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
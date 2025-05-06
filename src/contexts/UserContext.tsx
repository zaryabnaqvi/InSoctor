import { createContext, useContext, useState } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "analyst" | "viewer";
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const defaultUser: User = {
  id: "1",
  name: "Security Admin",
  email: "admin@sentinel-security.com",
  avatar: "https://ui-avatars.com/api/?name=Security+Admin&background=0D8ABC&color=fff",
  role: "admin"
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser); // For demo purposes, we start logged in

  const login = async (email: string, password: string) => {
    // Mock login
    if (email && password) {
      setUser(defaultUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: !!user,
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
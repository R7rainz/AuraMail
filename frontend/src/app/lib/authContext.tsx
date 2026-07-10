"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser, isAuthenticated, User, logoutUser, getStoredUser } from "./auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // First check localStorage for user (faster)
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Then verify with backend
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error fetching user: ", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        // Quickly set user from localStorage first
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
        // Then refresh from backend
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();

    const handleStorageChange = () => {
      if (isAuthenticated()) {
        refreshUser();
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
        isAuthenticated: user != null,
      }}
    >
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

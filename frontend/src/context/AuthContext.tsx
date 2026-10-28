"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearAuthToken, setAuthToken } from "@/lib/api";

type User = {
  id: string;
  email: string;
  role: "user" | "lawyer" | "admin" | "citizen";
  full_name?: string;
  onboarding_completed: boolean;
  onboarding_step: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage immediately on mount to prevent Navbar flicker
  useEffect(() => {
    const storedUser = localStorage.getItem("user_cache");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, []);

  useEffect(() => {
    // Listen for cross-tab auth state changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_cache") {
        if (!e.newValue) {
          // Logged out in another tab
          setUser(null);
          setToken(null);
          router.push("/auth/login");
        } else {
          // Logged in in another tab
          try {
            setUser(JSON.parse(e.newValue));
            setToken(localStorage.getItem("token"));
          } catch (error) {}
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const res = await api.get("auth/me");

        
        // Normalize
        const userData = res.data.user || res.data;
        if (userData.role === "user") {
          userData.role = "citizen";
        }
        
        setUser(userData);
        localStorage.setItem("user_cache", JSON.stringify(userData));
        localStorage.setItem("role", userData.role);
        
        document.cookie = `token=${storedToken}; path=/; SameSite=Lax`;
        document.cookie = `role=${userData.role}; path=/; SameSite=Lax`;
        document.cookie = `onboarding_completed=${userData.onboarding_completed}; path=/; SameSite=Lax`;

        const onboardingCompleted = userData?.onboarding_completed;
        if (onboardingCompleted === false && !window.location.pathname.startsWith("/onboarding")) {
          router.push("/onboarding");
        }
      } catch (err) {
        // Clear token silently on failed init

        clearAuthToken();
        setToken(null);
        setUser(null);
        localStorage.removeItem("user_cache");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      login: (newToken: string, newUser: any) => {
        let normalizedUser = { ...newUser };
        if (normalizedUser.role === "user") {
          normalizedUser.role = "citizen";
        }
        
        setAuthToken(newToken, normalizedUser.role);
        setToken(newToken);
        setUser(normalizedUser);
        
        localStorage.setItem("user_cache", JSON.stringify(normalizedUser));
        document.cookie = `token=${newToken}; path=/; SameSite=Lax`;
        document.cookie = `role=${normalizedUser.role}; path=/; SameSite=Lax`;
        document.cookie = `onboarding_completed=${normalizedUser.onboarding_completed}; path=/; SameSite=Lax`;

        const onboardingCompleted = normalizedUser?.onboarding_completed;
        if (onboardingCompleted === false) {
          router.push("/onboarding");
        }
      },
      logout: () => {
        clearAuthToken();
        setToken(null);
        setUser(null);
        localStorage.removeItem("user_cache");
        localStorage.removeItem("role");
        router.push("/auth/login");
      },
    }),
    [user, token, isLoading, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

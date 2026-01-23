"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { apiService } from "../services/api";

export type UserRole = "user" | "operator" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  collegeEmail?: string;
  department?: string;
  position?: string;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
  login: (jwt: string, user?: AuthUser | null) => void;
  logout: () => void;
  hasRole: (roles?: UserRole[]) => boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isUser: boolean;
};

const TOKEN_KEY = "campusor_jwt";
const USER_KEY = "campusor_user";

const AuthContext = createContext<AuthContextType | null>(null);

const decodeToken = (jwt: string): Partial<AuthUser> | null => {
  try {
    const decoded = jwtDecode<{ sub: string; role: UserRole; id?: string }>(jwt);
    return {
      id: decoded.sub || decoded.id,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

const isTokenValid = (jwt: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp?: number }>(jwt);
    if (!decoded.exp) return true; // Assume valid if no exp claim
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Register the unauthorized callback to trigger logout on 401/403
    apiService.setUnauthorizedCallback(logout);

    const timer = setTimeout(() => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken) {
        if (!isTokenValid(storedToken)) {
          console.warn("Stored token is expired or invalid. Logging out.");
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsLoading(false);
          return;
        }

        setToken(storedToken);

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as AuthUser;
            setUser({
              ...parsed,
              emailVerified: parsed.emailVerified ?? true,
            });
          } catch {
            // ignore bad stored value
          }
        } else {
          const decoded = decodeToken(storedToken);
          if (decoded?.role && decoded.id) {
            setUser({
              id: decoded.id,
              name: "",
              email: "",
              role: decoded.role,
              emailVerified: true,
            });
          }
        }
      }
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [logout]);

  const login = React.useCallback((jwt: string, authUser?: AuthUser | null) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);

    if (authUser) {
      const normalizedUser: AuthUser = {
        ...authUser,
        emailVerified: authUser.emailVerified ?? true,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    } else {
      const decoded = decodeToken(jwt);
      if (decoded?.role && decoded.id) {
        const fallbackUser: AuthUser = {
          id: decoded.id,
          name: "",
          email: "",
          role: decoded.role,
          emailVerified: true,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
        setUser(fallbackUser);
      }
    }
  }, []);



  const isAuthenticated = !!token;
  const role = user?.role ?? null;
  const isVerified = !!user?.emailVerified;

  const hasRole = React.useCallback((roles?: UserRole[]) => {
    if (!roles || roles.length === 0) return true;
    if (!role) return false;
    return roles.includes(role);
  }, [role]);

  const computed = useMemo(
    () => ({
      token,
      user,
      role,
      isAuthenticated,
      isVerified,
      isLoading,
      login,
      logout,
      hasRole,
      isAdmin: role === "admin",
      isOperator: role === "operator",
      isUser: role === "user",
    }),
    [token, user, role, isAuthenticated, isVerified, isLoading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={computed}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

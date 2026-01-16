"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "user" | "operator" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
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
    const payload = JSON.parse(atob(jwt.split(".")[1] || ""));
    return {
      id: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as AuthUser;
          setUser(parsed);
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
          });
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (jwt: string, authUser?: AuthUser | null) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);

    if (authUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } else {
      const decoded = decodeToken(jwt);
      if (decoded?.role && decoded.id) {
        const fallbackUser: AuthUser = {
          id: decoded.id,
          name: "",
          email: "",
          role: decoded.role,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
        setUser(fallbackUser);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const role = user?.role ?? null;

  const hasRole = (roles?: UserRole[]) => {
    if (!roles || roles.length === 0) return true;
    if (!role) return false;
    return roles.includes(role);
  };

  const computed = useMemo(
    () => ({
      token,
      user,
      role,
      isAuthenticated,
      isLoading,
      login,
      logout,
      hasRole,
      isAdmin: role === "admin",
      isOperator: role === "operator",
      isUser: role === "user",
    }),
    [token, user, role, isAuthenticated, isLoading, login, logout, hasRole]
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

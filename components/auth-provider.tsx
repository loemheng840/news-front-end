"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "@/lib/types";
import { User } from "@/lib/types";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "@/lib/redux/news-api";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginRequest] = useLoginMutation();
  const [registerRequest] = useRegisterMutation();
  const [logoutRequest] = useLogoutMutation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const json = await loginRequest({ email, password }).unwrap();
      setUser(json.user);
      setToken(json.token);
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const json = await registerRequest({
        name,
        email,
        password,
        password_confirmation: password,
      }).unwrap();

      // Auto-login if the backend returns a token
      if (json && "token" in json && json.token && "user" in json && json.user) {
        const authResponse = json as { token: string; user: User };
        setUser(authResponse.user);
        setToken(authResponse.token);
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("user", JSON.stringify(authResponse.user));
      }

      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutRequest().unwrap();
      } catch {
        // Server-side logout may fail if token is already expired — that's fine
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

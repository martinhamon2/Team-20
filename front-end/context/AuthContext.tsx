"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@types";
import UserService from "@services/UserService";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("loggedInUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await UserService.logout();
    } catch (error) {
      console.error("Logout failed at backend", error);
    }

    sessionStorage.removeItem("loggedInUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
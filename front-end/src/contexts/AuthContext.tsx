import UserService from "@/service/UserService";
import { User } from "@/types";
import { createContext, ReactNode, useContext } from "react";
import useSWR from "swr";

interface AuthContextType {
  user: Pick<User, "id" | "email" | "username" | "role"> | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const fetcher = async () => {
    const response = await UserService.ping();
    if (!response.ok) return null;
    return await response.json();
  };

  const { data, isLoading } = useSWR("ping", fetcher, {
    suspense: false,
    revalidateOnFocus: false,
  });

  const user: User | null = data
    ? {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role,
      }
    : null;

  return (
    <>
      <AuthContext.Provider value={{ user, isLoading }}>
        {children}
      </AuthContext.Provider>
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

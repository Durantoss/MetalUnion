// import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Temporary mock implementation to bypass React Query issues
  const user: User | null = null;
  const isLoading = false;
  const error = null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
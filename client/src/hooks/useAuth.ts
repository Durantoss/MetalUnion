import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include"
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return null;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
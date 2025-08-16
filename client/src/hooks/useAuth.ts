import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Handle auth failures gracefully for anonymous access
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) {
          // Return null for 401/403 errors (anonymous access)
          if (response.status === 401 || response.status === 403) {
            return null;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        // Return null for network errors (anonymous access)
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
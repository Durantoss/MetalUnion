import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  stagename: string | null;
  sessionStart?: string;
  lastActivity?: string;
  expiresAt?: string | null;
  rememberMe?: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const refreshSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/refresh-session', { method: 'POST' });
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  const extendSessionMutation = useMutation({
    mutationFn: async (rememberMe: boolean) => {
      return apiRequest('/api/auth/extend-session', {
        method: 'POST',
        body: JSON.stringify({ rememberMe }),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch user data to get updated session info
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
    refreshSession: refreshSessionMutation.mutate,
    extendSession: extendSessionMutation.mutate,
    isRefreshing: refreshSessionMutation.isPending,
    isExtending: extendSessionMutation.isPending,
  };
}
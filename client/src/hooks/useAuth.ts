import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Changed to true to ensure it loads on mount
    staleTime: 5 * 60 * 1000, // 5 minutes - extended for better persistence 
    gcTime: 30 * 60 * 1000, // 30 minutes cache (renamed from cacheTime in React Query v5)
    // Handle auth failures gracefully for anonymous access
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include"
        });
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

  // Track session activity for session management UI
  useEffect(() => {
    if (user && !error) {
      // Update last successful auth check
      localStorage.setItem('lastAuthCheck', new Date().toISOString());
      
      // Set session start time if not already set
      if (!localStorage.getItem('sessionStart')) {
        localStorage.setItem('sessionStart', new Date().toISOString());
      }
      
      // Enable remember me by default for logged in users
      const rememberUser = localStorage.getItem('rememberUser');
      if (rememberUser !== 'false') {
        localStorage.setItem('rememberUser', 'true');
      }
    } else if (error) {
      // Clear session tracking on auth errors
      localStorage.removeItem('sessionStart');
      localStorage.removeItem('lastAuthCheck');
    }
  }, [user, error]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    lastAuthCheck: localStorage.getItem('lastAuthCheck'),
  };
}
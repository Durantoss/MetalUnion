import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  // Production authentication enabled with cache fixes
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      // Real authentication flow
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return null;
      }
      
      const userData = await response.json();
      return userData;
    },
    retry: false,
    staleTime: 0, // Always fresh - no stale cache
    gcTime: 0, // No garbage collection cache
    refetchOnWindowFocus: true, // Always recheck on focus
    refetchOnMount: true, // Always recheck on mount
  });

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch
  };
}
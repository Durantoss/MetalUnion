import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  // Production authentication enabled with cache fixes
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      console.log('🔍 useAuth: Checking authentication status...');
      
      // Real authentication flow
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      console.log('🔍 useAuth: Server response:', response.status);
      
      if (!response.ok) {
        console.log('🔍 useAuth: Not authenticated - clearing any cached user data');
        return null;
      }
      
      const userData = await response.json();
      console.log('🔍 useAuth: User authenticated:', userData);
      return userData;
    },
    retry: false,
    staleTime: 0, // Always fresh - no stale cache
    gcTime: 0, // No garbage collection cache
    refetchOnWindowFocus: true, // Always recheck on focus
    refetchOnMount: true, // Always recheck on mount
  });

  const isAuthenticated = !!user;
  console.log('🔍 useAuth result:', { user: !!user, isLoading, isAuthenticated });

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch
  };
}
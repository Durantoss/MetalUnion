import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  // Production authentication enabled
  
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
      
      return response.json();
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch
  };
}
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Auto-refetch user data on component mount if not cached
  useEffect(() => {
    const cachedUser = queryClient.getQueryData(['/api/auth/user']);
    if (!cachedUser && !isLoading) {
      refetch();
    }
  }, [queryClient, refetch, isLoading]);

  console.log('useAuth hook called:', { 
    hasUser: !!user, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message 
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch
  };
}
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

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
    error
  };
}
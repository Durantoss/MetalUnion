import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  // Check if we're in deployed environment  
  const isDeployedApp = window.location.hostname.includes('.replit.app');
  const isTestingMode = true; // Enable testing mode for all testers
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      // For testing/deployed environments, create a demo user so all features work
      if (isDeployedApp || isTestingMode) {
        return {
          id: 'demo-user-testing',
          email: 'tester@moshunion.com',
          stagename: 'Demo Tester',
          isAdmin: false,
          createdAt: new Date().toISOString()
        };
      }
      
      // Original auth flow for development
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
    isAuthenticated: true, // Always authenticated for testing
    error,
    refetch
  };
}
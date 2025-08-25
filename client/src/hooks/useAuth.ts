import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  // Open access mode - always provide a guest user if no authenticated user
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Return guest user if no authenticated user
          return {
            id: 'guest-user',
            stagename: 'Guest',
            email: 'guest@moshunion.com',
            role: 'user',
            isAdmin: false,
            permissions: {},
            concertAttendanceCount: 0,
            commentCount: 0,
            reviewCount: 0,
            isOnline: true,
            loginStreak: 0,
            totalReviews: 0,
            totalPhotos: 0,
            totalLikes: 0,
            isGuest: true
          };
        }
        
        const userData = await response.json();
        return userData;
      } catch (error) {
        // Return guest user on any error
        return {
          id: 'guest-user',
          stagename: 'Guest',
          email: 'guest@moshunion.com',
          role: 'user',
          isAdmin: false,
          permissions: {},
          concertAttendanceCount: 0,
          commentCount: 0,
          reviewCount: 0,
          isOnline: true,
          loginStreak: 0,
          totalReviews: 0,
          totalPhotos: 0,
          totalLikes: 0,
          isGuest: true
        };
      }
    },
    retry: false,
    staleTime: 0, // Always fresh - no stale cache
    gcTime: 0, // No garbage collection cache
    refetchOnWindowFocus: true, // Always recheck on focus
    refetchOnMount: true, // Always recheck on mount
  });

  const isAuthenticated = !!user && !user.isGuest;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch
  };
}

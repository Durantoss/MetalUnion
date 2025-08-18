import { useQuery } from '@tanstack/react-query';

export interface AuthUser {
  id: string;
  stagename: string;
  email?: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  favoriteGenres?: string[];
  reputationPoints: number;
  concertAttendanceCount: number;
  commentCount: number;
  reviewCount: number;
  loginStreak: number;
  lastLoginAt?: string;
  rememberMe: boolean;
  badges: any[];
  isOnline: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
import { QueryClient } from "@tanstack/react-query";

// Default fetcher for React Query
const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const url = queryKey[0] as string;
  const response = await fetch(url, {
    credentials: 'include' // Important for session-based auth
  });
  
  if (!response.ok) {
    // Create error with status for better error handling
    const error = new Error(`${response.status}: ${response.statusText}`);
    throw error;
  }
  
  return response.json();
};

// API request helper for mutations
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = new Error(`${response.status}: ${response.statusText}`);
    throw error;
  }
  
  return response.json();
};

// Create and export QueryClient with the default fetcher
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
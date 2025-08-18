import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`API Error ${response.status}:`, errorData);
    throw new Error(`${response.status}: ${errorData || response.statusText}`);
  }

  return response.json();
}

// Set up default query function for TanStack Query
queryClient.setDefaultOptions({
  queries: {
    queryFn: async ({ queryKey }) => {
      const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
      return apiRequest(url as string);
    },
  },
});
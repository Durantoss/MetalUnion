import { QueryClient } from '@tanstack/react-query';
import { enhancedCache, cachedApiRequest } from './cache';
import { optimizedQueryConfig } from './database-optimization';

export const queryClient = new QueryClient(optimizedQueryConfig);

export async function apiRequest(url: string, options?: RequestInit) {
  // Use enhanced caching for GET requests
  if (!options?.method || options.method === 'GET') {
    return cachedApiRequest(url, options, {
      ttl: 5 * 60 * 1000, // 5 minutes cache
      bypassCache: options?.headers?.['cache-control'] === 'no-cache'
    });
  }

  // Direct fetch for non-GET requests
  const response = await fetch(url, {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
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
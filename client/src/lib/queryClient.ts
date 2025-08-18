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
  console.log('Making API request:', { url, method: options?.method, credentials: 'include' });
  
  const response = await fetch(url, {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  console.log('API response:', { 
    status: response.status, 
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`API Error ${response.status}:`, errorData);
    console.error('Request details:', { url, method: options?.method, headers: options?.headers });
    console.error('Response headers:', Object.fromEntries(response.headers.entries()));
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('API response data:', data);
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
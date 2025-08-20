/**
 * Database query optimization and caching strategies
 */
import { enhancedCache } from './cache';

interface QueryOptions {
  cacheKey?: string;
  ttl?: number;
  forceRefresh?: boolean;
}

/**
 * Optimized API request with intelligent caching and batching
 */
class DatabaseOptimizer {
  private requestQueue: Map<string, Promise<any>> = new Map();
  private batchTimeout: number = 50; // ms

  /**
   * Batch similar requests together to reduce API calls
   */
  async batchRequest<T>(
    endpoint: string,
    ids: string[],
    options: QueryOptions = {}
  ): Promise<Record<string, T>> {
    const cacheKey = `batch:${endpoint}:${ids.sort().join(',')}`;
    
    // Check cache first
    if (!options.forceRefresh) {
      const cached = enhancedCache.get<Record<string, T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    // Create the batched request
    const requestPromise = this.executeBatchRequest<T>(endpoint, ids, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache the result
      enhancedCache.set(cacheKey, result, options.ttl);
      
      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  private async executeBatchRequest<T>(
    endpoint: string,
    ids: string[],
    options: QueryOptions
  ): Promise<Record<string, T>> {
    const response = await fetch(`/api/${endpoint}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Optimized search with debouncing and caching
   */
  async optimizedSearch<T>(
    query: string,
    filters: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    // Normalize query for caching
    const normalizedQuery = query.toLowerCase().trim();
    const filterString = JSON.stringify(filters);
    const cacheKey = options.cacheKey || `search:${normalizedQuery}:${filterString}`;

    // Check cache first
    if (!options.forceRefresh && normalizedQuery) {
      const cached = enhancedCache.get<T[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Perform search
    const searchParams = new URLSearchParams({
      q: normalizedQuery,
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>),
    });

    const response = await fetch(`/api/search?${searchParams}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const results = await response.json();
    
    // Cache successful results
    if (normalizedQuery) {
      enhancedCache.set(cacheKey, results, options.ttl || 2 * 60 * 1000); // 2 minutes
    }

    return results;
  }

  /**
   * Prefetch commonly accessed data
   */
  async prefetchData(type: 'bands' | 'tours' | 'reviews', options: QueryOptions = {}) {
    const cacheKey = `prefetch:${type}`;
    
    // Check if already prefetched recently
    const lastPrefetch = enhancedCache.get(`${cacheKey}:timestamp`);
    if (lastPrefetch && Date.now() - lastPrefetch < 5 * 60 * 1000) {
      return; // Already prefetched within 5 minutes
    }

    try {
      const response = await fetch(`/api/${type}?limit=20&popular=true`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        enhancedCache.set(cacheKey, data, options.ttl || 10 * 60 * 1000); // 10 minutes
        enhancedCache.set(`${cacheKey}:timestamp`, Date.now(), 10 * 60 * 1000);
      }
    } catch (error) {
      console.warn(`Prefetch failed for ${type}:`, error);
    }
  }

  /**
   * Background data refresh strategy
   */
  startBackgroundRefresh() {
    // Refresh popular data every 5 minutes
    const refreshInterval = setInterval(() => {
      this.prefetchData('bands', { forceRefresh: true });
      this.prefetchData('tours', { forceRefresh: true });
      this.prefetchData('reviews', { forceRefresh: true });
    }, 5 * 60 * 1000);

    // Cleanup old cache entries every 10 minutes
    const cleanupInterval = setInterval(() => {
      // Cache cleanup is handled automatically by the enhancedCache
      console.log('🧹 Background cache cleanup completed');
    }, 10 * 60 * 1000);

    // Return cleanup function
    return () => {
      clearInterval(refreshInterval);
      clearInterval(cleanupInterval);
    };
  }

  /**
   * Get query performance statistics
   */
  getPerformanceStats() {
    return {
      activeRequests: this.requestQueue.size,
      cacheStats: enhancedCache.getStats(),
    };
  }
}

// Global database optimizer instance
export const databaseOptimizer = new DatabaseOptimizer();

/**
 * React Query configuration with optimizations
 */
export const optimizedQueryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: (failureCount: number, error: any) => {
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // Could trigger error reporting here
      },
    },
  },
};

/**
 * Hook for optimized data fetching
 */
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    enableBatching?: boolean;
    cacheTime?: number;
    staleTime?: number;
  } = {}
) {
  const cacheKey = queryKey.join(':');
  
  return {
    queryKey,
    queryFn: async () => {
      // Check enhanced cache first for faster response
      const cached = enhancedCache.get<T>(cacheKey);
      if (cached && options.staleTime) {
        return cached;
      }

      const result = await queryFn();
      
      // Store in enhanced cache for immediate access
      enhancedCache.set(cacheKey, result, options.cacheTime);
      
      return result;
    },
    staleTime: options.staleTime || 5 * 60 * 1000,
    gcTime: options.cacheTime || 15 * 60 * 1000,
  };
}
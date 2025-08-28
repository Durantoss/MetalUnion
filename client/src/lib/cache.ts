/**
 * Enhanced caching system for MoshUnion
 * Provides memory caching, compression, and smart cache management
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
}

class EnhancedCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly maxSize = 100; // Maximum cache entries
  private readonly compressionThreshold = 1024; // Compress items larger than 1KB

  /**
   * Set cache item with optional TTL and compression
   */
  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    try {
      // Validate inputs
      if (!key || key.trim() === '') {
        console.warn('Cache set failed: Invalid key');
        return;
      }

      if (data === null || data === undefined) {
        // Store null/undefined values but mark them appropriately
        const item: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          ttl,
        };
        this.cache.set(key, item);
        return;
      }

      // Auto-cleanup if cache is too large
      if (this.cache.size >= this.maxSize) {
        this.cleanup();
      }

      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      // Compress large objects with better error handling
      if (this.shouldCompress(data)) {
        try {
          item.data = this.compress(data);
          item.compressed = true;
        } catch (compressionError) {
          // Fall back to uncompressed if compression fails
          console.warn('Compression failed, storing uncompressed:', compressionError);
          item.data = data;
          item.compressed = false;
        }
      }

      this.cache.set(key, item);
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Get cache item with automatic decompression and TTL check
   */
  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      if (!item) return null;

      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key);
        return null;
      }

      // Decompress if needed
      return item.compressed ? this.decompress(item.data) : item.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Smart cleanup - removes oldest and expired items
   */
  private cleanup(): void {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    // Remove expired items first
    entries.forEach(([key, item]) => {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove oldest items
    if (this.cache.size >= this.maxSize) {
      const sorted = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = sorted.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private shouldCompress<T>(data: T): boolean {
    try {
      // Avoid compressing primitive types and null values
      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || data === null) {
        return false;
      }
      
      const stringified = JSON.stringify(data);
      return Boolean(stringified && typeof stringified === 'string' && stringified.length > this.compressionThreshold);
    } catch {
      return false;
    }
  }

  private compress<T>(data: T): T {
    try {
      const jsonString = JSON.stringify(data);
      const compressed = btoa(encodeURIComponent(jsonString));
      return compressed as unknown as T;
    } catch (error) {
      throw new Error(`Compression failed: ${error}`);
    }
  }

  private decompress<T>(compressed: unknown): T {
    try {
      const decompressed = decodeURIComponent(atob(compressed as string));
      return JSON.parse(decompressed);
    } catch (error) {
      throw new Error(`Decompression failed: ${error}`);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      expired: entries.filter(item => now - item.timestamp > item.ttl).length,
      compressed: entries.filter(item => item.compressed).length,
      memoryUsage: entries.reduce((acc, item) => acc + JSON.stringify(item).length, 0)
    };
  }
}

// Global cache instance
export const enhancedCache = new EnhancedCache();

/**
 * Cache-aware API request wrapper
 */
export async function cachedApiRequest<T>(
  url: string, 
  options?: RequestInit,
  cacheOptions?: { ttl?: number; bypassCache?: boolean }
): Promise<T> {
  const cacheKey = `api:${url}:${JSON.stringify(options?.body || '')}`;
  
  // Check cache first (unless bypassing)
  if (!cacheOptions?.bypassCache) {
    const cached = enhancedCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Make API request
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
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the result
  enhancedCache.set(cacheKey, data, cacheOptions?.ttl);
  
  return data;
}
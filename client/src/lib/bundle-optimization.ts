/**
 * Advanced bundle optimization and code splitting for MoshUnion
 */
import React from 'react';
import { performanceMonitor } from './performance';

/**
 * Dynamic import with error handling and performance tracking
 */
export async function importWithRetry<T>(
  importFn: () => Promise<T>,
  name: string,
  retries = 3,
  delay = 1000
): Promise<T> {
  const startTime = performance.now();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`bundle-load-${name}`, loadTime, 'measure');
      
      
      return module;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new Error(`Failed to load ${name}`);
}

/**
 * Optimized lazy component factory with preloading
 */
export function createOptimizedLazyComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  name: string,
  options: {
    fallback?: React.ComponentType;
    preload?: boolean;
    priority?: 'high' | 'low';
  } = {}
) {
  const { fallback, preload = false, priority = 'low' } = options;
  
  // Create the lazy component with retry logic
  const LazyComponent = React.lazy(() => 
    importWithRetry(importFn, name)
  );
  
  // Preload if requested
  if (preload) {
    if (priority === 'high') {
      // Preload immediately
      importFn().catch(() => {});
    } else {
      // Preload after initial load
      setTimeout(() => {
        importFn().catch(() => {});
      }, 2000);
    }
  }
  
  // Enhanced fallback component
  const FallbackComponent = fallback || (() => 
    React.createElement('div', { className: 'flex items-center justify-center p-8' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { 
          className: 'w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2' 
        }),
        React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
          `Loading ${name}...`
        )
      )
    )
  );
  
  return (props: P) => 
    React.createElement(React.Suspense,
      { fallback: React.createElement(FallbackComponent) },
      React.createElement(LazyComponent, props)
    );
}

/**
 * Resource preloader for critical assets
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preloadQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  /**
   * Add resource to preload queue
   */
  addToQueue(
    importFn: () => Promise<any>,
    name: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) {
    if (this.preloadedResources.has(name)) {
      return;
    }

    const loader = async () => {
      try {
        const startTime = performance.now();
        await importFn();
        const loadTime = performance.now() - startTime;
        
        performanceMonitor.recordMetric(`preload-${name}`, loadTime, 'measure');
        this.preloadedResources.add(name);
        
        console.log(`✅ Preloaded ${name} in ${loadTime}ms`);
      } catch (error) {
        () => {};
      }
    };

    // Insert based on priority
    if (priority === 'high') {
      this.preloadQueue.unshift(loader);
    } else {
      this.preloadQueue.push(loader);
    }

    this.processQueue();
  }

  /**
   * Process the preload queue
   */
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const loader = this.preloadQueue.shift();
      if (loader) {
        await loader();
        // Small delay to prevent overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Check if resource is preloaded
   */
  isPreloaded(name: string): boolean {
    return this.preloadedResources.has(name);
  }
}

// Global resource preloader
export const resourcePreloader = new ResourcePreloader();

/**
 * Optimized component chunks for lazy loading
 */
export const OptimizedComponents = {
  // Core components (preload with high priority)
  BandDiscovery: createOptimizedLazyComponent(
    () => import('@/components/BandDiscovery'),
    'BandDiscovery',
    { preload: true, priority: 'high' }
  ),
  
  EnhancedToursPage: createOptimizedLazyComponent(
    () => import('@/components/EnhancedToursPage'),
    'EnhancedToursPage',
    { preload: true, priority: 'high' }
  ),
  
  // Secondary components (preload with medium priority)
  ReviewsSection: createOptimizedLazyComponent(
    () => import('@/components/ReviewsSection'),
    'ReviewsSection',
    { preload: true, priority: 'low' }
  ),
  
  PhotosSection: createOptimizedLazyComponent(
    () => import('@/components/PhotosSection'),
    'PhotosSection',
    { preload: true, priority: 'low' }
  ),
  
  // Heavy components (load on demand)
  AIChatbot: createOptimizedLazyComponent(
    () => import('@/components/AIChatbot'),
    'AIChatbot'
  ),
  
  EncryptedChat: createOptimizedLazyComponent(
    () => import('@/components/EncryptedChat'),
    'EncryptedChat'
  ),
  
  PerformanceMonitor: createOptimizedLazyComponent(
    () => import('@/components/PerformanceMonitor'),
    'PerformanceMonitor'
  ),
};

/**
 * Initialize bundle optimizations
 */
export function initializeBundleOptimizations() {
  // Preload critical components after initial page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Preload based on user behavior patterns
      resourcePreloader.addToQueue(
        () => import('@/components/EnhancedSocialHub'),
        'EnhancedSocialHub',
        'medium'
      );
      
      resourcePreloader.addToQueue(
        () => import('@/components/GameficationDashboard'),
        'GameficationDashboard',
        'low'
      );
    }, 1000);
  });

  // Preload on user interaction
  document.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    const section = target.closest('[data-preload-section]')?.getAttribute('data-preload-section');
    
    if (section) {
      switch (section) {
        case 'messaging':
          resourcePreloader.addToQueue(
            () => import('@/components/EncryptedChat'),
            'EncryptedChat',
            'high'
          );
          break;
        case 'social':
          resourcePreloader.addToQueue(
            () => import('@/components/EnhancedSocialHub'),
            'EnhancedSocialHub',
            'high'
          );
          break;
      }
    }
  });

}
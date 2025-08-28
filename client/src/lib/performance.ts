/**
 * Performance monitoring and optimization utilities
 */
import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'measure' | 'mark';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const lcpEntry = entryList.getEntries().pop();
        if (lcpEntry) {
          this.recordMetric('LCP', lcpEntry.startTime, 'measure');
          if (lcpEntry.startTime > 2500) {
          }
        }
      });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime, 'measure');
        }
      });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          clsValue += (entry as any).value;
        }
        this.recordMetric('CLS', clsValue, 'measure');
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        this.observers.push(lcpObserver, fidObserver, clsObserver);
      } catch (e) {
        // Performance Observer not supported
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, type: PerformanceMetric['type'] = 'measure') {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
    };
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
    
  }

  /**
   * Measure function execution time
   */
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, 'measure');
    });
  }

  /**
   * Measure sync function execution time
   */
  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordMetric(name, duration, 'measure');
    return result;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const recent = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute
    
    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recent.length,
      slowOperations: recent.filter(m => m.value > 1000).length,
      averages: {} as Record<string, number>,
    };

    // Calculate averages by metric name
    const grouped = recent.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    for (const [name, values] of Object.entries(grouped)) {
      summary.averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    return summary;
  }

  /**
   * Get navigation timing information
   */
  getNavigationTiming() {
    if (!('performance' in window) || !performance.timing) {
      return null;
    }

    const timing = performance.timing;
    const navigation = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      processing: timing.loadEventStart - timing.domLoading,
      onload: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart,
    };

    return navigation;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    getNavigationTiming: performanceMonitor.getNavigationTiming.bind(performanceMonitor),
  };
}

/**
 * Lazy loading utilities
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => 
    React.createElement(React.Suspense, 
      { fallback: fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props)
    );
}

/**
 * Image lazy loading with intersection observer
 */
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return {
    imgRef,
    src: isLoaded ? src : undefined,
    isLoaded,
    isInView,
  };
}

/**
 * Debounced value hook for performance
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


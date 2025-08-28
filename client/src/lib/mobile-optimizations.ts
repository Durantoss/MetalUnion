/**
 * Advanced mobile optimizations for MoshUnion
 * Comprehensive mobile performance and UX enhancements
 */
import { performanceMonitor } from './performance';

interface MobileConfig {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasTouch: boolean;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  connection?: NetworkInformation;
}

/**
 * Advanced mobile detection and optimization
 */
class MobileOptimizer {
  private config: MobileConfig;
  private intersectionObserver?: IntersectionObserver;
  private prefetchQueue: Set<string> = new Set();
  private touchStartTime = 0;
  private lastTouchY = 0;

  constructor() {
    this.config = this.detectMobileConfig();
    this.initializeOptimizations();
  }

  private detectMobileConfig(): MobileConfig {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
      isMobile: /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isTablet: /ipad|tablet|kindle|playbook|silk/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      hasTouch,
      pixelRatio: window.devicePixelRatio || 1,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      connection: (navigator as any).connection,
    };
  }

  private initializeOptimizations() {
    // Optimize for mobile devices
    if (this.config.isMobile || this.config.isTablet) {
      this.setupMobileViewport();
      this.setupTouchOptimizations();
      this.setupConnectionOptimizations();
      this.setupPreloading();
    }

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();
    
    // Monitor performance
    this.setupPerformanceMonitoring();
  }

  private setupMobileViewport() {
    // Optimize viewport for mobile
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewport) {
      viewport.content = `width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover, shrink-to-fit=no`;
    }

    // Add safe area CSS variables
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0)');

    // Optimize for high DPI screens
    if (this.config.pixelRatio > 1.5) {
      root.style.setProperty('--pixel-ratio', this.config.pixelRatio.toString());
      root.classList.add('high-dpi');
    }
  }

  private setupTouchOptimizations() {
    // Optimize touch delay
    if (this.config.hasTouch) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
      
      // Add CSS for better touch response
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-tap-highlight-color: rgba(239, 68, 68, 0.2);
          -webkit-touch-callout: none;
          touch-action: manipulation;
        }
        
        button, [role="button"], a, input, textarea, select {
          -webkit-tap-highlight-color: rgba(239, 68, 68, 0.3);
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
        }
        
        /* Improve scrolling performance */
        .scroll-container {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
          transform: translateZ(0);
          will-change: scroll-position;
        }
        
        /* Optimize animations for mobile */
        @media (hover: none) and (pointer: coarse) {
          * {
            animation-duration: 0.2s !important;
            transition-duration: 0.2s !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  private handleTouchStart(event: TouchEvent) {
    this.touchStartTime = performance.now();
    this.lastTouchY = event.touches[0].clientY;
    
    // Prefetch on touch start for faster navigation
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    if (link && link.href.startsWith(window.location.origin)) {
      this.prefetchPage(link.href);
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    const touchDuration = performance.now() - this.touchStartTime;
    performanceMonitor.recordMetric('touch-response', touchDuration, 'measure');
    
    // Log slow touch responses
    if (touchDuration > 100) {
    }
  }

  private setupConnectionOptimizations() {
    const connection = this.config.connection;
    if (!connection) return;

    // Adapt behavior based on connection
    const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
    const isFastConnection = connection.effectiveType === '4g' || connection.effectiveType === '5g';
    
    if (isSlowConnection) {
      // Reduce quality and prefetching for slow connections
      document.documentElement.classList.add('slow-connection');
      this.optimizeForSlowConnection();
    } else if (isFastConnection) {
      // Aggressive prefetching for fast connections
      document.documentElement.classList.add('fast-connection');
      this.optimizeForFastConnection();
    }

    // Monitor connection changes
    connection.addEventListener('change', () => {
      this.config.connection = connection;
      this.setupConnectionOptimizations();
    });
  }

  private optimizeForSlowConnection() {
    // Disable non-essential animations
    const style = document.createElement('style');
    style.textContent = `
      .slow-connection * {
        animation: none !important;
        transition: none !important;
      }
      
      .slow-connection img {
        filter: blur(1px);
        transition: filter 0.3s ease;
      }
      
      .slow-connection img[data-loaded="true"] {
        filter: none;
      }
    `;
    document.head.appendChild(style);
  }

  private optimizeForFastConnection() {
    // Enable aggressive prefetching
    this.setupAggressivePrefetching();
  }

  private setupPreloading() {
    // Preload critical resources
    const criticalResources = [
      '/api/bands',
      '/api/tours',
      '/api/reviews'
    ];

    criticalResources.forEach(resource => {
      if (!this.prefetchQueue.has(resource)) {
        this.prefetchPage(resource);
      }
    });
  }

  private prefetchPage(url: string) {
    if (this.prefetchQueue.has(url)) return;
    
    this.prefetchQueue.add(url);
    
    // Use different strategies based on connection
    if (this.config.connection?.effectiveType === 'slow-2g' || this.config.connection?.effectiveType === '2g') {
      return; // Skip prefetching on slow connections
    }

    // Create prefetch link
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = url.startsWith('/api/') ? 'fetch' : 'document';
    document.head.appendChild(link);

    // Remove after timeout
    setTimeout(() => {
      document.head.removeChild(link);
      this.prefetchQueue.delete(url);
    }, 30000);
  }

  private setupAggressivePrefetching() {
    // Prefetch on hover/touch for fast connections
    document.addEventListener('mouseover', (event) => {
      const link = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement;
      if (link && link.href.startsWith(window.location.origin)) {
        this.prefetchPage(link.href);
      }
    });
  }

  private setupIntersectionObserver() {
    // Enhanced intersection observer for lazy loading
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.handleIntersection(entry.target as HTMLElement);
          }
        });
      },
      {
        root: null,
        rootMargin: this.config.isMobile ? '100px' : '50px', // Larger margin for mobile
        threshold: 0.1,
      }
    );
  }

  private handleIntersection(element: HTMLElement) {
    // Handle lazy loading
    if (element.hasAttribute('data-src')) {
      const img = element as HTMLImageElement;
      img.src = img.getAttribute('data-src')!;
      img.removeAttribute('data-src');
      img.setAttribute('data-loaded', 'true');
    }

    // Prefetch related content
    const prefetchUrl = element.getAttribute('data-prefetch');
    if (prefetchUrl) {
      this.prefetchPage(prefetchUrl);
    }

    this.intersectionObserver?.unobserve(element);
  }

  private setupPerformanceMonitoring() {
    // Monitor scroll performance
    let scrolling = false;
    document.addEventListener('scroll', () => {
      if (!scrolling) {
        scrolling = true;
        const start = performance.now();
        
        requestAnimationFrame(() => {
          const duration = performance.now() - start;
          performanceMonitor.recordMetric('scroll-performance', duration, 'measure');
          scrolling = false;
        });
      }
    }, { passive: true });

    // Monitor viewport changes
    window.addEventListener('resize', () => {
      this.config.viewportWidth = window.innerWidth;
      this.config.viewportHeight = window.innerHeight;
      performanceMonitor.recordMetric('viewport-change', performance.now(), 'mark');
    });
  }

  /**
   * Observe element for lazy loading
   */
  observeElement(element: HTMLElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
  }

  /**
   * Get mobile configuration
   */
  getConfig(): MobileConfig {
    return { ...this.config };
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice(): boolean {
    return this.config.isMobile || this.config.isTablet;
  }

  /**
   * Get optimal image size for current device
   */
  getOptimalImageSize(baseWidth: number): number {
    const { viewportWidth, pixelRatio } = this.config;
    const maxWidth = Math.min(baseWidth, viewportWidth);
    return Math.ceil(maxWidth * pixelRatio);
  }

  /**
   * Should use reduced motion
   */
  shouldReduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

// Global mobile optimizer instance
export const mobileOptimizer = new MobileOptimizer();

/**
 * React hook for mobile optimizations
 */
export function useMobileOptimizations() {
  return {
    config: mobileOptimizer.getConfig(),
    isMobile: mobileOptimizer.isMobileDevice(),
    observeElement: mobileOptimizer.observeElement.bind(mobileOptimizer),
    getOptimalImageSize: mobileOptimizer.getOptimalImageSize.bind(mobileOptimizer),
    shouldReduceMotion: mobileOptimizer.shouldReduceMotion.bind(mobileOptimizer),
  };
}
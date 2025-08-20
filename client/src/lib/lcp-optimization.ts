/**
 * Largest Contentful Paint (LCP) optimization utilities
 * Target: Get LCP under 1 second
 */

/**
 * Critical resource hints for faster LCP
 */
export function setupCriticalResourceHints() {
  const head = document.head;
  
  // Preconnect to external domains
  const preconnects = [
    // Add any external APIs or CDN domains here
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
  
  preconnects.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
  
  // DNS prefetch for likely next navigations
  const dnsPrefetch = [
    location.origin, // Self prefetch for API calls
  ];
  
  dnsPrefetch.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    head.appendChild(link);
  });
}

/**
 * Preload critical above-the-fold resources
 */
export function preloadCriticalResources() {
  // Preload critical CSS
  const criticalCSS = document.querySelector('link[href*="index.css"]');
  if (criticalCSS) {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = (criticalCSS as HTMLLinkElement).href;
    preloadLink.as = 'style';
    preloadLink.onload = () => preloadLink.rel = 'stylesheet';
    document.head.appendChild(preloadLink);
  }
  
  // Preload critical fonts
  const fontPreloads = [
    // Add critical font files here
  ];
  
  fontPreloads.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Optimize images for LCP
 */
export function optimizeLCPImages() {
  // Find images in viewport
  const images = document.querySelectorAll('img');
  const viewportHeight = window.innerHeight;
  
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    const isAboveFold = rect.top < viewportHeight && rect.top >= -rect.height;
    
    if (isAboveFold) {
      // High priority loading for above-the-fold images
      img.loading = 'eager';
      img.fetchPriority = 'high';
      
      // Preload if it's the largest image
      if (rect.width * rect.height > 50000) { // Large image threshold
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = img.src;
        preloadLink.as = 'image';
        document.head.appendChild(preloadLink);
      }
    }
  });
}

/**
 * Reduce layout shift during loading
 */
export function reduceLayoutShift() {
  const style = document.createElement('style');
  style.textContent = `
    /* Prevent layout shift with placeholder dimensions */
    img:not([width]):not([height]) {
      aspect-ratio: 16 / 9;
      width: 100%;
      height: auto;
    }
    
    /* Skeleton loaders for content areas */
    .content-loading {
      background: linear-gradient(90deg, 
        rgba(255,255,255,0.1) 25%, 
        rgba(255,255,255,0.2) 50%, 
        rgba(255,255,255,0.1) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Critical content priority */
    .hero-section, .main-nav, .primary-content {
      content-visibility: auto;
      contain-intrinsic-size: 400px;
    }
    
    /* Defer non-critical content */
    .secondary-content, .footer-content {
      content-visibility: auto;
      contain-intrinsic-size: 200px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Inline critical CSS to eliminate render-blocking
 */
export function inlineCriticalCSS() {
  const criticalCSS = `
    /* Critical above-the-fold styles */
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #000;
      color: #fff;
      line-height: 1.6;
    }
    
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    
    .hero-section {
      min-height: 60vh;
      background: linear-gradient(135deg, #1a0000 0%, #000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .main-nav {
      position: sticky;
      top: 0;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(10px);
      z-index: 100;
      padding: 1rem;
    }
    
    .btn-primary {
      background: linear-gradient(45deg, #ef4444, #fbbf24);
      border: none;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.id = 'critical-css';
  document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Progressive enhancement for better LCP
 */
export function setupProgressiveEnhancement() {
  // Show basic content immediately
  document.body.classList.add('js-loading');
  
  // Remove loading class when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.remove('js-loading');
      document.body.classList.add('js-loaded');
    });
  } else {
    document.body.classList.remove('js-loading');
    document.body.classList.add('js-loaded');
  }
  
  // Additional enhancements when fully loaded
  window.addEventListener('load', () => {
    document.body.classList.add('js-fully-loaded');
    
    // Enable animations after load
    setTimeout(() => {
      document.body.classList.add('animations-enabled');
    }, 100);
  });
}

/**
 * Monitor and optimize LCP in real-time
 */
export function monitorLCP() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        const lcp = lastEntry.startTime;
        console.log(`📊 LCP: ${Math.round(lcp)}ms`);
        
        if (lcp > 2500) {
          console.warn(`🐌 Poor LCP: ${Math.round(lcp)}ms`);
          // Could trigger additional optimizations here
        } else if (lcp > 1000) {
          console.warn(`🐌 Slow LCP: ${Math.round(lcp)}ms`);
        } else {
          console.log(`✅ Good LCP: ${Math.round(lcp)}ms`);
        }
        
        // Report to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lcp),
            delta: Math.round(lcp),
          });
        }
      }
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }
}

/**
 * Initialize all LCP optimizations
 */
export function initializeLCPOptimizations() {
  // Apply critical optimizations immediately
  setupCriticalResourceHints();
  inlineCriticalCSS();
  reduceLayoutShift();
  setupProgressiveEnhancement();
  
  // Apply optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResources();
      optimizeLCPImages();
      monitorLCP();
    });
  } else {
    preloadCriticalResources();
    optimizeLCPImages();
    monitorLCP();
  }
  
  console.log('🚀 LCP optimizations initialized');
}
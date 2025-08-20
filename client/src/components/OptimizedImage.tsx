import React, { useState, useRef, useEffect } from 'react';
import { useMobileOptimizations } from '@/lib/mobile-optimizations';
import { performanceMonitor } from '@/lib/performance';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
}

/**
 * Highly optimized image component with lazy loading, WebP support, and mobile optimization
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  className = '',
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const { isMobile, getOptimalImageSize, config } = useMobileOptimizations();

  // Generate optimized image sources
  const generateSources = () => {
    if (!src) return { webp: '', fallback: '', placeholder: '' };

    const optimalWidth = width ? getOptimalImageSize(width) : undefined;
    const baseUrl = src.includes('?') ? src : `${src}?`;
    
    const webpUrl = `${baseUrl}&format=webp&quality=${quality}${optimalWidth ? `&w=${optimalWidth}` : ''}`;
    const fallbackUrl = `${baseUrl}&quality=${quality}${optimalWidth ? `&w=${optimalWidth}` : ''}`;
    const placeholderUrl = blurDataURL || `${baseUrl}&quality=10&blur=10${optimalWidth ? `&w=${Math.floor(optimalWidth / 4)}` : ''}`;

    return {
      webp: webpUrl,
      fallback: fallbackUrl,
      placeholder: placeholderUrl,
    };
  };

  const sources = generateSources();

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        root: null,
        rootMargin: isMobile ? '200px' : '100px', // Larger margin for mobile
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isMobile]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const img = new Image();

    // Try WebP first if supported
    const supportsWebP = (() => {
      try {
        return document.createElement('canvas').toDataURL('image/webp').indexOf('webp') > -1;
      } catch {
        return false;
      }
    })();

    const imageUrl = supportsWebP ? sources.webp : sources.fallback;

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`image-load-${isMobile ? 'mobile' : 'desktop'}`, loadTime, 'measure');
      
      setCurrentSrc(imageUrl);
      setIsLoaded(true);
      setHasError(false);
      
      // Mark image as loaded for slow connection optimization
      if (imgRef.current) {
        imgRef.current.setAttribute('data-loaded', 'true');
      }
    };

    img.onerror = () => {
      console.warn('Image failed to load:', imageUrl);
      setHasError(true);
      
      // Try fallback URL if WebP failed
      if (supportsWebP && imageUrl === sources.webp) {
        img.src = sources.fallback;
      }
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, sources.webp, sources.fallback, isMobile]);

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (width 
    ? `(max-width: 768px) ${Math.min(width, 768)}px, ${width}px`
    : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  const imageStyle: React.CSSProperties = {
    ...style,
    transition: 'opacity 0.3s ease, filter 0.3s ease',
    opacity: isLoaded ? 1 : 0.8,
    filter: isLoaded ? 'none' : 'blur(1px)',
    backgroundColor: '#1a1a1a',
  };

  // Show placeholder while loading
  if (!isInView || (!isLoaded && placeholder === 'blur')) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          width,
          height,
          backgroundColor: '#1a1a1a',
          ...style,
        }}
      >
        {/* Skeleton loader */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
        
        {/* Blur placeholder */}
        {placeholder === 'blur' && sources.placeholder && (
          <img
            src={sources.placeholder}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
            style={{ filter: 'blur(10px) brightness(0.8)' }}
          />
        )}
        
        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
        
        {/* Hidden image for intersection observer */}
        <img
          ref={imgRef}
          alt=""
          className="absolute inset-0 opacity-0 pointer-events-none"
          {...props}
        />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gray-800 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-center text-gray-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <picture className={className}>
      {/* WebP source for modern browsers */}
      <source
        srcSet={sources.webp}
        sizes={responsiveSizes}
        type="image/webp"
      />
      
      {/* Fallback for older browsers */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        style={imageStyle}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        sizes={responsiveSizes}
        onLoad={() => {
          performanceMonitor.recordMetric('image-paint', performance.now(), 'mark');
        }}
        {...props}
        data-testid={`optimized-image-${alt.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </picture>
  );
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  document.head.appendChild(link);
  
  // Remove after a timeout to prevent memory leaks
  setTimeout(() => {
    if (document.head.contains(link)) {
      document.head.removeChild(link);
    }
  }, 10000);
}

/**
 * Batch preload multiple images
 */
export function preloadImages(images: Array<{ src: string; priority?: 'high' | 'low' }>) {
  // Limit concurrent preloads to prevent overwhelming the network
  const batchSize = 3;
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    
    setTimeout(() => {
      batch.forEach(({ src, priority = 'low' }) => {
        preloadImage(src, priority);
      });
    }, i * 100); // Stagger batches by 100ms
  }
}
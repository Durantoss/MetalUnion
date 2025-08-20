import React from 'react';
import { useLazyImage } from '@/lib/performance';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  placeholder?: React.ReactNode;
}

/**
 * Performance-optimized lazy loading image component
 */
export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  fallback = '/placeholder.svg', 
  placeholder,
  ...props 
}: LazyImageProps) {
  const { imgRef, src: loadedSrc, isLoaded, isInView } = useLazyImage(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse flex items-center justify-center">
          {placeholder || (
            <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></div>
          )}
        </div>
      )}
      
      <img
        ref={imgRef}
        src={loadedSrc || fallback}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onError={(e) => {
          // Fallback to placeholder on error
          e.currentTarget.src = fallback;
        }}
        {...props}
        data-testid={`lazy-image-${alt.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}
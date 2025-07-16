import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  containerClassName?: string;
  skeletonClassName?: string;
  fallbackSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className,
  containerClassName,
  skeletonClassName,
  fallbackSrc,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { trackImageLoad } = usePerformanceMetrics();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setLoadStartTime(performance.now());
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [threshold, rootMargin]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    
    // Track performance metrics
    if (loadStartTime) {
      const loadTime = performance.now() - loadStartTime;
      trackImageLoad(loadTime, true);
    }
    
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    
    // Track failed image load
    if (loadStartTime) {
      const loadTime = performance.now() - loadStartTime;
      trackImageLoad(loadTime, false);
    }
    
    onError?.(e);
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    aspectRatio,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        !width && !height && !aspectRatio && 'w-full h-full',
        containerClassName
      )}
      style={containerStyle}
    >
      {/* Loading skeleton */}
      {!isLoaded && isInView && (
        <Skeleton
          className={cn(
            'absolute inset-0 w-full h-full',
            skeletonClassName
          )}
        />
      )}

      {/* Placeholder before image is in view */}
      {!isInView && (
        <Skeleton
          className={cn(
            'w-full h-full',
            skeletonClassName
          )}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className={cn(
            'transition-opacity duration-300',
            !isLoaded && 'opacity-0',
            isLoaded && 'opacity-100',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

export { LazyImage };
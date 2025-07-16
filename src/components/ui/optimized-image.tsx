import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  responsive?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  fallback?: string;
  containerClassName?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  lazy = true,
  responsive = true,
  quality = 80,
  placeholder = 'blur',
  fallback,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const intersectionRef = useRef<IntersectionObserver | null>(null);
  const { trackImageLoad } = usePerformanceMetrics();

  // Generate responsive sizes and srcset
  const generateSrcSet = (baseSrc: string) => {
    if (!responsive || !width) return undefined;
    
    const sizes = [
      { width: Math.round(width * 0.5), descriptor: '0.5x' },
      { width: width, descriptor: '1x' },
      { width: Math.round(width * 1.5), descriptor: '1.5x' },
      { width: Math.round(width * 2), descriptor: '2x' },
    ];

    return sizes
      .map(({ width: w, descriptor }) => {
        // Convert to WebP if possible
        const webpSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return `${webpSrc} ${descriptor}`;
      })
      .join(', ');
  };

  // Generate AVIF sources for modern browsers
  const generateAvifSrc = (baseSrc: string) => {
    return baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif');
  };

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
      intersectionRef.current = observer;
    }

    return () => {
      if (intersectionRef.current) {
        intersectionRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

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

  // Start tracking when image begins loading
  useEffect(() => {
    if (isInView && !loadStartTime) {
      setLoadStartTime(performance.now());
    }
  }, [isInView, loadStartTime]);

  // Don't render anything if not in view and lazy loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-muted animate-pulse',
          containerClassName
        )}
        style={{ width, height }}
      />
    );
  }

  // Render error state
  if (hasError && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        width={width}
        height={height}
        {...props}
      />
    );
  }

  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const avifSrc = generateAvifSrc(src);

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse transition-opacity duration-300',
            isLoaded && 'opacity-0'
          )}
        />
      )}

      <picture>
        {/* AVIF source for modern browsers */}
        <source
          srcSet={generateSrcSet(avifSrc)}
          type="image/avif"
        />
        
        {/* WebP source for supported browsers */}
        <source
          srcSet={generateSrcSet(webpSrc)}
          type="image/webp"
        />

        {/* Fallback image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding={priority ? 'sync' : 'async'}
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
      </picture>
    </div>
  );
};

export { OptimizedImage };
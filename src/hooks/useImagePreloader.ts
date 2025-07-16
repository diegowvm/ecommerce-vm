import { useEffect } from 'react';

interface UseImagePreloaderOptions {
  images: string[];
  priority?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export const useImagePreloader = ({
  images,
  priority = false,
  crossOrigin,
}: UseImagePreloaderOptions) => {
  useEffect(() => {
    if (!priority || images.length === 0) return;

    const preloadImages = images.map((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      
      if (crossOrigin) {
        link.crossOrigin = crossOrigin;
      }

      // Add to head
      document.head.appendChild(link);

      return link;
    });

    // Cleanup
    return () => {
      preloadImages.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [images, priority, crossOrigin]);
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};
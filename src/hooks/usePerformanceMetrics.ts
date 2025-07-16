import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fcp: number | null; // First Contentful Paint
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
  ttfb: number | null; // Time to First Byte
  isSupported: boolean;
}

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
}

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    isSupported: typeof window !== 'undefined' && 'PerformanceObserver' in window,
  });

  const [imageMetrics, setImageMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
  });

  useEffect(() => {
    if (!metrics.isSupported) return;

    let lcpObserver: PerformanceObserver | null = null;
    let fcpObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;
    let fidObserver: PerformanceObserver | null = null;

    // Largest Contentful Paint
    try {
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    // First Contentful Paint
    try {
      fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observation not supported');
    }

    // Cumulative Layout Shift
    try {
      clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }

    // First Input Delay
    try {
      fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }

    // Navigation Timing for TTFB
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
      }
    } catch (e) {
      console.warn('Navigation timing not supported');
    }

    return () => {
      lcpObserver?.disconnect();
      fcpObserver?.disconnect();
      clsObserver?.disconnect();
      fidObserver?.disconnect();
    };
  }, [metrics.isSupported]);

  const trackImageLoad = (loadTime: number, success: boolean = true) => {
    setImageMetrics(prev => {
      const newTotalImages = prev.totalImages + 1;
      const newLoadedImages = success ? prev.loadedImages + 1 : prev.loadedImages;
      const newFailedImages = success ? prev.failedImages : prev.failedImages + 1;
      const newAverageLoadTime = success 
        ? (prev.averageLoadTime * prev.loadedImages + loadTime) / newLoadedImages
        : prev.averageLoadTime;

      return {
        totalImages: newTotalImages,
        loadedImages: newLoadedImages,
        failedImages: newFailedImages,
        averageLoadTime: newAverageLoadTime,
      };
    });
  };

  const getPerformanceGrade = (): 'good' | 'needs-improvement' | 'poor' => {
    if (!metrics.lcp || !metrics.fcp || !metrics.cls) return 'needs-improvement';

    const lcpGood = metrics.lcp <= 2500;
    const fcpGood = metrics.fcp <= 1800;
    const clsGood = metrics.cls <= 0.1;
    const fidGood = !metrics.fid || metrics.fid <= 100;

    const goodMetrics = [lcpGood, fcpGood, clsGood, fidGood].filter(Boolean).length;

    if (goodMetrics >= 3) return 'good';
    if (goodMetrics >= 2) return 'needs-improvement';
    return 'poor';
  };

  return {
    metrics,
    imageMetrics,
    trackImageLoad,
    performanceGrade: getPerformanceGrade(),
  };
};
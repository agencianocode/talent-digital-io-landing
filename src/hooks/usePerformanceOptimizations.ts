import { useState, useCallback, useRef } from 'react';
import { useProfileManager } from '@/contexts/ProfileManagerContext';

/**
 * Hook for handling optimistic updates with rollback capability
 */
export const useOptimisticUpdates = () => {
  const { updateProfile } = useProfileManager();
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);
  const rollbackDataRef = useRef<any>(null);

  const performOptimisticUpdate = useCallback(async (
    localUpdate: () => void,
    serverUpdate: () => Promise<void>,
    rollback?: () => void
  ) => {
    try {
      setIsOptimisticUpdate(true);
      
      // Store rollback data
      if (rollback) {
        rollbackDataRef.current = rollback;
      }

      // Apply optimistic update immediately
      localUpdate();

      // Perform server update
      await serverUpdate();

    } catch (error) {
      console.error('Optimistic update failed, rolling back:', error);
      
      // Rollback on error
      if (rollbackDataRef.current) {
        rollbackDataRef.current();
      }
      
      throw error;
    } finally {
      setIsOptimisticUpdate(false);
      rollbackDataRef.current = null;
    }
  }, []);

  return {
    performOptimisticUpdate,
    isOptimisticUpdate
  };
};

/**
 * Hook for intelligent data prefetching based on user behavior
 */
export const useIntelligentPrefetch = () => {
  const prefetchQueueRef = useRef<Set<string>>(new Set());
  const lastPrefetchRef = useRef<number>(0);

  const schedulePrefetch = useCallback((urls: string[], priority: 'high' | 'medium' | 'low' = 'medium') => {
    const now = Date.now();
    const timeSinceLastPrefetch = now - lastPrefetchRef.current;
    
    // Throttle prefetch requests
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 500 : 1000;
    
    if (timeSinceLastPrefetch < delay) {
      setTimeout(() => schedulePrefetch(urls, priority), delay - timeSinceLastPrefetch);
      return;
    }

    urls.forEach(url => {
      if (!prefetchQueueRef.current.has(url)) {
        prefetchQueueRef.current.add(url);
        
        // Create link element for prefetching
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        
        // Clean up after prefetch
        setTimeout(() => {
          document.head.removeChild(link);
          prefetchQueueRef.current.delete(url);
        }, 5000);
      }
    });
    
    lastPrefetchRef.current = now;
  }, []);

  const prefetchBasedOnRoute = useCallback((currentRoute: string, userContext: any) => {
    const prefetchMap: Record<string, string[]> = {
      '/talent-dashboard': [
        '/talent-dashboard/opportunities',
        '/talent-dashboard/explore'
      ],
      '/onboarding': [
        '/settings/profile',
        '/talent-dashboard'
      ],
      '/talent-dashboard/explore': [
        '/talent-dashboard/opportunities',
        '/talent-dashboard/saved'
      ]
    };

    const urlsToPrefetch = prefetchMap[currentRoute];
    if (urlsToPrefetch) {
      schedulePrefetch(urlsToPrefetch, 'medium');
    }
  }, [schedulePrefetch]);

  return {
    schedulePrefetch,
    prefetchBasedOnRoute
  };
};

/**
 * Hook for performance monitoring and optimization
 */
export const usePerformanceMonitor = () => {
  const metricsRef = useRef<{
    renderTimes: number[];
    apiCalls: number[];
    cacheHits: number;
    cacheMisses: number;
  }>({
    renderTimes: [],
    apiCalls: [],
    cacheHits: 0,
    cacheMisses: 0
  });

  const recordRenderTime = useCallback((componentName: string, time: number) => {
    metricsRef.current.renderTimes.push(time);
    
    if (time > 100) {
      console.warn(`Slow render detected: ${componentName} took ${time.toFixed(2)}ms`);
    }
  }, []);

  const recordApiCall = useCallback((duration: number) => {
    metricsRef.current.apiCalls.push(duration);
  }, []);

  const recordCacheHit = useCallback(() => {
    metricsRef.current.cacheHits++;
  }, []);

  const recordCacheMiss = useCallback(() => {
    metricsRef.current.cacheMisses++;
  }, []);

  const getMetrics = useCallback(() => {
    const { renderTimes, apiCalls, cacheHits, cacheMisses } = metricsRef.current;
    
    return {
      averageRenderTime: renderTimes.length > 0 
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
        : 0,
      slowRenders: renderTimes.filter(time => time > 100).length,
      averageApiTime: apiCalls.length > 0 
        ? apiCalls.reduce((a, b) => a + b, 0) / apiCalls.length 
        : 0,
      cacheHitRate: (cacheHits + cacheMisses) > 0 
        ? (cacheHits / (cacheHits + cacheMisses)) * 100 
        : 0,
      totalCacheHits: cacheHits,
      totalCacheMisses: cacheMisses
    };
  }, []);

  return {
    recordRenderTime,
    recordApiCall,
    recordCacheHit,
    recordCacheMiss,
    getMetrics
  };
};
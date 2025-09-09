// Performance optimization utilities
import { useCallback, useMemo } from 'react';

// Debounce hook for search and form inputs
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  return useCallback(
    (...args: Parameters<T>) => {
      const timeoutId = setTimeout(() => callback(...args), delay);
      return () => clearTimeout(timeoutId);
    },
    [callback, delay]
  ) as T;
};

// Memoized search filter
export const useSearchFilter = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && 
               value.toLowerCase().includes(lowercaseSearch);
      })
    );
  }, [items, searchTerm, searchFields]);
};

// Performance monitoring (development only)
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  if (import.meta.env.DEV) {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      if (end - start > 100) { // Only log if > 100ms
        console.warn(`[PERF] ${name} took ${(end - start).toFixed(2)}ms`);
      }
      return result;
    }) as T;
  }
  return fn;
};
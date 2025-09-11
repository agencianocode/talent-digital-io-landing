import React, { Suspense, lazy, memo } from 'react';
import LoadingSkeleton from '@/components/LoadingSkeleton';

/**
 * Performance-optimized lazy loading utilities
 * Provides intelligent code splitting and prefetching
 */

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  prefetch?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Enhanced lazy loading with intelligent prefetching
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) => {
  const LazyComponent = lazy(importFn);
  
  // Prefetch component based on priority
  if (options.prefetch) {
    const prefetchDelay = options.priority === 'high' ? 0 : 
                         options.priority === 'medium' ? 1000 : 2000;
    
    setTimeout(() => {
      importFn().catch(console.warn);
    }, prefetchDelay);
  }

  const WrappedComponent = memo((props: React.ComponentProps<T>) => {
    const FallbackComponent = options.fallback || LoadingSkeleton;
    
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  });

  WrappedComponent.displayName = `LazyLoaded(${LazyComponent.name || 'Component'})`;
  return WrappedComponent;
};

/**
 * Lazy-loaded heavy components with intelligent prefetching
 */

// Dashboard Components (High Priority - prefetch immediately)
export const LazyTalentDashboardHome = createLazyComponent(
  () => import('@/pages/TalentDashboardHome'),
  { prefetch: true, priority: 'high' }
);

export const LazyBusinessDashboard = createLazyComponent(
  () => import('@/pages/BusinessDashboard'),
  { prefetch: true, priority: 'high' }
);

export const LazyDashboardHome = createLazyComponent(
  () => import('@/pages/DashboardHome'),
  { prefetch: true, priority: 'high' }
);

// Profile & Settings (Medium Priority)
export const LazyTalentProfileWizard = createLazyComponent(
  () => import('@/components/wizard/TalentProfileWizard').then(m => ({ default: m.TalentProfileWizard })),
  { prefetch: true, priority: 'medium' }
);

export const LazyProfileSettings = createLazyComponent(
  () => import('@/pages/settings/ProfileSettings'),
  { prefetch: true, priority: 'medium' }
);

export const LazyTalentProfileSettings = createLazyComponent(
  () => import('@/pages/settings/TalentProfileSettings'),
  { prefetch: true, priority: 'medium' }
);

export const LazyOnboardingPage = createLazyComponent(
  () => import('@/pages/OnboardingPage'),
  { prefetch: true, priority: 'medium' }
);

// Opportunities & Applications (Medium Priority)
export const LazyTalentOpportunities = createLazyComponent(
  () => import('@/pages/TalentOpportunities'),
  { prefetch: true, priority: 'medium' }
);

export const LazyTalentMarketplace = createLazyComponent(
  () => import('@/pages/TalentMarketplace'),
  { prefetch: true, priority: 'medium' }
);

export const LazyOpportunityDetail = createLazyComponent(
  () => import('@/pages/OpportunityDetail'),
  { prefetch: false, priority: 'medium' }
);

export const LazyApplicationsPage = createLazyComponent(
  () => import('@/pages/ApplicationsPage'),
  { prefetch: false, priority: 'medium' }
);

// Messages & Communication (Low Priority)
export const LazyMessagesPage = createLazyComponent(
  () => import('@/pages/MessagesPage'),
  { prefetch: false, priority: 'low' }
);

// Admin & Analytics (Low Priority)
export const LazyAdminPanel = createLazyComponent(
  () => import('@/pages/AdminPanel'),
  { prefetch: false, priority: 'low' }
);

export const LazyTalentSearchPage = createLazyComponent(
  () => import('@/pages/TalentSearchPage'),
  { prefetch: false, priority: 'low' }
);

/**
 * Route-based prefetching utilities
 */
interface PrefetchConfig {
  currentRoute: string;
  userRole: string;
  profileCompleteness: number;
}

export const prefetchRouteComponents = ({ currentRoute, userRole, profileCompleteness }: PrefetchConfig) => {
  // Prefetch likely next routes based on current context
  
  if (currentRoute === '/' && userRole === 'talent') {
    // User likely to go to dashboard
    LazyTalentDashboardHome;
    
    if (profileCompleteness < 60) {
      // Likely to need onboarding
      LazyOnboardingPage;
      LazyTalentProfileWizard;
    }
  }
  
  if (currentRoute.includes('/talent-dashboard') && profileCompleteness >= 60) {
    // User likely to browse opportunities
    LazyTalentOpportunities;
    LazyTalentMarketplace;
  }
  
  if (currentRoute.includes('/onboarding')) {
    // User likely to go to settings after onboarding
    LazyProfileSettings;
    LazyTalentProfileSettings;
  }
};

/**
 * Component-level performance optimizations
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({ 
  src, 
  alt, 
  className, 
  loading = 'lazy',
  priority = false 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding="async"
      style={{ contentVisibility: 'auto' }}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Performance monitoring utilities
 */
export const measureComponentPerformance = (componentName: string) => {
  return <T extends React.ComponentType<any>>(Component: T) => {
    const MeasuredComponent = memo((props: React.ComponentProps<T>) => {
      React.useEffect(() => {
        const startTime = performance.now();
        
        return () => {
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          if (renderTime > 100) { // Log slow renders
            console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
          }
        };
      });
      
      return <Component {...props} />;
    });
    
    MeasuredComponent.displayName = `Measured(${componentName})`;
    return MeasuredComponent;
  };
};

/**
 * Data prefetching hook
 */
export const usePrefetch = () => {
  const prefetchData = React.useCallback(async (urls: string[]) => {
    const prefetchPromises = urls.map(url => {
      return fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      }).catch(() => {
        // Silently fail for prefetch requests
      });
    });
    
    await Promise.allSettled(prefetchPromises);
  }, []);

  return { prefetchData };
};

import React, { lazy, Suspense } from 'react';
import LoadingSkeleton from '@/components/LoadingSkeleton';

// Lazy load heavy components
export const LazyTalentMarketplace = lazy(() => import('@/pages/TalentMarketplace'));
export const LazyBusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
export const LazyTalentDashboard = lazy(() => import('@/pages/TalentDashboard'));
export const LazyMessagesPage = lazy(() => import('@/pages/MessagesPage'));
export const LazyOpportunityDetail = lazy(() => import('@/pages/OpportunityDetail'));

// HOC for wrapping lazy components with suspense
export const withSuspense = (Component: React.ComponentType<any>, fallback?: React.ReactNode) => {
  return (props: any) => (
    <Suspense fallback={fallback || <LoadingSkeleton type="opportunities" />}>
      <Component {...props} />
    </Suspense>
  );
};

// Pre-wrapped components
export const SuspenseTalentMarketplace = withSuspense(LazyTalentMarketplace);
export const SuspenseBusinessDashboard = withSuspense(LazyBusinessDashboard);
export const SuspenseTalentDashboard = withSuspense(LazyTalentDashboard);
export const SuspenseMessagesPage = withSuspense(LazyMessagesPage);
export const SuspenseOpportunityDetail = withSuspense(LazyOpportunityDetail);

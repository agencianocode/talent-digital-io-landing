import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedLoadingSkeletonProps {
  variant?: 'card' | 'list' | 'dashboard' | 'profile';
  count?: number;
  className?: string;
}

export const OptimizedLoadingSkeleton: React.FC<OptimizedLoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1,
  className = ""
}) => {
  const renderCardSkeleton = () => (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main Content */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sections */}
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderCardSkeleton()}
        </React.Fragment>
      ))}
    </div>
  );

  switch (variant) {
    case 'list':
      return renderListSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'profile':
      return renderProfileSkeleton();
    default:
      return Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {renderCardSkeleton()}
        </React.Fragment>
      ));
  }
};
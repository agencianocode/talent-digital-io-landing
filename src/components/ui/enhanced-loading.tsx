import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, TrendingUp, Users, Briefcase, Calendar } from 'lucide-react';

interface EnhancedLoadingProps {
  type?: 'dashboard' | 'applications' | 'opportunities' | 'profile' | 'generic';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({ 
  type = 'generic', 
  message,
  showProgress = false,
  progress = 0
}) => {
  const renderDashboardSkeleton = () => (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metrics cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts/lists skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderApplicationsSkeleton = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGenericSkeleton = () => (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Cargando...</h3>
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
        {showProgress && (
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSmartSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'applications':
        return renderApplicationsSkeleton();
      case 'opportunities':
        return renderApplicationsSkeleton(); // Similar structure
      case 'profile':
        return renderGenericSkeleton();
      default:
        return renderGenericSkeleton();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderSmartSkeleton()}
    </div>
  );
};

// Specialized loading components for different contexts
export const DashboardLoading = () => (
  <EnhancedLoading type="dashboard" message="Cargando métricas del dashboard..." />
);

export const ApplicationsLoading = () => (
  <EnhancedLoading type="applications" message="Cargando aplicaciones..." />
);

export const OpportunitiesLoading = () => (
  <EnhancedLoading type="opportunities" message="Cargando oportunidades..." />
);

export const ProfileLoading = () => (
  <EnhancedLoading type="profile" message="Cargando perfil..." />
);

// Progressive loading with steps
interface ProgressiveLoadingProps {
  steps: Array<{
    label: string;
    completed: boolean;
  }>;
  currentStep: number;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({ steps, currentStep }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold">Configurando tu dashboard...</h3>
      
      <div className="space-y-3 max-w-sm">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step.completed 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-primary text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {step.completed ? '✓' : index + 1}
            </div>
            <span className={`text-sm ${
              step.completed ? 'text-green-600' : index === currentStep ? 'text-primary font-medium' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};

interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  className
}) => {
  return (
    <div className={cn('space-y-4 p-4 rounded-lg border bg-card', className)}>
      <div className="flex items-start space-x-4">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-1/2' : 'w-full')} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ha ocurrido un error',
  message = 'No pudimos completar la operación. Por favor, inténtalo de nuevo.',
  onRetry,
  className
}) => {
  return (
    <Alert variant="destructive" className={cn('max-w-md mx-auto', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm opacity-90">{message}</div>
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="bg-background hover:bg-background/80"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Intentar de nuevo
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface SuccessStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'Operación exitosa',
  message = 'Los cambios se han guardado correctamente.',
  className
}) => {
  return (
    <Alert className={cn('max-w-md mx-auto border-green-200 bg-green-50 text-green-800', className)}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="font-medium">{title}</div>
        <div className="text-sm opacity-90">{message}</div>
      </AlertDescription>
    </Alert>
  );
};

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Cargando...',
  className
}) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-background',
      className
    )}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  LoadingCard,
  ErrorState,
  SuccessState,
  LoadingPage
};
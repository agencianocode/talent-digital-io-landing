import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Star, Award, Trophy } from 'lucide-react';

interface UnifiedProgressProps {
  value: number;
  maxValue?: number;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

const progressVariants = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-destructive'
};

const sizeVariants = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const getProgressIcon = (value: number, maxValue: number) => {
  const percentage = (value / maxValue) * 100;
  if (percentage === 100) return Trophy;
  if (percentage >= 75) return Award;
  if (percentage >= 50) return Star;
  return CheckCircle;
};

export const UnifiedProgress: React.FC<UnifiedProgressProps> = ({
  value,
  maxValue = 100,
  label,
  variant = 'default',
  size = 'md',
  showBadge = true,
  showIcon = true,
  animated = true,
  className
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const IconComponent = getProgressIcon(value, maxValue);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header with label and badge */}
      {(label || showBadge) && (
        <div className="flex items-center justify-between">
          {label && (
            <div className="flex items-center gap-2">
              {showIcon && (
                <IconComponent 
                  className={cn(
                    'h-4 w-4 transition-all duration-300',
                    percentage === 100 ? 'text-yellow-500 animate-pulse' : 'text-muted-foreground'
                  )} 
                />
              )}
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          )}
          {showBadge && (
            <Badge 
              variant={percentage === 100 ? "default" : "outline"}
              className={cn(
                'transition-all duration-300',
                percentage === 100 && 'bg-gradient-to-r from-primary to-primary/80 animate-pulse'
              )}
            >
              {Math.round(percentage)}%
            </Badge>
          )}
        </div>
      )}
      
      {/* Progress bar */}
      <div className="relative">
        <Progress 
          value={percentage}
          className={cn(
            'transition-all duration-500 ease-out',
            sizeVariants[size],
            animated && 'animate-pulse',
            className
          )}
        />
        
        {/* Completion celebration effect */}
        {percentage === 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-in-right" />
        )}
      </div>
    </div>
  );
};

export default UnifiedProgress;
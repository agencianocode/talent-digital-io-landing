import { Badge } from '@/components/ui/badge';
import { GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExclusiveOpportunityBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'prominent';
}

export const ExclusiveOpportunityBadge = ({ 
  size = 'md', 
  variant = 'default' 
}: ExclusiveOpportunityBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (variant === 'prominent') {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <Sparkles className={iconSize[size]} />
        <span className="font-semibold">Oportunidad Exclusiva para Graduados</span>
        <GraduationCap className={iconSize[size]} />
      </div>
    );
  }

  return (
    <Badge 
      className={cn(
        'flex items-center gap-1.5 font-medium bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
        sizeClasses[size]
      )}
      variant={variant === 'outline' ? 'outline' : 'default'}
    >
      <GraduationCap className={iconSize[size]} />
      {size !== 'sm' ? 'Exclusiva para Graduados' : 'Exclusiva'}
    </Badge>
  );
};

interface ExclusiveOpportunityCardProps {
  children: React.ReactNode;
  isExclusive?: boolean;
}

export const ExclusiveOpportunityCard = ({ 
  children, 
  isExclusive = false 
}: ExclusiveOpportunityCardProps) => {
  if (!isExclusive) return <>{children}</>;

  return (
    <div className="relative rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-0.5">
      <div className="absolute -top-3 left-4 z-10">
        <ExclusiveOpportunityBadge size="sm" />
      </div>
      {children}
    </div>
  );
};

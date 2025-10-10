import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  showAnimation?: boolean;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  variant = 'default',
  className,
  showAnimation = true
}) => {
  if (variant === 'icon-only') {
    return (
      <div className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}>
        <Crown className={cn(
          "h-5 w-5 text-yellow-500",
          showAnimation && "animate-pulse"
        )} />
        {showAnimation && (
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-ping" />
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge 
        variant="secondary"
        className={cn(
          "bg-gradient-to-r from-yellow-500/20 to-amber-500/20",
          "border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
          "flex items-center gap-1 px-2 py-0.5 font-semibold",
          showAnimation && "animate-fade-in",
          className
        )}
      >
        <Crown className="h-3 w-3" />
        Premium
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20",
        "border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
        "flex items-center gap-2 px-3 py-1.5 font-semibold shadow-sm",
        "hover:shadow-md transition-all duration-300",
        showAnimation && "animate-fade-in hover-scale",
        className
      )}
    >
      <Crown className={cn(
        "h-4 w-4",
        showAnimation && "animate-pulse"
      )} />
      <span>Miembro Premium</span>
      {showAnimation && (
        <Sparkles className="h-3 w-3 animate-pulse" />
      )}
    </Badge>
  );
};

export default PremiumBadge;

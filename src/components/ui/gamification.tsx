import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, 
  Award, 
  Target, 
  Zap, 
  CheckCircle2,
  Crown,
  Flame
} from 'lucide-react';

interface BadgeData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgeProps {
  badge: BadgeData;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600', 
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600'
};

const rarityGlow = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/40', 
  legendary: 'shadow-yellow-500/50'
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  size = 'md',
  showProgress = true,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const IconComponent = badge.icon;
  
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  useEffect(() => {
    if (badge.earned) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [badge.earned]);

  const progress = badge.progress && badge.maxProgress 
    ? (badge.progress / badge.maxProgress) * 100 
    : 0;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:scale-105',
      badge.earned && `shadow-lg ${rarityGlow[badge.rarity]}`,
      isAnimating && 'animate-bounce-in',
      className
    )}>
      <CardContent className="p-4 text-center space-y-2">
        {/* Badge Icon */}
        <div className={cn(
          'mx-auto rounded-full flex items-center justify-center relative',
          sizeMap[size],
          badge.earned 
            ? `bg-gradient-to-br ${rarityColors[badge.rarity]} text-white shadow-lg`
            : 'bg-muted text-muted-foreground'
        )}>
          <IconComponent className={cn(
            size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10',
            isAnimating && 'animate-pulse'
          )} />
          
          {/* Completion sparkles effect */}
          {badge.earned && isAnimating && (
            <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />
          )}
        </div>

        {/* Badge Info */}
        <div className="space-y-1">
          <h4 className={cn(
            'font-semibold text-sm',
            badge.earned ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {badge.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {badge.description}
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && badge.maxProgress && !badge.earned && (
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Rarity Indicator */}
        <Badge 
          variant={badge.earned ? "default" : "outline"}
          className={cn(
            'text-xs capitalize',
            badge.earned && `bg-gradient-to-r ${rarityColors[badge.rarity]} border-0 text-white`
          )}
        >
          {badge.rarity}
        </Badge>
      </CardContent>
    </Card>
  );
};

interface ProgressStreakProps {
  streak: number;
  goal?: number;
  className?: string;
}

export const ProgressStreak: React.FC<ProgressStreakProps> = ({
  streak,
  goal = 7,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Flame className="h-5 w-5 text-orange-500" />
      <span className="font-semibold text-lg">{streak}</span>
      <span className="text-sm text-muted-foreground">día{streak !== 1 ? 's' : ''}</span>
      {goal && (
        <div className="flex-1 ml-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Racha actual</span>
            <span>{streak}/{goal}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((streak / goal) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  requiredXP: number;
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentLevel,
  currentXP,
  requiredXP,
  className
}) => {
  const progress = (currentXP / requiredXP) * 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-foreground rounded-full flex items-center justify-center">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Nivel {currentLevel}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentXP}/{requiredXP} XP
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary-foreground transition-all duration-500 relative"
          style={{ width: `${progress}%` }}
        >
          {/* XP gain animation effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-in-right" />
        </div>
      </div>
    </div>
  );
};

interface MotivationalMessageProps {
  messages: string[];
  interval?: number;
  className?: string;
}

export const MotivationalMessage: React.FC<MotivationalMessageProps> = ({
  messages,
  interval = 3000,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 200);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  if (!messages.length) return null;

  return (
    <div className={cn(
      'text-center p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20',
      'transition-all duration-200',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1',
      className
    )}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">¡Sigue así!</span>
      </div>
      <p className="text-sm text-foreground/80">
        {messages[currentIndex]}
      </p>
    </div>
  );
};

// Sample badges data
export const sampleBadges: BadgeData[] = [
  {
    id: 'first-profile',
    title: 'Primera Impresión',
    description: 'Completa tu perfil básico',
    icon: CheckCircle2,
    earned: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'skill-master',
    title: 'Maestro de Habilidades',
    description: 'Agrega 5 habilidades profesionales',
    icon: Star,
    earned: false,
    progress: 0,
    maxProgress: 5,
    rarity: 'rare'
  },
  {
    id: 'portfolio-pro',
    title: 'Portafolio Profesional',
    description: 'Sube tu primer proyecto al portafolio',
    icon: Award,
    earned: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'epic'
  },
  {
    id: 'networking-ninja',
    title: 'Ninja del Networking',
    description: 'Conecta con 10 profesionales',
    icon: Target,
    earned: false,
    progress: 0,
    maxProgress: 10,
    rarity: 'legendary'
  }
];

export default {
  AchievementBadge,
  ProgressStreak,
  LevelProgress,
  MotivationalMessage,
  sampleBadges
};
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigationFlow } from '@/components/NavigationFlowProvider';
import { 
  ChevronRight,
  Lock, 
  Zap,
  Star,
  Settings,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  level?: 'basic' | 'intermediate' | 'advanced';
  className?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({ 
  children, 
  level = 'basic',
  className = ''
}) => {
  const { disclosureConfig } = useNavigationFlow();

  // Determine if content should be shown based on profile state and disclosure config
  const shouldShow = (() => {
    switch (level) {
      case 'basic':
        return true; // Always show basic content
      case 'intermediate':
        return disclosureConfig.showPortfolioSection || disclosureConfig.showAdvancedSettings;
      case 'advanced':
        return disclosureConfig.showNetworkingFeatures || disclosureConfig.showPremiumOptions;
      default:
        return true;
    }
  })();

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface FeatureLockedProps {
  featureName: string;
  requiredState: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const FeatureLocked: React.FC<FeatureLockedProps> = ({ 
  featureName, 
  requiredState, 
  description,
  actionLabel = 'Mejorar perfil',
  onAction
}) => {
  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardContent className="p-6 text-center">
        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">{featureName}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Badge variant="outline" className="mb-4">
          Requiere: {requiredState}
        </Badge>
        {onAction && (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface ContextualSuggestionsProps {
  maxSuggestions?: number;
}

export const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({ 
  maxSuggestions = 3 
}) => {
  const { disclosureConfig, navigateToOnboarding } = useNavigationFlow();

  const suggestions = disclosureConfig.recommendedActions.slice(0, maxSuggestions);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <Zap className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium text-blue-800 dark:text-blue-200">
            💡 Acciones recomendadas para ti:
          </p>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {suggestion}
              </li>
            ))}
          </ul>
          <Button 
            size="sm" 
            className="mt-3"
            onClick={navigateToOnboarding}
          >
            Comenzar ahora
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface AdaptiveNavigationProps {
  className?: string;
}

export const AdaptiveNavigation: React.FC<AdaptiveNavigationProps> = ({ className = '' }) => {
  const { 
    disclosureConfig, 
    profileState,
    navigateToOnboarding,
    navigateToDashboard 
  } = useNavigationFlow();

  const navigationItems = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: <Settings className="h-4 w-4" />,
      available: true,
      onClick: navigateToOnboarding,
      badge: profileState === 'new' ? 'Nuevo' : null
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <Award className="h-4 w-4" />,
      available: disclosureConfig.showPortfolioSection,
      locked: !disclosureConfig.showPortfolioSection,
      requiredState: 'En Progreso'
    },
    {
      id: 'networking',
      label: 'Networking',
      icon: <Users className="h-4 w-4" />,
      available: disclosureConfig.showNetworkingFeatures,
      locked: !disclosureConfig.showNetworkingFeatures,
      requiredState: 'Completo'
    },
    {
      id: 'advanced',
      label: 'Funciones Avanzadas',
      icon: <TrendingUp className="h-4 w-4" />,
      available: disclosureConfig.showAdvancedSettings,
      locked: !disclosureConfig.showAdvancedSettings,
      requiredState: 'Completo'
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: <Star className="h-4 w-4" />,
      available: disclosureConfig.showPremiumOptions,
      locked: !disclosureConfig.showPremiumOptions,
      requiredState: 'Profesional',
      premium: true
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Navegación Adaptativa</h3>
      
      {navigationItems.map((item) => (
        <div key={item.id}>
          {item.available ? (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.badge && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
              {item.premium && (
                <Star className="ml-auto h-3 w-3 text-yellow-500" />
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
              <div className="text-muted-foreground">{item.icon}</div>
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <div className="ml-auto flex items-center gap-2">
                <Lock className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {item.requiredState}
                </Badge>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="pt-3 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={navigateToDashboard}
        >
          Ver Dashboard Completo
        </Button>
      </div>
    </div>
  );
};

interface ProgressIndicatorProps {
  showDetails?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ showDetails = false }) => {
  const { profileStateInfo } = useNavigationFlow();
  
  const currentRange = profileStateInfo.completionRange;
  const progress = Math.max(currentRange[0], Math.min(currentRange[1], 
    (currentRange[0] + currentRange[1]) / 2
  ));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Progreso del perfil</span>
        <Badge variant="outline" className={profileStateInfo.color}>
          {profileStateInfo.icon} {profileStateInfo.label}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">{progress}%</span>
          <span>100%</span>
        </div>
      </div>

      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {profileStateInfo.description}
        </div>
      )}
    </div>
  );
};
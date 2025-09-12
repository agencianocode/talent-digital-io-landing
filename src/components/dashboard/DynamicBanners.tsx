import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Star, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Gift,
  Target,
  Zap,
  ExternalLink 
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';

interface Banner {
  id: string;
  type: 'survey' | 'feedback' | 'promotion' | 'upgrade' | 'tip' | 'celebration';
  title: string;
  message: string;
  ctaText: string;
  ctaAction: string;
  priority: 'low' | 'medium' | 'high';
  conditions: {
    minApplications?: number;
    minOpportunities?: number;
    hasActiveOpportunities?: boolean;
    daysSinceRegistration?: number;
    completedOnboarding?: boolean;
  };
  dismissible: boolean;
  expiresAt?: string;
  icon: string;
}

interface DynamicBannersProps {
  metrics: {
    totalOpportunities: number;
    activeOpportunities: number;
    totalApplications: number;
    unreviewedApplications: number;
  };
}

const DynamicBanners: React.FC<DynamicBannersProps> = ({ metrics }) => {
  const { user, company } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);

  // Banner configurations
  const bannerConfigs: Banner[] = [
    {
      id: 'welcome_survey',
      type: 'survey',
      title: '¡Ayúdanos a mejorar! 📊',
      message: 'Queremos conocer mejor tus necesidades para ofrecerte la mejor experiencia.',
      ctaText: 'Responder encuesta (2 min)',
      ctaAction: 'https://forms.gle/survey-example',
      priority: 'medium',
      conditions: {
        daysSinceRegistration: 3,
        minOpportunities: 1
      },
      dismissible: true,
      icon: 'MessageCircle'
    },
    {
      id: 'first_application_celebration',
      type: 'celebration',
      title: '🎉 ¡Primera aplicación recibida!',
      message: 'Felicitaciones, has recibido tu primera aplicación. Revísala y contacta al candidato.',
      ctaText: 'Ver aplicación',
      ctaAction: '/business-dashboard/applications',
      priority: 'high',
      conditions: {
        minApplications: 1
      },
      dismissible: true,
      icon: 'Star'
    },
    {
      id: 'upgrade_premium',
      type: 'upgrade',
      title: '🚀 Potencia tu búsqueda',
      message: 'Accede a candidatos premium, analytics avanzados y soporte prioritario.',
      ctaText: 'Ver planes',
      ctaAction: '/business-dashboard/upgrade',
      priority: 'medium',
      conditions: {
        minApplications: 5,
        hasActiveOpportunities: true
      },
      dismissible: true,
      icon: 'Zap'
    },
    {
      id: 'review_pending_applications',
      type: 'tip',
      title: '📋 Aplicaciones pendientes',
      message: `Tienes ${metrics.unreviewedApplications} aplicaciones sin revisar. Los candidatos esperan tu respuesta.`,
      ctaText: 'Revisar ahora',
      ctaAction: '/business-dashboard/applications?status=pending',
      priority: 'high',
      conditions: {
        minApplications: 3
      },
      dismissible: false,
      icon: 'Target'
    },
    {
      id: 'feedback_request',
      type: 'feedback',
      title: '💭 Tu opinión nos importa',
      message: 'Cuéntanos cómo ha sido tu experiencia reclutando talento con nuestra plataforma.',
      ctaText: 'Dar feedback',
      ctaAction: 'mailto:feedback@talent-digital.io?subject=Feedback Dashboard',
      priority: 'low',
      conditions: {
        minApplications: 10,
        daysSinceRegistration: 7
      },
      dismissible: true,
      icon: 'MessageCircle'
    },
    {
      id: 'promote_referral',
      type: 'promotion',
      title: '🎁 Programa de referidos',
      message: 'Invita a otras empresas y obtén 1 mes gratis por cada registro exitoso.',
      ctaText: 'Invitar empresas',
      ctaAction: '/business-dashboard/referrals',
      priority: 'medium',
      conditions: {
        minOpportunities: 2,
        daysSinceRegistration: 14
      },
      dismissible: true,
      icon: 'Gift'
    }
  ];

  useEffect(() => {
    // Load dismissed banners from localStorage
    const dismissed = localStorage.getItem(`dismissed_banners_${activeCompany?.id}`);
    if (dismissed) {
      setDismissedBanners(JSON.parse(dismissed));
    }
  }, [activeCompany]);

  useEffect(() => {
    if (!company || !metrics) return;

    const daysSinceRegistration = company.created_at 
      ? Math.floor((Date.now() - new Date(company.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Filter banners based on conditions and dismissal status
    const eligibleBanners = bannerConfigs.filter(banner => {
      // Skip dismissed banners
      if (banner.dismissible && dismissedBanners.includes(banner.id)) {
        return false;
      }

      // Check expiration
      if (banner.expiresAt && new Date(banner.expiresAt) < new Date()) {
        return false;
      }

      // Check conditions
      const conditions = banner.conditions;
      
      if (conditions.minApplications && metrics.totalApplications < conditions.minApplications) {
        return false;
      }
      
      if (conditions.minOpportunities && metrics.totalOpportunities < conditions.minOpportunities) {
        return false;
      }
      
      if (conditions.hasActiveOpportunities && metrics.activeOpportunities === 0) {
        return false;
      }
      
      if (conditions.daysSinceRegistration && daysSinceRegistration < conditions.daysSinceRegistration) {
        return false;
      }

      // Special condition for unreviewed applications banner
      if (banner.id === 'review_pending_applications' && metrics.unreviewedApplications === 0) {
        return false;
      }

      return true;
    });

    // Sort by priority and take top 2
    const sortedBanners = eligibleBanners.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 2);

    setActiveBanners(sortedBanners);
  }, [company, metrics, dismissedBanners]);

  const handleDismiss = (bannerId: string) => {
    const newDismissed = [...dismissedBanners, bannerId];
    setDismissedBanners(newDismissed);
    localStorage.setItem(`dismissed_banners_${activeCompany?.id}`, JSON.stringify(newDismissed));
    
    // Track analytics
    trackBannerAction(bannerId, 'dismiss');
  };

  const handleCTAClick = (banner: Banner) => {
    // Track analytics
    trackBannerAction(banner.id, 'click');
    
    // Handle different action types
    if (banner.ctaAction.startsWith('http')) {
      window.open(banner.ctaAction, '_blank');
    } else if (banner.ctaAction.startsWith('mailto:')) {
      window.location.href = banner.ctaAction;
    } else {
      // Internal navigation
      window.open(banner.ctaAction, '_blank');
    }
  };

  const trackBannerAction = (bannerId: string, action: 'view' | 'click' | 'dismiss') => {
    // Analytics tracking - in a real app, you'd integrate with your analytics service
    console.log('Banner Analytics:', {
      bannerId,
      action,
      userId: user?.id,
      companyId: activeCompany?.id,
      timestamp: new Date().toISOString()
    });
    
    // Here you could integrate with services like:
    // - Google Analytics
    // - Mixpanel
    // - Amplitude
    // - Custom analytics endpoint
  };

  const getIcon = (iconName: string) => {
    const icons = {
      MessageCircle,
      Star,
      Zap,
      Target,
      Gift,
      TrendingUp,
      Users
    };
    const IconComponent = icons[iconName as keyof typeof icons] || MessageCircle;
    return <IconComponent className="h-5 w-5" />;
  };

  const getBannerStyle = (type: Banner['type']) => {
    switch (type) {
      case 'celebration':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'upgrade':
        return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200';
      case 'survey':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200';
      case 'feedback':
        return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200';
      case 'promotion':
        return 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200';
      case 'tip':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {activeBanners.map((banner) => (
        <Card key={banner.id} className={`${getBannerStyle(banner.type)} transition-all duration-300 hover:shadow-md`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(banner.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{banner.title}</h3>
                    <Badge 
                      variant={banner.priority === 'high' ? 'destructive' : 'secondary'} 
                      className="text-xs"
                    >
                      {banner.priority === 'high' ? 'Urgente' : 
                       banner.priority === 'medium' ? 'Importante' : 'Info'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {banner.message}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleCTAClick(banner)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {banner.ctaText}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
              {banner.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(banner.id)}
                  className="flex-shrink-0 h-8 w-8 p-0 hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DynamicBanners;
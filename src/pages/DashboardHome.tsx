import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import BusinessMetrics from "@/components/dashboard/BusinessMetrics";
import RecommendedProfiles from "@/components/dashboard/RecommendedProfiles";
import DashboardSettings, { DashboardSettings as DashboardSettingsType } from "@/components/dashboard/DashboardSettings";
import DynamicBanners from "@/components/dashboard/DynamicBanners";
import { DashboardLoading } from "@/components/ui/enhanced-loading";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user, company, profile } = useSupabaseAuth();
  const { getBusinessMetrics } = useDashboardMetrics();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettingsType>({
    layout: 'grid',
    theme: 'system',
    showTrends: true,
    showIcons: true,
    refreshInterval: 0,
    widgets: {
      'total-opportunities': { enabled: true, position: 0 },
      'total-applications': { enabled: true, position: 1 },
      'applications-this-month': { enabled: true, position: 2 },
      'conversion-rate': { enabled: true, position: 3 },
      'top-opportunities': { enabled: true, position: 4 },
      'recent-applications': { enabled: true, position: 5 },
    }
  });
  
  // Setup real-time notifications
  useRealTimeNotifications({
    onNewApplication: () => {
      // Refresh metrics when new application is received
      loadMetrics();
    },
    enableSound: true
  });
  
  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const businessMetrics = await getBusinessMetrics();
      setMetrics(businessMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadMetrics();
  }, [getBusinessMetrics]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          ¡Bienvenido, {company?.name || profile?.full_name || 'Usuario'}!
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <DashboardSettings 
            onSave={setDashboardSettings}
            currentSettings={dashboardSettings}
          />
          <Button 
            onClick={() => navigate('/business-dashboard/opportunities/new')}
            className="font-semibold"
          >
            Publicar Oportunidad
          </Button>
        </div>
      </div>

      {/* Dynamic CTA Banners */}
      {metrics && (
        <DynamicBanners metrics={metrics} />
      )}

      {/* Enhanced Business Metrics */}
      {metrics && (
        <BusinessMetrics
          totalOpportunities={metrics.totalOpportunities}
          totalApplications={metrics.totalApplications}
          activeOpportunities={metrics.activeOpportunities}
          pendingApplications={metrics.pendingApplications}
          unreviewedApplications={metrics.unreviewedApplications}
          applicationsThisMonth={metrics.applicationsThisMonth}
          applicationsLastMonth={metrics.applicationsLastMonth}
          averageResponseTime={metrics.averageResponseTime}
          candidatesContacted={metrics.candidatesContacted}
          candidatesInEvaluation={metrics.candidatesInEvaluation}
          topOpportunities={metrics.topOpportunities}
          recentApplications={metrics.recentApplications}
        />
      )}

      {/* Recommended Profiles Section */}
      <div className="mt-8">
        <RecommendedProfiles />
      </div>

      {/* CTA Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">¿Necesitas ayuda para encontrar el talento perfecto?</h3>
          <p className="text-muted-foreground mb-4">
            Nuestro equipo puede ayudarte a optimizar tus búsquedas y atraer a los mejores candidatos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.open('mailto:support@talent-digital.io', '_blank')}>
              Contactar Soporte
            </Button>
            <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
              Publicar Nueva Oportunidad
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
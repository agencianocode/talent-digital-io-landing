import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import BusinessMetrics from "@/components/dashboard/BusinessMetrics";
import DashboardSettings, { DashboardSettings as DashboardSettingsType } from "@/components/dashboard/DashboardSettings";

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
  
  useEffect(() => {
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
    
    loadMetrics();
  }, [getBusinessMetrics]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando métricas...</p>
          </div>
        </div>
      </div>
    );
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

      {/* Enhanced Business Metrics */}
      {metrics && (
        <BusinessMetrics
          totalOpportunities={metrics.totalOpportunities}
          totalApplications={metrics.totalApplications}
          activeOpportunities={metrics.activeOpportunities}
          pendingApplications={metrics.pendingApplications}
          applicationsThisMonth={metrics.applicationsThisMonth}
          applicationsLastMonth={metrics.applicationsLastMonth}
          topOpportunities={metrics.topOpportunities}
          recentApplications={metrics.recentApplications}
        />
      )}
    </div>
  );
};

export default DashboardHome;
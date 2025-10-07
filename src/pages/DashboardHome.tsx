import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import CreateCompanyDialog from "@/components/CreateCompanyDialog";
import { Building } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { BusinessMetrics } from "@/components/dashboard/BusinessMetrics";
import RecommendedProfiles from "@/components/dashboard/RecommendedProfiles";
import DynamicBanners from "@/components/dashboard/DynamicBanners";
import DashboardCustomization, { DashboardConfiguration } from "@/components/dashboard/DashboardCustomization";
import EnhancedMetrics from "@/components/dashboard/EnhancedMetrics";
import { DashboardLoading } from "@/components/ui/enhanced-loading";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { profile } = useSupabaseAuth();
  const { activeCompany } = useCompany();
  const { getBusinessMetrics } = useDashboardMetrics();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfiguration>({
    layout: 'grid',
    theme: 'auto',
    density: 'comfortable',
    autoRefresh: false,
    refreshInterval: 0,
    companySize: 'small',
    widgets: {
      'total-opportunities': { 
        id: 'total-opportunities', 
        title: 'Total de Oportunidades', 
        enabled: true, 
        position: 0, 
        size: 'small', 
        category: 'metrics', 
        icon: 'Briefcase',
        description: 'Número total de oportunidades publicadas'
      },
      'total-applications': { 
        id: 'total-applications', 
        title: 'Total de Aplicaciones', 
        enabled: true, 
        position: 1, 
        size: 'small', 
        category: 'metrics', 
        icon: 'Users',
        description: 'Aplicaciones recibidas en total'
      },
      'active-opportunities': { 
        id: 'active-opportunities', 
        title: 'Oportunidades Activas', 
        enabled: true, 
        position: 2, 
        size: 'small', 
        category: 'metrics', 
        icon: 'Target',
        description: 'Oportunidades actualmente publicadas'
      },
      'applications-this-month': { 
        id: 'applications-this-month', 
        title: 'Aplicaciones Este Mes', 
        enabled: true, 
        position: 3, 
        size: 'small', 
        category: 'metrics', 
        icon: 'TrendingUp',
        description: 'Aplicaciones recibidas este mes'
      },
      'enhanced-metrics': { 
        id: 'enhanced-metrics', 
        title: 'Métricas Avanzadas', 
        enabled: true, 
        position: 4, 
        size: 'large', 
        category: 'analytics', 
        icon: 'BarChart3',
        description: 'Análisis detallado por tipo de contrato y skills'
      }
    },
    customizations: {
      showWelcomeMessage: true,
      showTips: true,
      showBanners: true,
      primaryMetric: 'total-applications'
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

  const handleCompanyCreated = () => {
    setIsCreateDialogOpen(false);
    loadMetrics();
  };

  if (!activeCompany) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Building className="h-6 w-6" />
              Crear tu Empresa
            </CardTitle>
            <CardDescription>
              Para comenzar a usar el dashboard, necesitas crear tu empresa primero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full"
            >
              <Building className="h-4 w-4 mr-2" />
              Crear Empresa
            </Button>
          </CardContent>
        </Card>

        <CreateCompanyDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCompanyCreated={handleCompanyCreated}
        />
      </div>
    );
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${dashboardConfig.density === 'compact' ? 'space-y-4' : dashboardConfig.density === 'spacious' ? 'space-y-8' : 'space-y-6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        {dashboardConfig.customizations.showWelcomeMessage && (
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            ¡Bienvenido, {activeCompany?.name || profile?.full_name || 'Usuario'}!
          </h1>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <DashboardCustomization 
            currentConfig={dashboardConfig}
            onConfigChange={setDashboardConfig}
            metrics={metrics}
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
      {metrics && dashboardConfig.customizations.showBanners && (
        <DynamicBanners metrics={metrics} />
      )}

      {/* Enhanced Business Metrics */}
      {metrics && dashboardConfig.widgets['total-opportunities']?.enabled && (
        <BusinessMetrics />
      )}

      {/* Enhanced Analytics */}
      {metrics && dashboardConfig.widgets['enhanced-metrics']?.enabled && (
        <div className="mt-8">
          <EnhancedMetrics
            contractTypeMetrics={metrics.contractTypeMetrics || {}}
            skillsDemand={metrics.skillsDemand || []}
            experienceLevelDemand={metrics.experienceLevelDemand || []}
            salaryRanges={metrics.salaryRanges || []}
            averageSalary={metrics.averageSalary || 0}
          />
        </div>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import TalentMetrics from "@/components/dashboard/TalentMetrics";

const TalentDashboardHome = () => {
  const navigate = useNavigate();
  const { profile } = useSupabaseAuth();
  const { getTalentMetrics } = useDashboardMetrics();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        const talentMetrics = await getTalentMetrics();
        setMetrics(talentMetrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, [getTalentMetrics]);

  if (isLoading) {
    return (
      <div className="p-8">
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
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          ¡Bienvenido, {profile?.full_name || 'Talento'}!
        </h1>
        <Button 
          className="font-semibold w-full sm:w-auto"
          onClick={() => navigate('/talent-dashboard/explore')}
        >
          Buscar Oportunidades
        </Button>
      </div>

      {/* Enhanced Talent Metrics */}
      {metrics && (
        <TalentMetrics
          totalApplications={metrics.totalApplications}
          acceptedApplications={metrics.acceptedApplications}
          pendingApplications={metrics.pendingApplications}
          savedOpportunities={metrics.savedOpportunities}
          profileViews={metrics.profileViews}
          profileCompletion={metrics.profileCompletion}
          recentApplications={metrics.recentApplications}
          recommendedOpportunities={metrics.recommendedOpportunities}
        />
      )}
    </div>
  );
};

export default TalentDashboardHome;

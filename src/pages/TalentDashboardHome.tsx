
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useDashboardMetrics } from "@/hooks/useCustomHooks";

const TalentDashboardHome = () => {
  const { profile } = useSupabaseAuth();
  const { getTalentMetrics } = useDashboardMetrics();
  
  const metrics = getTalentMetrics();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          ¡Bienvenido, {profile?.full_name || 'Talento'}!
        </h1>
        <Button 
          className="font-semibold"
          onClick={() => window.location.href = '/talent/marketplace'}
        >
          Explorar Oportunidades
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary p-6 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium text-foreground">Aplicaciones Enviadas</h3>
            <p className="text-2xl font-bold text-foreground mt-2">
              {metrics?.appliedJobs || 0}
            </p>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium text-foreground">Entrevistas Programadas</h3>
            <p className="text-2xl font-bold text-foreground mt-2">
              {metrics?.scheduledInterviews || 0}
            </p>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium text-foreground">Mensajes sin leer</h3>
            <p className="text-2xl font-bold text-foreground mt-2">
              {metrics?.unreadMessages || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Card */}
      <div className="bg-secondary p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Dashboard: Oportunidades recomendadas y estado de aplicaciones
        </h2>
        <p className="text-muted-foreground">
          Aquí podrás ver las oportunidades que mejor se adapten a tu perfil y hacer seguimiento de tus aplicaciones.
        </p>
      </div>

      {/* Bottom Card */}
      <div className="bg-secondary p-8 rounded-lg mt-6">
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Funcionalidades adicionales próximamente...
          </p>
        </div>
      </div>
    </div>
  );
};

export default TalentDashboardHome;

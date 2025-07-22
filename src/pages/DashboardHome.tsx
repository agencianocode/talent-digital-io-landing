import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DashboardHome = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          ¡Bienvenida, Wendy!
        </h1>
        <Button 
          onClick={() => navigate('/dashboard/opportunities/new')}
          className="font-semibold"
        >
          Publicar Oportunidad
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary p-6 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium text-foreground">Oportunidades Activas</h3>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium text-foreground">Aplicaciones sin revisar</h3>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-lg">
          <div className="text-center">
            <h3 className="font-medium text-foreground">Mensajes sin leer</h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Card */}
      <div className="bg-secondary p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Dashboard: Resumen de Oportunidades publicadas y progreso (cantidad de aplicaciones, por revisar)
        </h2>
      </div>

      {/* Bottom Card */}
      <div className="bg-secondary p-8 rounded-lg mt-6">
        <div className="min-h-[200px]">
          {/* Placeholder for additional dashboard content */}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
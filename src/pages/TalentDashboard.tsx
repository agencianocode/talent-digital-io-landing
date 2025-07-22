import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TalentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-foreground">TalentoDigital.io</h1>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Panel de Talento
          </h2>
          <p className="text-xl text-muted-foreground">
            Encuentra las mejores oportunidades en ventas digitales
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Explorar Vacantes</h3>
            <p className="text-muted-foreground mb-4">
              Descubre oportunidades como closer, SDR o appointment setter
            </p>
            <Button className="w-full">Ver Oportunidades</Button>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Mi Perfil</h3>
            <p className="text-muted-foreground mb-4">
              Actualiza tu información y mejora tu visibilidad
            </p>
            <Button variant="outline" className="w-full">Editar Perfil</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDashboard;
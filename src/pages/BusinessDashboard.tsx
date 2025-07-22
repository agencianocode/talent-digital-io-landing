import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BusinessDashboard = () => {
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
            Panel de Empresa
          </h2>
          <p className="text-xl text-muted-foreground">
            Encuentra el mejor talento digital para tu empresa
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Publicar Vacante</h3>
            <p className="text-muted-foreground mb-4">
              Publica una nueva oportunidad laboral para closers, SDRs y appointment setters
            </p>
            <Button className="w-full">Crear Vacante</Button>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-3">Ver Candidatos</h3>
            <p className="text-muted-foreground mb-4">
              Explora perfiles de talento digital disponible
            </p>
            <Button variant="outline" className="w-full">Explorar Talento</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
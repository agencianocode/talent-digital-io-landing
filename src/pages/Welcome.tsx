import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const handleCardClick = (action: string) => {
    switch(action) {
      case 'onboarding':
        // Handle onboarding call scheduling
        break;
      case 'publish':
        navigate('/dashboard/opportunities/new');
        break;
      case 'explore':
        navigate('/dashboard/talent');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-12">
            ¡Bienvenida! ¿Cómo quieres comenzar?
          </h1>
        </div>

        <div className="space-y-6">
          <div 
            className="bg-secondary p-8 rounded-lg cursor-pointer transition-colors hover:bg-card-hover"
            onClick={() => handleCardClick('onboarding')}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Agendar llamada de Onboarding Gratuita
              </h2>
            </div>
          </div>

          <div 
            className="bg-secondary p-8 rounded-lg cursor-pointer transition-colors hover:bg-card-hover"
            onClick={() => handleCardClick('publish')}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Publicar Oportunidad
              </h2>
            </div>
          </div>

          <div 
            className="bg-secondary p-8 rounded-lg cursor-pointer transition-colors hover:bg-card-hover"
            onClick={() => handleCardClick('explore')}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Explorar talento
              </h2>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate('/business-dashboard')}
            className="text-foreground hover:text-muted-foreground underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
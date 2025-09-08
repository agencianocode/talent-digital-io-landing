import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserTypeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            ¿Qué buscas?
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Business Card */}
          <div 
            className="bg-secondary p-8 rounded-2xl cursor-pointer transition-all hover:bg-card-hover group border border-border hover:border-primary/20"
            onClick={() => navigate('/register-business')}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Busco Talento
              </h2>
              <p className="text-muted-foreground">
                Para mi negocio o empresa
              </p>
            </div>
          </div>

          {/* Talent Card */}
          <div 
            className="bg-secondary p-8 rounded-2xl cursor-pointer transition-all hover:bg-card-hover group border border-border hover:border-primary/20"
            onClick={() => navigate('/register-talent')}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Busco Trabajo
              </h2>
              <p className="text-muted-foreground">
                Soy un profesional digital
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-muted-foreground mb-4">¿Ya tienes una cuenta?</p>
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="w-full max-w-sm text-lg py-4 h-auto font-semibold"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
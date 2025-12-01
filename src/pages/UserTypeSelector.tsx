import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserTypeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] bg-background flex flex-col justify-center px-5 sm:px-6">
      <div className="max-w-md w-full mx-auto text-center flex flex-col justify-center gap-6 sm:gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
            ¿Qué buscas?
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Selecciona el tipo de cuenta
          </p>
        </div>
        
        {/* Cards - Una debajo de otra */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Business Card */}
          <div 
            className="p-4 sm:p-5 rounded-xl cursor-pointer transition-all group border border-border bg-background hover:bg-[#f4e8ff] active:bg-[#f4e8ff]/80 shadow-sm hover:shadow-md active:shadow-sm touch-manipulation"
            onClick={() => navigate('/register-business')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Busco Talento
                </h2>
                <p className="text-sm text-muted-foreground">
                  Para mi negocio o empresa
                </p>
              </div>
            </div>
          </div>

          {/* Talent Card */}
          <div 
            className="p-4 sm:p-5 rounded-xl cursor-pointer transition-all group border border-border bg-background hover:bg-[#f4e8ff] active:bg-[#f4e8ff]/80 shadow-sm hover:shadow-md active:shadow-sm touch-manipulation"
            onClick={() => navigate('/register-talent')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Busco Trabajo
                </h2>
                <p className="text-sm text-muted-foreground">
                  Soy un profesional digital
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 sm:pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">¿Ya tienes una cuenta?</p>
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="w-full text-base py-3 h-auto font-semibold"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
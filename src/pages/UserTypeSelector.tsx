import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserTypeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] bg-background flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-10 md:py-12">
      <div className="max-w-2xl w-full mx-auto text-center flex flex-col justify-between h-full max-h-[700px] sm:max-h-none sm:h-auto sm:justify-center sm:gap-8">
        {/* Header */}
        <div className="flex-shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 sm:mb-4">
            ¿Qué buscas?
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </p>
        </div>
        
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 my-6 sm:my-0">
          {/* Business Card */}
          <div 
            className="p-4 sm:p-6 md:p-8 rounded-2xl cursor-pointer transition-all group border border-border bg-background hover:bg-[#f4e8ff] active:bg-[#f4e8ff]/80 shadow-md hover:shadow-lg active:shadow-md touch-manipulation"
            onClick={() => navigate('/register-business')}
          >
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Busco Talento
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Para mi negocio
              </p>
            </div>
          </div>

          {/* Talent Card */}
          <div 
            className="p-4 sm:p-6 md:p-8 rounded-2xl cursor-pointer transition-all group border border-border bg-background hover:bg-[#f4e8ff] active:bg-[#f4e8ff]/80 shadow-md hover:shadow-lg active:shadow-md touch-manipulation"
            onClick={() => navigate('/register-talent')}
          >
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Busco Trabajo
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Soy profesional
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 sm:pt-6 border-t border-border">
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">¿Ya tienes una cuenta?</p>
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="w-full max-w-sm text-base sm:text-lg py-3 sm:py-4 h-auto font-semibold"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
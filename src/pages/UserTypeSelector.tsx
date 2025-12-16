import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
const UserTypeSelector = () => {
  const navigate = useNavigate();
  return <div className="h-[100dvh] sm:min-h-screen sm:h-auto bg-background flex items-center justify-center px-4 py-4 sm:py-12">
      <div className="max-w-2xl w-full text-center space-y-3 sm:space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-4 lg:text-5xl">
            ¿Qué estás buscando hoy?
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-8 md:mb-12 px-2">
            Elegí cómo querés usar Talento Digital     
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
          {/* Business Card */}
          <div className="p-3 sm:p-6 md:p-8 rounded-2xl cursor-pointer transition-all group border border-border bg-background hover:bg-[#f4e8ff] active:bg-[#f4e8ff]/80 shadow-md hover:shadow-lg active:shadow-md touch-manipulation" onClick={() => navigate('/register-business')}>
            <div className="text-center space-y-2 sm:space-y-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                Soy una empresa  
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground">
                Publicá oportunidades y conectá con talento digital verificado       
              </p>
            </div>
          </div>

          {/* Talent Card */}
          <div className="p-3 sm:p-6 md:p-8 rounded-2xl cursor-pointer transition-all group border border-border bg-background hover:bg-[#f4e8ff] active:bg-[#f4e8ff]/80 shadow-md hover:shadow-lg active:shadow-md touch-manipulation" onClick={() => navigate('/register-talent')}>
            <div className="text-center space-y-2 sm:space-y-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                Soy talento digital  
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground">
                Creá tu perfil y aplicá a oportunidades reales       
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 sm:pt-6 border-t border-border">
          <p className="text-xs sm:text-base text-muted-foreground mb-2 sm:mb-4">¿Ya tienes una cuenta?</p>
          <Button variant="outline" onClick={() => navigate('/auth')} className="w-full max-w-sm text-sm sm:text-lg py-2.5 sm:py-4 h-auto font-semibold">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>;
};
export default UserTypeSelector;
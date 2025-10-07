
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import NotificationCenter from "./NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSupabaseAuth();

  return (
    <header className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground cursor-pointer" onClick={() => navigate('/')}>
              <span className="hidden sm:inline">TalentoDigital.io</span>
              <span className="sm:hidden">TD.io</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex space-x-4 xl:space-x-8">
            <a href="#oportunidades" className="text-foreground hover:text-muted-foreground font-medium text-sm lg:text-base">
              Oportunidades
            </a>
            <a href="#talento" className="text-foreground hover:text-muted-foreground font-medium text-sm lg:text-base">
              Para Talento
            </a>
            <a href="#negocios" className="text-foreground hover:text-muted-foreground font-medium text-sm lg:text-base">
              Para Negocios
            </a>
          </nav>

          {/* Auth Buttons / User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <NotificationCenter />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="font-medium text-xs sm:text-sm mobile-btn-sm"
                >
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/user-selector')}
                  className="font-medium text-xs sm:text-sm mobile-btn-sm"
                >
                  <span className="hidden sm:inline">Comenzar Gratis</span>
                  <span className="sm:hidden">Registrar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

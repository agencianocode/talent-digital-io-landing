
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import NotificationCenter from "./NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSupabaseAuth();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-foreground">TalentoDigital.io</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-foreground hover:text-muted-foreground font-medium">
              Oportunidades Laborales
            </a>
            <a href="#" className="text-foreground hover:text-muted-foreground font-medium">
              Para Talento Digital
            </a>
            <a href="#" className="text-foreground hover:text-muted-foreground font-medium">
              Para Negocios
            </a>
          </nav>

          {/* Auth Buttons / User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <NotificationCenter />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="font-medium"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="font-medium"
                >
                  Comenzar Gratis
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

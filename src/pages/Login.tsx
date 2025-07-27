import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-4">
            Login
          </h1>
          <p className="text-2xl text-foreground mb-12">
            Negocio/Talento
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            variant="secondary"
            onClick={() => navigate('/register-business')}
            className="w-full text-lg py-6 h-auto font-semibold hover:bg-card-hover"
          >
            Busco Talento para mi negocio
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate('/register-talent')}
            className="w-full text-lg py-6 h-auto font-semibold hover:bg-card-hover"
          >
            Busco trabajo
          </Button>

          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full text-lg py-4 h-auto font-semibold"
            >
              Iniciar Sesión / Registrarse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Comenzar Gratis
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Únete a TalentoDigital.io y conecta con las mejores oportunidades
        </p>
        
        <Button 
          onClick={() => navigate('/user-selector')}
          className="w-full text-lg py-6 h-auto font-semibold mb-4"
        >
          Crear Cuenta
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => navigate('/login')}
          className="w-full text-lg py-6 h-auto font-semibold"
        >
          Ya tengo cuenta
        </Button>
      </div>
    </div>
  );
};

export default Register;
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-4">
          Login
        </h1>
        <p className="text-2xl text-foreground mb-12">
          Negocio/Talento
        </p>
        
        <Button 
          onClick={() => navigate('/user-selector')}
          className="w-full text-lg py-6 h-auto font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Login;
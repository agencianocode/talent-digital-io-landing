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
            onClick={() => navigate('/company-search')}
            className="w-full text-lg py-6 h-auto font-semibold hover:bg-card-hover"
          >
            Busco Talento para mi negocio
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate('/job-categories')}
            className="w-full text-lg py-6 h-auto font-semibold hover:bg-card-hover"
          >
            Busco trabajo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
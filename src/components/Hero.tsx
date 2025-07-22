import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-24">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Conecta Talento Digital con Oportunidades
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          La plataforma líder para closers de venta, appointment setters y reclutadores
        </p>
        
        <Button 
          size="lg" 
          onClick={() => navigate('/login')}
          className="text-lg px-8 py-6 h-auto font-semibold"
        >
          Comenzar Ahora
        </Button>
      </div>
    </section>
  );
};

export default Hero;
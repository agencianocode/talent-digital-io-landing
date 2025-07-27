import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Star, 
  MessageSquare, 
  Shield,
  Search,
  Heart,
  Zap
} from "lucide-react";

const TalentLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: "Encuentra Oportunidades",
      description: "Busca y filtra oportunidades que se adapten a tus habilidades y preferencias"
    },
    {
      icon: Heart,
      title: "Guarda tus Favoritas",
      description: "Marca las oportunidades que te interesan para revisarlas más tarde"
    },
    {
      icon: Zap,
      title: "Aplicación Rápida",
      description: "Aplica a múltiples oportunidades con un solo clic"
    },
    {
      icon: MessageSquare,
      title: "Comunicación Directa",
      description: "Chatea directamente con reclutadores y empresas"
    },
    {
      icon: TrendingUp,
      title: "Seguimiento de Aplicaciones",
      description: "Monitorea el estado de todas tus aplicaciones en tiempo real"
    },
    {
      icon: Shield,
      title: "Perfil Seguro",
      description: "Tu información está protegida y solo la ven empresas verificadas"
    }
  ];

  const categories = [
    "Ventas", "Marketing", "Desarrollo", "Diseño", "Operaciones", "Fulfillment"
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Frontend Developer",
      content: "Encontré mi trabajo ideal en menos de una semana. La plataforma es muy fácil de usar.",
      rating: 5
    },
    {
      name: "Carlos Ruiz",
      role: "Digital Marketer",
      content: "Las empresas aquí realmente buscan talento. He recibido múltiples ofertas interesantes.",
      rating: 5
    },
    {
      name: "Ana López",
      role: "UX Designer",
      content: "Me encanta poder filtrar por ubicación remota. Perfecto para mi estilo de vida.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-foreground hover:text-foreground"
            >
              ← Volver al Inicio
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              Talento Digital
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Para Talento Digital
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Conecta con las mejores empresas y encuentra tu próxima oportunidad profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register-talent')}
              className="hover-lift"
            >
              Únete como Talento
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary hover-lift"
              onClick={() => navigate('/auth')}
            >
              Explorar Oportunidades
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Talentos Registrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Oportunidades Activas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Tasa de Colocación</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Empresas Partner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que necesitas para encontrar trabajo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Oportunidades en todas las áreas
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="text-lg py-2 px-4 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                onClick={() => navigate('/auth')}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo que dicen nuestros talentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Regístrate</h3>
              <p className="text-muted-foreground">
                Crea tu perfil y destaca tus habilidades y experiencia
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Explora</h3>
              <p className="text-muted-foreground">
                Busca y filtra oportunidades que se adapten a tu perfil
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Conecta</h3>
              <p className="text-muted-foreground">
                Aplica y conecta directamente con empresas interesadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para impulsar tu carrera?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de talentos que ya encontraron su trabajo ideal
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/register-talent')}
          >
            Comenzar Ahora - Es Gratis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TalentLanding;
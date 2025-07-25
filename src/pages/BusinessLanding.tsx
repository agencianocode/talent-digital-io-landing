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
  Target,
  Clock,
  BarChart,
  CheckCircle
} from "lucide-react";

const BusinessLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Encuentra Talento Calificado",
      description: "Accede a una base de datos de talentos digitales pre-verificados"
    },
    {
      icon: Clock,
      title: "Contratación Rápida",
      description: "Reduce el tiempo de contratación hasta en 80% con nuestro proceso optimizado"
    },
    {
      icon: BarChart,
      title: "Analytics Avanzados",
      description: "Obtén insights sobre tus publicaciones y el rendimiento de tus búsquedas"
    },
    {
      icon: MessageSquare,
      title: "Comunicación Directa",
      description: "Chatea directamente con candidatos y coordina entrevistas"
    },
    {
      icon: Shield,
      title: "Candidatos Verificados",
      description: "Todos los talentos pasan por un proceso de verificación de habilidades"
    },
    {
      icon: CheckCircle,
      title: "Gestión Simplificada",
      description: "Maneja todas tus vacantes y aplicaciones desde un solo dashboard"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Gratis",
      description: "Perfecto para empezar",
      features: [
        "1 publicación activa",
        "Hasta 10 aplicaciones",
        "Soporte por email",
        "Dashboard básico"
      ]
    },
    {
      name: "Professional",
      price: "$99/mes",
      description: "Para empresas en crecimiento",
      features: [
        "5 publicaciones activas",
        "Aplicaciones ilimitadas",
        "Analytics avanzados",
        "Soporte prioritario",
        "Filtros avanzados"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      description: "Para empresas grandes",
      features: [
        "Publicaciones ilimitadas",
        "API personalizada",
        "Gerente de cuenta dedicado",
        "Integración con HRIS",
        "Reportes personalizados"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Roberto Martínez",
      role: "CEO, TechStart",
      company: "TechStart",
      content: "Encontramos a nuestro desarrollador estrella en solo 3 días. La calidad de los candidatos es excepcional.",
      rating: 5
    },
    {
      name: "Laura Herrera",
      role: "HR Manager, InnovaDigital",
      company: "InnovaDigital",
      content: "La plataforma nos ha ahorrado meses en procesos de reclutamiento. Altamente recomendada.",
      rating: 5
    },
    {
      name: "Andrés Castro",
      role: "Founder, GrowthCo",
      company: "GrowthCo",
      content: "El mejor ROI en reclutamiento que hemos tenido. Los talentos son exactamente lo que buscábamos.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Para Negocios
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Encuentra y contrata el mejor talento digital para hacer crecer tu empresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register-business')}
            >
              Comenzar Ahora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/auth')}
            >
              Ver Demo
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
              <div className="text-muted-foreground">Talentos Activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">80%</div>
              <div className="text-muted-foreground">Reducción en Tiempo</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Tasa de Éxito</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">48h</div>
              <div className="text-muted-foreground">Tiempo Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            La solución completa para reclutamiento digital
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

      {/* How it Works Section */}
      <div className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Contrata en 3 simples pasos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Publica tu Vacante</h3>
              <p className="text-muted-foreground">
                Describe el perfil que buscas y los requisitos específicos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Recibe Aplicaciones</h3>
              <p className="text-muted-foreground">
                Los talentos calificados aplicarán automáticamente a tu vacante
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Selecciona y Contrata</h3>
              <p className="text-muted-foreground">
                Entrevista a los mejores candidatos y haz tu selección final
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Planes que se adaptan a tu empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-lg">
                    <Badge variant="secondary">Más Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  <Button 
                    className="w-full mt-6"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate('/register-business')}
                  >
                    {plan.name === "Enterprise" ? "Contactar Ventas" : "Comenzar Ahora"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo que dicen nuestros clientes
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
                    <div className="text-sm text-primary">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para encontrar tu próximo gran talento?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de empresas que ya confían en nuestra plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register-business')}
            >
              Comenzar Gratis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/auth')}
            >
              Programar Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLanding;
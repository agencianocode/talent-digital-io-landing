import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Briefcase, Search, Star, CheckCircle } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-foreground">
                Talento Digital
              </h1>
              <nav className="hidden md:flex space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/opportunities')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Oportunidades Laborales
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/talent')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Para Talento Digital
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/business')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Para Negocios
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Comenzar Gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Conecta con el mejor{" "}
            <span className="text-primary">talento digital</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plataforma líder para encontrar profesionales especializados en marketing digital, 
            ventas y tecnología. Conecta empresas con talento excepcional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => navigate('/register-business')}
              className="text-lg px-8 py-6"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Busco Talento
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/register-talent')}
              className="text-lg px-8 py-6"
            >
              <Users className="mr-2 h-5 w-5" />
              Busco Trabajo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Verificación de perfiles
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Proceso seguro
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Soporte 24/7
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir Talento Digital?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Búsqueda Inteligente</h3>
              <p className="text-muted-foreground">
                Encuentra el talento perfecto con nuestro sistema de filtros avanzados 
                y algoritmos de matching inteligente.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Perfiles Verificados</h3>
              <p className="text-muted-foreground">
                Todos los profesionales pasan por un proceso de verificación 
                para garantizar la calidad y autenticidad.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comunidad Activa</h3>
              <p className="text-muted-foreground">
                Únete a una comunidad vibrante de profesionales digitales 
                y empresas innovadoras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Profesionales activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-muted-foreground">Empresas registradas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Satisfacción del cliente</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24h</div>
              <div className="text-muted-foreground">Tiempo promedio de conexión</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de profesionales y empresas que ya confían en nosotros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register-business')}
              className="text-lg px-8 py-6"
            >
              Registrar Empresa
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/register-talent')}
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Registrarse como Talento
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Talento Digital</h3>
              <p className="text-muted-foreground">
                Conectando el mejor talento digital con empresas innovadoras.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Empresas</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto">Publicar oferta</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Buscar talento</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Precios</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Talento</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto">Buscar trabajos</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Crear perfil</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Recursos</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto">Centro de ayuda</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Contacto</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Términos</Button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Talento Digital. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
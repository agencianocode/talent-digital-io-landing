import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Briefcase, Search, Star, CheckCircle, Menu, X, LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getDashboardRoute } from "@/lib/navigation";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, userRole, signOut } = useSupabaseAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGoToDashboard = () => {
    const dashboardRoute = getDashboardRoute(userRole);
    navigate(dashboardRoute);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                Talento Digital
              </h1>
              <nav className="hidden lg:flex space-x-6">
                {/* Sección de navegación eliminada */}
              </nav>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleGoToDashboard}
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Ir al Panel
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    size="sm"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                  >
                    Comenzar Gratis
                  </Button>
                </div>
              )}
              {!isAuthenticated && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  size="sm"
                  className="sm:hidden"
                >
                  Comenzar
                </Button>
              )}
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col space-y-2">
                {isAuthenticated && (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleGoToDashboard();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ir al Panel
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6">
            Conecta con el mejor{" "}
            <span className="text-primary font-black">talento digital</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
            La plataforma líder para conectar empresas con talento digital especializado. 
            Encuentra tu próxima oportunidad o contrata al profesional ideal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 lg:mb-12 px-4">
            <Button 
              size="lg"
              onClick={() => navigate('/')}
              className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 hover-lift btn-primary group"
            >
              <Briefcase className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              Contratar Talento
              <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/')}
              className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 hover-lift btn-secondary group"
            >
              <Users className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              Buscar Trabajo
              <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Verificación de perfiles
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Proceso seguro
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Soporte 24/7
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12">
            ¿Por qué elegir Talento Digital?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center p-6 card-hover rounded-xl transition-all duration-300 hover:bg-card/50">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-heading">Búsqueda Inteligente</h3>
              <p className="text-muted-foreground">
                Encuentra el talento perfecto con nuestro sistema de filtros avanzados 
                y algoritmos de matching inteligente.
              </p>
            </div>

            <div className="text-center p-6 card-hover rounded-xl transition-all duration-300 hover:bg-card/50">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-heading">Perfiles Verificados</h3>
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
              onClick={() => navigate('/')}
              className="text-lg px-8 py-6"
            >
              Registrar Empresa
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/')}
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
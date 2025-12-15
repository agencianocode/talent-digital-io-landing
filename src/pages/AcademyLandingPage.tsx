import { Users, Award, Briefcase, BarChart3, ShoppingBag, CheckCircle, Play, ArrowRight } from 'lucide-react';
import academyHeroMockups from '@/assets/academy-hero-mockups.png';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AcademyLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Clean and minimal */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center h-20">
            <span className="text-xl font-semibold italic tracking-tight text-foreground">TalentoDigital.io</span>
          </div>
        </div>
      </header>

      {/* Hero Section - Two Columns */}
      <section className="min-h-screen pt-20 pb-16 px-6 sm:px-8 lg:px-12 relative overflow-hidden flex items-center">
        {/* Background decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-muted via-secondary/50 to-transparent rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-gradient-to-br from-muted via-secondary/30 to-transparent rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-gradient-to-br from-secondary/40 to-transparent rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text */}
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
                Diferenciá tu academia con casos de éxito reales
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
                TalentoDigital ayuda a academias de habilidades digitales a conectar a sus estudiantes y graduados con empresas reales, convirtiendo la formación en resultados visibles.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-5">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm"
                  onClick={() => navigate('/register-academy')}
                >
                  <span className="mr-2">👉</span>
                  Registrar mi academia gratis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-base font-medium rounded-xl border-2 border-border bg-background hover:bg-muted/50"
                  onClick={() => window.open('https://calendly.com/talentodigital', '_blank')}
                >
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Ver Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Exclusivo para academias de habilidades digitales. Servicio Gratuito de TalentoDigital
              </p>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative flex justify-end lg:translate-x-16">
              <img 
                src={academyHeroMockups} 
                alt="TalentoDigital - Estadísticas de empleabilidad, directorio de talento y oportunidades"
                className="w-full max-w-2xl lg:max-w-none lg:w-[130%] h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Directorio Público */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Users className="h-4 w-4" />
                Directorio de Talento
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Creá un directorio público de talento con la marca de tu academia
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Tus estudiantes y graduados tienen un perfil verificado que las empresas pueden encontrar. 
                Tu academia gana visibilidad y credibilidad con cada historia de éxito.
              </p>
              <ul className="space-y-3">
                {[
                  'Perfiles verificados con badge de tu academia',
                  'Filtros por skills, experiencia y disponibilidad',
                  'URL personalizada: talentodigital.io/academy/tu-marca',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Directorio de Graduados</span>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-muted"></div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-muted rounded mb-2"></div>
                          <div className="h-3 w-24 bg-muted/60 rounded"></div>
                        </div>
                        <div className="px-2 py-1 bg-primary/10 rounded text-xs font-medium">Verificado</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Estudiantes Verificados */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Perfil de Graduado</span>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-muted"></div>
                    <div>
                      <div className="h-5 w-40 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-32 bg-muted/60 rounded mb-2"></div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 rounded text-xs">React</span>
                        <span className="px-2 py-0.5 bg-primary/10 rounded text-xs">TypeScript</span>
                        <span className="px-2 py-0.5 bg-primary/10 rounded text-xs">Node.js</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">Graduado de Sales Xcelerator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Disponible para trabajo remoto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                Perfiles Verificados
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Estudiantes verificados que se destacan automáticamente
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Cada graduado de tu academia tiene un badge verificado. Las empresas confían en perfiles 
                respaldados por academias de calidad.
              </p>
              <ul className="space-y-3">
                {[
                  'Badge de verificación de tu academia',
                  'Portfolio de proyectos y certificaciones',
                  'Historial de formación visible para reclutadores',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Oportunidades Exclusivas */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Briefcase className="h-4 w-4" />
                Oportunidades Exclusivas
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Oportunidades reales, exclusivas y alineadas a tu academia
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Las empresas publican oportunidades exclusivas para tus graduados. 
                Vos decidís qué oportunidades llegan a tu comunidad.
              </p>
              <ul className="space-y-3">
                {[
                  'Oportunidades filtradas para tu academia',
                  'Notificaciones automáticas a tus graduados',
                  'Seguimiento de aplicaciones en tiempo real',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Oportunidades para tu Academia</span>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { title: 'Sales Development Rep', company: 'TechCorp', exclusive: true },
                      { title: 'Account Executive', company: 'StartupXYZ', exclusive: true },
                      { title: 'Customer Success Manager', company: 'SaaS Inc', exclusive: false },
                    ].map((job, i) => (
                      <div key={i} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-muted-foreground">{job.company}</div>
                          </div>
                          {job.exclusive && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs">Exclusivo</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Métricas de Empleabilidad */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Dashboard de Métricas</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Estudiantes Activos', value: '256' },
                      { label: 'Graduados', value: '148' },
                      { label: 'Tasa de Empleo', value: '58%' },
                      { label: 'Empresas Conectadas', value: '45' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-muted/20 rounded-lg text-center">
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-muted/20 rounded-lg flex items-end justify-around p-4">
                    {[60, 80, 45, 90, 70, 85].map((h, i) => (
                      <div key={i} className="w-8 bg-primary/60 rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <BarChart3 className="h-4 w-4" />
                Métricas de Impacto
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Trackeá empleabilidad real, no suposiciones
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Métricas claras sobre el impacto de tu academia: tasas de empleo, 
                tiempo promedio hasta la contratación, y satisfacción de empresas.
              </p>
              <ul className="space-y-3">
                {[
                  'Dashboard con métricas en tiempo real',
                  'Reportes exportables para sponsors',
                  'Comparativas con benchmarks del sector',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 5: Marketplace */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Promocioná tus servicios en el marketplace
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Tu academia puede ofrecer servicios de capacitación, consultoría o mentoring. 
                Las empresas te encuentran y contratan directamente.
              </p>
              <ul className="space-y-3">
                {[
                  'Perfil de servicios de tu academia',
                  'Cotizaciones y contrataciones directas',
                  'Visibilidad ante empresas buscando capacitación',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Servicios de tu Academia</span>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { title: 'Bootcamp de Ventas B2B', price: 'USD 2,500', duration: '8 semanas' },
                      { title: 'Workshop de Negociación', price: 'USD 800', duration: '2 días' },
                      { title: 'Mentoring 1:1', price: 'USD 150/h', duration: 'Flexible' },
                    ].map((service, i) => (
                      <div key={i} className="p-4 border border-border rounded-lg">
                        <div className="font-medium mb-1">{service.title}</div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{service.duration}</span>
                          <span className="font-medium">{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Llevá tu academia al siguiente nivel
          </h2>
          <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Comenzá gratis y descubrí cómo TalentoDigital puede potenciar el impacto de tu academia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full sm:w-auto text-base px-8"
              onClick={() => navigate('/register-academy')}
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => window.open('https://calendly.com/talentodigital', '_blank')}
            >
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">TalentoDigital</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="mailto:hola@talentodigital.io" className="hover:text-foreground transition-colors">Contacto</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TalentoDigital. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AcademyLandingPage;

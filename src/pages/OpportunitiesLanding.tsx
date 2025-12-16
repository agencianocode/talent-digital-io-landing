import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { MapPin, Clock, DollarSign, Briefcase, Building } from "lucide-react";
import { stripHtml } from "@/lib/utils";

const OpportunitiesLanding = () => {
  const navigate = useNavigate();
  const { opportunities, isLoading } = useSupabaseOpportunities();

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Por Contrato' },
    { value: 'freelance', label: 'Freelance' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Oportunidades Laborales
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Descubre las mejores oportunidades para talentos digitales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="hover-lift"
            >
              Explorar Oportunidades
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary hover-lift"
              onClick={() => navigate('/register-business')}
            >
              Publicar Oportunidad
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{opportunities.length}+</div>
              <div className="text-muted-foreground">Oportunidades Activas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Empresas Registradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Talentos Conectados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Opportunities */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Oportunidades Destacadas</h2>
          
          {opportunities.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Pronto habrá oportunidades disponibles
              </h3>
              <p className="text-muted-foreground">
                Las empresas están publicando nuevas oportunidades constantemente
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.slice(0, 6).map((opportunity) => (
                <div key={opportunity.id} className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                      {opportunity.title}
                    </h3>
                    <Badge variant="secondary">
                      {opportunity.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                    <Building className="h-4 w-4" />
                    <span className="font-medium text-foreground">
                      {opportunity.companies?.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    {opportunity.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{jobTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}</span>
                    </div>
                  </div>

                  {opportunity.salary_min && (
                    <div className="flex items-center space-x-1 text-sm font-medium text-foreground mb-4">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        ${opportunity.salary_min.toLocaleString()}
                        {opportunity.salary_max && 
                          ` - $${opportunity.salary_max.toLocaleString()}`
                        } {opportunity.currency || 'USD'}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {stripHtml(opportunity.description)}
                  </p>
                  
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Ver Detalles
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Ver Todas las Oportunidades
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para encontrar tu próxima oportunidad?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestra plataforma y conecta con las mejores empresas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register-talent')}
            >
              Registrarse como Talento
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/register-business')}
            >
              Registrarse como Empresa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesLanding;
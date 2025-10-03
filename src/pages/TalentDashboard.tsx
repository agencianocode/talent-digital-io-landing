import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  DollarSign,
  Users,
  Clock,
  Building
} from 'lucide-react';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { useProfileData } from '@/hooks/useProfileData';

const TalentDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { opportunities, isLoading: opportunitiesLoading } = useSupabaseOpportunities();
  const { getProfileCompleteness } = useProfileData();
  
  const profileCompleteness = getProfileCompleteness();

  const handleSearch = () => {
    navigate('/talent-dashboard/explore');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
        
        {/* Profile Completion Section */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 font-['Inter']">
              Tu perfil está al {profileCompleteness}%
            </CardTitle>
            <p className="text-gray-600 font-['Inter']">
              Complétalo para atraer más talento y generar confianza.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={profileCompleteness} className="h-2" />
            
            <div className="space-y-3">
              {/* Onboarding Completado */}
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-['Inter']">Onboarding Completado</span>
              </div>
              
              {/* Agregar Experiencia y Educación */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 font-['Inter']">Agrega Experiencia y Educación</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 font-['Inter']"
                  onClick={() => navigate('/talent-dashboard/profile')}
                >
                  Completar Perfil ahora <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {/* Agregar Video de Presentación */}
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-['Inter']">Agrega un Video de Presentación</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 font-['Inter']">
              Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button variant="outline" size="sm" className="font-['Inter']">
                Categoría
              </Button>
              <Button variant="outline" size="sm" className="font-['Inter']">
                Skills
              </Button>
              <Button variant="outline" size="sm" className="font-['Inter']">
                Tipo de Contrato
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Input
                placeholder="Busca"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 font-['Inter']"
              />
              <Button 
                onClick={handleSearch}
                className="bg-black hover:bg-gray-800 text-white font-['Inter']"
              >
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">
            Oportunidades Recientes
          </h2>
          
          {/* Oportunidades dinámicas desde Supabase */}
          {opportunitiesLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-['Inter']">Cargando oportunidades...</p>
            </div>
          ) : opportunities && opportunities.length > 0 ? (
            opportunities.slice(0, 3).map((opportunity, index) => (
              <Card key={opportunity.id || index} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {opportunity.companies?.logo_url ? (
                        <img 
                          src={opportunity.companies.logo_url} 
                          alt={`Logo de ${opportunity.companies.name}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback a icono si la imagen falla
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center"
                        style={{ display: opportunity.companies?.logo_url ? 'none' : 'flex' }}
                      >
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">
                              {opportunity.title || 'Título no disponible'}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              {opportunity.status === 'active' ? 'Activa' : opportunity.status || 'Activa'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 font-['Inter'] mb-2">
                            {opportunity.companies?.name || 'Empresa no especificada'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 font-['Inter']">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {opportunity.salary_min && opportunity.salary_max
                                ? `$${opportunity.salary_min}-${opportunity.salary_max} ${opportunity.currency || 'USD'}`
                                : opportunity.salary_min
                                ? `Desde $${opportunity.salary_min} ${opportunity.currency || 'USD'}`
                                : 'A Convenir'
                              }
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Ver postulantes
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {opportunity.created_at 
                                ? `Hace ${Math.floor((new Date().getTime() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24))} días`
                                : 'Fecha no disponible'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            className="bg-black hover:bg-gray-800 text-white font-['Inter']"
                            onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.id}`)}
                          >
                            Ver Detalles
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-['Inter']">No hay oportunidades disponibles en este momento.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/talent-dashboard/opportunities')}
              >
                Explorar Oportunidades
              </Button>
            </div>
          )}
        </div>
        </div>
      </main>
  );
};

export default TalentDashboard;
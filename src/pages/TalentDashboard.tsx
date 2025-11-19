import { useState, useEffect, useMemo } from 'react';
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
  Building,
  X
} from 'lucide-react';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { useTalentProfileProgress } from '@/hooks/useTalentProfileProgress';
import { AcademyAffiliationCard } from '@/components/talent/AcademyAffiliationCard';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademyAffiliations } from '@/hooks/useAcademyAffiliations';

const TalentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleteDisclaimer, setShowCompleteDisclaimer] = useState(true);
  const { opportunities, isLoading: opportunitiesLoading } = useSupabaseOpportunities();
  const { 
    getTasksStatus, 
    getCompletionPercentage, 
    getNextIncompleteTask
  } = useTalentProfileProgress();
  
  // 🎓 Obtener afiliaciones de academia para filtrar oportunidades exclusivas
  const { affiliations } = useAcademyAffiliations(user?.email);
  const academyIds = useMemo(() => affiliations.map(a => a.academy_id), [affiliations]);
  
  // 🚀 Filtrar oportunidades exclusivas de academias
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // Si es exclusiva de academia, solo mostrar si el usuario pertenece a esa academia
      if (opp.is_academy_exclusive) {
        return academyIds.includes(opp.company_id);
      }
      // Si NO es exclusiva, mostrar siempre
      return true;
    });
  }, [opportunities, academyIds]);
  
  // Cargar estado del disclaimer desde localStorage
  useEffect(() => {
    const disclaimerClosed = localStorage.getItem('talent-profile-complete-disclaimer-closed');
    if (disclaimerClosed === 'true') {
      setShowCompleteDisclaimer(false);
    }
  }, []);
  
  // Función para cerrar el disclaimer
  const handleCloseDisclaimer = () => {
    setShowCompleteDisclaimer(false);
    localStorage.setItem('talent-profile-complete-disclaimer-closed', 'true');
  };
  
  const profileCompleteness = getCompletionPercentage();
  const tasks = getTasksStatus();
  const nextTask = getNextIncompleteTask();

  const handleSearch = () => {
    // Guardar búsqueda en localStorage para que TalentOpportunitiesSearch la use
    if (searchQuery.trim()) {
      localStorage.setItem('talent-opportunity-search', searchQuery.trim());
    }
    navigate('/talent-dashboard/opportunities');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* Profile Completion Section */}
        {profileCompleteness === 100 ? (
          // Perfil completo - Badge compacto con celebración y botón de cerrar
          showCompleteDisclaimer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3">
              <CheckCircle className="text-green-600 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-green-900 font-['Inter']">¡Perfil completo! 🎉</p>
                <p className="text-xs sm:text-sm text-green-700 font-['Inter']">Tu perfil está optimizado para recibir las mejores oportunidades.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDisclaimer}
                className="text-green-700 hover:text-green-900 hover:bg-green-100 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                aria-label="Cerrar mensaje"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )
        ) : (
          // Perfil incompleto - Layout de 2 columnas compacto
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Completitud (2 columnas) */}
            <div className="lg:col-span-2">
              <Card className="bg-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">
                      Tu perfil está al {profileCompleteness}%
                    </h2>
                    {/* Indicadores visuales compactos */}
                    <div className="flex items-center gap-1">
                      {tasks.map((task) => (
                        task.completed ? (
                          <CheckCircle key={task.id} className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle key={task.id} className="w-4 h-4 text-gray-300" />
                        )
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 font-['Inter']">
                    Complétalo para recibir mejores oportunidades
                  </p>
                  
                  <Progress value={profileCompleteness} className="h-2 mb-4" />
                  
                  {/* Solo mostrar tareas INCOMPLETAS */}
                  <div className="space-y-2">
                    {tasks.filter(task => !task.completed).map((task) => {
                      const isCurrentStep = nextTask?.id === task.id;
                      
                      return (
                        <div 
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isCurrentStep 
                              ? 'bg-blue-50 border-l-4 border-blue-500' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Circle className={`w-5 h-5 flex-shrink-0 ${isCurrentStep ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <span className={`text-gray-700 font-['Inter'] ${isCurrentStep ? 'font-semibold' : ''}`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          
                          {task.route && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 font-['Inter'] flex-shrink-0"
                              onClick={() => task.route && navigate(task.route)}
                            >
                              Completar <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Columna derecha - Tips para destacar */}
            <div>
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-lg font-semibold mb-3 text-purple-900 font-['Inter']">💡 Tips para destacar</h3>
                  <ul className="space-y-2 text-sm text-purple-800 font-['Inter']">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Un perfil completo recibe <strong>3x más vistas</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>El video de presentación aumenta tus posibilidades en <strong>70%</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Mantén tu experiencia actualizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Añade tus mejores proyectos</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => nextTask?.route && navigate(nextTask.route)}
                  >
                    Continuar ahora →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Academy Affiliation Section */}
        <AcademyAffiliationCard />

        {/* Search Section */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 font-['Inter']">
              Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="font-['Inter'] text-xs sm:text-sm">
                Categoría
              </Button>
              <Button variant="outline" size="sm" className="font-['Inter'] text-xs sm:text-sm">
                Skills
              </Button>
              <Button variant="outline" size="sm" className="font-['Inter'] text-xs sm:text-sm">
                Tipo de Contrato
              </Button>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Input
                placeholder="Busca"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 font-['Inter'] text-sm"
              />
              <Button 
                onClick={handleSearch}
                variant="default"
                className="font-['Inter'] whitespace-nowrap px-3 sm:px-4 md:px-6 text-xs sm:text-sm"
              >
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 font-['Inter']">
            Oportunidades Recientes
          </h2>
          
          {/* Oportunidades dinámicas desde Supabase */}
          {opportunitiesLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-['Inter']">Cargando oportunidades...</p>
            </div>
          ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
            filteredOpportunities.slice(0, 3).map((opportunity, index) => (
              <Card key={opportunity.id || index} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* Company Logo */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {opportunity.companies?.logo_url ? (
                        <img 
                          src={opportunity.companies.logo_url} 
                          alt={`Logo de ${opportunity.companies.name}`}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
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
                        <Building className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Job Info */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col gap-3">
                        {/* Título y Badge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-['Inter'] break-words">
                            {opportunity.title || 'Título no disponible'}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs whitespace-nowrap">
                            {opportunity.status === 'active' ? 'Activa' : opportunity.status || 'Activa'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm sm:text-base text-gray-600 font-['Inter'] truncate">
                          {opportunity.companies?.name || 'Empresa no especificada'}
                        </p>
                        
                        {/* Metadatos - Columna en móvil, fila en desktop */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 font-['Inter']">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {opportunity.salary_min && opportunity.salary_max
                                ? `$${opportunity.salary_min}-${opportunity.salary_max} ${opportunity.currency || 'USD'}`
                                : opportunity.salary_min
                                ? `Desde $${opportunity.salary_min} ${opportunity.currency || 'USD'}`
                                : 'A Convenir'
                              }
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            Ver postulantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            {opportunity.created_at 
                              ? `Hace ${Math.floor((new Date().getTime() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24))} días`
                              : 'Fecha no disponible'
                            }
                          </span>
                        </div>
                        
                        {/* Actions - Ancho completo en móvil */}
                        <div className="flex items-center gap-2 pt-2 border-t sm:border-t-0 sm:pt-0">
                          <Button 
                            size="sm"
                            variant="default"
                            className="font-['Inter'] flex-1 sm:flex-none text-xs sm:text-sm"
                            onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.id}`)}
                          >
                            Ver Detalles
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
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
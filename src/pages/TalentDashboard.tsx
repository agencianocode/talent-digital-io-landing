import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  DollarSign,
  Users,
  Building,
  X,
  Bookmark,
  Eye,
  Tag,
  MapPin,
  GraduationCap,
  Search
} from 'lucide-react';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { useTalentProfileProgress } from '@/hooks/useTalentProfileProgress';
import { AcademyAffiliationCard } from '@/components/talent/AcademyAffiliationCard';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAcademyAffiliations } from '@/hooks/useAcademyAffiliations';
import FilterBar from '@/components/FilterBar';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import ApplicationModal from '@/components/ApplicationModal';
import ProfileCompletenessModal from '@/components/ProfileCompletenessModal';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';

interface FilterState {
  category?: string | string[];
  subcategory?: string;
  contractType?: string | string[];
  workMode?: string;
  location?: string;
  experience?: string | string[];
}

const TalentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [showCompleteDisclaimer, setShowCompleteDisclaimer] = useState(true);
  const { opportunities, isLoading: opportunitiesLoading, hasApplied } = useSupabaseOpportunities();
  const { 
    getTasksStatus, 
    getCompletionPercentage, 
    getNextIncompleteTask
  } = useTalentProfileProgress();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showCompletenessModal, setShowCompletenessModal] = useState(false);
  
  // Saved opportunities
  const { isOpportunitySaved, saveOpportunity, unsaveOpportunity } = useSavedOpportunities();
  const { completeness } = useProfileCompleteness();
  
  // 🎓 Obtener afiliaciones de academia para filtrar oportunidades exclusivas
  const { affiliations } = useAcademyAffiliations(user?.email);
  const academyIds = useMemo(() => affiliations.map(a => a.academy_id), [affiliations]);
  
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

  // Función para calcular tiempo desde creación
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Hace 1 día';
    return `Hace ${diffInDays} días`;
  };

  // Función para manejar cambios de filtros
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters as FilterState);
  };

  // Función para manejar cambios en la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Función para manejar aplicación
  const handleApply = (opportunity: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (completeness < 100) {
      setShowCompletenessModal(true);
      return;
    }

    if (opportunity.is_external_application && opportunity.external_application_url) {
      window.open(opportunity.external_application_url, '_blank', 'noopener,noreferrer');
      return;
    }

    setSelectedOpportunity(opportunity);
    setShowApplicationModal(true);
  };

  // Función para manejar guardar
  const handleSave = async (opportunityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpportunitySaved(opportunityId)) {
      await unsaveOpportunity(opportunityId);
    } else {
      await saveOpportunity(opportunityId);
    }
  };

  // 🚀 Filtrar oportunidades
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opp => {
      // Si es exclusiva de academia, solo mostrar si el usuario pertenece a esa academia
      if (opp.is_academy_exclusive) {
        return academyIds.includes(opp.company_id);
      }
      return true;
    });

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title?.toLowerCase().includes(searchLower) ||
        opp.companies?.name?.toLowerCase().includes(searchLower) ||
        opp.description?.toLowerCase().includes(searchLower) ||
        opp.category?.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de categoría
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      if (categories.length > 0) {
        filtered = filtered.filter(opp => 
          categories.some(cat => opp.category?.toLowerCase() === cat.toLowerCase())
        );
      }
    }

    // Aplicar filtro de tipo de contrato
    if (filters.contractType) {
      const types = Array.isArray(filters.contractType) ? filters.contractType : [filters.contractType];
      if (types.length > 0) {
        filtered = filtered.filter(opp => 
          types.some(type => opp.type?.toLowerCase() === type.toLowerCase())
        );
      }
    }

    // Aplicar filtro de experiencia
    if (filters.experience) {
      const levels = Array.isArray(filters.experience) ? filters.experience : [filters.experience];
      if (levels.length > 0) {
        filtered = filtered.filter(opp => {
          const oppLevels = (opp as any).experience_levels || [];
          return levels.some(level => 
            oppLevels.some((l: string) => l.toLowerCase() === level.toLowerCase())
          );
        });
      }
    }

    return filtered;
  }, [opportunities, academyIds, searchTerm, filters]);

  if (opportunitiesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Profile Completion Section */}
      {profileCompleteness === 100 ? (
        // Perfil completo - Badge compacto con celebración y botón de cerrar
        showCompleteDisclaimer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 mb-6">
            <CheckCircle className="text-green-600 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-green-900">¡Perfil completo! 🎉</p>
              <p className="text-xs sm:text-sm text-green-700">Tu perfil está optimizado para recibir las mejores oportunidades.</p>
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
        // Perfil incompleto - Layout compacto
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Columna izquierda - Completitud (2 columnas) */}
          <div className="lg:col-span-2">
            <Card className="bg-card">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Tu perfil está al {profileCompleteness}%
                  </h2>
                  {/* Indicadores visuales compactos */}
                  <div className="flex items-center gap-1">
                    {tasks.map((task) => (
                      task.completed ? (
                        <CheckCircle key={task.id} className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle key={task.id} className="w-4 h-4 text-muted-foreground" />
                      )
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
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
                            ? 'bg-primary/10 border-l-4 border-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Circle className={`w-5 h-5 flex-shrink-0 ${isCurrentStep ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex-1">
                            <span className={`text-foreground ${isCurrentStep ? 'font-semibold' : ''}`}>
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {task.route && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/90 flex-shrink-0"
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
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4 lg:p-6">
                <h3 className="text-lg font-semibold mb-3 text-primary">💡 Tips para destacar</h3>
                <ul className="space-y-2 text-sm text-primary/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Un perfil completo recibe <strong>3x más vistas</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>El video de presentación aumenta tus posibilidades en <strong>70%</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Mantén tu experiencia actualizada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
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
      <div className="mb-6">
        <AcademyAffiliationCard />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Aplicá a roles que se ajusten a tus habilidades, intereses y experiencia
        </h1>
        <p className="text-muted-foreground">
          Usá los filtros para encontrar el puesto ideal para vos.
        </p>
      </div>

      {/* Ver Guardados Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/talent-dashboard/saved')}
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          Ver Guardados
        </Button>
      </div>

      {/* Filtros con FilterBar */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          type="opportunities"
          resultCount={filteredOpportunities.length}
          isLoading={opportunitiesLoading}
        />
      </div>

      {/* Lista de oportunidades */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No se encontraron oportunidades
              </h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar tus filtros o criterios de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <Card 
              key={opportunity.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.slug || opportunity.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Logo de la empresa */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border bg-muted">
                        {opportunity.companies?.logo_url ? (
                          <img 
                            src={opportunity.companies.logo_url} 
                            alt={opportunity.companies?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Título y empresa con fecha */}
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {opportunity.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {opportunity.companies?.name} ({getTimeAgo(opportunity.created_at)})
                          </p>
                        </div>

                        {/* Línea de estadísticas */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>
                              {(opportunity as any).views_count || 0} vista{(opportunity as any).views_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {(opportunity as any).applications_count || 0} postulante{(opportunity as any).applications_count !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Solo mostrar salario si es público */}
                          {(opportunity.salary_min || opportunity.salary_max) && 
                           (opportunity.salary_is_public !== false || hasApplied(opportunity.id)) && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <DollarSign className="h-4 w-4" />
                              {opportunity.salary_min && opportunity.salary_max
                                ? `${opportunity.currency || '$'}${opportunity.salary_min.toLocaleString()} - ${opportunity.currency || '$'}${opportunity.salary_max.toLocaleString()}`
                                : opportunity.salary_min
                                ? `${opportunity.currency || '$'}${opportunity.salary_min.toLocaleString()}`
                                : `${opportunity.currency || '$'}${opportunity.salary_max?.toLocaleString()}`
                              }
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {opportunity.category && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {opportunity.category}
                            </Badge>
                          )}
                          
                          {opportunity.type && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {opportunity.type}
                            </Badge>
                          )}
                          
                          {opportunity.location && (
                            <Badge 
                              variant="outline" 
                              className={`flex items-center gap-1 ${
                                opportunity.location.toLowerCase() === 'remoto' || 
                                opportunity.location.toLowerCase() === 'remote'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : ''
                              }`}
                            >
                              <MapPin className="h-3 w-3" />
                              {opportunity.location}
                            </Badge>
                          )}
                          
                          {opportunity.is_academy_exclusive && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Exclusivo Academia
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSave(opportunity.id, e)}
                      className={isOpportunitySaved(opportunity.id) ? 'text-primary border-primary' : ''}
                    >
                      <Bookmark className={`h-4 w-4 mr-1 ${isOpportunitySaved(opportunity.id) ? 'fill-current' : ''}`} />
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/talent-dashboard/opportunities/${opportunity.slug || opportunity.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver más
                    </Button>
                    {!hasApplied(opportunity.id) && (
                      <Button
                        size="sm"
                        onClick={(e) => handleApply(opportunity, e)}
                      >
                        Aplicar
                      </Button>
                    )}
                    {hasApplied(opportunity.id) && (
                      <Badge variant="secondary" className="py-1.5">
                        Ya aplicaste
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Application Modal */}
      {selectedOpportunity && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
          onApplicationSent={() => {
            setShowApplicationModal(false);
            setSelectedOpportunity(null);
          }}
        />
      )}

      {/* Profile Completeness Modal */}
      <ProfileCompletenessModal
        isOpen={showCompletenessModal}
        onClose={() => setShowCompletenessModal(false)}
      />
    </div>
  );
};

export default TalentDashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  DollarSign, 
  Search,
  Bookmark,
  Eye,
  Building,
  Tag,
  Users,
  GraduationCap
} from "lucide-react";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSupabaseAuth, isTalentRole } from "@/contexts/SupabaseAuthContext";
import { useAcademyAffiliations } from "@/hooks/useAcademyAffiliations";
import { toast } from "sonner";
import ApplicationModal from "@/components/ApplicationModal";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import FilterBar from "@/components/FilterBar";
import ProfileCompletenessModal from "@/components/ProfileCompletenessModal";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";
import { useDebounce } from "@/hooks/useDebounce";

interface FilterState {
  category?: string | string[];
  subcategory?: string;
  contractType?: string | string[];
  workMode?: string;
  location?: string;
  experience?: string | string[];
}

const TalentOpportunitiesSearch = () => {
  const { user, userRole } = useSupabaseAuth();
  const { 
    opportunities, 
    isLoading, 
    hasApplied
  } = useSupabaseOpportunities();
  
  // Obtener afiliaciones de academia del talento
  const { affiliations } = useAcademyAffiliations(user?.email);
  const academyIds = affiliations.map(a => a.academy_id);
  
  const navigate = useNavigate();
  const { completeness } = useProfileCompleteness();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showCompletenessModal, setShowCompletenessModal] = useState(false);
  
  // 🚀 OPTIMIZACIÓN: Debounce del término de búsqueda para evitar filtrados en cada tecla
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Cargar filtros guardados del localStorage al montar
  useEffect(() => {
    const savedFilters = localStorage.getItem('talent-opportunity-filters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        
        // Migrar valores antiguos de experience con mayúscula a minúscula
        if (parsed.experience) {
          if (Array.isArray(parsed.experience)) {
            parsed.experience = parsed.experience.map((exp: string) => exp.toLowerCase());
          } else if (typeof parsed.experience === 'string') {
            parsed.experience = [parsed.experience.toLowerCase()];
          }
        }
        
        setFilters(parsed);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }

    const savedSearch = localStorage.getItem('talent-opportunity-search');
    if (savedSearch) {
      setSearchTerm(savedSearch);
    }
  }, []);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('talent-opportunity-filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('talent-opportunity-search', searchTerm);
  }, [searchTerm]);

  // Función para manejar cambios de filtros
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Normalización y sinónimos para categorías
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const CATEGORY_SYNONYMS: Record<string, string[]> = {
    'ventas': ['ventas', 'comercial', 'sales', 'closer', 'cierre de ventas', 'cierre'],
    'marketing': ['marketing', 'media buyer', 'paid ads', 'performance marketing', 'digital marketing', 'paid media'],
    'creativo': ['creativo', 'diseño', 'design', 'creative'],
    'atencion-cliente': ['atencion al cliente', 'customer success', 'customer support', 'soporte al cliente'],
    'operaciones': ['operaciones', 'operations'],
    'tecnologia-automatizaciones': ['tecnologia', 'tecnología', 'technology', 'it', 'automatizaciones', 'automation', 'software'],
    'soporte-profesional': ['soporte profesional', 'recursos humanos', 'legal', 'finanzas', 'administracion', 'administración']
  };

  // Filtrar oportunidades según búsqueda y filtros
  const filteredOpportunities = opportunities?.filter(opportunity => {
    // CRÍTICO: Solo mostrar oportunidades activas (excluir paused, closed, draft)
    if (opportunity.status !== 'active') return false;

    // FILTRO DE OPORTUNIDADES EXCLUSIVAS DE ACADEMIA
    // Si la oportunidad es exclusiva de una academia, solo mostrar si el talento
    // es estudiante/graduado de ESA academia específica
    if (opportunity.is_academy_exclusive) {
      const isStudentOfThisAcademy = academyIds.includes(opportunity.company_id);
      if (!isStudentOfThisAcademy) {
        return false; // Ocultar oportunidades exclusivas de otras academias
      }
    }

    // Filtro de búsqueda por título, descripción y empresa (con debounce)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.description?.toLowerCase().includes(searchLower) ||
        opportunity.companies?.name?.toLowerCase().includes(searchLower) ||
        opportunity.requirements?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro de categoría (soporta múltiples categorías y sinónimos)
    if (filters.category) {
      const oppCatNorm = normalize(opportunity.category || '');
      const selectedCats = Array.isArray(filters.category) ? filters.category : [filters.category];
      const matchesCategory = selectedCats.some((cat) => {
        const synonyms = CATEGORY_SYNONYMS[cat] || [cat];
        return synonyms.some((syn) => oppCatNorm.includes(normalize(syn)));
      });
      if (!matchesCategory) return false;
    }

    // Filtro de subcategoría (comparación case-insensitive en descripción/requisitos)
    if (filters.subcategory) {
      const subcategoryLower = filters.subcategory.toLowerCase();
      const matchesSubcategory = 
        opportunity.title?.toLowerCase().includes(subcategoryLower) ||
        opportunity.description?.toLowerCase().includes(subcategoryLower) ||
        opportunity.requirements?.toLowerCase().includes(subcategoryLower);
      
      if (!matchesSubcategory) return false;
    }

    // Filtro de tipo de contrato (multi-selección)
    if (filters.contractType) {
      const selectedTypes = Array.isArray(filters.contractType) 
        ? filters.contractType 
        : [filters.contractType];
      
      if (selectedTypes.length > 0 && !selectedTypes.includes(opportunity.type)) {
        return false;
      }
    }

    // Filtro de modalidad de trabajo
    if (filters.workMode) {
      const oppLocation = opportunity.location?.toLowerCase() || '';
      const filterMode = filters.workMode.toLowerCase();
      
      if (filterMode === 'remote') {
        if (!oppLocation.includes('remoto') && !oppLocation.includes('remote')) return false;
      } else if (filterMode === 'onsite') {
        if (oppLocation.includes('remoto') || oppLocation.includes('remote')) return false;
      } else if (filterMode === 'hybrid') {
        if (!oppLocation.includes('híbrido') && !oppLocation.includes('hybrid')) return false;
      }
    }

    // Filtro de ubicación (Remoto-Mundial, Remoto-LATAM, etc.)
    if (filters.location) {
      const oppLocation = opportunity.location?.toLowerCase() || '';
      const filterLocation = filters.location.toLowerCase();
      
      if (!oppLocation.includes(filterLocation)) return false;
    }

    // Filtro de nivel de experiencia (multi-selección)
    if (filters.experience && Array.isArray(filters.experience) && filters.experience.length > 0) {
      const oppExperiences = (opportunity as any).experience_levels || [];
      
      // Si la oportunidad no tiene experience_levels definido, no filtrar
      if (oppExperiences.length === 0) return false;
      
      // Normalizar y comparar exactamente (sin includes)
      const normalizedOppExp = oppExperiences.map((e: string) => normalize(e));
      const normalizedFilterExp = filters.experience.map((e: string) => normalize(e));
      
      // Debug log (temporal)
      if (opportunity.title === 'Closer de Ventas') {
        console.log('🔍 Debug Filtro Experiencia:', {
          title: opportunity.title,
          oppExperiences,
          normalizedOppExp,
          filterExp: filters.experience,
          normalizedFilterExp
        });
      }
      
      const hasMatch = normalizedFilterExp.some(filterExp => 
        normalizedOppExp.includes(filterExp)
      );
      
      if (!hasMatch) return false;
    }

    return true;
  }).sort((a, b) => {
    // Ordenar por fecha de publicación (más reciente primero)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) || [];

  // Manejar aplicación a oportunidad
  const handleApply = async (opportunity: any) => {
    if (!user || !isTalentRole(userRole)) {
      toast.error('Solo los talentos pueden aplicar a oportunidades');
      return;
    }

    if (hasApplied(opportunity.id)) {
      toast.info('Ya has aplicado a esta oportunidad');
      return;
    }

    // 🚨 VALIDACIÓN: Verificar que el perfil esté 100% completo
    if (completeness < 100) {
      console.log('⚠️ Perfil incompleto, mostrando modal:', { completeness });
      setSelectedOpportunity(opportunity);
      setShowCompletenessModal(true);
      return;
    }

    // Perfil completo, abrir modal de aplicación
    setSelectedOpportunity(opportunity);
    setShowApplicationModal(true);
  };

  const handleApplicationSent = () => {
    setShowApplicationModal(false);
    setSelectedOpportunity(null);
    window.location.reload();
  };

  const { saveOpportunity, isOpportunitySaved } = useSavedOpportunities();

  const handleSave = async (opportunityId: string) => {
    if (isOpportunitySaved(opportunityId)) {
      toast.info('Esta oportunidad ya está guardada');
      return;
    }
    
    try {
      await saveOpportunity(opportunityId);
      toast.success('Oportunidad guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar oportunidad');
    }
  };

  // Obtener tiempo transcurrido
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Aplicá a roles que se ajusten a tus habilidades, intereses y experiencia
        </h1>
        <p className="text-gray-600">
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
          isLoading={isLoading}
        />
      </div>

      {/* Lista de oportunidades */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron oportunidades
              </h3>
              <p className="text-gray-600 mb-4">
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
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {opportunity.companies?.logo_url ? (
                          <img 
                            src={opportunity.companies.logo_url} 
                            alt={opportunity.companies?.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Título y empresa con fecha */}
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {opportunity.title}
                          </h3>
                          <p className="text-gray-600">
                            {opportunity.companies?.name} ({getTimeAgo(opportunity.created_at)})
                          </p>
                        </div>

                        {/* Línea de estadísticas: postulantes y vistas */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {(opportunity as any).applications_count || 0} postulante{(opportunity as any).applications_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>
                              {(opportunity as any).views_count || 0} vista{(opportunity as any).views_count !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {(opportunity.salary_min || opportunity.salary_max) && (
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

                        {/* Badges: Categoría, Modalidad, Ubicación, Exclusividad */}
                        <div className="flex flex-wrap gap-2">
                          {/* Badge de categoría */}
                          {opportunity.category && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {opportunity.category}
                            </Badge>
                          )}
                          
                          {/* Badge de modalidad (tipo de contrato) - sin color */}
                          {opportunity.type && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {opportunity.type}
                            </Badge>
                          )}
                          
                          {/* Badge de ubicación - celeste si remoto, gris si no */}
                          {opportunity.location && (
                            <Badge 
                              variant="outline" 
                              className={`flex items-center gap-1 ${
                                opportunity.location.toLowerCase().includes('remoto') || opportunity.location.toLowerCase().includes('remote')
                                  ? 'bg-sky-100 text-sky-700 border-sky-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              <MapPin className="h-3 w-3" />
                              {opportunity.location.toLowerCase().includes('remoto') || opportunity.location.toLowerCase().includes('remote') 
                                ? 'Remoto' 
                                : opportunity.location.split(',').pop()?.trim() || opportunity.location.split('-').pop()?.trim() || 'Presencial'
                              }
                            </Badge>
                          )}
                          
                          {/* Badge de exclusividad de academia */}
                          {opportunity.is_academy_exclusive && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Exclusiva
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(opportunity.id);
                      }}
                      disabled={isOpportunitySaved(opportunity.id)}
                      className="flex items-center gap-2"
                    >
                      <Bookmark className={`h-4 w-4 ${isOpportunitySaved(opportunity.id) ? 'fill-current' : ''}`} />
                      {isOpportunitySaved(opportunity.id) ? 'Guardada' : 'Guardar'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/talent-dashboard/opportunities/${opportunity.id}`);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver más
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(opportunity);
                      }}
                      disabled={hasApplied(opportunity.id)}
                      className="flex items-center gap-2"
                    >
                      {hasApplied(opportunity.id) ? '✓ Aplicado' : 'Aplicar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de completitud de perfil */}
      {showCompletenessModal && (
        <ProfileCompletenessModal
          isOpen={showCompletenessModal}
          onClose={() => {
            setShowCompletenessModal(false);
            setSelectedOpportunity(null);
          }}
          minCompletenessRequired={100}
        />
      )}

      {/* Modal de aplicación */}
      {showApplicationModal && selectedOpportunity && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
          onApplicationSent={handleApplicationSent}
        />
      )}
    </div>
  );
};

export default TalentOpportunitiesSearch;

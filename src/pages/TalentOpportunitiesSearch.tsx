import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Search,
  Bookmark,
  Eye,
  Building,
  Tag
} from "lucide-react";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSupabaseAuth, isTalentRole } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import ApplicationModal from "@/components/ApplicationModal";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import FilterBar from "@/components/FilterBar";

interface FilterState {
  category?: string;
  subcategory?: string;
  contractType?: string;
  workMode?: string;
  location?: string;
  experience?: string;
  salaryRange?: number[];
  skills?: string[];
}

const TalentOpportunitiesSearch = () => {
  const { user, userRole } = useSupabaseAuth();
  const { 
    opportunities, 
    isLoading, 
    hasApplied
  } = useSupabaseOpportunities();
  
  const navigate = useNavigate();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // Cargar filtros guardados del localStorage al montar
  useEffect(() => {
    const savedFilters = localStorage.getItem('talent-opportunity-filters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
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

  // Filtrar oportunidades según búsqueda y filtros
  const filteredOpportunities = opportunities?.filter(opportunity => {
    // Filtro de búsqueda por título, descripción y empresa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.description?.toLowerCase().includes(searchLower) ||
        opportunity.companies?.name?.toLowerCase().includes(searchLower) ||
        opportunity.requirements?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro de categoría (comparación case-insensitive)
    if (filters.category) {
      const oppCategory = opportunity.category?.toLowerCase() || '';
      const filterCategory = filters.category.toLowerCase();
      if (oppCategory !== filterCategory) return false;
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

    // Filtro de tipo de contrato
    if (filters.contractType && opportunity.type !== filters.contractType) return false;

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

    // Filtro de nivel de experiencia
    if (filters.experience) {
      // Aquí puedes implementar la lógica de experiencia cuando esté disponible en la BD
      // Por ahora, permitimos todas las oportunidades
    }

    // Filtro de rango salarial
    if (filters.salaryRange && Array.isArray(filters.salaryRange) && filters.salaryRange.length === 2) {
      const [minSalary, maxSalary] = filters.salaryRange;
      if (minSalary !== undefined && maxSalary !== undefined && opportunity.salary_min && opportunity.salary_max) {
        // Verificar que haya al menos alguna superposición en el rango
        if (opportunity.salary_max < minSalary * 1000 || opportunity.salary_min > maxSalary * 1000) {
          return false;
        }
      }
    }

    // Filtro de skills/tags
    if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
      // Buscar en título, descripción o requisitos
      const hasMatchingSkill = filters.skills.some((skill: string) => {
        const skillLower = skill.toLowerCase();
        return (
          opportunity.title?.toLowerCase().includes(skillLower) ||
          opportunity.description?.toLowerCase().includes(skillLower) ||
          opportunity.requirements?.toLowerCase().includes(skillLower)
        );
      });
      
      if (!hasMatchingSkill) return false;
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 Buscar Oportunidades
        </h1>
        <p className="text-gray-600">
          Encuentra la oportunidad perfecta para tu perfil profesional
        </p>
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
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
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
                        {/* Título y empresa */}
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {opportunity.title}
                          </h3>
                          <p className="text-gray-600">
                            {opportunity.companies?.name}
                          </p>
                        </div>

                        {/* Metadatos */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {getTimeAgo(opportunity.created_at)}
                          </div>
                          
                          {opportunity.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {opportunity.location}
                            </div>
                          )}

                          {opportunity.type && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {opportunity.type}
                            </div>
                          )}

                          {(opportunity.salary_min || opportunity.salary_max) && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <DollarSign className="h-4 w-4" />
                              {opportunity.salary_min && opportunity.salary_max
                                ? `${opportunity.currency || '$'}${opportunity.salary_min.toLocaleString()} - ${opportunity.currency || '$'}${opportunity.salary_max.toLocaleString()}`
                                : opportunity.salary_min
                                ? `Desde ${opportunity.currency || '$'}${opportunity.salary_min.toLocaleString()}`
                                : `Hasta ${opportunity.currency || '$'}${opportunity.salary_max?.toLocaleString()}`
                              }
                            </div>
                          )}
                        </div>

                        {/* Badges de categoría y skills */}
                        <div className="flex flex-wrap gap-2">
                          {opportunity.category && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {opportunity.category}
                            </Badge>
                          )}
                          {opportunity.type && (
                            <Badge variant="outline">
                              {opportunity.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSave(opportunity.id)}
                      disabled={isOpportunitySaved(opportunity.id)}
                      className="flex items-center gap-2"
                    >
                      <Bookmark className={`h-4 w-4 ${isOpportunitySaved(opportunity.id) ? 'fill-current' : ''}`} />
                      {isOpportunitySaved(opportunity.id) ? 'Guardada' : 'Guardar'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver más
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApply(opportunity)}
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

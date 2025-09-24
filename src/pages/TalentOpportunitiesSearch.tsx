import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Filter,
  Bookmark,
  Eye,
  Building
} from 'lucide-react';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import TalentTopNavigation from '@/components/TalentTopNavigation';
import ApplicationModal from '@/components/ApplicationModal';

interface FilterState {
  category: string;
  contractType: string;
  experienceLevel: string;
  location: string;
  skills: string[];
  showSalary: boolean;
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
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    contractType: '',
    experienceLevel: '',
    location: '',
    skills: [],
    showSalary: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // Cargar filtros guardados del localStorage
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

  // Guardar filtros en localStorage
  const saveFilters = useCallback(() => {
    localStorage.setItem('talent-opportunity-filters', JSON.stringify(filters));
    localStorage.setItem('talent-opportunity-search', searchTerm);
  }, [filters, searchTerm]);

  // Guardar filtros cuando cambien
  useEffect(() => {
    saveFilters();
  }, [saveFilters]);

  // Categorías disponibles
  const categories = [
    'Ventas',
    'Marketing', 
    'Atención al Cliente',
    'Operaciones',
    'Creativo',
    'Tecnología',
    'Soporte Profesional'
  ];

  // Tipos de contrato
  const contractTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'commission', label: 'Por Comisión' },
    { value: 'fixed-commission', label: 'Fijo + Comisión' }
  ];

  // Niveles de experiencia
  const experienceLevels = [
    { value: 'beginner', label: 'Principiante (0-1 año)' },
    { value: 'intermediate', label: 'Intermedio (1-3 años)' },
    { value: 'advanced', label: 'Avanzado (3-6 años)' },
    { value: 'expert', label: 'Experto (+6 años)' }
  ];

  // Ubicaciones
  const locations = [
    'Remoto - Mundial',
    'Remoto - LATAM', 
    'Presencial',
    'Híbrido'
  ];

  // Filtrar oportunidades
  const filteredOpportunities = opportunities?.filter(opportunity => {
    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        opportunity.title?.toLowerCase().includes(searchLower) ||
        opportunity.description?.toLowerCase().includes(searchLower) ||
        opportunity.companies?.name?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por categoría
    if (filters.category && opportunity.category !== filters.category) {
      return false;
    }

    // Filtro por tipo de contrato
    if (filters.contractType && opportunity.type !== filters.contractType) {
      return false;
    }

    // Filtro por ubicación
    if (filters.location) {
      const isRemote = opportunity.location?.toLowerCase().includes('remoto');
      if (filters.location === 'Remoto - Mundial' && !isRemote) {
        return false;
      }
      if (filters.location === 'Presencial' && isRemote) {
        return false;
      }
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
    // Refrescar la lista de oportunidades para actualizar el estado de aplicado
    window.location.reload();
  };

  // TODO: Implementar funcionalidad de guardar oportunidades
  const handleSave = async (_opportunityId: string) => {
    toast.info('Funcionalidad de guardado próximamente disponible');
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      category: '',
      contractType: '',
      experienceLevel: '',
      location: '',
      skills: [],
      showSalary: false
    });
    setSearchTerm('');
    localStorage.removeItem('talent-opportunity-filters');
    localStorage.removeItem('talent-opportunity-search');
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
      <div className="min-h-screen bg-gray-50">
        <TalentTopNavigation />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Buscar Oportunidades
          </h1>
          <p className="text-gray-600">
            Encuentra la oportunidad perfecta para tu perfil profesional
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descripción o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de contrato
                  </label>
                  <Select
                    value={filters.contractType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, contractType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      {contractTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las ubicaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las ubicaciones</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel de experiencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experiencia
                  </label>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los niveles</SelectItem>
                      {experienceLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showSalary"
                    checked={filters.showSalary}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, showSalary: checked as boolean }))
                    }
                  />
                  <label htmlFor="showSalary" className="text-sm text-gray-700">
                    Solo mostrar oportunidades con salario público
                  </label>
                </div>
                <Button variant="ghost" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredOpportunities.length} oportunidades encontradas
          </p>
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
                <Button onClick={clearFilters}>
                  Limpiar filtros
                </Button>
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
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
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

                        <div className="flex-1">
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
                                {contractTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}
                              </div>
                            )}

                            {(opportunity.salary_min || opportunity.salary_max) && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {opportunity.salary_min && opportunity.salary_max
                                  ? `$${opportunity.salary_min.toLocaleString()} - $${opportunity.salary_max.toLocaleString()}`
                                  : opportunity.salary_min
                                  ? `Desde $${opportunity.salary_min.toLocaleString()}`
                                  : `Hasta $${opportunity.salary_max?.toLocaleString()}`
                                }
                                {opportunity.currency && ` ${opportunity.currency}`}
                              </div>
                            )}
                          </div>

                          {/* Categoría */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {opportunity.category && (
                              <Badge variant="secondary">
                                {opportunity.category}
                              </Badge>
                            )}
                          </div>

                          {/* Descripción */}
                          {opportunity.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {opportunity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(opportunity.id)}
                        className="flex items-center gap-2"
                      >
                        <Bookmark className="h-4 w-4" />
                        Guardar
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleApply(opportunity)}
                        disabled={hasApplied(opportunity.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {hasApplied(opportunity.id) ? 'Ya aplicaste' : 'Aplicar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de aplicación */}
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          opportunity={selectedOpportunity}
          onApplicationSent={handleApplicationSent}
        />
      </div>
    </div>
  );
};

export default TalentOpportunitiesSearch;

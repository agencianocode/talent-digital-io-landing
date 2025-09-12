import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MapPin, Briefcase, DollarSign, Clock, Calendar, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseOpportunities } from '@/hooks/useSupabaseOpportunities';
import { useSavedOpportunities } from '@/hooks/useSavedOpportunities';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location?: string;
  type: string;
  category: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  created_at: string;
  company_id: string;
  companies: {
    name: string;
    logo_url?: string;
  };
}

const TalentMarketplace = () => {
  const navigate = useNavigate();
  const { user, userRole } = useSupabaseAuth();
  const { 
    opportunities, 
    isLoading, 
    applyToOpportunity, 
    hasApplied,
    getApplicationStatus 
  } = useSupabaseOpportunities();
  
  const {
    saveOpportunity,
    unsaveOpportunity,
    isOpportunitySaved
  } = useSavedOpportunities();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [applying, setApplying] = useState<string | null>(null);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('talentMarketplaceFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setSearchTerm(filters.searchTerm || '');
      setCategoryFilter(filters.categoryFilter || '');
      setSubcategoryFilter(filters.subcategoryFilter || '');
      setTypeFilter(filters.typeFilter || '');
      setLocationFilter(filters.locationFilter || '');
      setSortBy(filters.sortBy || 'date');
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchTerm,
      categoryFilter,
      subcategoryFilter,
      typeFilter,
      locationFilter,
      sortBy
    };
    localStorage.setItem('talentMarketplaceFilters', JSON.stringify(filters));
  }, [searchTerm, categoryFilter, subcategoryFilter, typeFilter, locationFilter, sortBy]);

  // Job categories with subcategories
  const jobCategories = {
    'Ventas': [
      'Closer de ventas',
      'SDR / Vendedor remoto', 
      'Appointment Setter',
      'Triage',
      'Director comercial'
    ],
    'Marketing': [
      'Media Buyer',
      'Marketing Expert', 
      'Content Specialist',
      'Editor de video'
    ],
    'Operaciones': [
      'Asistente Operativo',
      'Asistente Personal Virtual',
      'Project Manager', 
      'Experto en Automatizaciones'
    ],
    'Fulfillment': [
      'CSM',
      'Atención al cliente'
    ],
    'Desarrollo': [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer'
    ],
    'Diseño': [
      'UI/UX Designer', 
      'Graphic Designer',
      'Web Designer'
    ]
  };

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Por Contrato' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'commission', label: 'Por Comisión' },
    { value: 'project', label: 'Por Proyecto' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Sin experiencia (0-1 años)' },
    { value: 'junior', label: 'Junior (1-3 años)' },
    { value: 'mid', label: 'Mid-level (3-6 años)' },
    { value: 'senior', label: 'Senior (6+ años)' }
  ];

  const locations = [
    { value: 'remote-global', label: 'Remoto - Mundial' },
    { value: 'remote-latam', label: 'Remoto - LATAM' },
    { value: 'mexico', label: 'México' },
    { value: 'colombia', label: 'Colombia' },
    { value: 'argentina', label: 'Argentina' },
    { value: 'chile', label: 'Chile' },
    { value: 'peru', label: 'Perú' }
  ];

  // Get subcategories for selected category
  const availableSubcategories = categoryFilter ? (jobCategories[categoryFilter as keyof typeof jobCategories] || []) : [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (categoryFilter && !availableSubcategories.includes(subcategoryFilter)) {
      setSubcategoryFilter('');
    }
  }, [categoryFilter, subcategoryFilter, availableSubcategories]);

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = opportunities
    .filter(opportunity => {
      // Search filter
      if (searchTerm && !opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !opportunity.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !opportunity.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryFilter && opportunity.category !== categoryFilter) {
        return false;
      }

      // Subcategory filter
      if (subcategoryFilter && !opportunity.title.toLowerCase().includes(subcategoryFilter.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter && opportunity.type !== typeFilter) {
        return false;
      }

      // Location filter
      if (locationFilter && opportunity.location && !opportunity.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'salary':
          const aSalary = a.salary_max || a.salary_min || 0;
          const bSalary = b.salary_max || b.salary_min || 0;
          return bSalary - aSalary;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleApply = async (opportunityId: string) => {
    if (!user || !isTalentRole(userRole)) {
      toast.error('Solo los talentos pueden aplicar a oportunidades');
      return;
    }

    if (hasApplied(opportunityId)) {
      toast.error('Ya has aplicado a esta oportunidad');
      return;
    }

    setApplying(opportunityId);
    try {
      await applyToOpportunity(opportunityId, '');
      toast.success('¡Aplicación enviada exitosamente!');
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Error al enviar la aplicación');
    } finally {
      setApplying(null);
    }
  };

  const handleSaveToggle = async (opportunityId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar oportunidades');
      return;
    }

    try {
      if (isOpportunitySaved(opportunityId)) {
        await unsaveOpportunity(opportunityId);
        toast.success('Oportunidad removida de guardados');
      } else {
        await saveOpportunity(opportunityId);
        toast.success('Oportunidad guardada');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Error al guardar/remover oportunidad');
    }
  };

  if (!isTalentRole(userRole)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los talentos pueden acceder a esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Explorar Oportunidades</h1>
          <p className="text-muted-foreground">
            {filteredAndSortedOpportunities.length} oportunidades disponibles
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Más recientes</SelectItem>
              <SelectItem value="salary">Salario</SelectItem>
              <SelectItem value="title">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por título, empresa, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {Object.keys(jobCategories).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {jobTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Ubicación"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      {(searchTerm || categoryFilter || typeFilter || locationFilter) && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setSubcategoryFilter('');
              setTypeFilter('');
              setLocationFilter('');
              setSortBy('date');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      )}

      {/* Opportunities List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedOpportunities.map((opportunity) => {
          const applied = hasApplied(opportunity.id);
          const saved = isOpportunitySaved(opportunity.id);
          const applicationStatus = getApplicationStatus(opportunity.id);

          return (
            <Card key={opportunity.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {opportunity.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{opportunity.companies?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location || 'Ubicación no especificada'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(opportunity.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveToggle(opportunity.id)}
                    className="ml-2"
                  >
                    <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {opportunity.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {opportunity.type}
                  </Badge>
                  {opportunity.salary_min && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${opportunity.salary_min.toLocaleString()}
                      {opportunity.salary_max && ` - $${opportunity.salary_max.toLocaleString()}`}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {opportunity.description}
                </p>

                {/* Application Status */}
                {applied && applicationStatus && (
                  <div className="mb-3">
                    <ApplicationStatusBadge status={applicationStatus as "pending" | "reviewed" | "accepted" | "rejected"} />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {!applied ? (
                      <Button 
                        onClick={() => handleApply(opportunity.id)}
                        disabled={applying === opportunity.id}
                        className="flex-1"
                        size="sm"
                      >
                        {applying === opportunity.id ? 'Aplicando...' : 'Aplicar'}
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled className="flex-1" size="sm">
                        Aplicado
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.id}`)}
                    >
                      Ver más
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedOpportunities.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {opportunities.length === 0 ? 'No hay oportunidades disponibles' : 'No se encontraron oportunidades'}
          </h3>
          <p className="text-muted-foreground">
            {opportunities.length === 0 
              ? 'Las empresas pronto publicarán nuevas oportunidades. ¡Mantente atento!'
              : 'Intenta ajustar tus filtros de búsqueda'
            }
          </p>
          {opportunities.length === 0 && (
            <Button 
              className="mt-4"
              onClick={() => navigate('/talent-dashboard/home')}
            >
              Volver al Dashboard
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TalentMarketplace;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Search, MapPin, Clock, DollarSign, Briefcase, Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";

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
  company_id: string;
  companies: {
    name: string;
    logo_url?: string;
  };
}

const TalentMarketplace = () => {
  const navigate = useNavigate();
  const { user, userRole, isAuthenticated } = useSupabaseAuth();
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
    isOpportunitySaved,
    savedOpportunities,
    isLoading: savedLoading
  } = useSavedOpportunities();



  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [applying, setApplying] = useState<string | null>(null);

  // Job categories with subcategories (same as OpportunitiesPage)
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
    { value: 'freelance', label: 'Freelance' }
  ];

  // Get subcategories for selected category
  const availableSubcategories = categoryFilter ? (jobCategories[categoryFilter as keyof typeof jobCategories] || []) : [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (categoryFilter && categoryFilter !== "all" && !availableSubcategories.includes(subcategoryFilter)) {
      setSubcategoryFilter("all");
    }
  }, [categoryFilter, subcategoryFilter, availableSubcategories]);

  // Apply all filters
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" || opp.category === categoryFilter;
    const matchesSubcategory = !subcategoryFilter || subcategoryFilter === "all" || opp.title.toLowerCase().includes(subcategoryFilter.toLowerCase());
    const matchesType = !typeFilter || typeFilter === "all" || opp.type === typeFilter;
    const matchesLocation = !locationFilter || 
      (opp.location && opp.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesType && matchesLocation;
  });

  const handleApply = async (opportunityId: string) => {
    if (!user || userRole !== 'talent') {
      toast.error('Solo los talentos pueden aplicar a oportunidades');
      return;
    }

    if (hasApplied(opportunityId)) {
      toast.error('Ya has aplicado a esta oportunidad');
      return;
    }

    setApplying(opportunityId);
    try {
      await applyToOpportunity(opportunityId, ''); // Cover letter can be added later
      toast.success('¡Aplicación enviada exitosamente!');
    } catch (error) {
      console.error('Error applying to opportunity:', error);
      toast.error('Error al enviar la aplicación. Intenta de nuevo.');
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

  if (userRole !== 'talent') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los talentos pueden acceder a esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
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
    <div className="p-8">
      {/* Header with advanced filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">
            Marketplace de Oportunidades ({filteredOpportunities.length})
          </h1>

        </div>

        {/* Advanced Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar oportunidades, empresas..."
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
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.keys(jobCategories).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categoryFilter && (
            <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especialidades</SelectItem>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Ubicación (ej: Remoto, CDMX...)"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="max-w-xs"
          />
          
          {(categoryFilter && categoryFilter !== "all" || subcategoryFilter && subcategoryFilter !== "all" || typeFilter && typeFilter !== "all" || locationFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setCategoryFilter("all");
                setSubcategoryFilter("all");
                setTypeFilter("all");
                setLocationFilter("");
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>
      
      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {opportunities.length === 0 ? 'No hay oportunidades disponibles' : 'No se encontraron oportunidades'}
          </h3>
          <p className="text-muted-foreground">
            {opportunities.length === 0 
              ? 'Las empresas pronto publicarán nuevas oportunidades'
              : 'Intenta con otros términos de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-secondary p-6 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {opportunity.title}
                    </h3>
                    <Badge variant="secondary">
                      {opportunity.category}
                    </Badge>
                    {jobTypes.find(t => t.value === opportunity.type) && (
                      <Badge variant="outline">
                        {jobTypes.find(t => t.value === opportunity.type)?.label}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span className="font-medium text-foreground">
                      {opportunity.companies?.name}
                    </span>
                    {opportunity.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{opportunity.type}</span>
                    </div>
                    {opportunity.salary_min && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          ${opportunity.salary_min.toLocaleString()}
                          {opportunity.salary_max && 
                            ` - $${opportunity.salary_max.toLocaleString()}`
                          } {opportunity.currency || 'USD'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-foreground mb-4 line-clamp-3">
                    {opportunity.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleSaveToggle(opportunity.id)}
                    className="mb-2"
                    title={isOpportunitySaved(opportunity.id) ? "Remover de guardados" : "Guardar oportunidad"}
                  >
                    {isOpportunitySaved(opportunity.id) ? (
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    ) : (
                      <HeartOff className="h-5 w-5" />
                    )}
                  </Button>

                  
                  {hasApplied(opportunity.id) ? (
                    <Badge variant="secondary" className="min-w-[120px] justify-center">
                      {getApplicationStatus(opportunity.id) === 'pending' && 'En Revisión'}
                      {getApplicationStatus(opportunity.id) === 'accepted' && 'Aceptado'}
                      {getApplicationStatus(opportunity.id) === 'rejected' && 'Rechazado'}
                    </Badge>
                  ) : (
                    <Button 
                      onClick={() => handleApply(opportunity.id)}
                      disabled={applying === opportunity.id}
                      className="min-w-[120px]"
                    >
                      {applying === opportunity.id ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.id}`)}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentMarketplace;

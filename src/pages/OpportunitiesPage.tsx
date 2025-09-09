import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabaseOpportunities } from "@/hooks/useSupabaseOpportunities";
import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Search, Filter, Eye, Edit, Link, MoreHorizontal, Briefcase, Users, Copy, Trash2, Archive, Share2 } from "lucide-react";
import { toast } from "sonner";
import StaticShareButton from '@/components/StaticShareButton';

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();
  const { activeCompany, canCreateOpportunities, hasPermission } = useCompany();
  const { 
    opportunities, 
    isLoading, 
    getApplicationsByOpportunity,
    deleteOpportunity,
    toggleOpportunityStatus
  } = useSupabaseOpportunities();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});

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
    { value: 'freelance', label: 'Freelance' }
  ];

  // Filter opportunities by company (business users only see their own)
  const companyOpportunities = opportunities.filter(opp => 
    !activeCompany || opp.company_id === activeCompany.id
  );

  // Apply search and filters
  const filteredOpportunities = companyOpportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" || opp.category === categoryFilter;
    const matchesType = !typeFilter || typeFilter === "all" || opp.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Load application counts for each opportunity
  useEffect(() => {
    const loadApplicationCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const opp of companyOpportunities) {
        try {
          const applications = await getApplicationsByOpportunity(opp.id);
          counts[opp.id] = applications.length;
        } catch (error) {
          console.error(`Error loading applications for ${opp.id}:`, error);
          counts[opp.id] = 0;
        }
      }
      
      setApplicationCounts(counts);
    };

    if (companyOpportunities.length > 0) {
      loadApplicationCounts();
    }
  }, [companyOpportunities.length]); // Only depend on length, not the full array

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  // Funciones para manejar las acciones de los botones
  const handleViewOpportunity = (opportunityId: string) => {
    navigate(`/business-dashboard/opportunities/${opportunityId}`);
  };

  const handleEditOpportunity = (opportunityId: string) => {
    navigate(`/business-dashboard/opportunities/${opportunityId}/edit`);
  };

  const handleShareOpportunity = (opportunityId: string) => {
    // This will be handled by the ShareOpportunity component
    console.log('Share opportunity:', opportunityId);
  };

  const handleCopyOpportunity = (opportunityId: string) => {
    // Aquí podrías implementar la lógica para duplicar una oportunidad
    toast.success('Funcionalidad de duplicar próximamente');
  };

  const handleArchiveOpportunity = async (opportunityId: string) => {
    try {
      // Por ahora, archivar es lo mismo que desactivar
      await toggleOpportunityStatus(opportunityId, true);
      toast.success('Oportunidad archivada');
    } catch (error) {
      toast.error('Error al archivar la oportunidad');
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad? Esta acción no se puede deshacer.')) {
      try {
        await deleteOpportunity(opportunityId);
        toast.success('Oportunidad eliminada');
      } catch (error) {
        toast.error('Error al eliminar la oportunidad');
      }
    }
  };

  const handleToggleStatus = async (opportunityId: string, currentStatus: boolean) => {
    try {
      await toggleOpportunityStatus(opportunityId, currentStatus);
      const newStatus = !currentStatus;
      toast.success(`Oportunidad ${newStatus ? 'activada' : 'desactivada'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado de la oportunidad');
    }
  };

  if (!isBusinessRole(userRole)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los usuarios de empresa pueden acceder a esta página.</p>
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header with advanced filters */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Mis Oportunidades ({filteredOpportunities.length})
          </h1>
          <div className="flex items-center space-x-2">
            {canCreateOpportunities() && (
              <Button 
                onClick={() => navigate('/business-dashboard/opportunities/new')}
                className="font-semibold w-full sm:w-auto"
              >
                Publicar Oportunidad
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar oportunidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todas las categorías" />
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tipo de trabajo" />
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
      </div>
      
      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {companyOpportunities.length === 0 ? 'No tienes oportunidades publicadas' : 'No se encontraron oportunidades'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {companyOpportunities.length === 0 
              ? 'Publica tu primera oportunidad para empezar a recibir aplicaciones'
              : 'Intenta con otros términos de búsqueda o filtros'
            }
          </p>
          {companyOpportunities.length === 0 && canCreateOpportunities() && (
            <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
              Publicar Primera Oportunidad
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-card p-4 lg:p-6 rounded-lg border">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-foreground w-full sm:w-auto">
                      {opportunity.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={getStatusBadgeClass(opportunity.is_active)}
                    >
                      {opportunity.is_active ? 'ACTIVA' : 'INACTIVA'}
                    </Badge>
                    <Badge variant="outline">
                      {opportunity.category}
                    </Badge>
                    <Badge variant="outline">
                      {jobTypes.find(t => t.value === opportunity.type)?.label || opportunity.type}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {opportunity.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    {opportunity.location && (
                      <span>📍 {opportunity.location}</span>
                    )}
                    {opportunity.salary_min && (
                      <span>
                        💰 ${opportunity.salary_min.toLocaleString()}
                        {opportunity.salary_max && ` - $${opportunity.salary_max.toLocaleString()}`}
                        {` ${opportunity.currency || 'USD'}`}
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className={applicationCounts[opportunity.id] > 0 ? "font-semibold text-green-600" : ""}>
                        {applicationCounts[opportunity.id] || 0} postulantes
                      </span>
                      {applicationCounts[opportunity.id] > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 text-xs">
                          Nuevas
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Application count with link */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                    <Button
                      variant={applicationCounts[opportunity.id] > 0 ? "default" : "outline"}
                      size="sm"
                      onClick={() => navigate(`/business-dashboard/applications?opportunity=${opportunity.id}`)}
                      className={`text-xs w-full sm:w-auto ${applicationCounts[opportunity.id] > 0 ? "bg-green-600 hover:bg-green-700" : ""}`}
                    >
                      Ver Aplicaciones ({applicationCounts[opportunity.id] || 0})
                      {applicationCounts[opportunity.id] > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-white text-green-600 text-xs">
                          {applicationCounts[opportunity.id]}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleViewOpportunity(opportunity.id)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {hasPermission('admin') && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEditOpportunity(opportunity.id)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <StaticShareButton 
                    opportunityId={opportunity.id}
                    opportunityTitle={opportunity.title}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        title="Más opciones"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {hasPermission('admin') && (
                        <>
                          <DropdownMenuItem onClick={() => handleCopyOpportunity(opportunity.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(opportunity.id, opportunity.is_active)}>
                            <Archive className="h-4 w-4 mr-2" />
                            {opportunity.is_active ? 'Desactivar' : 'Activar'}
                          </DropdownMenuItem>
                        </>
                      )}
                      {hasPermission('owner') && (
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOpportunity(opportunity.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import AdminOpportunityFilters from '@/components/admin/AdminOpportunityFilters';
import AdminOpportunityDetail from '@/components/admin/AdminOpportunityDetail';
import { useAdminOpportunities } from '@/hooks/useAdminOpportunities';

interface AdminOpportunityModerationProps {
  companyFilterId?: string | null;
}

const AdminOpportunityModeration: React.FC<AdminOpportunityModerationProps> = ({ companyFilterId }) => {
  const {
    opportunities,
    allOpportunities,
    filteredOpportunities,
    companies,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch
  } = useAdminOpportunities();

  // Apply company filter when provided
  React.useEffect(() => {
    if (companyFilterId) {
      updateFilters({ companyFilter: companyFilterId });
    }
  }, [companyFilterId]);

  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewOpportunity = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOpportunityId(null);
  };

  const handleOpportunityUpdate = () => {
    refetch();
  };

  const handleRefresh = async () => {
    toast.loading('Actualizando oportunidades...', { id: 'refresh-opportunities' });
    await refetch();
    toast.success('Oportunidades actualizadas correctamente', { id: 'refresh-opportunities' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      case 'closed':
        return <Badge variant="destructive">Cerrada</Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      case 'review-required':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Revisión Requerida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-100 text-green-800">Baja</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      ventas: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      'atencion-cliente': 'bg-purple-100 text-purple-800',
      operaciones: 'bg-orange-100 text-orange-800',
      creativo: 'bg-pink-100 text-pink-800',
      tecnologia: 'bg-indigo-100 text-indigo-800',
      'soporte-profesional': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="secondary" className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
  };

  const getContractTypeBadge = (contractType: string) => {
    const contractColors: Record<string, string> = {
      'full-time': 'bg-blue-100 text-blue-800',
      'Tiempo Completo': 'bg-blue-100 text-blue-800',
      'Trabajo Continuo': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'Medio Tiempo': 'bg-green-100 text-green-800',
      'freelance': 'bg-purple-100 text-purple-800',
      'Freelance': 'bg-purple-100 text-purple-800',
      'commission': 'bg-orange-100 text-orange-800',
      'Por Comisión': 'bg-orange-100 text-orange-800',
      'A Comisión': 'bg-orange-100 text-orange-800',
      'Contrato': 'bg-teal-100 text-teal-800',
      'fixed-commission': 'bg-pink-100 text-pink-800'
    };

    // Traducir tipos de contrato en inglés
    const contractLabels: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'freelance': 'Freelance',
      'commission': 'Por Comisión',
      'fixed-commission': 'Por Comisión Fija'
    };

    const displayLabel = contractLabels[contractType] || contractType;

    return (
      <Badge variant="outline" className={contractColors[contractType] || contractColors[displayLabel] || 'bg-gray-100 text-gray-800'}>
        {displayLabel}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error al cargar oportunidades</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Moderación de Oportunidades</h2>
          <p className="text-sm text-muted-foreground">
            Administra y modera todas las oportunidades publicadas
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <AdminOpportunityFilters
        filters={filters}
        onFiltersChange={updateFilters}
        totalOpportunities={allOpportunities.length}
        filteredCount={filteredOpportunities.length}
        isLoading={isLoading}
        companies={companies}
      />

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Lista de Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron oportunidades</h3>
              <p className="text-muted-foreground">
                {filteredOpportunities.length === 0 && allOpportunities.length > 0 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay oportunidades publicadas en la plataforma'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Logo + Basic Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {opportunity.company_logo ? (
                        <img 
                          src={opportunity.company_logo} 
                          alt={opportunity.company_name}
                          className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Opportunity Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start flex-col gap-2 mb-2">
                        <h3 className="font-medium text-sm md:text-base">{opportunity.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getStatusBadge(opportunity.status)}
                          {getCategoryBadge(opportunity.category)}
                          {getContractTypeBadge(opportunity.contract_type)}
                        </div>
                      </div>
                      
                      {opportunity.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {opportunity.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{opportunity.company_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{opportunity.location}</span>
                        </div>
                        {opportunity.salary_amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 flex-shrink-0" />
                            <span>{opportunity.salary_amount}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            Publicada {formatDistanceToNow(new Date(opportunity.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-3 md:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                          <span className="font-medium">{opportunity.applications_count}</span>
                          <span className="text-xs md:text-sm">postulaciones</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                          <span className="font-medium">{opportunity.views_count}</span>
                          <span className="text-xs md:text-sm">vistas</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOpportunity(opportunity.id)}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Ver Detalles</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, filteredOpportunities.length)} de {filteredOpportunities.length} oportunidades
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunity Detail Modal */}
      {selectedOpportunityId && (
        <AdminOpportunityDetail
          opportunityId={selectedOpportunityId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onOpportunityUpdate={handleOpportunityUpdate}
        />
      )}
    </div>
  );
};

export default AdminOpportunityModeration;

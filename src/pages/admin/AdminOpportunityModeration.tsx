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
      'part-time': 'bg-green-100 text-green-800',
      'freelance': 'bg-purple-100 text-purple-800',
      'commission': 'bg-orange-100 text-orange-800',
      'fixed-commission': 'bg-pink-100 text-pink-800'
    };

    return (
      <Badge variant="outline" className={contractColors[contractType] || 'bg-gray-100 text-gray-800'}>
        {contractType}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moderación de Oportunidades</h2>
          <p className="text-muted-foreground">
            Administra y modera todas las oportunidades publicadas
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading}
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
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {opportunity.company_logo ? (
                      <img 
                        src={opportunity.company_logo} 
                        alt={opportunity.company_name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Opportunity Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{opportunity.title}</h3>
                      {getStatusBadge(opportunity.status)}
                      {getPriorityBadge(opportunity.priority)}
                      {getCategoryBadge(opportunity.category)}
                      {getContractTypeBadge(opportunity.contract_type)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {opportunity.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span>{opportunity.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{opportunity.location}</span>
                      </div>
                      {opportunity.salary_amount && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{opportunity.salary_amount}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Publicada {formatDistanceToNow(new Date(opportunity.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{opportunity.applications_count}</span>
                      </div>
                      <span className="text-xs">postulaciones</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">{opportunity.views_count}</span>
                      </div>
                      <span className="text-xs">visualizaciones</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOpportunity(opportunity.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
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
                  Anterior
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
                  Siguiente
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

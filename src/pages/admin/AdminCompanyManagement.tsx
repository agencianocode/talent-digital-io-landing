import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  MapPin, 
  Calendar, 
  Globe, 
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import AdminCompanyFilters from '@/components/admin/AdminCompanyFilters';
import AdminCompanyDetail from '@/components/admin/AdminCompanyDetail';
import { useAdminCompanies } from '@/hooks/useAdminCompanies';

interface AdminCompanyManagementProps {
  onNavigateToOpportunities?: (companyId: string) => void;
}

const AdminCompanyManagement: React.FC<AdminCompanyManagementProps> = ({ onNavigateToOpportunities }) => {
  const {
    companies,
    allCompanies,
    filteredCompanies,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch
  } = useAdminCompanies();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCompanyId(null);
  };

  const handleCompanyUpdate = () => {
    refetch();
  };

  const handleRefresh = async () => {
    toast.loading('Actualizando empresas...', { id: 'refresh-companies' });
    await refetch();
    toast.success('Empresas actualizadas correctamente', { id: 'refresh-companies' });
  };

  const getIndustryBadge = (industry?: string) => {
    if (!industry) return <Badge variant="outline">No especificada</Badge>;
    
    const industryColors: Record<string, string> = {
      technology: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      sales: 'bg-purple-100 text-purple-800',
      consulting: 'bg-orange-100 text-orange-800',
      education: 'bg-yellow-100 text-yellow-800',
      healthcare: 'bg-red-100 text-red-800',
      finance: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="secondary" className={industryColors[industry] || 'bg-gray-100 text-gray-800'}>
        {industry}
      </Badge>
    );
  };

  const getSizeBadge = (size?: string) => {
    if (!size) return <Badge variant="outline">No especificado</Badge>;
    
    const sizeLabels: Record<string, string> = {
      startup: 'Startup (1-10)',
      small: 'Pequeña (11-50)',
      medium: 'Mediana (51-200)',
      large: 'Grande (201-1000)',
      enterprise: 'Enterprise (1000+)'
    };

    return (
      <Badge variant="outline">
        {sizeLabels[size] || size}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "Activa" : "Inactiva"}
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
                <h3 className="font-semibold">Error al cargar empresas</h3>
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
          <h2 className="text-xl md:text-2xl font-bold">Gestión de Empresas</h2>
          <p className="text-sm text-muted-foreground">
            Administra todas las empresas registradas en la plataforma
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
      <AdminCompanyFilters
        filters={filters}
        onFiltersChange={updateFilters}
        totalCompanies={allCompanies.length}
        filteredCount={filteredCompanies.length}
        isLoading={isLoading}
      />

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Lista de Empresas
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
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
              <p className="text-muted-foreground">
                {filteredCompanies.length === 0 && allCompanies.length > 0 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay empresas registradas en la plataforma'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Logo + Basic Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start flex-col gap-2 mb-2">
                        <h3 className="font-medium text-sm md:text-base">{company.name}</h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getIndustryBadge(company.industry)}
                          {getSizeBadge(company.size)}
                          {getStatusBadge(company.is_active)}
                        </div>
                      </div>
                      
                      {company.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {company.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Crown className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{company.owner_name}</span>
                        </div>
                        {company.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{company.location}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 flex-shrink-0" />
                            <span>Sitio web</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            Registrada {formatDistanceToNow(new Date(company.created_at), { 
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
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                          <span className="font-medium">{company.users_count}</span>
                          <span className="text-xs md:text-sm">usuarios</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                          <span className="font-medium">{company.opportunities_count}</span>
                          <span className="text-xs md:text-sm">oportunidades</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCompany(company.id)}
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
                Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, filteredCompanies.length)} de {filteredCompanies.length} empresas
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

      {/* Company Detail Modal */}
      {selectedCompanyId && (
        <AdminCompanyDetail
          companyId={selectedCompanyId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onCompanyUpdate={handleCompanyUpdate}
          onNavigateToOpportunities={onNavigateToOpportunities}
        />
      )}
    </div>
  );
};

export default AdminCompanyManagement;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Grid3X3, 
  List,
  ChevronLeft,
  ChevronRight,
  Package,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceServices } from '@/hooks/useMarketplaceServices';
import ServiceCard from '@/components/marketplace/ServiceCard';
import ServiceFilters from '@/components/marketplace/ServiceFilters';
import ServiceRequestModal from '@/components/marketplace/ServiceRequestModal';
import PublishServiceModal from '@/components/marketplace/PublishServiceModal';
import { MarketplaceService } from '@/hooks/useMarketplaceServices';

const BusinessMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    services,
    allServices,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refreshServices
  } = useMarketplaceServices();

  const handleRequestService = (service: MarketplaceService) => {
    setSelectedService(service);
    setIsRequestModalOpen(true);
  };

  const handleRequestSent = async () => {
    // Refresh services to update request counts
    await refreshServices();
  };

  const handleClearFilters = () => {
    updateFilters({
      searchQuery: '',
      categoryFilter: 'all',
      priceRange: 'all',
      locationFilter: 'all',
      availabilityFilter: 'all'
    });
  };

  const handlePublishService = () => {
    setIsPublishModalOpen(true);
  };

  const handleManageServices = () => {
    navigate('/business-dashboard/my-services');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar servicios</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error}
            </p>
            <Button onClick={refreshServices}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace de Servicios</h1>
            <p className="text-muted-foreground">
              Encuentra los mejores talentos para tu empresa
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleManageServices} variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mis Servicios
            </Button>
            <Button onClick={handlePublishService} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Publicar Servicio
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ServiceFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={handleClearFilters}
        totalResults={allServices.length}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Página {currentPage} de {totalPages}
          </Badge>
        </div>
      </div>

      {/* Services Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {allServices.length === 0 
                ? 'El marketplace está vacío' 
                : 'No se encontraron servicios'}
            </h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              {allServices.length === 0 
                ? 'Aún no hay servicios publicados en el marketplace. Los talentos premium pueden publicar sus servicios.' 
                : 'Intenta ajustar tus filtros de búsqueda o explorar diferentes categorías.'}
            </p>
            {allServices.length > 0 && (
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onRequestService={handleRequestService}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
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
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Service Request Modal */}
      <ServiceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        service={selectedService}
        onRequestSent={handleRequestSent}
      />

      {/* Publish Service Modal */}
      <PublishServiceModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={refreshServices}
      />

    </div>
  );
};

export default BusinessMarketplace;

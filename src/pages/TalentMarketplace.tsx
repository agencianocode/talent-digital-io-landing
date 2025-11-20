import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Plus, 
  Settings,
  Grid3X3, 
  List,
  ChevronLeft,
  ChevronRight,
  Package,
  Info,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { useMarketplaceServices } from '@/hooks/useMarketplaceServices';
import ServiceCard from '@/components/marketplace/ServiceCard';
import ServiceFilters from '@/components/marketplace/ServiceFilters';
import ServiceRequestModal from '@/components/marketplace/ServiceRequestModal';
import PublishServiceModal from '@/components/marketplace/PublishServiceModal';
import { MarketplaceService } from '@/hooks/useMarketplaceServices';
import { AcademyCoursesSection } from '@/components/marketplace/AcademyCoursesSection';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { marketplaceService } from '@/services/marketplaceService';

const TalentMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [publishingRequestStatus, setPublishingRequestStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const { user } = useSupabaseAuth();

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

  // Cargar estado de solicitudes de publicación al montar el componente
  useEffect(() => {
    const loadPublishingRequestStatus = async () => {
      if (!user || userRole !== 'freemium_talent') return;

      try {
        const requests = await marketplaceService.getMyPublishingRequests();
        
        // Buscar la solicitud más reciente
        if (requests.length > 0) {
          // Ordenar por fecha de creación (más reciente primero)
          const sortedRequests = requests.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const latestRequest = sortedRequests[0];
          
          if (latestRequest) {
            // Verificar si el usuario ya cerró el banner para esta solicitud
            const dismissedKey = `publishing_request_alert_dismissed_${latestRequest.id}`;
            const isDismissed = localStorage.getItem(dismissedKey) === 'true';
            
            if (!isDismissed) {
              setPublishingRequestStatus(latestRequest.status as 'pending' | 'approved' | 'rejected');
              setShowAlert(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading publishing request status:', error);
      }
    };

    loadPublishingRequestStatus();
  }, [user, userRole]);

  const handleRequestService = (service: MarketplaceService) => {
    setSelectedService(service);
    setIsRequestModalOpen(true);
  };

  const handleRequestSent = async () => {
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
    navigate('/talent-dashboard/my-services');
  };

  const handleDismissAlert = async () => {
    // Obtener la solicitud más reciente para guardar el ID
    try {
      const requests = await marketplaceService.getMyPublishingRequests();
      if (requests.length > 0) {
        const sortedRequests = requests.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestRequest = sortedRequests[0];
        
        if (latestRequest) {
          // Guardar en localStorage que el usuario cerró el banner
          const dismissedKey = `publishing_request_alert_dismissed_${latestRequest.id}`;
          localStorage.setItem(dismissedKey, 'true');
        }
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
    
    setShowAlert(false);
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
              Descubre servicios de otros talentos
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

      {/* Alert de estado de solicitud de publicación para Freemium */}
      {showAlert && publishingRequestStatus && (
        <Alert className={`mb-6 relative ${
          publishingRequestStatus === 'approved' 
            ? 'bg-green-50 border-green-200' 
            : publishingRequestStatus === 'rejected'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <button
            onClick={handleDismissAlert}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
          
          {publishingRequestStatus === 'pending' && (
            <>
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 font-semibold">Solicitud en Revisión ⏳</AlertTitle>
              <AlertDescription className="text-blue-700 mt-2">
                Tu solicitud para acceder al Marketplace de Servicios está siendo revisada por nuestro equipo. 
                Te notificaremos por email cuando sea aprobada y puedas empezar a publicar tus servicios.
              </AlertDescription>
            </>
          )}
          
          {publishingRequestStatus === 'approved' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900 font-semibold">¡Solicitud Aprobada! ✅</AlertTitle>
              <AlertDescription className="text-green-700 mt-2">
                Tu solicitud para acceder al Marketplace de Servicios ha sido aprobada. 
                Ya puedes empezar a publicar tus servicios en el marketplace.
              </AlertDescription>
            </>
          )}
          
          {publishingRequestStatus === 'rejected' && (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900 font-semibold">Solicitud Rechazada ❌</AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                Tu solicitud para acceder al Marketplace de Servicios ha sido rechazada. 
                Si tienes preguntas o deseas más información, por favor contacta a nuestro equipo de soporte.
              </AlertDescription>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={handleDismissAlert}
          >
            Entendido
          </Button>
        </Alert>
      )}

      {/* Academy Courses Section */}
      <div className="mb-12">
        <AcademyCoursesSection />
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
                ? 'Aún no hay servicios publicados en el marketplace.' 
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

export default TalentMarketplace;
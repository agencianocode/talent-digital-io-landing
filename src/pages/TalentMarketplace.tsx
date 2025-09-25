import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Package, 
  MessageSquare, 
  Eye, 
  TrendingUp,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause
} from 'lucide-react';
import { useTalentServices } from '@/hooks/useTalentServices';
import ServiceForm from '@/components/marketplace/ServiceForm';
import TalentServiceCard from '@/components/marketplace/TalentServiceCard';
import ServiceRequestsList from '@/components/marketplace/ServiceRequestsList';
import { TalentService, ServiceFormData } from '@/hooks/useTalentServices';
import { useToast } from '@/hooks/use-toast';
import TalentTopNavigation from '@/components/TalentTopNavigation';

const TalentMarketplace: React.FC = () => {
  const { toast } = useToast();
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<TalentService | null>(null);
  const [activeTab, setActiveTab] = useState('services');

  const {
    services,
    serviceRequests,
    isLoading,
    isRequestsLoading,
    error,
    createService,
    updateService,
    deleteService,
    updateRequestStatus,
    duplicateService,
    refreshServices,
    // refreshRequests
  } = useTalentServices();

  // Computed values
  const servicesByStatus = {
    active: services.filter(s => s.is_available),
    inactive: services.filter(s => !s.is_available)
  };
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending');
  const totalViews = services.reduce((sum, _s) => sum + 0, 0); // TODO: Add views field to TalentService
  const totalRequests = serviceRequests.length;
  const averageRating = 4.7; // Mock value for now

  // Wrapper for updateRequestStatus to return boolean
  const handleUpdateRequestStatus = async (requestId: string, status: 'pending' | 'accepted' | 'declined' | 'completed'): Promise<boolean> => {
    try {
      await updateRequestStatus(requestId, status);
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
      return false;
    }
  };

  const handleCreateService = async (formData: ServiceFormData): Promise<boolean> => {
    try {
      await createService(formData);
      setIsServiceFormOpen(false);
      return true;
    } catch (error) {
      console.error('Error creating service:', error);
      return false;
    }
  };

  const handleEditService = async (formData: ServiceFormData): Promise<boolean> => {
    if (!editingService) return false;
    try {
      await updateService(editingService.id, formData);
      setEditingService(null);
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      return false;
    }
  };

  const handleDeleteService = async (service: TalentService) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${service.title}"?`)) {
      try {
        await deleteService(service.id);
        toast({
          title: "Servicio eliminado",
          description: "El servicio ha sido eliminado exitosamente.",
        });
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el servicio.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDuplicateService = async (service: TalentService) => {
    try {
      await duplicateService(service.id);
      toast({
        title: "Servicio duplicado",
        description: "Se ha creado una copia del servicio.",
      });
    } catch (error) {
      console.error('Error duplicating service:', error);
      toast({
        title: "Error",
        description: "No se pudo duplicar el servicio.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (service: TalentService) => {
    const newStatus = service.is_available ? 'paused' : 'active';
    try {
      await updateService(service.id, { 
        is_available: newStatus === 'active'
      });
      toast({
        title: "Estado actualizado",
        description: `El servicio ha sido ${newStatus === 'active' ? 'activado' : 'pausado'}.`,
      });
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del servicio.",
        variant: "destructive"
      });
    }
  };

  const handleViewPortfolio = (service: TalentService) => {
    if (service.portfolio_url) {
      window.open(service.portfolio_url, '_blank');
    }
  };

  const handleOpenCreateForm = () => {
    setEditingService(null);
    setIsServiceFormOpen(true);
  };

  const handleOpenEditForm = (service: TalentService) => {
    setEditingService(service);
    setIsServiceFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsServiceFormOpen(false);
    setEditingService(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TalentTopNavigation />
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mi Marketplace</h1>
            <p className="text-muted-foreground">
              Gestiona tus servicios y solicitudes de clientes
            </p>
          </div>
          <Button onClick={handleOpenCreateForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Servicio
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Servicios</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vistas Totales</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solicitudes</p>
                  <p className="text-2xl font-bold">{totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating Promedio</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Mis Servicios
            <Badge variant="secondary" className="ml-1">
              {services.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Solicitudes
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          {/* Service Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Activos</p>
                    <p className="text-xl font-bold">{servicesByStatus.active.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Pause className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pausados</p>
                    <p className="text-xl font-bold">{servicesByStatus.inactive.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Borradores</p>
                    <p className="text-xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendidos</p>
                    <p className="text-xl font-bold">{totalRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
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
                <h3 className="text-lg font-semibold mb-2">No tienes servicios</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crea tu primer servicio para empezar a recibir solicitudes de clientes.
                </p>
                <Button onClick={handleOpenCreateForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Mi Primer Servicio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <TalentServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteService}
                  onDuplicate={handleDuplicateService}
                  onToggleStatus={handleToggleStatus}
                  onViewPortfolio={handleViewPortfolio}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <ServiceRequestsList
            requests={serviceRequests}
            onUpdateStatus={handleUpdateRequestStatus}
            isUpdating={isRequestsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Service Form Modal */}
      <ServiceForm
        isOpen={isServiceFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingService ? handleEditService : handleCreateService}
        initialData={editingService ? {
          title: editingService.title,
          description: editingService.description,
          category: editingService.category,
          price: editingService.price,
          currency: editingService.currency,
          delivery_time: editingService.delivery_time,
          location: editingService.location,
          is_available: editingService.is_available,
          portfolio_url: editingService.portfolio_url,
          demo_url: editingService.demo_url,
          tags: editingService.tags
        } : undefined}
        isSubmitting={false}
        mode={editingService ? 'edit' : 'create'}
      />
      </div>
    </div>
  );
};

export default TalentMarketplace;
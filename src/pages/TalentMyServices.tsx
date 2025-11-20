import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Plus, 
  Package, 
  AlertCircle
} from 'lucide-react';
import { useTalentServices } from '@/hooks/useTalentServices';
import ServiceForm from '@/components/marketplace/ServiceForm';
import TalentServiceCard from '@/components/marketplace/TalentServiceCard';
import { TalentService, ServiceFormData } from '@/hooks/useTalentServices';
import { useToast } from '@/hooks/use-toast';

const TalentMyServices: React.FC = () => {
  const { toast } = useToast();
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<TalentService | null>(null);

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
    loadServiceRequests,
  } = useTalentServices();

  // Cargar solicitudes al montar el componente
  React.useEffect(() => {
    loadServiceRequests();
  }, [loadServiceRequests]);

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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Servicios</h1>
            <p className="text-muted-foreground">
              Gestiona tus servicios y solicitudes de clientes
            </p>
          </div>
          <Button onClick={handleOpenCreateForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Servicio
          </Button>
        </div>

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
          {services.map((service) => {
            // Filtrar solicitudes para este servicio
            const serviceRequestsForService = serviceRequests.filter(
              req => req.service_id === service.id
            );
            
            return (
              <TalentServiceCard
                key={service.id}
                service={service}
                serviceRequests={serviceRequestsForService}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteService}
                onDuplicate={handleDuplicateService}
                onToggleStatus={handleToggleStatus}
                onViewPortfolio={handleViewPortfolio}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                isUpdatingRequest={isRequestsLoading}
              />
            );
          })}
        </div>
      )}

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
  );
};

export default TalentMyServices;

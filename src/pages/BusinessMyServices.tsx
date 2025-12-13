import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';

import { useTalentServices } from '@/hooks/useTalentServices';
import { useCompany } from '@/contexts/CompanyContext';
import TalentServiceCard from '@/components/marketplace/TalentServiceCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ServiceForm from '@/components/marketplace/ServiceForm';

const BusinessMyServices: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompany } = useCompany();
  const [companyServices, setCompanyServices] = useState<any[]>([]);
  const [isLoadingCompanyServices, setIsLoadingCompanyServices] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  // Hook para servicios personales (donde user_id = current user)
  const {
    services: personalServices,
    isLoading: loadingPersonal,
    deleteService: deletePersonalService,
    duplicateService: duplicatePersonalService,
    toggleServiceAvailability: togglePersonalServiceStatus,
    refreshServices: loadPersonalServices
  } = useTalentServices();

  // Cargar servicios de la empresa
  const loadCompanyServices = async () => {
    if (!activeCompany?.id) return;
    
    setIsLoadingCompanyServices(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_services')
        .select('*')
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanyServices(data || []);
    } catch (error) {
      console.error('Error loading company services:', error);
    } finally {
      setIsLoadingCompanyServices(false);
    }
  };

  useEffect(() => {
    loadCompanyServices();
  }, [activeCompany?.id]);

  // Handlers unificados que manejan servicios personales y de empresa
  const handleEdit = (service: any) => {
    // Siempre abrir el formulario de edición
    setEditingService(service);
  };

  const handleDelete = async (service: any) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

    try {
      if (service.company_id) {
        // Servicio de empresa - eliminar directamente
        const { error } = await supabase
          .from('marketplace_services')
          .delete()
          .eq('id', service.id);

        if (error) throw error;
        toast.success('Servicio eliminado correctamente');
        loadCompanyServices();
      } else {
        // Servicio personal - usar el hook
        await deletePersonalService(service.id);
        toast.success('Servicio eliminado correctamente');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  const handleDuplicate = async (service: any) => {
    try {
      if (service.company_id) {
        // Servicio de empresa - duplicar directamente
        const { id, created_at, updated_at, views_count, requests_count, ...serviceData } = service;
        const { error } = await supabase
          .from('marketplace_services')
          .insert({
            ...serviceData,
            title: `${service.title} (Copia)`,
            views_count: 0,
            requests_count: 0
          });

        if (error) throw error;
        toast.success('Servicio duplicado correctamente');
        loadCompanyServices();
      } else {
        // Servicio personal - usar el hook
        await duplicatePersonalService(service.id);
        toast.success('Servicio duplicado correctamente');
      }
    } catch (error) {
      console.error('Error duplicating service:', error);
      toast.error('Error al duplicar el servicio');
    }
  };

  const handleToggleStatus = async (service: any) => {
    try {
      if (service.company_id) {
        // Servicio de empresa - cambiar estado directamente
        const newStatus = service.status === 'active' ? 'paused' : 'active';
        const { error } = await supabase
          .from('marketplace_services')
          .update({ status: newStatus })
          .eq('id', service.id);

        if (error) throw error;
        toast.success(`Servicio ${newStatus === 'active' ? 'activado' : 'pausado'} correctamente`);
        loadCompanyServices();
      } else {
        // Servicio personal - usar el hook
        const newAvailability = service.status !== 'active';
        await togglePersonalServiceStatus(service.id, newAvailability);
        toast.success(`Servicio ${newAvailability ? 'activado' : 'pausado'} correctamente`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error al cambiar el estado del servicio');
    }
  };

  const handleViewPortfolio = (service: any) => {
    if (service.portfolio_url) {
      window.open(service.portfolio_url, '_blank');
    } else {
      toast.info('Este servicio no tiene una URL de portafolio configurada');
    }
  };

  const handleServiceFormSubmit = async (data: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('marketplace_services')
        .update(data)
        .eq('id', editingService.id);

      if (error) throw error;

      toast.success('Servicio actualizado correctamente');
      setEditingService(null);
      loadCompanyServices();
      loadPersonalServices();
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error al actualizar el servicio');
      return false;
    }
  };

  // Filtrar servicios personales para excluir los que tienen company_id (para evitar duplicados)
  const personalServicesOnly = personalServices.filter(service => !service.company_id);
  
  // Combinar servicios personales (sin company_id) + servicios de empresa (con company_id)
  const allServices = [...personalServicesOnly, ...companyServices];
  const isLoading = loadingPersonal || isLoadingCompanyServices;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Servicios</h1>
            <p className="text-muted-foreground">
              Gestiona tus servicios publicados en el marketplace
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/business-dashboard/marketplace')} 
              variant="outline"
            >
              Volver al Marketplace
            </Button>
            <Button 
              onClick={() => navigate('/business-dashboard/marketplace')} 
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </div>
      </div>

      {/* Published Services */}
      {allServices.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Servicios Publicados ({allServices.length})</h2>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando servicios...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allServices.map((service) => (
                  <TalentServiceCard
                    key={service.id}
                    service={service}
                    serviceRequests={[]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onToggleStatus={handleToggleStatus}
                    onViewPortfolio={handleViewPortfolio}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <ServiceForm
          isOpen={true}
          onClose={() => setEditingService(null)}
          onSubmit={handleServiceFormSubmit}
          initialData={editingService}
          mode="edit"
        />
      )}
    </div>
  );
};

export default BusinessMyServices;


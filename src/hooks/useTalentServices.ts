import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { marketplaceService } from '@/services/marketplaceService';
// import { SERVICE_CATEGORIES } from '@/lib/marketplace-categories';
import { 
  TalentService, 
  ServiceRequest, 
  ServiceFormData,
  // ServiceRequestFormData
} from '@/integrations/supabase/marketplace-types';

// Re-export types for backward compatibility
export type { TalentService, ServiceRequest, ServiceFormData } from '@/integrations/supabase/marketplace-types';

export interface UseTalentServicesReturn {
  // Data
  services: TalentService[];
  serviceRequests: ServiceRequest[];
  
  // Loading states
  isLoading: boolean;
  isRequestsLoading: boolean;
  error: string | null;
  
  // Actions
  createService: (serviceData: ServiceFormData) => Promise<TalentService>;
  updateService: (serviceId: string, serviceData: Partial<ServiceFormData>) => Promise<TalentService>;
  deleteService: (serviceId: string) => Promise<void>;
  duplicateService: (serviceId: string) => Promise<TalentService>;
  toggleServiceAvailability: (serviceId: string, isAvailable: boolean) => Promise<void>;
  
  // Service requests
  loadServiceRequests: () => Promise<void>;
  updateRequestStatus: (requestId: string, status: 'pending' | 'accepted' | 'declined' | 'completed') => Promise<void>;
  
  // Refresh
  refreshServices: () => Promise<void>;
  refreshRequests: () => Promise<void>;
}

export const useTalentServices = (): UseTalentServicesReturn => {
  const [services, setServices] = useState<TalentService[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user services
  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const userServices = await marketplaceService.getUserServices(user.id);
      setServices(userServices);

    } catch (err) {
      console.error('Error loading services:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los servicios');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load service requests
  const loadServiceRequests = useCallback(async () => {
    try {
      setIsRequestsLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const requests = await marketplaceService.getServiceRequests(user.id);
      setServiceRequests(requests);

    } catch (err) {
      console.error('Error loading service requests:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes');
      setServiceRequests([]);
    } finally {
      setIsRequestsLoading(false);
    }
  }, []);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Create service
  const createService = useCallback(async (serviceData: ServiceFormData): Promise<TalentService> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const newService = await marketplaceService.createService(user.id, serviceData);
      setServices(prev => [newService, ...prev]);
      return newService;

    } catch (err) {
      console.error('Error creating service:', err);
      throw err;
    }
  }, []);

  // Update service
  const updateService = useCallback(async (serviceId: string, serviceData: Partial<ServiceFormData>): Promise<TalentService> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const updatedService = await marketplaceService.updateService(serviceId, user.id, serviceData);
      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ));
      return updatedService;

    } catch (err) {
      console.error('Error updating service:', err);
      throw err;
    }
  }, []);

  // Delete service
  const deleteService = useCallback(async (serviceId: string): Promise<void> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      await marketplaceService.deleteService(serviceId, user.id);
      setServices(prev => prev.filter(service => service.id !== serviceId));

    } catch (err) {
      console.error('Error deleting service:', err);
      throw err;
    }
  }, []);

  // Duplicate service
  const duplicateService = useCallback(async (serviceId: string): Promise<TalentService> => {
    try {
      const originalService = services.find(s => s.id === serviceId);
      if (!originalService) {
        throw new Error('Servicio no encontrado');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const duplicateData: ServiceFormData = {
        title: `${originalService.title} (Copia)`,
        description: originalService.description,
        category: originalService.category,
        price: originalService.price,
        currency: originalService.currency,
        delivery_time: originalService.delivery_time,
        location: originalService.location,
        is_available: false, // Start as unavailable
        portfolio_url: originalService.portfolio_url,
        demo_url: originalService.demo_url,
        tags: originalService.tags
      };

      const newService = await marketplaceService.createService(user.id, duplicateData);
      setServices(prev => [newService, ...prev]);
      return newService;

    } catch (err) {
      console.error('Error duplicating service:', err);
      throw err;
    }
  }, [services]);

  // Toggle service availability
  const toggleServiceAvailability = useCallback(async (serviceId: string, isAvailable: boolean): Promise<void> => {
    try {
      await updateService(serviceId, { is_available: isAvailable });
    } catch (err) {
      console.error('Error toggling service availability:', err);
      throw err;
    }
  }, [updateService]);

  // Update request status
  const updateRequestStatus = useCallback(async (requestId: string, status: 'pending' | 'accepted' | 'declined' | 'completed'): Promise<void> => {
    try {
      await marketplaceService.updateRequestStatus(requestId, status);
      setServiceRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));
    } catch (err) {
      console.error('Error updating request status:', err);
      throw err;
    }
  }, []);

  // Refresh services
  const refreshServices = useCallback(async () => {
    await loadServices();
  }, [loadServices]);

  // Refresh requests
  const refreshRequests = useCallback(async () => {
    await loadServiceRequests();
  }, [loadServiceRequests]);

  return {
    // Data
    services,
    serviceRequests,
    
    // Loading states
    isLoading,
    isRequestsLoading,
    error,
    
    // Actions
    createService,
    updateService,
    deleteService,
    duplicateService,
    toggleServiceAvailability,
    
    // Service requests
    loadServiceRequests,
    updateRequestStatus,
    
    // Refresh
    refreshServices,
    refreshRequests
  };
};
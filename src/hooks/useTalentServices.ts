import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export interface TalentService {
  id: string;
  talent_profile_id: string;
  title: string;
  description: string;
  category: string;
  price_min: number;
  price_max: number;
  currency: string;
  delivery_time: string;
  is_available: boolean;
  skills_required?: string[];
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  talent_profile_id: string;
  title: string;
  description: string;
  category: string;
  price_min: number;
  price_max: number;
  currency: string;
  delivery_time: string;
  is_available: boolean;
  skills_required?: string[];
  portfolio_url?: string;
}

export const useTalentServices = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch services for a specific talent profile
  const fetchTalentServices = useCallback(async (talentProfileId: string): Promise<TalentService[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('talent_services' as any)
        .select('*')
        .eq('talent_profile_id', talentProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching talent services:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch services by user ID
  const fetchServicesByUserId = useCallback(async (userId: string): Promise<TalentService[]> => {
    try {
      setIsLoading(true);
      
      // First get the talent profile for this user
      const { data: talentProfile, error: profileError } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.warn('No talent profile found for user:', profileError);
        return [];
      }

      // Then get the services for this talent profile
      const { data, error } = await supabase
        .from('talent_services' as any)
        .select('*')
        .eq('talent_profile_id', talentProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching services by user ID:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new service
  const createService = useCallback(async (serviceData: CreateServiceData): Promise<TalentService | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear servicios",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('talent_services' as any)
        .insert(serviceData)
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Servicio creado correctamente",
      });
      
      return data as any;
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el servicio",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Update an existing service
  const updateService = useCallback(async (serviceId: string, serviceData: Partial<CreateServiceData>): Promise<TalentService | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar servicios",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('talent_services' as any)
        .update({
          ...serviceData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select('*')
        .single();

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Servicio actualizado correctamente",
      });
      
      return data as any;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Delete a service
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar servicios",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('talent_services' as any)
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Servicio eliminado correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Toggle service availability
  const toggleServiceAvailability = useCallback(async (serviceId: string, isAvailable: boolean): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para cambiar la disponibilidad",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('talent_services' as any)
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: `Servicio ${isAvailable ? 'disponible' : 'no disponible'}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling service availability:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la disponibilidad del servicio",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Get available services by category
  const getServicesByCategory = useCallback(async (category: string): Promise<TalentService[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('talent_services' as any)
        .select('*')
        .eq('category', category)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching services by category:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Get all available services
  const getAllAvailableServices = useCallback(async (): Promise<TalentService[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('talent_services' as any)
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as any[]) || [];
    } catch (error) {
      console.error('Error fetching all available services:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    fetchTalentServices,
    fetchServicesByUserId,
    createService,
    updateService,
    deleteService,
    toggleServiceAvailability,
    getServicesByCategory,
    getAllAvailableServices,
  };
};

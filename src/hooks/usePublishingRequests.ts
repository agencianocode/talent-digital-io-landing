import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PublishingRequest {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_name: string;
  service_type: string;
  budget: string | null;
  timeline: string | null;
  description: string;
  requirements: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  requester_role?: string | null;
}

export const usePublishingRequests = () => {
  const [requests, setRequests] = useState<PublishingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  const loadRequests = async () => {
    try {
      // Cargar solicitudes con rol del usuario
      const { data: requestsData, error } = await supabase
        .from('marketplace_publishing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con rol del usuario
      const enrichedRequests = await Promise.all(
        (requestsData || []).map(async (request) => {
          if (request.requester_id) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', request.requester_id)
              .single();
            
            return {
              ...request,
              requester_role: roleData?.role || null
            } as PublishingRequest;
          }
          return { ...request, requester_role: null } as PublishingRequest;
        })
      );

      setRequests(enrichedRequests);
      setPendingCount(enrichedRequests.filter(r => r.status === 'pending').length || 0);
    } catch (error: any) {
      console.error('Error loading publishing requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    try {
      // Si se aprueba, primero obtener los datos de la solicitud
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (!request || !request.requester_id) {
          throw new Error('No se pudo obtener la información de la solicitud');
        }

        // Crear el servicio en marketplace_services
        const { error: serviceError } = await supabase
          .from('marketplace_services')
          .insert({
            user_id: request.requester_id,
            title: request.service_type,
            description: request.description,
            category: 'otros', // Categoría por defecto, el usuario puede editarla después
            price: 0, // Precio inicial, el usuario debe configurarlo
            currency: 'USD',
            delivery_time: request.timeline || '1-2 semanas',
            location: 'Remoto',
            is_available: false, // Inicialmente no disponible hasta que el usuario complete la información
            status: 'draft', // Estado draft hasta que el usuario complete todos los campos
            tags: [],
          });

        if (serviceError) {
          console.error('Error creating service:', serviceError);
          throw new Error('No se pudo crear el servicio en el marketplace');
        }

        // Actualizar el rol del usuario a premium_talent si es necesario
        const { data: currentRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', request.requester_id)
          .single();

        if (currentRole && currentRole.role === 'freemium_talent') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: 'premium_talent' })
            .eq('user_id', request.requester_id);

          if (roleError) {
            console.error('Error updating user role:', roleError);
          }
        }
      }

      // Actualizar el estado de la solicitud
      const { error } = await supabase
        .from('marketplace_publishing_requests')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: status === 'approved' 
          ? 'Solicitud aprobada y servicio creado. El usuario puede completar la información desde su dashboard.'
          : 'Solicitud rechazada correctamente',
      });

      loadRequests();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la solicitud',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadRequests();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('publishing_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_publishing_requests',
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createServiceForApprovedRequest = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request || !request.requester_id) {
        throw new Error('No se pudo obtener la información de la solicitud');
      }

      if (request.status !== 'approved') {
        throw new Error('La solicitud debe estar aprobada');
      }

      // Verificar si ya existe un servicio para este usuario con el mismo título
      const { data: existingService } = await supabase
        .from('marketplace_services')
        .select('id')
        .eq('user_id', request.requester_id)
        .eq('title', request.service_type)
        .single();

      if (existingService) {
        throw new Error('Ya existe un servicio con este título para este usuario');
      }

      // Crear el servicio
      const { error: serviceError } = await supabase
        .from('marketplace_services')
        .insert({
          user_id: request.requester_id,
          title: request.service_type,
          description: request.description,
          category: 'consultoria',
          price: 0,
          currency: 'USD',
          delivery_time: request.timeline || '1-2 semanas',
          location: 'Remoto',
          is_available: false,
          status: 'draft',
          tags: [],
        });

      if (serviceError) throw serviceError;

      toast({
        title: 'Éxito',
        description: 'Servicio creado correctamente. El usuario puede completar la información desde su dashboard.',
      });

      return true;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el servicio',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    requests,
    loading,
    pendingCount,
    loadRequests,
    updateRequestStatus,
    createServiceForApprovedRequest,
  };
};

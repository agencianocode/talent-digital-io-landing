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
      // Primero obtener la solicitud para tener todos los datos
      const { data: request, error: fetchError } = await supabase
        .from('marketplace_publishing_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) throw new Error('Solicitud no encontrada');

      // Obtener el user_id del solicitante
      // Nota: requester_id debería estar presente cuando se crea la solicitud desde PublishServiceModal
      let requesterUserId = request.requester_id;
      
      // Si no tiene requester_id, no podemos crear el servicio automáticamente
      // El requester_id se establece cuando se crea la solicitud desde PublishServiceModal
      if (!requesterUserId) {
        console.warn('⚠️ La solicitud no tiene requester_id. Email del solicitante:', request.contact_email);
        console.warn('⚠️ No se puede crear el servicio automáticamente sin el user_id del solicitante.');
        console.warn('⚠️ Por favor, verifica que la solicitud tenga el campo requester_id o créalo manualmente.');
      }

      // Si se aprueba y tiene requester_id, crear el servicio en el marketplace
      if (status === 'approved' && requesterUserId) {
        try {
          // Convertir el budget a número si es posible
          let price = 0;
          if (request.budget) {
            // Intentar extraer un número del budget (ej: "500-1000" -> 750, "10000+" -> 10000)
            const budgetStr = request.budget.replace(/[^0-9+-]/g, '');
            if (budgetStr.includes('+')) {
              price = parseFloat(budgetStr.replace('+', '')) || 0;
            } else if (budgetStr.includes('-')) {
              const parts = budgetStr.split('-').filter(p => p).map(Number);
              if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
                price = (parts[0] + parts[1]) / 2;
              } else if (parts.length === 1 && parts[0] !== undefined) {
                price = parts[0];
              }
            } else {
              price = parseFloat(budgetStr) || 0;
            }
          }

          // Convertir timeline a delivery_time
          let deliveryTime = '2-3 semanas';
          if (request.timeline) {
            const timelineMap: Record<string, string> = {
              'urgent': '1-2 semanas',
              'fast': '1 mes',
              'normal': '2-3 meses',
              'flexible': '3-6 meses'
            };
            deliveryTime = timelineMap[request.timeline] || request.timeline;
          }

          // Función para capitalizar primera letra
          const capitalizeFirst = (str: string) => {
            if (!str) return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
          };

          // Crear un título más descriptivo con categoría capitalizada
          const categoryCapitalized = capitalizeFirst(request.service_type);
          
          // Validar company_name - ignorar "NA", vacíos, o igual al contact_name
          const isValidCompanyName = request.company_name 
            && request.company_name.trim() !== '' 
            && request.company_name.trim().toUpperCase() !== 'NA'
            && request.company_name !== request.contact_name;
          
          // Si no hay empresa válida, usar solo la categoría capitalizada
          const serviceTitle = isValidCompanyName
            ? `${request.company_name.trim()} - ${categoryCapitalized}`
            : categoryCapitalized;

          // Crear el servicio en marketplace_services
          console.log('🔧 Creando servicio con datos:', {
            user_id: requesterUserId,
            title: serviceTitle,
            category: request.service_type,
            price: price || 0,
            status: 'active',
            is_available: true
          });

          const { error: serviceError, data: serviceData } = await supabase
            .from('marketplace_services')
            .insert({
              user_id: requesterUserId,
              title: serviceTitle,
              description: request.description,
              category: request.service_type,
              price: price || 0,
              currency: 'USD',
              delivery_time: deliveryTime,
              location: 'Remoto', // Valor por defecto, puede ajustarse después
              is_available: true,
              status: 'active',
              tags: [],
              views_count: 0,
              requests_count: 0,
              rating: 0,
              reviews_count: 0
            })
            .select()
            .single();

          if (serviceError) {
            console.error('❌ Error creando servicio:', serviceError);
            console.error('Error details:', {
              message: serviceError.message,
              details: serviceError.details,
              hint: serviceError.hint,
              code: serviceError.code
            });
            // Lanzar error para que se muestre al usuario
            throw new Error(`Error al crear el servicio: ${serviceError.message}`);
          } else {
            console.log('✅ Servicio creado exitosamente:', serviceData);
            
            // Actualizar el rol del usuario a premium_talent si es freemium_talent
            const { data: currentRole, error: roleFetchError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', requesterUserId)
              .single();

            if (roleFetchError) {
              console.error('❌ Error obteniendo rol del usuario:', roleFetchError);
            } else if (currentRole && currentRole.role === 'freemium_talent') {
              const { error: roleUpdateError } = await supabase
                .from('user_roles')
                .update({ role: 'premium_talent' })
                .eq('user_id', requesterUserId);
              
              if (roleUpdateError) {
                console.error('❌ Error actualizando rol:', roleUpdateError);
                toast({
                  title: 'Advertencia',
                  description: 'Servicio creado pero no se pudo actualizar el rol del usuario. Por favor, actualízalo manualmente.',
                  variant: 'default',
                });
              } else {
                console.log('✅ Rol actualizado a premium_talent para usuario:', requesterUserId);
              }
            } else {
              console.log('ℹ️ Usuario no es freemium_talent, no se actualiza el rol. Rol actual:', currentRole?.role);
            }
          }
        } catch (serviceError: any) {
          console.error('❌ Error al crear servicio o actualizar rol:', serviceError);
          // Mostrar error al usuario pero continuar con la actualización del estado
          toast({
            title: 'Error al crear servicio',
            description: serviceError.message || 'Hubo un problema al crear el servicio. Por favor, contacta al administrador.',
            variant: 'destructive',
          });
        }
      }

      // Actualizar el estado de la solicitud
      const { error: updateError } = await supabase
        .from('marketplace_publishing_requests')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Mostrar mensaje de éxito
      if (status === 'approved') {
        if (!requesterUserId) {
          toast({
            title: 'Advertencia',
            description: 'Solicitud aprobada, pero no se pudo crear el servicio porque no se encontró el usuario. Por favor, créalo manualmente.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Éxito',
            description: 'Solicitud aprobada, servicio creado y rol actualizado correctamente',
          });
        }
      } else {
        toast({
          title: 'Éxito',
          description: 'Solicitud rechazada correctamente',
        });
      }

      // Recargar las solicitudes
      await loadRequests();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la solicitud',
        variant: 'destructive',
      });
      throw error;
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

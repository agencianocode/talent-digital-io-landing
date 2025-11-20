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

      // Si se aprueba y tiene requester_id, actualizar rol y crear el servicio
      if (status === 'approved' && requesterUserId) {
        // PRIMERO: Actualizar el rol del usuario a premium_talent si es freemium_talent o talent
        // Esto se hace ANTES de crear el servicio para asegurar que siempre se ejecute
        try {
          console.log('🔍 [Aprobación] Verificando rol del usuario:', requesterUserId);
          
          const { data: currentRole, error: roleFetchError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', requesterUserId)
            .maybeSingle(); // Usar maybeSingle para evitar errores si no existe

          console.log('🔍 [Aprobación] Resultado de consulta de rol:', { currentRole, roleFetchError });

          if (roleFetchError) {
            console.error('❌ Error obteniendo rol del usuario:', roleFetchError);
            console.error('❌ Detalles del error:', {
              message: roleFetchError.message,
              details: roleFetchError.details,
              hint: roleFetchError.hint,
              code: roleFetchError.code
            });
            toast({
              title: 'Error',
              description: `Error al obtener el rol del usuario: ${roleFetchError.message}`,
              variant: 'destructive',
            });
          } else if (!currentRole) {
            console.error('❌ No se encontró registro de rol para el usuario:', requesterUserId);
            toast({
              title: 'Error',
              description: 'No se encontró el rol del usuario en la base de datos.',
              variant: 'destructive',
            });
          } else {
            const currentRoleValue = currentRole.role;
            console.log('🔍 [Aprobación] Rol actual del usuario:', currentRoleValue);
            
            // Verificar si es un rol de talento que debe actualizarse
            // Incluir freemium_talent, talent, o cualquier rol que contenga 'talent' pero no 'premium'
            const shouldUpdateRole = currentRoleValue === 'freemium_talent' || 
                                     currentRoleValue === 'talent' ||
                                     (typeof currentRoleValue === 'string' && 
                                      currentRoleValue.includes('talent') && 
                                      !currentRoleValue.includes('premium'));
            
            console.log('🔍 [Aprobación] ¿Debe actualizarse el rol?', shouldUpdateRole);
            
            if (shouldUpdateRole) {
              console.log('🔄 [Aprobación] Actualizando rol de', currentRoleValue, 'a premium_talent para usuario:', requesterUserId);
              
              const { data: updatedRole, error: roleUpdateError } = await supabase
                .from('user_roles')
                .update({ role: 'premium_talent' })
                .eq('user_id', requesterUserId)
                .select()
                .single();
              
              if (roleUpdateError) {
                console.error('❌ Error actualizando rol:', roleUpdateError);
                console.error('❌ Detalles del error:', {
                  message: roleUpdateError.message,
                  details: roleUpdateError.details,
                  hint: roleUpdateError.hint,
                  code: roleUpdateError.code
                });
                toast({
                  title: 'Advertencia',
                  description: `No se pudo actualizar el rol del usuario: ${roleUpdateError.message}. Por favor, actualízalo manualmente.`,
                  variant: 'default',
                });
              } else {
                console.log('✅ [Aprobación] Rol actualizado exitosamente a premium_talent:', updatedRole);
                toast({
                  title: 'Éxito',
                  description: 'Rol del usuario actualizado a Premium Talent correctamente.',
                });
              }
            } else {
              console.log('ℹ️ [Aprobación] Usuario no requiere actualización de rol. Rol actual:', currentRoleValue);
            }
          }
        } catch (roleError: any) {
          console.error('❌ Error al actualizar rol (catch):', roleError);
          console.error('❌ Stack trace:', roleError.stack);
          toast({
            title: 'Error',
            description: `Error inesperado al actualizar el rol: ${roleError.message || 'Error desconocido'}`,
            variant: 'destructive',
          });
          // Continuar con la creación del servicio aunque falle la actualización del rol
        }

        // SEGUNDO: Crear el servicio en el marketplace
        try {
          console.log('🔧 [Aprobación] Iniciando creación de servicio para usuario:', requesterUserId);
          console.log('🔧 [Aprobación] Datos de la solicitud:', {
            service_type: request.service_type,
            description: request.description,
            budget: request.budget,
            timeline: request.timeline,
            company_name: request.company_name,
            contact_name: request.contact_name
          });

          // Validar que tenemos los datos necesarios
          if (!request.service_type || !request.description) {
            throw new Error('La solicitud no tiene los datos necesarios (service_type o description) para crear el servicio.');
          }

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

          // Verificar si ya existe un servicio para este usuario con el mismo título o categoría
          console.log('🔍 [Aprobación] Verificando si ya existe un servicio para este usuario...');
          const { data: existingServices, error: checkError } = await supabase
            .from('marketplace_services')
            .select('id, title, category, status')
            .eq('user_id', requesterUserId)
            .eq('category', request.service_type);

          if (checkError) {
            console.warn('⚠️ [Aprobación] Error al verificar servicios existentes:', checkError);
          } else if (existingServices && existingServices.length > 0) {
            console.log('ℹ️ [Aprobación] Ya existe un servicio para este usuario con la misma categoría:', existingServices);
            // Verificar si alguno está activo
            const activeService = existingServices.find(s => s.status === 'active' && s.category === request.service_type);
            if (activeService) {
              console.log('✅ [Aprobación] Ya existe un servicio activo. No se creará uno nuevo.');
              toast({
                title: 'Información',
                description: 'Ya existe un servicio activo para este usuario. El servicio no se duplicará.',
              });
              // No crear servicio duplicado, pero continuar con la aprobación
            } else {
              console.log('ℹ️ [Aprobación] Existe un servicio pero no está activo. Se creará uno nuevo.');
            }
          }

          // Crear el servicio en marketplace_services
          const serviceDataToInsert = {
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
          };

          console.log('🔧 [Aprobación] Creando servicio con datos:', serviceDataToInsert);

          const { error: serviceError, data: serviceData } = await supabase
            .from('marketplace_services')
            .insert(serviceDataToInsert)
            .select()
            .single();

          if (serviceError) {
            console.error('❌ [Aprobación] Error creando servicio:', serviceError);
            console.error('❌ [Aprobación] Detalles del error:', {
              message: serviceError.message,
              details: serviceError.details,
              hint: serviceError.hint,
              code: serviceError.code
            });
            // Lanzar error para que se muestre al usuario
            throw new Error(`Error al crear el servicio: ${serviceError.message}`);
          } else {
            console.log('✅ [Aprobación] Servicio creado exitosamente:', serviceData);
            console.log('✅ [Aprobación] ID del servicio creado:', serviceData?.id);
            toast({
              title: 'Éxito',
              description: 'Servicio creado y publicado en el Marketplace correctamente.',
            });
          }
        } catch (serviceError: any) {
          console.error('❌ [Aprobación] Error al crear servicio (catch):', serviceError);
          console.error('❌ [Aprobación] Stack trace:', serviceError.stack);
          // Mostrar error al usuario pero continuar con la actualización del estado
          toast({
            title: 'Error al crear servicio',
            description: serviceError.message || 'Hubo un problema al crear el servicio. Por favor, contacta al administrador.',
            variant: 'destructive',
          });
          // NO lanzar el error aquí para que la solicitud se marque como aprobada
          // El admin puede crear el servicio manualmente si es necesario
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

  const deleteRequest = async (requestId: string) => {
    try {
      console.log('🗑️ [Eliminar] Iniciando eliminación de solicitud:', requestId);
      
      // Verificar que el requestId existe
      if (!requestId) {
        throw new Error('ID de solicitud no proporcionado');
      }

      // Verificar que la solicitud existe antes de intentar eliminarla
      const { data: existingRequest, error: checkError } = await supabase
        .from('marketplace_publishing_requests')
        .select('id, contact_email, status')
        .eq('id', requestId)
        .single();

      if (checkError) {
        console.error('❌ [Eliminar] Error al verificar solicitud:', checkError);
        throw new Error(`No se encontró la solicitud: ${checkError.message}`);
      }

      if (!existingRequest) {
        throw new Error('La solicitud no existe');
      }

      console.log('🔍 [Eliminar] Solicitud encontrada:', existingRequest);

      // Intentar eliminar sin select primero para verificar si funciona
      const { error: deleteError, count } = await supabase
        .from('marketplace_publishing_requests')
        .delete({ count: 'exact' })
        .eq('id', requestId);

      console.log('🔍 [Eliminar] Resultado de eliminación (sin select):', { error: deleteError, count });

      if (deleteError) {
        console.error('❌ [Eliminar] Error de Supabase:', deleteError);
        console.error('❌ [Eliminar] Detalles del error:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
        throw deleteError;
      }

      // Verificar que realmente se eliminó
      if (count === 0) {
        console.warn('⚠️ [Eliminar] No se eliminó ningún registro. Count:', count);
        // Intentar verificar si todavía existe
        const { data: stillExists } = await supabase
          .from('marketplace_publishing_requests')
          .select('id')
          .eq('id', requestId)
          .single();
        
        if (stillExists) {
          throw new Error('La solicitud no se pudo eliminar. Puede ser un problema de permisos (RLS).');
        } else {
          console.log('✅ [Eliminar] La solicitud ya no existe, se eliminó correctamente');
        }
      } else {
        console.log(`✅ [Eliminar] ${count} solicitud(es) eliminada(s) exitosamente`);
      }

      toast({
        title: 'Éxito',
        description: 'Solicitud eliminada correctamente.',
      });

      // Forzar recarga de solicitudes con un pequeño delay para asegurar que la BD se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadRequests();
      
      // Verificar una vez más que se eliminó
      const { data: verifyDeleted } = await supabase
        .from('marketplace_publishing_requests')
        .select('id')
        .eq('id', requestId)
        .single();
      
      if (verifyDeleted) {
        console.warn('⚠️ [Eliminar] La solicitud todavía existe después de eliminar. Puede ser un problema de caché o RLS.');
      } else {
        console.log('✅ [Eliminar] Verificación: La solicitud fue eliminada correctamente');
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ [Eliminar] Error al eliminar solicitud (catch):', error);
      console.error('❌ [Eliminar] Stack trace:', error.stack);
      
      const errorMessage = error.message || 'No se pudo eliminar la solicitud';
      const errorDetails = error.details ? ` Detalles: ${error.details}` : '';
      const errorHint = error.hint ? ` Sugerencia: ${error.hint}` : '';
      
      toast({
        title: 'Error',
        description: `${errorMessage}${errorDetails}${errorHint}`,
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
    deleteRequest,
  };
};

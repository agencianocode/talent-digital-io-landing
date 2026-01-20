import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para trackear la última actividad del usuario.
 * 
 * Actualiza el campo `last_activity` en profiles cuando el usuario realiza
 * acciones significativas como:
 * - Iniciar sesión
 * - Editar perfil / agregar video / educación / experiencia
 * - Enviar mensajes
 * - Aplicar a oportunidades
 * - Publicar en marketplace
 * - Marcar notificaciones como leídas
 */
export const useActivityTracker = () => {
  const trackActivity = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.rpc('update_last_activity');
    } catch (error) {
      // Silent fail - activity tracking shouldn't break the app
      console.warn('Failed to track activity:', error);
    }
  }, []);

  return { trackActivity };
};

/**
 * Función standalone para trackear actividad sin usar el hook.
 * Útil para contextos donde no se puede usar hooks.
 */
export const trackUserActivity = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.rpc('update_last_activity');
  } catch (error) {
    console.warn('Failed to track activity:', error);
  }
};

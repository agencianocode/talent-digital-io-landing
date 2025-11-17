-- ========================================
-- PROCESAR NOTIFICACIONES PENDIENTES
-- Este script lista las notificaciones que necesitan ser procesadas
-- El frontend debería procesarlas automáticamente cuando esté abierto
-- ========================================

-- Ver notificaciones creadas en las últimas 24 horas que no han sido leídas
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  read,
  created_at,
  NOW() - created_at as tiempo_transcurrido
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND read = false
ORDER BY created_at DESC;

-- Para procesarlas manualmente desde el frontend:
-- await supabase.functions.invoke('process-notification', { 
--   body: { notification_id: 'id-aqui' } 
-- })

-- Verificar si el usuario tiene la app abierta (tiene suscripción Realtime activa)
-- Esto es difícil de verificar desde SQL, pero puedes:
-- 1. Abrir la app en el navegador
-- 2. Ver en la consola del navegador si hay logs de [useNotifications]
-- 3. Crear una nueva notificación y ver si aparece en tiempo real


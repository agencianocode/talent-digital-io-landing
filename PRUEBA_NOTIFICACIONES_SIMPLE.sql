-- ========================================
-- PRUEBA SIMPLE DE NOTIFICACIONES
-- Ejecuta este script paso a paso para probar el sistema
-- ========================================

-- PASO 1: Obtener tu user_id (cambia el email por el tuyo)
SELECT 
  id as user_id,
  email
FROM auth.users
WHERE email = 'tu-email@ejemplo.com'  -- ⚠️ CAMBIA ESTE EMAIL
LIMIT 1;

-- PASO 2: Crear una notificación de prueba
-- ⚠️ Reemplaza 'TU_USER_ID_AQUI' con el user_id del PASO 1
INSERT INTO notifications (
  user_id, 
  type, 
  title, 
  message, 
  action_url,
  read
)
VALUES (
  'TU_USER_ID_AQUI'::uuid,  -- ⚠️ CAMBIA POR TU USER_ID
  'system',
  '🧪 Prueba de Notificación',
  'Si ves esta notificación, el sistema está funcionando correctamente.',
  '/dashboard',
  false
)
RETURNING id, created_at;

-- PASO 3: Verificar que se creó
SELECT 
  id,
  user_id,
  type,
  title,
  read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 1;

-- PASO 4: Procesar manualmente la notificación (si no se procesó automáticamente)
-- Esto llamará a la Edge Function process-notification
-- ⚠️ Reemplaza 'NOTIFICATION_ID_AQUI' con el id del PASO 2
SELECT 
  'Para procesar manualmente, ejecuta en tu código frontend:' as instruccion
UNION ALL
SELECT 'await supabase.functions.invoke("process-notification", { body: { notification_id: "NOTIFICATION_ID_AQUI" } })';

-- PASO 5: Verificar si hay notificaciones sin procesar
SELECT 
  COUNT(*) as notificaciones_sin_leer,
  MIN(created_at) as mas_antigua,
  MAX(created_at) as mas_reciente
FROM notifications
WHERE read = false;

-- PASO 6: Ver todas tus notificaciones recientes
SELECT 
  id,
  type,
  title,
  message,
  read,
  created_at
FROM notifications
WHERE user_id = 'TU_USER_ID_AQUI'::uuid  -- ⚠️ CAMBIA POR TU USER_ID
ORDER BY created_at DESC
LIMIT 10;


-- ========================================
-- VERIFICAR DETALLES DEL SISTEMA DE NOTIFICACIONES
-- Ejecuta después del diagnóstico inicial
-- ========================================

-- 1. Ver las funciones SQL de notificaciones en detalle
SELECT 
  routine_name as funcion,
  routine_type as tipo,
  data_type as retorna
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%'
ORDER BY routine_name;

-- 2. Ver los triggers activos en detalle
SELECT 
  trigger_name as trigger,
  event_manipulation as evento,
  action_timing as timing,
  action_statement as funcion_ejecutada
FROM information_schema.triggers
WHERE event_object_table = 'notifications'
ORDER BY trigger_name;

-- 3. Ver notificaciones recientes con detalles
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  read,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '1 hour' THEN '🟢 Muy reciente'
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN '🟡 Reciente'
    ELSE '🔴 Antigua'
  END as antiguedad
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar si hay usuarios con perfiles (para enviar notificaciones)
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as con_email
FROM auth.users;

-- 5. Verificar configuración de admin para notificaciones
SELECT 
  category,
  key,
  value,
  CASE 
    WHEN value IS NOT NULL THEN '✅ Configurado'
    ELSE '❌ No configurado'
  END as estado
FROM admin_settings
WHERE category = 'notifications'
ORDER BY key;

-- 6. Ver preferencias de usuarios (muestra resumen)
SELECT 
  notification_type,
  COUNT(*) as total_preferencias,
  COUNT(*) FILTER (WHERE enabled = true) as habilitadas,
  COUNT(*) FILTER (WHERE enabled = false) as deshabilitadas
FROM user_notification_preferences
GROUP BY notification_type
ORDER BY notification_type;

-- 7. Verificar si hay suscripciones push (aunque estén inactivas)
SELECT 
  COUNT(*) as total_suscripciones,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '30 days') as activas_30dias,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '7 days') as activas_7dias,
  COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '30 days') as inactivas
FROM push_subscriptions;

-- 8. Ver detalles de suscripciones push (si existen)
SELECT 
  ps.id,
  ps.user_id,
  u.email,
  p.full_name,
  ps.endpoint,
  ps.created_at,
  ps.updated_at,
  CASE 
    WHEN ps.updated_at > NOW() - INTERVAL '7 days' THEN '🟢 Activa'
    WHEN ps.updated_at > NOW() - INTERVAL '30 days' THEN '🟡 Reciente'
    ELSE '🔴 Inactiva'
  END as estado
FROM push_subscriptions ps
LEFT JOIN auth.users u ON u.id = ps.user_id
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY ps.updated_at DESC
LIMIT 10;

-- 9. Verificar si Realtime está habilitado (esto se verifica en el Dashboard)
SELECT 
  '⚠️ Para verificar Realtime:' as instruccion
UNION ALL
SELECT '1. Ve a Supabase Dashboard → Database → Replication'
UNION ALL
SELECT '2. Busca la tabla "notifications"'
UNION ALL
SELECT '3. Verifica que tenga Realtime habilitado ✅';

-- 10. Resumen de problemas encontrados
SELECT 
  '===== PROBLEMAS ENCONTRADOS =====' as resumen
UNION ALL
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM push_subscriptions WHERE updated_at > NOW() - INTERVAL '30 days') = 0 
    THEN '❌ PROBLEMA: No hay suscripciones push activas'
    ELSE '✅ OK: Hay suscripciones push activas'
  END
UNION ALL
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM admin_settings WHERE category = 'notifications') = 0 
    THEN '⚠️ ADVERTENCIA: No hay configuración de admin para notificaciones'
    ELSE '✅ OK: Configuración de admin existe'
  END
UNION ALL
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM notifications WHERE read = false AND created_at < NOW() - INTERVAL '24 hours') > 0 
    THEN '⚠️ ADVERTENCIA: Hay notificaciones antiguas sin leer'
    ELSE '✅ OK: No hay notificaciones antiguas sin leer'
  END;


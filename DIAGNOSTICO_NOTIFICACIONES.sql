-- ========================================
-- DIAGNÓSTICO DEL SISTEMA DE NOTIFICACIONES
-- Ejecuta este script para verificar el estado actual
-- ========================================

-- 1. Verificar que la tabla notifications existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
    THEN '✅ Tabla notifications existe'
    ELSE '❌ Tabla notifications NO existe'
  END as estado_tabla;

-- 2. Verificar que la tabla push_subscriptions existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_subscriptions')
    THEN '✅ Tabla push_subscriptions existe'
    ELSE '❌ Tabla push_subscriptions NO existe'
  END as estado_tabla;

-- 3. Verificar funciones SQL de notificaciones
SELECT 
  routine_name as funcion,
  routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%'
ORDER BY routine_name;

-- 4. Verificar triggers activos en la tabla notifications
SELECT 
  trigger_name as trigger,
  event_manipulation as evento,
  action_timing as timing,
  action_statement as funcion
FROM information_schema.triggers
WHERE event_object_table = 'notifications'
ORDER BY trigger_name;

-- 5. Contar notificaciones en la tabla
SELECT 
  COUNT(*) as total_notificaciones,
  COUNT(*) FILTER (WHERE read = false) as no_leidas,
  COUNT(*) FILTER (WHERE read = true) as leidas,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as ultimas_24h
FROM notifications;

-- 6. Verificar suscripciones push activas
SELECT 
  COUNT(*) as total_suscripciones,
  COUNT(DISTINCT user_id) as usuarios_suscritos,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '30 days') as activas_30dias
FROM push_subscriptions;

-- 7. Verificar configuración de admin para notificaciones
SELECT 
  category,
  key,
  CASE 
    WHEN value IS NOT NULL THEN '✅ Configurado'
    ELSE '❌ No configurado'
  END as estado
FROM admin_settings
WHERE category = 'notifications'
ORDER BY key;

-- 8. Verificar preferencias de usuarios (muestra un ejemplo)
SELECT 
  COUNT(*) as total_preferencias,
  COUNT(DISTINCT user_id) as usuarios_con_preferencias,
  COUNT(*) FILTER (WHERE enabled = true) as habilitadas,
  COUNT(*) FILTER (WHERE enabled = false) as deshabilitadas
FROM user_notification_preferences;

-- 9. Ver últimas 5 notificaciones creadas
SELECT 
  id,
  user_id,
  type,
  title,
  read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 5;

-- 10. Resumen del estado
SELECT 
  '===== RESUMEN DEL DIAGNÓSTICO =====' as resumen
UNION ALL
SELECT '📊 Total notificaciones: ' || COUNT(*)::text
FROM notifications
UNION ALL
SELECT '🔔 Notificaciones no leídas: ' || COUNT(*)::text
FROM notifications
WHERE read = false
UNION ALL
SELECT '📱 Suscripciones push activas: ' || COUNT(*)::text
FROM push_subscriptions
WHERE updated_at > NOW() - INTERVAL '30 days'
UNION ALL
SELECT '⚙️ Funciones SQL: ' || COUNT(*)::text
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%'
UNION ALL
SELECT '🔧 Triggers activos: ' || COUNT(*)::text
FROM information_schema.triggers
WHERE event_object_table = 'notifications';


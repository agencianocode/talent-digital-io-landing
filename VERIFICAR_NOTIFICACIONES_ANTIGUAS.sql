-- ========================================
-- VERIFICAR Y GESTIONAR NOTIFICACIONES ANTIGUAS
-- Ejecuta este script para ver las notificaciones antiguas sin leer
-- ========================================

-- 1. Ver todas las notificaciones antiguas sin leer (> 24 horas)
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  read,
  created_at,
  NOW() - created_at as tiempo_transcurrido,
  CASE 
    WHEN created_at < NOW() - INTERVAL '7 days' THEN '🔴 Muy antigua (>7 días)'
    WHEN created_at < NOW() - INTERVAL '3 days' THEN '🟡 Antigua (>3 días)'
    ELSE '🟢 Reciente (>24 horas)'
  END as antiguedad
FROM notifications
WHERE read = false 
  AND created_at < NOW() - INTERVAL '24 hours'
ORDER BY created_at ASC;

-- 2. Contar notificaciones por antigüedad
WITH categorized AS (
  SELECT 
    CASE 
      WHEN created_at < NOW() - INTERVAL '7 days' THEN '>7 días'
      WHEN created_at < NOW() - INTERVAL '3 days' THEN '>3 días'
      WHEN created_at < NOW() - INTERVAL '24 hours' THEN '>24 horas'
      ELSE '<24 horas'
    END AS antiguedad,
    read
  FROM notifications
)
SELECT 
  antiguedad,
  COUNT(*) AS cantidad,
  COUNT(*) FILTER (WHERE read = false) AS no_leidas,
  COUNT(*) FILTER (WHERE read = true) AS leidas
FROM categorized
GROUP BY antiguedad
ORDER BY 
  CASE antiguedad
    WHEN '>7 días' THEN 1
    WHEN '>3 días' THEN 2
    WHEN '>24 horas' THEN 3
    ELSE 4
  END;

-- 3. Ver notificaciones antiguas con información del usuario
SELECT 
  n.id,
  n.user_id,
  u.email,
  p.full_name,
  n.type,
  n.title,
  n.read,
  n.created_at,
  NOW() - n.created_at as tiempo_transcurrido
FROM notifications n
LEFT JOIN auth.users u ON u.id = n.user_id
LEFT JOIN profiles p ON p.user_id = u.id
WHERE n.read = false 
  AND n.created_at < NOW() - INTERVAL '24 hours'
ORDER BY n.created_at ASC
LIMIT 20;

-- 4. OPCIONAL: Marcar como leídas las notificaciones muy antiguas (>7 días)
-- ⚠️ DESCOMENTA ESTAS LÍNEAS SOLO SI QUIERES MARCARLAS COMO LEÍDAS
/*
UPDATE notifications
SET read = true,
    read_at = NOW()
WHERE read = false 
  AND created_at < NOW() - INTERVAL '7 days';

SELECT 'Notificaciones muy antiguas marcadas como leídas' as resultado;
SELECT COUNT(*) as cantidad_marcadas FROM notifications 
WHERE read = true AND read_at >= NOW() - INTERVAL '1 minute';
*/

-- 5. OPCIONAL: Eliminar notificaciones muy antiguas (>30 días y leídas)
-- ⚠️ DESCOMENTA ESTAS LÍNEAS SOLO SI QUIERES ELIMINARLAS
/*
DELETE FROM notifications
WHERE read = true 
  AND created_at < NOW() - INTERVAL '30 days';

SELECT 'Notificaciones antiguas eliminadas' as resultado;
*/


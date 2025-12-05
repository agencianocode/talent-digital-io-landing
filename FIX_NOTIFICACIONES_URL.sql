-- Script para corregir URLs de notificaciones de solicitudes de membresía
-- Problema: Notificaciones antiguas apuntan a /business-dashboard/team/requests (404)
-- Solución: Actualizar a /business-dashboard/users
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Ver notificaciones actuales con URL incorrecta
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  action_url,
  created_at,
  read
FROM notifications
WHERE type = 'membership_request'
  AND action_url LIKE '%team/requests%'
ORDER BY created_at DESC;

-- PASO 2: Actualizar URLs incorrectas a la correcta
UPDATE notifications
SET action_url = '/business-dashboard/users'
WHERE type = 'membership_request'
  AND (
    action_url = '/business-dashboard/team/requests'
    OR action_url LIKE '%team/requests%'
    OR action_url = '/business-dashboard/team'
  );

-- PASO 3: Verificar que se actualizaron correctamente
SELECT 
  id,
  type,
  title,
  action_url,
  created_at
FROM notifications
WHERE type = 'membership_request'
ORDER BY created_at DESC
LIMIT 10;

-- PASO 4: Ver todas las notificaciones de un usuario específico
-- Reemplaza 'TU-EMAIL@AQUI.COM' con tu email
SELECT 
  n.id,
  n.type,
  n.title,
  n.message,
  n.action_url,
  n.read,
  n.created_at
FROM notifications n
JOIN auth.users u ON u.id = n.user_id
WHERE u.email = 'TU-EMAIL@AQUI.COM'
ORDER BY n.created_at DESC
LIMIT 20;


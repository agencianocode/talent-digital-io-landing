-- ========================================
-- CORRECCIÓN: Actualizar action_url de notificaciones de equipo
-- ========================================
-- Este script corrige las notificaciones existentes que tienen la URL incorrecta
-- y actualiza las funciones para futuras notificaciones

-- 1. Actualizar notificaciones existentes con URL incorrecta
-- Nuevo miembro
UPDATE notifications
SET action_url = '/business-dashboard/users'
WHERE type = 'team'
  AND title = '👥 Nuevo miembro en el equipo'
  AND (action_url = '/business-dashboard/team' OR action_url = '/business-dashboard/team/requests');

-- Solicitud de acceso
UPDATE notifications
SET action_url = '/business-dashboard/users'
WHERE type = 'team'
  AND title = '🔔 Solicitud de acceso'
  AND (action_url = '/business-dashboard/team/requests' OR action_url = '/business-dashboard/team');

-- 2. Actualizar la función notify_access_request para que use la URL correcta
CREATE OR REPLACE FUNCTION notify_access_request(
  p_company_id UUID,
  p_requester_id UUID,
  p_requested_role TEXT DEFAULT 'Miembro'
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  company_owner_id UUID;
  company_name_var TEXT;
  requester_name TEXT;
BEGIN
  -- Obtener información de la empresa
  SELECT c.user_id, c.name
  INTO company_owner_id, company_name_var
  FROM companies c
  WHERE c.id = p_company_id;
  
  -- Obtener nombre del solicitante
  SELECT COALESCE(p.full_name, u.email)
  INTO requester_name
  FROM auth.users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = p_requester_id;
  
  -- Notificar al owner de la empresa
  INSERT INTO notifications (user_id, type, title, message, action_url, read)
  VALUES (
    company_owner_id,
    'team',
    '🔔 Solicitud de acceso',
    requester_name || ' solicitó unirse a ' || company_name_var || ' como ' || p_requested_role,
    '/business-dashboard/users',
    false
  );
END;
$$;

-- 3. Actualizar la función notify_new_team_member para que use la URL correcta
CREATE OR REPLACE FUNCTION notify_new_team_member()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  company_owner_id UUID;
  company_name_var TEXT;
  new_member_name TEXT;
  new_member_role TEXT;
BEGIN
  -- Obtener información de la empresa
  SELECT c.user_id, c.name
  INTO company_owner_id, company_name_var
  FROM companies c
  WHERE c.id = NEW.company_id;
  
  -- Obtener nombre del nuevo miembro
  SELECT COALESCE(p.full_name, u.email)
  INTO new_member_name
  FROM auth.users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = NEW.user_id;
  
  -- Obtener rol del nuevo miembro
  new_member_role := COALESCE(NEW.role, 'Miembro');
  
  -- Solo notificar si no es el owner quien se está agregando
  IF NEW.user_id != company_owner_id THEN
    -- Notificar al owner de la empresa
    INSERT INTO notifications (user_id, type, title, message, action_url, read)
    VALUES (
      company_owner_id,
      'team',
      '👥 Nuevo miembro en el equipo',
      new_member_name || ' se unió a ' || company_name_var || ' como ' || new_member_role,
      '/business-dashboard/users',
      false
    );
    
    -- Notificar al nuevo miembro
    INSERT INTO notifications (user_id, type, title, message, action_url, read)
    VALUES (
      NEW.user_id,
      'team',
      '🎉 Bienvenido al equipo',
      'Te has unido a ' || company_name_var || ' como ' || new_member_role,
      '/business-dashboard',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Verificar actualización
SELECT 
  COUNT(*) as notificaciones_corregidas,
  '✅ Notificaciones de nuevo miembro actualizadas' as estado
FROM notifications
WHERE type = 'team'
  AND title = '👥 Nuevo miembro en el equipo'
  AND action_url = '/business-dashboard/users';

SELECT 
  COUNT(*) as notificaciones_corregidas,
  '✅ Notificaciones de solicitud de acceso actualizadas' as estado
FROM notifications
WHERE type = 'team'
  AND title = '🔔 Solicitud de acceso'
  AND action_url = '/business-dashboard/users';

SELECT '✅ Funciones actualizadas correctamente' as resultado;


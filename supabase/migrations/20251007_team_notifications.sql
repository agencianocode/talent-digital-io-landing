-- ========================================
-- NOTIFICACIONES DE EQUIPO Y EMPRESA
-- ========================================

-- 1. TRIGGER: Nuevo miembro se une al equipo
-- Se ejecuta cuando se acepta una invitación o se agrega un usuario

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

-- Crear trigger para nuevos miembros del equipo
-- Asumiendo que existe una tabla company_users o user_roles
DROP TRIGGER IF EXISTS trigger_new_team_member ON user_roles;
CREATE TRIGGER trigger_new_team_member
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_team_member();

-- ========================================
-- 2. FUNCIÓN: Notificar solicitud de acceso pendiente
-- Se llama manualmente cuando alguien solicita unirse
-- ========================================

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
    '/business-dashboard/team/requests',
    false
  );
END;
$$;

-- ========================================
-- VERIFICAR INSTALACIÓN
-- ========================================

SELECT 
  routine_name as funcion,
  '✅ Creada' as estado
FROM information_schema.routines 
WHERE routine_name IN (
  'notify_new_team_member',
  'notify_access_request'
)
ORDER BY routine_name;

SELECT 
  trigger_name,
  event_object_table as tabla,
  '✅ Activo' as estado
FROM information_schema.triggers
WHERE trigger_name = 'trigger_new_team_member';

COMMENT ON FUNCTION notify_new_team_member() IS 'Notifica cuando un nuevo miembro se une al equipo';
COMMENT ON FUNCTION notify_access_request(UUID, UUID, TEXT) IS 'Notifica cuando alguien solicita acceso a una empresa';

SELECT '✅ Notificaciones de equipo/empresa implementadas' as resultado;


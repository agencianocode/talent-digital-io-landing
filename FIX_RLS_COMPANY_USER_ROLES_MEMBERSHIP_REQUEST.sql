-- Script para permitir que usuarios creen solicitudes de membresía a empresas
-- Error: "new row violates row-level security policy for table company_user_roles"
-- Ejecutar en Supabase SQL Editor

-- 1. Ver políticas actuales de company_user_roles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'company_user_roles'
ORDER BY policyname;

-- 2. Crear política para permitir que usuarios creen solicitudes de membresía
-- Esto permite que cualquier usuario autenticado pueda crear una solicitud pendiente
CREATE POLICY "Users can create membership requests"
ON company_user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Solo pueden crear solicitudes para sí mismos
  auth.uid() = user_id
  AND
  -- Solo pueden crear con status 'pending'
  status = 'pending'
);

-- 3. Verificar que la política se creó correctamente
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'company_user_roles'
  AND policyname = 'Users can create membership requests';

-- 4. OPCIONAL: Si necesitas actualizar una política existente en lugar de crear una nueva
-- Primero eliminar la política vieja (si existe):
-- DROP POLICY IF EXISTS "Users can create membership requests" ON company_user_roles;

-- 5. Verificar que los usuarios pueden leer sus propias solicitudes
-- Si no existe, crear política de lectura
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_user_roles'
      AND policyname = 'Users can view their own membership requests'
  ) THEN
    CREATE POLICY "Users can view their own membership requests"
    ON company_user_roles
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = user_id
      OR
      -- Propietarios pueden ver todas las solicitudes de su empresa
      company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
      )
      OR
      -- Admins de la empresa pueden ver solicitudes
      company_id IN (
        SELECT company_id 
        FROM company_user_roles 
        WHERE user_id = auth.uid() 
          AND role IN ('owner', 'admin')
          AND status = 'accepted'
      )
    );
  END IF;
END $$;

-- 6. Verificar todas las políticas finales
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lectura'
    WHEN cmd = 'INSERT' THEN 'Creación'
    WHEN cmd = 'UPDATE' THEN 'Actualización'
    WHEN cmd = 'DELETE' THEN 'Eliminación'
  END as tipo_operacion
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'company_user_roles'
ORDER BY cmd, policyname;


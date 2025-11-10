-- 🔒 CORREGIR POLÍTICAS RLS PARA TABLA APPLICATIONS
-- Problema: Error 403 al enviar aplicaciones
-- Causa: Falta política de INSERT para usuarios autenticados
-- Solución: Crear políticas completas para applications

-- ============================================================================
-- INSTRUCCIONES:
-- 1. Copiar TODO este archivo
-- 2. Pegar en Supabase SQL Editor
-- 3. Click "Run"
-- 4. Esperar 5-10 segundos
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar políticas actuales
-- ============================================================================

SELECT 
  policyname,
  cmd as operacion,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY cmd;

-- ============================================================================
-- PASO 2: Habilitar RLS en la tabla
-- ============================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 3: CREAR POLÍTICAS PARA TALENTOS
-- ============================================================================

-- INSERT: Talentos pueden crear sus propias aplicaciones
DROP POLICY IF EXISTS "users_can_insert_own_applications" ON applications;
CREATE POLICY "users_can_insert_own_applications"
ON applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECT: Talentos pueden ver sus propias aplicaciones
DROP POLICY IF EXISTS "users_can_view_own_applications" ON applications;
CREATE POLICY "users_can_view_own_applications"
ON applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- UPDATE: Talentos pueden actualizar sus propias aplicaciones
DROP POLICY IF EXISTS "users_can_update_own_applications" ON applications;
CREATE POLICY "users_can_update_own_applications"
ON applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Talentos pueden eliminar sus propias aplicaciones (opcional)
DROP POLICY IF EXISTS "users_can_delete_own_applications" ON applications;
CREATE POLICY "users_can_delete_own_applications"
ON applications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PASO 4: CREAR POLÍTICAS PARA EMPRESAS
-- ============================================================================

-- SELECT: Empresas pueden ver aplicaciones a sus oportunidades
DROP POLICY IF EXISTS "companies_can_view_applications_to_their_opportunities" ON applications;
CREATE POLICY "companies_can_view_applications_to_their_opportunities"
ON applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM opportunities o
    JOIN companies c ON c.id = o.company_id
    WHERE o.id = applications.opportunity_id
      AND c.user_id = auth.uid()
  )
);

-- UPDATE: Empresas pueden actualizar aplicaciones a sus oportunidades (cambiar status, rating, etc.)
DROP POLICY IF EXISTS "companies_can_update_applications_to_their_opportunities" ON applications;
CREATE POLICY "companies_can_update_applications_to_their_opportunities"
ON applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM opportunities o
    JOIN companies c ON c.id = o.company_id
    WHERE o.id = applications.opportunity_id
      AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM opportunities o
    JOIN companies c ON c.id = o.company_id
    WHERE o.id = applications.opportunity_id
      AND c.user_id = auth.uid()
  )
);

-- ============================================================================
-- PASO 5: CREAR POLÍTICAS PARA ADMIN
-- ============================================================================

-- Admins pueden ver todas las aplicaciones
DROP POLICY IF EXISTS "admin_can_read_all_applications" ON applications;
CREATE POLICY "admin_can_read_all_applications"
ON applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
);

-- Admins pueden actualizar todas las aplicaciones
DROP POLICY IF EXISTS "admin_can_update_all_applications" ON applications;
CREATE POLICY "admin_can_update_all_applications"
ON applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
);

-- ============================================================================
-- PASO 6: Verificar que todas las políticas se crearon correctamente
-- ============================================================================

SELECT 
  tablename,
  policyname,
  cmd as operacion,
  permissive,
  roles,
  CASE 
    WHEN policyname LIKE '%talent%' OR policyname LIKE '%user%' THEN '👤 Talento'
    WHEN policyname LIKE '%compan%' THEN '🏢 Empresa'
    WHEN policyname LIKE '%admin%' THEN '⚙️ Admin'
    ELSE '❓ Otro'
  END as tipo_usuario
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY cmd, policyname;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Deberías ver 9 políticas en total:
-- 
-- INSERT:
-- ✅ users_can_insert_own_applications (👤 Talento)
--
-- SELECT:
-- ✅ users_can_view_own_applications (👤 Talento)
-- ✅ companies_can_view_applications_to_their_opportunities (🏢 Empresa)
-- ✅ admin_can_read_all_applications (⚙️ Admin)
--
-- UPDATE:
-- ✅ users_can_update_own_applications (👤 Talento)
-- ✅ companies_can_update_applications_to_their_opportunities (🏢 Empresa)
-- ✅ admin_can_update_all_applications (⚙️ Admin)
--
-- DELETE:
-- ✅ users_can_delete_own_applications (👤 Talento)

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 
-- 1. Estas políticas permiten:
--    - ✅ Talentos pueden aplicar a oportunidades
--    - ✅ Talentos pueden ver/editar sus aplicaciones
--    - ✅ Empresas pueden ver aplicaciones a sus vacantes
--    - ✅ Empresas pueden cambiar status de aplicaciones
--    - ✅ Admins tienen acceso completo
--
-- 2. Seguridad:
--    - ✅ Cada usuario solo ve SUS aplicaciones
--    - ✅ Empresas solo ven aplicaciones a SUS oportunidades
--    - ✅ No hay fugas de información entre usuarios
--
-- 3. Si después de ejecutar esto sigue el error 403:
--    - Verificar que el usuario tiene un token válido
--    - Recargar la página para obtener nuevo token
--    - Verificar en logs de Supabase si hay otros errores


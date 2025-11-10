-- 🔒 VERIFICAR Y CORREGIR POLÍTICAS RLS PARA TALENT_PROFILES
-- Verificar que los usuarios puedan actualizar su propio perfil

-- 1. Ver políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as usando,
  with_check as con_verificacion
FROM pg_policies
WHERE tablename IN ('talent_profiles', 'profiles')
ORDER BY tablename, cmd;

-- 2. Verificar si existe política de UPDATE para talent_profiles
SELECT COUNT(*) as tiene_politica_update
FROM pg_policies
WHERE tablename = 'talent_profiles' 
  AND cmd = 'UPDATE';

-- 3. CREAR POLÍTICA SI NO EXISTE (ejecutar si el count anterior es 0)

-- Habilitar RLS si no está habilitado
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios puedan ver su propio perfil
CREATE POLICY IF NOT EXISTS "users_can_view_own_talent_profile"
ON talent_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para que usuarios puedan insertar su propio perfil
CREATE POLICY IF NOT EXISTS "users_can_insert_own_talent_profile"
ON talent_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ⚠️ POLÍTICA CRÍTICA: Permitir que usuarios actualicen su propio perfil
CREATE POLICY IF NOT EXISTS "users_can_update_own_talent_profile"
ON talent_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para que usuarios puedan eliminar su propio perfil
CREATE POLICY IF NOT EXISTS "users_can_delete_own_talent_profile"
ON talent_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. POLÍTICAS PARA PROFILES (si faltan)

-- Política para actualizar profiles
CREATE POLICY IF NOT EXISTS "users_can_update_own_profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. VERIFICAR QUE LAS POLÍTICAS SE CREARON
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('talent_profiles', 'profiles')
  AND cmd = 'UPDATE'
ORDER BY tablename;

-- 6. PROBAR ACTUALIZACIÓN COMO USUARIO
-- Cambiar a la sesión del usuario y ejecutar:
-- 
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claim.sub = '(USER_ID)';
-- 
-- UPDATE talent_profiles
-- SET experience_level = 'intermedio'
-- WHERE user_id = auth.uid();
-- 
-- Si falla, hay problema de RLS


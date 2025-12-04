-- Script para arreglar recursión infinita en políticas RLS de tabla companies
-- Error: "infinite recursion detected in policy for relation companies"
-- Este error ocurre cuando una política RLS referencia a sí misma de forma circular
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Ver todas las políticas actuales de companies
SELECT 
  policyname,
  cmd as operacion,
  qual as condicion_select,
  with_check as condicion_insert_update
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
ORDER BY policyname;

-- PASO 2: ELIMINAR todas las políticas actuales que causan recursión
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Users can view their companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can update companies" ON companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON companies;
DROP POLICY IF EXISTS "Company members can view their company" ON companies;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable update for company owners" ON companies;

-- PASO 3: Crear políticas SIMPLES y SIN RECURSIÓN

-- Política 1: SELECT (Ver empresas)
-- Los usuarios pueden ver:
-- a) Empresas que ellos crearon
-- b) Todas las empresas (para búsqueda pública)
CREATE POLICY "Anyone can view companies"
ON companies
FOR SELECT
TO authenticated
USING (true); -- Permitir ver todas las empresas (necesario para búsqueda)

-- Política 2: INSERT (Crear empresas)
-- Solo el propietario puede crear su propia empresa
CREATE POLICY "Users can create their own company"
ON companies
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Política 3: UPDATE (Actualizar empresas)
-- Solo el propietario puede actualizar su empresa
CREATE POLICY "Users can update their own company"
ON companies
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Política 4: DELETE (Eliminar empresas)
-- Solo el propietario puede eliminar su empresa
CREATE POLICY "Users can delete their own company"
ON companies
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

-- PASO 4: Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd as operacion,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ Ver empresas'
    WHEN cmd = 'INSERT' THEN '✅ Crear empresa'
    WHEN cmd = 'UPDATE' THEN '✅ Actualizar empresa'
    WHEN cmd = 'DELETE' THEN '✅ Eliminar empresa'
  END as descripcion,
  permissive as tipo
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
ORDER BY cmd, policyname;

-- PASO 5: Probar que funciona
-- Este query debe funcionar sin error:
SELECT id, name, logo_url, user_id
FROM companies
WHERE name ILIKE '%SalesXcelerator%'
LIMIT 5;


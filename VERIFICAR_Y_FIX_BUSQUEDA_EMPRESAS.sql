-- Script para verificar y arreglar la búsqueda de empresas en company onboarding
-- Problema: No aparecen empresas en el autocompletado
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar que hay empresas en la base de datos
SELECT 
  id,
  name,
  user_id,
  logo_url,
  description,
  created_at
FROM companies
ORDER BY created_at DESC
LIMIT 10;

-- PASO 2: Ver todas las políticas actuales de companies
SELECT 
  policyname,
  cmd as operacion,
  permissive,
  roles,
  qual::text as condicion_using,
  with_check::text as condicion_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
ORDER BY cmd, policyname;

-- PASO 3: Verificar si hay políticas duplicadas o conflictivas
SELECT 
  cmd,
  COUNT(*) as cantidad_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
GROUP BY cmd
ORDER BY cmd;

-- PASO 4: Si hay múltiples políticas SELECT, eliminarlas TODAS
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Users can view their companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Company members can view their company" ON companies;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable read access for all users" ON companies;
DROP POLICY IF EXISTS "Public companies are viewable by everyone" ON companies;

-- PASO 5: Crear UNA SOLA política de lectura SIMPLE
CREATE POLICY "authenticated_users_can_view_all_companies"
ON companies
FOR SELECT
TO authenticated
USING (true); -- Permitir ver TODAS las empresas (necesario para búsqueda)

-- PASO 6: Verificar que solo hay UNA política SELECT
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
  AND cmd = 'SELECT';

-- PASO 7: Probar la búsqueda como lo hace el frontend
-- Esta consulta simula lo que hace CompanyOnboardingStep1.tsx
SELECT 
  id, 
  name, 
  logo_url
FROM companies
WHERE name ILIKE '%salex%'
LIMIT 5;

-- PASO 8: Si aún no funciona, verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'companies';

-- PASO 9: Si RLS está deshabilitado, habilitarlo
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- PASO 10: Verificación final - debe devolver empresas
SELECT 
  id,
  name,
  logo_url,
  CASE 
    WHEN user_id IS NOT NULL THEN '✅ Tiene propietario'
    ELSE '❌ Sin propietario'
  END as estado
FROM companies
ORDER BY name
LIMIT 10;


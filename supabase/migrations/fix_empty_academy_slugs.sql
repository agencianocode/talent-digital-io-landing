-- Fix para limpiar academy_slugs vacíos que causan error de duplicados
-- EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR UNA SOLA VEZ

-- Convertir todos los academy_slug con empty string ('') a NULL
-- Esto previene errores de unique constraint
UPDATE companies
SET academy_slug = NULL
WHERE academy_slug = '';

-- Verificar el cambio
SELECT 
  id,
  name,
  academy_slug,
  CASE 
    WHEN academy_slug IS NULL THEN 'NULL'
    WHEN academy_slug = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END as slug_status
FROM companies
ORDER BY academy_slug NULLS FIRST;


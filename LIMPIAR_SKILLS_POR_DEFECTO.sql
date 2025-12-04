-- Script para identificar y limpiar skills por defecto que no corresponden
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Ver perfiles con los skills problemáticos por defecto
SELECT 
  p.user_id,
  p.full_name,
  p.title,
  tp.skills
FROM profiles p
LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
WHERE tp.skills IS NOT NULL
  AND tp.skills @> ARRAY['automatizaciones', 'desarrollo No Code', 'product manager']::text[]
ORDER BY p.created_at DESC;

-- PASO 2: Ver cuántos perfiles tienen exactamente esos 3 skills
SELECT 
  COUNT(*) as perfiles_con_skills_por_defecto
FROM talent_profiles tp
WHERE tp.skills = ARRAY['automatizaciones', 'desarrollo No Code', 'product manager']::text[];

-- PASO 3: LIMPIAR - Eliminar esos skills por defecto de perfiles que NO son de tecnología
-- Solo ejecutar después de verificar los resultados anteriores
UPDATE talent_profiles tp
SET skills = ARRAY[]::text[]
WHERE tp.skills = ARRAY['automatizaciones', 'desarrollo No Code', 'product manager']::text[]
  AND tp.user_id IN (
    SELECT p.user_id 
    FROM profiles p
    WHERE p.title NOT ILIKE '%tecnolog%'
      AND p.title NOT ILIKE '%automation%'
      AND p.title NOT ILIKE '%no code%'
      AND p.title NOT ILIKE '%product manager%'
      AND p.title NOT ILIKE '%developer%'
      AND p.title NOT ILIKE '%programador%'
  );

-- PASO 4: Verificar resultado
SELECT 
  'DESPUÉS DE LIMPIEZA' as etapa,
  COUNT(*) as total_perfiles,
  COUNT(CASE WHEN skills IS NULL OR skills = '{}' THEN 1 END) as sin_skills,
  COUNT(CASE WHEN skills = ARRAY['automatizaciones', 'desarrollo No Code', 'product manager']::text[] THEN 1 END) as con_skills_por_defecto
FROM talent_profiles;

-- PASO 5: Mostrar perfiles que aún necesitan skills apropiados
SELECT 
  p.user_id,
  p.full_name,
  p.title,
  tp.skills,
  CASE 
    WHEN p.title ILIKE '%venta%' OR p.title ILIKE '%sales%' OR p.title ILIKE '%closer%' THEN 'Sugerencia: agregar skills de ventas'
    WHEN p.title ILIKE '%marketing%' THEN 'Sugerencia: agregar skills de marketing'
    WHEN p.title ILIKE '%diseño%' OR p.title ILIKE '%design%' THEN 'Sugerencia: agregar skills de diseño'
    WHEN p.title ILIKE '%customer%' OR p.title ILIKE '%atención%' THEN 'Sugerencia: agregar skills de atención al cliente'
    ELSE 'Revisar manualmente'
  END as recomendacion
FROM profiles p
LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
WHERE (tp.skills IS NULL OR tp.skills = '{}' OR array_length(tp.skills, 1) = 0)
  AND p.title IS NOT NULL
ORDER BY p.created_at DESC;


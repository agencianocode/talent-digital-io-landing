-- ========================================
-- MIGRACIÓN: Actualizar talent_profiles desde user_metadata
-- ========================================
-- Este script migra los datos de title, bio, skills y experience_level
-- desde auth.users.raw_user_meta_data a la tabla talent_profiles
-- para usuarios que ya completaron el onboarding pero no tienen estos datos

-- Función helper para extraer datos de metadata
CREATE OR REPLACE FUNCTION migrate_talent_profiles_from_metadata()
RETURNS TABLE(
  user_id UUID,
  title TEXT,
  bio TEXT,
  skills JSONB,
  experience_level TEXT,
  updated_count INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows INTEGER := 0;
BEGIN
  -- Actualizar talent_profiles con datos de user_metadata
  -- Solo actualizar si el campo en talent_profiles está NULL o vacío
  UPDATE talent_profiles tp
  SET 
    title = COALESCE(
      NULLIF(tp.title, ''),
      NULLIF(tp.title, 'Talento Digital'),
      (au.raw_user_meta_data->>'title')::TEXT
    ),
    bio = COALESCE(
      NULLIF(tp.bio, ''),
      NULLIF(tp.bio, 'Sin descripción'),
      (au.raw_user_meta_data->>'bio')::TEXT
    ),
    skills = COALESCE(
      tp.skills,
      CASE 
        WHEN au.raw_user_meta_data->>'skills' IS NOT NULL 
        THEN (au.raw_user_meta_data->>'skills')::JSONB
        ELSE NULL
      END
    ),
    experience_level = COALESCE(
      NULLIF(tp.experience_level, ''),
      (au.raw_user_meta_data->>'experience_level')::TEXT
    ),
    updated_at = NOW()
  FROM auth.users au
  WHERE tp.user_id = au.id
    AND (
      -- Solo actualizar si falta alguno de estos campos
      tp.title IS NULL 
      OR tp.title = '' 
      OR tp.title = 'Talento Digital'
      OR tp.bio IS NULL 
      OR tp.bio = ''
      OR tp.bio = 'Sin descripción'
      OR tp.skills IS NULL
      OR tp.experience_level IS NULL
      OR tp.experience_level = ''
    )
    AND (
      -- Y si existe el dato en metadata
      (au.raw_user_meta_data->>'title') IS NOT NULL
      OR (au.raw_user_meta_data->>'bio') IS NOT NULL
      OR (au.raw_user_meta_data->>'skills') IS NOT NULL
      OR (au.raw_user_meta_data->>'experience_level') IS NOT NULL
    );

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  -- Retornar estadísticas
  RETURN QUERY
  SELECT 
    tp.user_id,
    tp.title,
    tp.bio,
    tp.skills,
    tp.experience_level,
    updated_rows
  FROM talent_profiles tp
  WHERE updated_rows > 0
  LIMIT 1;
END;
$$;

-- Ejecutar la migración
SELECT * FROM migrate_talent_profiles_from_metadata();

-- Verificar resultados
SELECT 
  COUNT(*) as total_talent_profiles,
  COUNT(CASE WHEN title IS NOT NULL AND title != '' AND title != 'Talento Digital' THEN 1 END) as con_titulo,
  COUNT(CASE WHEN bio IS NOT NULL AND bio != '' AND bio != 'Sin descripción' THEN 1 END) as con_bio,
  COUNT(CASE WHEN skills IS NOT NULL THEN 1 END) as con_skills,
  COUNT(CASE WHEN experience_level IS NOT NULL AND experience_level != '' THEN 1 END) as con_experience_level,
  COUNT(CASE 
    WHEN title IS NOT NULL AND title != '' AND title != 'Talento Digital'
    AND bio IS NOT NULL AND bio != '' AND bio != 'Sin descripción'
    AND bio IS NOT NULL
    THEN 1 
  END) as perfiles_completos
FROM talent_profiles;

-- Mostrar usuarios que aún necesitan actualización
SELECT 
  au.email,
  tp.title as titulo_actual,
  (au.raw_user_meta_data->>'title')::TEXT as titulo_en_metadata,
  CASE 
    WHEN tp.bio IS NULL OR tp.bio = '' OR tp.bio = 'Sin descripción' 
    THEN 'Sin bio'
    ELSE LEFT(tp.bio, 50) || '...'
  END as bio_actual,
  CASE 
    WHEN (au.raw_user_meta_data->>'bio') IS NOT NULL 
    THEN LEFT((au.raw_user_meta_data->>'bio')::TEXT, 50) || '...'
    ELSE 'Sin bio en metadata'
  END as bio_en_metadata,
  tp.experience_level as experience_actual,
  (au.raw_user_meta_data->>'experience_level')::TEXT as experience_en_metadata,
  CASE 
    WHEN tp.title IS NULL OR tp.title = '' OR tp.title = 'Talento Digital'
    OR tp.bio IS NULL OR tp.bio = '' OR tp.bio = 'Sin descripción'
    THEN '⚠️ Necesita actualización'
    ELSE '✅ OK'
  END as estado
FROM talent_profiles tp
JOIN auth.users au ON tp.user_id = au.id
WHERE (
  tp.title IS NULL 
  OR tp.title = '' 
  OR tp.title = 'Talento Digital'
  OR tp.bio IS NULL 
  OR tp.bio = ''
  OR tp.bio = 'Sin descripción'
)
AND (
  (au.raw_user_meta_data->>'title') IS NOT NULL
  OR (au.raw_user_meta_data->>'bio') IS NOT NULL
  OR (au.raw_user_meta_data->>'experience_level') IS NOT NULL
)
ORDER BY au.email
LIMIT 20;

-- Limpiar función temporal (opcional)
-- DROP FUNCTION IF EXISTS migrate_talent_profiles_from_metadata();

SELECT '✅ Migración completada' as resultado;


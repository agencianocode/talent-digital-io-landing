-- 🔧 RECALCULAR PROFILE_COMPLETENESS PARA USUARIO ESPECÍFICO
-- Usuario: fabitronic.mago2020@gmail.com

-- ============================================================================
-- PASO 1: Ver datos actuales del usuario
-- ============================================================================
SELECT 
  p.full_name,
  p.avatar_url IS NOT NULL as tiene_avatar,
  p.phone IS NOT NULL as tiene_telefono,
  p.country IS NOT NULL as tiene_pais,
  p.city IS NOT NULL as tiene_ciudad,
  p.social_links,
  p.video_presentation_url IS NOT NULL as tiene_video,
  p.profile_completeness as completitud_actual,
  tp.primary_category_id IS NOT NULL as tiene_categoria,
  tp.title IS NOT NULL as tiene_titulo,
  tp.experience_level,
  tp.bio IS NOT NULL as tiene_bio,
  tp.skills,
  tp.industries_of_interest,
  tp.portfolio_url IS NOT NULL as tiene_portfolio
FROM profiles p
LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
JOIN auth.users au ON au.id = p.user_id
WHERE au.email = 'fabitronic.mago2020@gmail.com';

-- ============================================================================
-- PASO 2: Calcular completitud basada en campos reales
-- ============================================================================
WITH user_data AS (
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.phone,
    p.country,
    p.city,
    p.social_links,
    p.video_presentation_url,
    tp.primary_category_id,
    tp.title,
    tp.experience_level,
    tp.bio,
    tp.skills,
    tp.industries_of_interest,
    tp.portfolio_url
  FROM profiles p
  LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
  JOIN auth.users au ON au.id = p.user_id
  WHERE au.email = 'fabitronic.mago2020@gmail.com'
),
calculated_score AS (
  SELECT
    user_id,
    CASE WHEN full_name IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN avatar_url IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN phone IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN country IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN city IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN social_links IS NOT NULL AND jsonb_typeof(social_links) = 'object' AND social_links::text != '{}'::text THEN 10 ELSE 0 END +
    CASE WHEN primary_category_id IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN title IS NOT NULL THEN 8 ELSE 0 END +
    CASE WHEN experience_level IS NOT NULL THEN 4 ELSE 0 END +
    CASE WHEN bio IS NOT NULL THEN 3 ELSE 0 END +
    CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 15 ELSE 0 END +
    CASE WHEN industries_of_interest IS NOT NULL AND array_length(industries_of_interest, 1) > 0 THEN 5 ELSE 0 END +
    CASE WHEN video_presentation_url IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN portfolio_url IS NOT NULL THEN 5 ELSE 0 END
    as completitud_calculada
  FROM user_data
)
SELECT * FROM calculated_score;

-- ============================================================================
-- PASO 3: ACTUALIZAR profile_completeness en la base de datos
-- ============================================================================

-- Ejecutar este UPDATE con el valor calculado del paso anterior:

UPDATE profiles
SET profile_completeness = (
  WITH user_data AS (
    SELECT 
      p.user_id,
      p.full_name,
      p.avatar_url,
      p.phone,
      p.country,
      p.city,
      p.social_links,
      p.video_presentation_url,
      tp.primary_category_id,
      tp.title,
      tp.experience_level,
      tp.bio,
      tp.skills,
      tp.industries_of_interest,
      tp.portfolio_url
    FROM profiles p
    LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
    WHERE p.user_id = profiles.user_id
  )
  SELECT
    CASE WHEN full_name IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN avatar_url IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN phone IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN country IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN city IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN social_links IS NOT NULL AND jsonb_typeof(social_links) = 'object' AND social_links::text != '{}'::text THEN 10 ELSE 0 END +
    CASE WHEN primary_category_id IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN title IS NOT NULL THEN 8 ELSE 0 END +
    CASE WHEN experience_level IS NOT NULL THEN 4 ELSE 0 END +
    CASE WHEN bio IS NOT NULL THEN 3 ELSE 0 END +
    CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 15 ELSE 0 END +
    CASE WHEN industries_of_interest IS NOT NULL AND array_length(industries_of_interest, 1) > 0 THEN 5 ELSE 0 END +
    CASE WHEN video_presentation_url IS NOT NULL THEN 5 ELSE 0 END +
    CASE WHEN portfolio_url IS NOT NULL THEN 5 ELSE 0 END
  FROM user_data
)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- ============================================================================
-- PASO 4: Verificar resultado
-- ============================================================================
SELECT 
  p.full_name,
  p.profile_completeness as completitud_actualizada
FROM profiles p
JOIN auth.users au ON au.id = p.user_id
WHERE au.email = 'fabitronic.mago2020@gmail.com';

-- ============================================================================
-- PASO 5: RECALCULAR PARA TODOS LOS USUARIOS (OPCIONAL)
-- ============================================================================

-- Si quieres recalcular para TODOS los usuarios talentos, ejecuta esto:
-- (Puede tardar un poco si hay muchos usuarios)

-- UPDATE profiles
-- SET profile_completeness = (
--   ... (mismo cálculo que arriba)
-- )
-- WHERE user_id IN (
--   SELECT user_id FROM user_roles 
--   WHERE role IN ('freemium_talent', 'premium_talent')
-- );


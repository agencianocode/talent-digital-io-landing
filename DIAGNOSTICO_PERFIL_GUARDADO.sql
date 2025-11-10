-- 🔍 DIAGNÓSTICO COMPLETO: Problema de guardado de perfil
-- Usuario: fabitronic.mago2020@gmail.com
-- Problema: Datos diligenciados no se guardan en la base de datos

-- ============================================================================
-- 1. VERIFICAR DATOS ACTUALES DEL USUARIO
-- ============================================================================

-- Ver TODOS los datos del usuario en profiles
SELECT 
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.phone,
  p.country,
  p.city,
  p.social_links,
  p.video_presentation_url,
  p.profile_completeness,
  p.created_at,
  p.updated_at,
  au.email
FROM profiles p
JOIN auth.users au ON au.id = p.user_id
WHERE au.email = 'fabitronic.mago2020@gmail.com';

-- Ver TODOS los datos del usuario en talent_profiles
SELECT 
  tp.*,
  au.email
FROM talent_profiles tp
JOIN auth.users au ON au.id = tp.user_id
WHERE au.email = 'fabitronic.mago2020@gmail.com';

-- ============================================================================
-- 2. VERIFICAR POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Ver políticas en talent_profiles
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
WHERE tablename = 'talent_profiles';

-- Ver políticas en profiles
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
WHERE tablename = 'profiles';

-- ============================================================================
-- 3. VERIFICAR FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Ver constraint de primary_category_id
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'talent_profiles'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Ver categorías profesionales disponibles
SELECT id, name, slug, description
FROM professional_categories
ORDER BY name;

-- ============================================================================
-- 4. PROBAR ACTUALIZACIÓN MANUAL
-- ============================================================================

-- Intentar actualizar un campo de prueba
-- (NO EJECUTAR AÚN - Solo para diagnóstico)
-- 
-- UPDATE talent_profiles
-- SET experience_level = 'intermedio'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');
-- 
-- Si esto da error, hay problema de permisos RLS

-- ============================================================================
-- 5. SOLUCIÓN: ACTUALIZAR CAMPOS FALTANTES
-- ============================================================================

-- EJECUTAR SOLO SI EL USUARIO CONFIRMA QUE TIENE ESTOS DATOS:

-- Actualizar experience_level (si tiene experiencia)
-- UPDATE talent_profiles
-- SET experience_level = 'intermedio'  -- Cambiar según corresponda: principiante/intermedio/avanzado/experto
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- Actualizar primary_category_id (si tiene categoría)
-- Primero ver qué categorías hay:
-- SELECT id, name FROM professional_categories;
-- 
-- Luego actualizar con el ID correcto:
-- UPDATE talent_profiles
-- SET primary_category_id = 'ID_DE_LA_CATEGORIA'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- Actualizar industries_of_interest (si tiene industrias)
-- UPDATE talent_profiles
-- SET industries_of_interest = ARRAY['tecnologia', 'marketing', 'ventas']  -- Ajustar según corresponda
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- Actualizar social_links (si tiene redes sociales)
-- UPDATE profiles
-- SET social_links = jsonb_build_object(
--   'linkedin', 'https://linkedin.com/in/usuario',
--   'instagram', 'https://instagram.com/usuario'
-- )
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- Actualizar video_presentation_url (si tiene video)
-- UPDATE profiles
-- SET video_presentation_url = 'https://youtube.com/...'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- Actualizar portfolio_url (si tiene portfolio)
-- UPDATE talent_profiles
-- SET portfolio_url = 'https://behance.net/...'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- ============================================================================
-- 6. RECALCULAR Y ACTUALIZAR PROFILE_COMPLETENESS
-- ============================================================================

-- Después de actualizar todos los campos, recalcular completitud:
-- 
-- UPDATE profiles
-- SET profile_completeness = 100  -- O el porcentaje calculado
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fabitronic.mago2020@gmail.com');

-- ============================================================================
-- 7. VERIFICAR RESULTADO FINAL
-- ============================================================================

-- Ver completitud final
SELECT 
  p.full_name,
  p.profile_completeness,
  tp.primary_category_id IS NOT NULL as tiene_categoria,
  tp.experience_level,
  tp.industries_of_interest,
  p.social_links,
  p.video_presentation_url IS NOT NULL as tiene_video,
  tp.portfolio_url IS NOT NULL as tiene_portfolio
FROM profiles p
LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
JOIN auth.users au ON au.id = p.user_id
WHERE au.email = 'fabitronic.mago2020@gmail.com';


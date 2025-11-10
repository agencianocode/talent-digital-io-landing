-- 🚀 ÍNDICES DE OPTIMIZACIÓN DE RENDIMIENTO
-- Este archivo contiene todos los índices necesarios para mejorar el rendimiento de las queries
-- más frecuentes en TalentoDigital.io
--
-- INSTRUCCIONES:
-- 1. Abrir Supabase SQL Editor
-- 2. Copiar y pegar este archivo completo
-- 3. Ejecutar
--
-- NOTA: Usamos CONCURRENTLY para evitar locks en producción
-- Si hay errores con CONCURRENTLY, remover esa palabra y ejecutar en horario de bajo tráfico

-- ============================================================================
-- TALENT PROFILES - Búsqueda y filtrado de talentos
-- ============================================================================

-- Índice principal por user_id (query más frecuente)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_talent_profiles_user_id 
ON talent_profiles(user_id);

-- Índice para filtrado por años de experiencia
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_talent_profiles_years_experience 
ON talent_profiles(years_experience) 
WHERE years_experience IS NOT NULL;

-- Índice para búsqueda de texto en título y bio
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_talent_profiles_title_trgm 
ON talent_profiles USING gin(title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_talent_profiles_bio_trgm 
ON talent_profiles USING gin(bio gin_trgm_ops);

-- ============================================================================
-- PROFILES - Información general de usuarios
-- ============================================================================

-- Índice principal por user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

-- Índice para búsqueda por nombre
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_full_name_trgm 
ON profiles USING gin(full_name gin_trgm_ops);

-- Índice para filtrado por país
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_country 
ON profiles(country) 
WHERE country IS NOT NULL;

-- Índice para filtrado por ciudad
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_city 
ON profiles(city) 
WHERE city IS NOT NULL;

-- ============================================================================
-- USER ROLES - Autenticación y permisos
-- ============================================================================

-- Índice principal por user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id 
ON user_roles(user_id);

-- Índice para filtrado por rol
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role 
ON user_roles(role);

-- Índice compuesto para queries que filtran por ambos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id_role 
ON user_roles(user_id, role);

-- ============================================================================
-- APPLICATIONS - Postulaciones a oportunidades
-- ============================================================================

-- Índice principal por user_id (talentos viendo sus aplicaciones)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_id 
ON applications(user_id);

-- Índice por opportunity_id (empresas viendo postulantes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_opportunity_id 
ON applications(opportunity_id);

-- Índice por status para filtrado rápido
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_status 
ON applications(status);

-- Índice compuesto para dashboard de talentos (mis aplicaciones por status)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status 
ON applications(user_id, status, created_at DESC);

-- Índice compuesto para dashboard de empresas (postulantes por oportunidad)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_opp_status 
ON applications(opportunity_id, status, created_at DESC);

-- ============================================================================
-- OPPORTUNITIES - Vacantes y ofertas de trabajo
-- ============================================================================

-- Índice principal por company_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_company_id 
ON opportunities(company_id);

-- Índice por status para filtrado
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_status 
ON opportunities(status);

-- Índice compuesto para listado de oportunidades activas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_status_created 
ON opportunities(status, created_at DESC);

-- Índice para búsqueda de texto en título
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_title_trgm 
ON opportunities USING gin(title gin_trgm_ops);

-- Índice para búsqueda de texto en descripción
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_description_trgm 
ON opportunities USING gin(description gin_trgm_ops);

-- Índice para filtrado por tipo de contrato
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_type 
ON opportunities(type) 
WHERE type IS NOT NULL;

-- Índice para filtrado por categoría
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_category 
ON opportunities(category) 
WHERE category IS NOT NULL;

-- Índice para oportunidades exclusivas de academia
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_academy_exclusive 
ON opportunities(is_academy_exclusive, company_id) 
WHERE is_academy_exclusive = true;

-- ============================================================================
-- OPPORTUNITY VIEWS - Vistas de oportunidades
-- ============================================================================

-- Índice por opportunity_id para contar vistas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunity_views_opportunity_id 
ON opportunity_views(opportunity_id);

-- Índice por user_id para evitar duplicados
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunity_views_user_id 
ON opportunity_views(user_id);

-- Índice compuesto para queries de analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunity_views_opp_viewed 
ON opportunity_views(opportunity_id, viewed_at DESC);

-- ============================================================================
-- COMPANIES - Información de empresas
-- ============================================================================

-- Índice por ID (ya existe como PK pero incluimos por completitud)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_id ON companies(id);

-- Índice por tipo de negocio (para filtrar academias)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_business_type 
ON companies(business_type) 
WHERE business_type IS NOT NULL;

-- Índice para slugs de academias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_academy_slug 
ON companies(academy_slug) 
WHERE academy_slug IS NOT NULL;

-- Índice para búsqueda de texto en nombre
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name_trgm 
ON companies USING gin(name gin_trgm_ops);

-- ============================================================================
-- ACADEMY STUDENTS - Estudiantes de academias
-- ============================================================================

-- Índice por email de estudiante
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academy_students_email 
ON academy_students(student_email);

-- Índice por academy_id para listar estudiantes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academy_students_academy_id 
ON academy_students(academy_id);

-- Índice por status para filtrado
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academy_students_status 
ON academy_students(status);

-- Índice compuesto para dashboard de academia
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academy_students_academy_status 
ON academy_students(academy_id, status, enrolled_at DESC);

-- ============================================================================
-- MESSAGES - Sistema de mensajería
-- ============================================================================

-- Índice por conversation_id (query más frecuente)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id, created_at ASC);

-- Índice por sender_id para búsquedas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id 
ON messages(sender_id);

-- Índice por recipient_id para búsquedas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recipient_id 
ON messages(recipient_id);

-- Índice para mensajes no leídos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread 
ON messages(recipient_id, read) 
WHERE read = false;

-- ============================================================================
-- SAVED OPPORTUNITIES - Oportunidades guardadas
-- ============================================================================

-- Índice por user_id (query más frecuente)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_opportunities_user_id 
ON saved_opportunities(user_id, created_at DESC);

-- Índice por opportunity_id para verificar duplicados
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_opportunities_opportunity_id 
ON saved_opportunities(opportunity_id);

-- ============================================================================
-- MARKETPLACE PUBLISHING REQUESTS - Solicitudes de publicación
-- ============================================================================

-- Índice por requester_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_publishing_requests_requester_id 
ON marketplace_publishing_requests(requester_id);

-- Índice por status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_publishing_requests_status 
ON marketplace_publishing_requests(status);

-- Índice compuesto para admin panel
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_publishing_requests_status_created 
ON marketplace_publishing_requests(status, created_at DESC);

-- ============================================================================
-- RESUMEN DE ÍNDICES CREADOS
-- ============================================================================

-- Para verificar que todos los índices se crearon correctamente, ejecuta:
-- 
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
-- FROM pg_indexes
-- WHERE schemaname = 'public' 
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. Los índices TRGM (trigram) requieren la extensión pg_trgm:
--    CREATE EXTENSION IF NOT EXISTS pg_trgm;
--
-- 2. Los índices se crean con CONCURRENTLY para evitar locks en producción
--
-- 3. El tamaño total de índices puede ser significativo (50-200MB dependiendo de datos)
--
-- 4. Monitorear el rendimiento después de crear índices con:
--    SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
--
-- 5. Si algún índice no se usa (idx_scan = 0), considerar eliminarlo después de 1 mes

-- ============================================================================
-- MANTENIMIENTO
-- ============================================================================

-- Reindexar periódicamente (mensual) para mantener rendimiento óptimo:
-- REINDEX INDEX CONCURRENTLY idx_talent_profiles_user_id;
-- REINDEX INDEX CONCURRENTLY idx_applications_user_id;
-- (repetir para cada índice importante)

-- O reindexar toda la base de datos (requiere más tiempo):
-- REINDEX DATABASE CONCURRENTLY;


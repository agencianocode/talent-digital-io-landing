-- 🚀 ÍNDICES DE OPTIMIZACIÓN DE RENDIMIENTO (Sin CONCURRENTLY)
-- Versión simplificada para ejecutar en Supabase SQL Editor
-- INSTRUCCIONES:
-- 1. Copiar TODO este archivo
-- 2. Pegar en Supabase SQL Editor
-- 3. Click "Run"
-- 4. Esperar 30-60 segundos

-- ============================================================================
-- Habilitar extensión para búsquedas de texto
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- TALENT PROFILES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_years_experience ON talent_profiles(years_experience) WHERE years_experience IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_talent_profiles_title_trgm ON talent_profiles USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_bio_trgm ON talent_profiles USING gin(bio gin_trgm_ops);

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm ON profiles USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city) WHERE city IS NOT NULL;

-- ============================================================================
-- USER ROLES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);

-- ============================================================================
-- APPLICATIONS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_opp_status ON applications(opportunity_id, status, created_at DESC);

-- ============================================================================
-- OPPORTUNITIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_status_created ON opportunities(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_title_trgm ON opportunities USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_opportunities_description_trgm ON opportunities USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type) WHERE type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_academy_exclusive ON opportunities(is_academy_exclusive, company_id) WHERE is_academy_exclusive = true;

-- ============================================================================
-- OPPORTUNITY VIEWS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_opportunity_views_opportunity_id ON opportunity_views(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_views_viewer_id ON opportunity_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_views_opp_viewed ON opportunity_views(opportunity_id, viewed_at DESC);

-- ============================================================================
-- COMPANIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_companies_business_type ON companies(business_type) WHERE business_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_academy_slug ON companies(academy_slug) WHERE academy_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops);

-- ============================================================================
-- ACADEMY STUDENTS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_academy_students_email ON academy_students(student_email);
CREATE INDEX IF NOT EXISTS idx_academy_students_academy_id ON academy_students(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_students_status ON academy_students(status);
CREATE INDEX IF NOT EXISTS idx_academy_students_academy_status ON academy_students(academy_id, status, enrolled_at DESC);

-- ============================================================================
-- MESSAGES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, read) WHERE read = false;

-- ============================================================================
-- SAVED OPPORTUNITIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user_id ON saved_opportunities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_opportunity_id ON saved_opportunities(opportunity_id);

-- ============================================================================
-- MARKETPLACE PUBLISHING REQUESTS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_publishing_requests_requester_id ON marketplace_publishing_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_publishing_requests_status ON marketplace_publishing_requests(status);
CREATE INDEX IF NOT EXISTS idx_publishing_requests_status_created ON marketplace_publishing_requests(status, created_at DESC);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Verificar índices creados
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;


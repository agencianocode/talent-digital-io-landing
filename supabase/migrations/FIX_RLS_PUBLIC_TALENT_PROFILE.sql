-- Fix RLS policies to allow public read access to talent profile data
-- This allows anonymous users (incognito mode) to view talent profiles

-- ============================================
-- TALENT EXPERIENCES - Allow public read
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view talent experiences" ON public.talent_experiences;

-- Create policy to allow anyone to view experiences of any talent
CREATE POLICY "Public can view talent experiences"
  ON public.talent_experiences
  FOR SELECT
  USING (true); -- Allow anyone to read

-- ============================================
-- TALENT EDUCATION - Allow public read
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view talent education" ON public.talent_education;

-- Create policy to allow anyone to view education of any talent
CREATE POLICY "Public can view talent education"
  ON public.talent_education
  FOR SELECT
  USING (true); -- Allow anyone to read

-- ============================================
-- TALENT PORTFOLIOS - Allow public read
-- ============================================

-- Check if table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'talent_portfolios'
  ) THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Public can view talent portfolios" ON public.talent_portfolios;
    
    -- Create policy to allow anyone to view portfolios of any talent
    CREATE POLICY "Public can view talent portfolios"
      ON public.talent_portfolios
      FOR SELECT
      USING (true); -- Allow anyone to read
  END IF;
END $$;

-- ============================================
-- TALENT SOCIAL LINKS - Allow public read
-- ============================================

-- Check if table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'talent_social_links'
  ) THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Public can view talent social links" ON public.talent_social_links;
    
    -- Create policy to allow anyone to view social links of any talent
    CREATE POLICY "Public can view talent social links"
      ON public.talent_social_links
      FOR SELECT
      USING (true); -- Allow anyone to read
  END IF;
END $$;

-- ============================================
-- PROFILES - Ensure public read access
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Create policy to allow anyone to view profiles
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true); -- Allow anyone to read

-- ============================================
-- TALENT PROFILES - Ensure public read access
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view talent profiles" ON public.talent_profiles;

-- Create policy to allow anyone to view talent profiles
CREATE POLICY "Public can view talent profiles"
  ON public.talent_profiles
  FOR SELECT
  USING (true); -- Allow anyone to read

-- ============================================
-- OLD TABLES (for backward compatibility)
-- ============================================

-- Work Experience (old table)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'work_experience'
  ) THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Public can view work experience" ON public.work_experience;
    
    -- Create policy to allow anyone to view work experience
    CREATE POLICY "Public can view work experience"
      ON public.work_experience
      FOR SELECT
      USING (true); -- Allow anyone to read
  END IF;
END $$;

-- Education (old table)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'education'
  ) THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Public can view education" ON public.education;
    
    -- Create policy to allow anyone to view education
    CREATE POLICY "Public can view education"
      ON public.education
      FOR SELECT
      USING (true); -- Allow anyone to read
  END IF;
END $$;


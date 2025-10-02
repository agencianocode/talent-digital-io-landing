-- Fix RLS policies to allow business users to view talent profiles
-- This allows companies to see talent information when viewing their profiles

-- Drop existing restrictive policies for talent_portfolios
DROP POLICY IF EXISTS "Users can view their own portfolios" ON talent_portfolios;

-- Create new policy that allows business users to view any talent portfolio
CREATE POLICY "Allow business users to view talent portfolios" ON talent_portfolios
    FOR SELECT USING (
        -- Users can always view their own portfolios
        auth.uid() = user_id 
        OR 
        -- Business users can view any talent portfolio
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('business', 'freemium_business', 'premium_business')
        )
    );

-- Drop existing restrictive policies for talent_experience
DROP POLICY IF EXISTS "Users can view their own experience" ON talent_experience;

-- Create new policy that allows business users to view any talent experience
CREATE POLICY "Allow business users to view talent experience" ON talent_experience
    FOR SELECT USING (
        -- Users can always view their own experience
        auth.uid() = user_id 
        OR 
        -- Business users can view any talent experience
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('business', 'freemium_business', 'premium_business')
        )
    );

-- Drop existing restrictive policies for talent_education
DROP POLICY IF EXISTS "Users can view their own education" ON talent_education;

-- Create new policy that allows business users to view any talent education
CREATE POLICY "Allow business users to view talent education" ON talent_education
    FOR SELECT USING (
        -- Users can always view their own education
        auth.uid() = user_id 
        OR 
        -- Business users can view any talent education
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('business', 'freemium_business', 'premium_business')
        )
    );

-- Drop existing restrictive policies for talent_social_links
DROP POLICY IF EXISTS "Users can view their own social links" ON talent_social_links;

-- Create new policy that allows business users to view any talent social links
CREATE POLICY "Allow business users to view talent social links" ON talent_social_links
    FOR SELECT USING (
        -- Users can always view their own social links
        auth.uid() = user_id 
        OR 
        -- Business users can view any talent social links
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('business', 'freemium_business', 'premium_business')
        )
    );

-- Also need to fix talent_profiles table RLS policy
-- First, check if talent_profiles table has RLS enabled
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'talent_profiles') THEN
        -- Drop existing restrictive policy if it exists
        DROP POLICY IF EXISTS "Users can view their own talent profile" ON talent_profiles;
        
        -- Create new policy that allows business users to view any talent profile
        CREATE POLICY "Allow business users to view talent profiles" ON talent_profiles
            FOR SELECT USING (
                -- Users can always view their own talent profile
                auth.uid() = user_id 
                OR 
                -- Business users can view any talent profile
                EXISTS (
                    SELECT 1 FROM user_roles ur 
                    WHERE ur.user_id = auth.uid() 
                    AND ur.role IN ('business', 'freemium_business', 'premium_business')
                )
            );
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT ON talent_portfolios TO authenticated;
GRANT SELECT ON talent_experience TO authenticated;
GRANT SELECT ON talent_education TO authenticated;
GRANT SELECT ON talent_social_links TO authenticated;
GRANT SELECT ON talent_profiles TO authenticated;

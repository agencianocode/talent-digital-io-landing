-- Check if the trigger exists and create it if it doesn't
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also ensure we have the correct enum values
DO $$ 
BEGIN
  -- Check if admin role exists in the enum, if not add it
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;

-- For existing users without roles, let's assign them based on any existing companies they might have
-- Business users are those who have companies
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT c.user_id, 'business'::user_role
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = c.user_id
);

-- For users in profiles but not in user_roles and not business users, default to talent
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'talent'::user_role
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id
) AND NOT EXISTS (
  SELECT 1 FROM companies c WHERE c.user_id = p.user_id
);
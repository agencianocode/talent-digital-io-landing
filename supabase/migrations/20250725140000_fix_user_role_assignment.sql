-- Fix user role assignment to ensure business users get correct role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_type TEXT;
BEGIN
  -- Get user_type from metadata or default to 'talent'
  user_type := COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'talent');
  
  -- Log for debugging
  RAISE NOTICE 'Creating user with type: %', user_type;
  
  -- Insert into profiles first
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert role based on user_type, ensuring it's a valid enum value
  -- Use ON CONFLICT to handle cases where role might already exist
  IF user_type = 'business' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'business'::user_role)
    ON CONFLICT (user_id) DO UPDATE SET role = 'business'::user_role;
    
    RAISE NOTICE 'Assigned business role to user: %', NEW.id;
  ELSE
    -- Default to talent for any other case
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'talent'::user_role)
    ON CONFLICT (user_id) DO UPDATE SET role = 'talent'::user_role;
    
    RAISE NOTICE 'Assigned talent role to user: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 
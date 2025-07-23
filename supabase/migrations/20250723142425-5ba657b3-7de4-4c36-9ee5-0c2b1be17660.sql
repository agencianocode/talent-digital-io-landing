-- Recreate the handle_new_user function to ensure it works correctly
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
  
  -- Insert into profiles first
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Insert role based on user_type, ensuring it's a valid enum value
  IF user_type = 'business' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'business'::user_role);
  ELSE
    -- Default to talent for any other case
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'talent'::user_role);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;
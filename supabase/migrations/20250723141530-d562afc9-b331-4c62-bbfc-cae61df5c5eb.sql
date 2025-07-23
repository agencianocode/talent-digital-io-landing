-- Update handle_new_user function to use user_type from metadata
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
  user_type := NEW.raw_user_meta_data ->> 'user_type';
  
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Insert role based on user_type or default to talent
  IF user_type IS NOT NULL AND user_type IN ('business', 'talent') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_type::user_role);
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'talent');
  END IF;
  
  RETURN NEW;
END;
$$;
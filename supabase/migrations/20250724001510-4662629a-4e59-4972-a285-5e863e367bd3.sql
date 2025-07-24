-- Allow users to update their own role
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
CREATE POLICY "Users can update their own role" 
ON public.user_roles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own role (needed for role switching)
DROP POLICY IF EXISTS "Users can delete their own role" ON public.user_roles;
CREATE POLICY "Users can delete their own role" 
ON public.user_roles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create a function to safely switch user roles
CREATE OR REPLACE FUNCTION public.switch_user_role(new_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete existing role
  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), new_role);
  
  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RETURN FALSE;
END;
$$;
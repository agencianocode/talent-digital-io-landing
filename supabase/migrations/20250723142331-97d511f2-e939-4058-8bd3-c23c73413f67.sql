-- Create user_role enum type
CREATE TYPE public.user_role AS ENUM ('business', 'talent');

-- Update user_roles table to use the enum type
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Update the default value to use the enum
ALTER TABLE public.user_roles 
ALTER COLUMN role SET DEFAULT 'talent'::user_role;
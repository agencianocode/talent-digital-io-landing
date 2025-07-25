-- Recreate the trigger that was missing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify we have the profile created
INSERT INTO public.profiles (user_id, full_name)
VALUES ('74d08fd0-08ae-43ae-b446-a88fac0c5ae7', 'Andres Sanchez')
ON CONFLICT (user_id) DO NOTHING;
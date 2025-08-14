-- SECURITY FIX: Convert profiles table RLS policies from PERMISSIVE to RESTRICTIVE
-- PERMISSIVE policies can be bypassed if multiple policies exist, RESTRICTIVE cannot

-- First, drop all existing permissive policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create RESTRICTIVE policies that cannot be bypassed
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Only allow access if user owns the profile OR is an admin
    (auth.uid() = user_id) OR public.is_admin()
  ) WITH CHECK (
    (auth.uid() = user_id) OR public.is_admin()
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can only insert their own profile OR admin can insert any
    (auth.uid() = user_id) OR public.is_admin()
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can only update their own profile OR admin can update any
    (auth.uid() = user_id) OR public.is_admin()
  ) WITH CHECK (
    -- Prevent users from changing user_id to someone else's
    (auth.uid() = user_id) OR public.is_admin()
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    -- Users can only delete their own profile OR admin can delete any
    (auth.uid() = user_id) OR public.is_admin()
  );

-- Additional security: Ensure user_id cannot be NULL (prevent data leaks)
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure user_id references valid auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
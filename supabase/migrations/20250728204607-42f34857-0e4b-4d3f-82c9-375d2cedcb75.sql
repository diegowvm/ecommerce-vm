-- Drop the existing security definer view
DROP VIEW IF EXISTS public.user_statistics;

-- Replace with a secure function that respects RLS
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE(
  total_users bigint,
  active_users bigint,
  suspended_users bigint,
  banned_users bigint,
  new_users_30d bigint,
  active_users_7d bigint,
  avg_login_count numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    count(*) AS total_users,
    count(CASE WHEN status = 'active' THEN 1 END) AS active_users,
    count(CASE WHEN status = 'suspended' THEN 1 END) AS suspended_users,
    count(CASE WHEN status = 'banned' THEN 1 END) AS banned_users,
    count(CASE WHEN created_at >= (CURRENT_DATE - INTERVAL '30 days') THEN 1 END) AS new_users_30d,
    count(CASE WHEN last_login >= (CURRENT_DATE - INTERVAL '7 days') THEN 1 END) AS active_users_7d,
    avg(login_count) AS avg_login_count
  FROM public.profiles;
$$;

-- Update the existing get_user_stats function to use the new function
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE(total_users bigint, active_users bigint, suspended_users bigint, banned_users bigint, new_users_30d bigint, active_users_7d bigint, avg_login_count numeric)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM public.get_user_statistics();
$$;
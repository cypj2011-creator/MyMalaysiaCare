
-- 1) Remove permissive public policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2) Revoke anon access from tables (authenticated retains, gated by RLS)
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.scan_history FROM anon;

-- 3) Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard_counts() FROM PUBLIC, anon;

-- 4) Update leaderboard function to include a safe display name (no raw email exposure)
DROP FUNCTION IF EXISTS public.get_leaderboard_counts();

CREATE OR REPLACE FUNCTION public.get_leaderboard_counts()
RETURNS TABLE(user_id uuid, display_name text, points bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    COALESCE(NULLIF(TRIM(p.username), ''), split_part(p.email, '@', 1), 'Anonymous') AS display_name,
    COUNT(sh.id) FILTER (WHERE sh.recyclable = true)::bigint AS points
  FROM public.profiles p
  LEFT JOIN public.scan_history sh ON sh.user_id = p.id
  GROUP BY p.id, p.username, p.email
  ORDER BY points DESC NULLS LAST;
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_counts() TO authenticated;

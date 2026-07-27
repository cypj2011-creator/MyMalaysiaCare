DROP POLICY IF EXISTS "Scan counts are viewable by everyone" ON public.scan_history;

CREATE OR REPLACE FUNCTION public.get_leaderboard_counts()
RETURNS TABLE(user_id uuid, points bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, COUNT(*)::bigint AS points
  FROM public.scan_history
  WHERE recyclable = true
  GROUP BY user_id;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_counts() TO anon, authenticated;
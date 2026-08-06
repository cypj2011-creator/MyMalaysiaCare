CREATE OR REPLACE FUNCTION public.get_leaderboard_counts()
 RETURNS TABLE(user_id uuid, display_name text, points bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id AS user_id,
    COALESCE(NULLIF(TRIM(p.username), ''), split_part(p.email, '@', 1), 'Anonymous') AS display_name,
    COUNT(sh.id) FILTER (WHERE sh.recyclable = true)::bigint AS points
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.scan_history sh ON sh.user_id = p.id
  WHERE COALESCE(u.is_anonymous, false) = false
    AND COALESCE(NULLIF(TRIM(p.email), ''), NULL) IS NOT NULL
  GROUP BY p.id, p.username, p.email
  ORDER BY points DESC NULLS LAST;
$function$;
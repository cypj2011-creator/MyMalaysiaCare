CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.cleanup_stale_guest_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM auth.users
  WHERE is_anonymous = true
    AND COALESCE(last_sign_in_at, created_at) < now() - interval '10 minutes';
END;
$function$;

SELECT cron.unschedule('cleanup-stale-guest-accounts')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-guest-accounts');

SELECT cron.schedule(
  'cleanup-stale-guest-accounts',
  '*/5 * * * *',
  $$SELECT public.cleanup_stale_guest_accounts();$$
);
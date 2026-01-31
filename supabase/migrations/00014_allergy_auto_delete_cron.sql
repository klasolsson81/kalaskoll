-- Enable pg_cron extension (already available in Supabase)
-- Must be run by a superuser / via Supabase Dashboard → Database → Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup of expired allergy data (GDPR art. 9)
-- Runs at 03:00 UTC every day
SELECT cron.schedule(
  'cleanup-expired-allergy-data',
  '0 3 * * *',
  $$DELETE FROM public.allergy_data WHERE auto_delete_at < NOW()$$
);

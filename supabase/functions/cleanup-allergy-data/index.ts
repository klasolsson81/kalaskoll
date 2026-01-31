// Supabase Edge Function: Cleanup expired allergy data (GDPR art. 9)
// Schedule: Daily via cron (pg_cron or external scheduler)
//
// Setup:
//   supabase functions deploy cleanup-allergy-data
//   supabase functions set-secret SUPABASE_SERVICE_ROLE_KEY=<key>
//
// Cron (via Supabase Dashboard → Database → Extensions → pg_cron):
//   SELECT cron.schedule(
//     'cleanup-allergy-data',
//     '0 3 * * *',  -- 03:00 UTC daily
//     $$SELECT net.http_post(
//       url := '<SUPABASE_URL>/functions/v1/cleanup-allergy-data',
//       headers := jsonb_build_object(
//         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
//       ),
//       body := '{}'
//     );$$
//   );

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify authorization (service role key or function invoke token)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return new Response('Server configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Delete allergy data where auto_delete_at has passed
  const { data, error } = await supabase
    .from('allergy_data')
    .delete()
    .lt('auto_delete_at', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('Cleanup failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deletedCount = data?.length ?? 0;
  console.log(`Cleaned up ${deletedCount} expired allergy records`);

  return new Response(
    JSON.stringify({ success: true, deletedCount }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
});

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BETA_CONFIG, BETA_END_DATE } from '@/lib/beta-config';
import { betaRegisterSchema } from '@/lib/utils/validation';

async function checkRateLimit(ip: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: existing } = await adminClient
    .from('beta_rate_limit')
    .select('*')
    .eq('ip_address', ip)
    .single();

  if (!existing) {
    await adminClient.from('beta_rate_limit').insert({ ip_address: ip });
    return true;
  }

  if (new Date(existing.first_attempt_at) < new Date(oneHourAgo)) {
    await adminClient
      .from('beta_rate_limit')
      .update({
        attempts: 1,
        first_attempt_at: new Date().toISOString(),
        last_attempt_at: new Date().toISOString(),
      })
      .eq('ip_address', ip);
    return true;
  }

  if (existing.attempts >= BETA_CONFIG.maxRegistrationsPerIpPerHour) {
    return false;
  }

  await adminClient
    .from('beta_rate_limit')
    .update({
      attempts: existing.attempts + 1,
      last_attempt_at: new Date().toISOString(),
    })
    .eq('ip_address', ip);

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = betaRegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password, name, honeypot } = result.data;

    // Honeypot check — bots fill this hidden field
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Kolla din e-post!' });
    }

    // Rate limiting per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitOk = await checkRateLimit(ip);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'För många registreringsförsök. Försök igen om en timme.' },
        { status: 429 },
      );
    }

    // Check if beta is full
    const supabase = await createClient();
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'tester');

    if ((count || 0) >= BETA_CONFIG.maxTesters) {
      return NextResponse.json(
        { error: 'Beta är full! Gå med i väntelistan istället.', waitlistRequired: true },
        { status: 400 },
      );
    }

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'E-postadressen är redan registrerad.' },
          { status: 400 },
        );
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Kunde inte skapa användare');
    }

    // Update profile with beta status via admin client (bypass RLS)
    const adminClient = createAdminClient();

    await adminClient
      .from('profiles')
      .update({
        full_name: name,
        role: 'tester',
        beta_registered_at: new Date().toISOString(),
        beta_expires_at: new Date(`${BETA_END_DATE}T23:59:59`).toISOString(),
        beta_ai_images_used: 0,
        beta_sms_used: 0,
      })
      .eq('id', authData.user.id);

    // Remove from waitlist if they were on it
    await adminClient
      .from('waitlist')
      .update({ converted_at: new Date().toISOString() })
      .eq('email', email.toLowerCase());

    return NextResponse.json({
      success: true,
      message: 'Välkommen till beta! Kolla din e-post för att verifiera kontot.',
    });
  } catch (error) {
    console.error('Beta registration error:', error);
    return NextResponse.json(
      { error: 'Något gick fel. Försök igen.' },
      { status: 500 },
    );
  }
}

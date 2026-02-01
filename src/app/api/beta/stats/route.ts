import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BETA_CONFIG, isBetaEnded } from '@/lib/beta-config';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const betaEnded = isBetaEnded();

    const { count: testerCount } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'tester');

    const { count: waitlistCount } = await adminClient
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .is('converted_at', null);

    const totalTesters = testerCount || 0;
    const activeTesters = betaEnded ? 0 : totalTesters;
    const spotsRemaining = Math.max(0, BETA_CONFIG.maxTesters - totalTesters);
    const percentFull = Math.round((totalTesters / BETA_CONFIG.maxTesters) * 100);

    return NextResponse.json({
      totalTesters,
      activeTesters,
      spotsRemaining,
      waitlistCount: waitlistCount || 0,
      percentFull,
      maxTesters: BETA_CONFIG.maxTesters,
      registrationOpen: !betaEnded && BETA_CONFIG.registrationOpen && spotsRemaining > 0,
    });
  } catch (error) {
    console.error('Beta stats error:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta beta-statistik' },
      { status: 500 },
    );
  }
}

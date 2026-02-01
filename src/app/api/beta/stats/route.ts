import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BETA_CONFIG } from '@/lib/beta-config';

export async function GET() {
  try {
    const supabase = await createClient();

    const { count: testerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'tester');

    const { count: activeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'tester')
      .gt('beta_expires_at', new Date().toISOString());

    const { count: waitlistCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .is('converted_at', null);

    const totalTesters = testerCount || 0;
    const spotsRemaining = Math.max(0, BETA_CONFIG.maxTesters - totalTesters);
    const percentFull = Math.round((totalTesters / BETA_CONFIG.maxTesters) * 100);

    return NextResponse.json({
      totalTesters,
      activeTesters: activeCount || 0,
      spotsRemaining,
      waitlistCount: waitlistCount || 0,
      percentFull,
      maxTesters: BETA_CONFIG.maxTesters,
      registrationOpen: BETA_CONFIG.registrationOpen && spotsRemaining > 0,
    });
  } catch (error) {
    console.error('Beta stats error:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta beta-statistik' },
      { status: 500 },
    );
  }
}

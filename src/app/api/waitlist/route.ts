import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { waitlistSchema } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = waitlistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, honeypot } = result.data;

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    const adminClient = createAdminClient();

    // Check if already on waitlist
    const { data: existing } = await adminClient
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Du är redan på väntelistan!',
      });
    }

    // Check if already registered (join auth.users since profiles has no email)
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const alreadyRegistered = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email,
    );

    if (alreadyRegistered) {
      return NextResponse.json(
        { error: 'Du har redan ett konto. Logga in istället!' },
        { status: 400 },
      );
    }

    // Add to waitlist
    const { error } = await adminClient.from('waitlist').insert({ email });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Du är redan på väntelistan!',
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Du är nu på väntelistan! Vi meddelar dig när det finns plats.',
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Något gick fel. Försök igen.' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { feedbackSchema } from '@/lib/utils/validation';
import { isFeedbackRateLimited } from '@/lib/utils/rate-limit';
import { blockIp, hasBotSignals } from '@/lib/utils/bot-block';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att skicka feedback.' },
        { status: 401 },
      );
    }

    // Rate limit: 5 per hour per user
    if (await isFeedbackRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Du har skickat för mycket feedback. Försök igen om en stund.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const result = feedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { message, screenshot, pageUrl, userAgent, screenSize, honeypot } = result.data;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Honeypot or bot signals → block IP and pretend success
    if (honeypot || hasBotSignals({ screenSize, userAgent })) {
      await blockIp(ip);
      return NextResponse.json({ success: true, message: 'Tack för din feedback!' });
    }

    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      user_email: user.email,
      message,
      screenshot_url: screenshot,
      page_url: pageUrl,
      user_agent: userAgent,
      screen_size: screenSize,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Tack för din feedback!',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Kunde inte spara feedback. Försök igen.' },
      { status: 500 },
    );
  }
}

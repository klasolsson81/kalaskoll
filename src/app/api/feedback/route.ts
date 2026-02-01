import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { feedbackSchema } from '@/lib/utils/validation';

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

    const body = await request.json();
    const result = feedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { message, screenshot, pageUrl, userAgent, screenSize } = result.data;

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

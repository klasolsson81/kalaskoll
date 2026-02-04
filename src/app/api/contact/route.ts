import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/utils/validation';
import { isContactRateLimited } from '@/lib/utils/rate-limit';
import { sendContactEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  const limited = await isContactRateLimited(ip);
  if (limited) {
    return NextResponse.json(
      { error: 'För många förfrågningar. Försök igen om en stund.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltig JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ogiltiga uppgifter' },
      { status: 400 },
    );
  }

  const { name, email, message, honeypot } = parsed.data;

  // Honeypot triggered — silently succeed
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  const result = await sendContactEmail({ name, email, message });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Kunde inte skicka meddelandet. Försök igen senare.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

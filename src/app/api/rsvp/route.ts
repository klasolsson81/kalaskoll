import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rsvpSchema } from '@/lib/utils/validation';
import { sendRsvpConfirmation } from '@/lib/email/resend';
import { formatDate, formatTime } from '@/lib/utils/format';
import { APP_URL } from '@/lib/constants';
import { isRateLimited } from '@/lib/utils/rate-limit';
import { encryptAllergyData } from '@/lib/utils/crypto';
import type { Database } from '@/types/database';

function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function generateEditToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'För många förfrågningar. Vänta en stund.' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltigt format' }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { token } = body;
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token krävs' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up invitation by token
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('id, party_id, token')
    .eq('token', token)
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: 'Ogiltig inbjudan' }, { status: 404 });
  }

  // Check RSVP deadline
  const { data: partyForDeadline } = await supabase
    .from('parties')
    .select('rsvp_deadline')
    .eq('id', invitation.party_id)
    .single();

  if (partyForDeadline?.rsvp_deadline) {
    const deadline = new Date(partyForDeadline.rsvp_deadline);
    deadline.setHours(23, 59, 59, 999);
    if (new Date() > deadline) {
      return NextResponse.json(
        { error: 'Sista svarsdatum har passerat. Kontakta den som bjöd in dig.' },
        { status: 400 },
      );
    }
  }

  const email = parsed.data.parentEmail;

  // Check for duplicate email on this invitation → 409
  const { data: existing } = await supabase
    .from('rsvp_responses')
    .select('id')
    .eq('invitation_id', invitation.id)
    .eq('parent_email', email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Du har redan svarat på denna inbjudan. Kolla din e-post för en länk att ändra ditt svar.' },
      { status: 409 },
    );
  }

  // Generate edit token
  const editToken = generateEditToken();

  // Insert new response
  const { data: rsvp, error: rsvpError } = await supabase
    .from('rsvp_responses')
    .insert({
      invitation_id: invitation.id,
      child_name: parsed.data.childName,
      attending: parsed.data.attending,
      parent_name: parsed.data.parentName || null,
      parent_phone: parsed.data.parentPhone || null,
      parent_email: email,
      message: parsed.data.message || null,
      edit_token: editToken,
    })
    .select('id')
    .single();

  if (rsvpError || !rsvp) {
    return NextResponse.json({ error: 'Kunde inte spara svar' }, { status: 500 });
  }

  const rsvpId = rsvp.id;

  // Store allergy data if attending and has allergies with consent
  const allergies = parsed.data.allergies ?? [];
  const otherDietary = parsed.data.otherDietary;
  const hasAllergyData = allergies.length > 0 || (otherDietary && otherDietary.length > 0);

  if (parsed.data.attending && hasAllergyData && parsed.data.allergyConsent) {
    const { data: party } = await supabase
      .from('parties')
      .select('party_date')
      .eq('id', invitation.party_id)
      .single();

    const partyDate = party?.party_date ? new Date(party.party_date) : new Date();
    const autoDeleteAt = new Date(partyDate);
    autoDeleteAt.setDate(autoDeleteAt.getDate() + 7);

    const encrypted = encryptAllergyData(allergies, otherDietary || null);
    await supabase.from('allergy_data').insert({
      rsvp_id: rsvpId,
      allergies: encrypted.allergies_enc,
      other_dietary: encrypted.other_dietary_enc,
      consent_given_at: new Date().toISOString(),
      auto_delete_at: autoDeleteAt.toISOString(),
    });
  }

  // Send confirmation email (fire-and-forget)
  const { data: party } = await supabase
    .from('parties')
    .select('child_name, party_date, party_time, venue_name')
    .eq('id', invitation.party_id)
    .single();

  if (party) {
    const editUrl = `${APP_URL}/r/${invitation.token}/edit?token=${editToken}`;
    sendRsvpConfirmation({
      to: email,
      childName: parsed.data.childName,
      partyChildName: party.child_name,
      attending: parsed.data.attending,
      editUrl,
      partyDate: formatDate(party.party_date),
      partyTime: formatTime(party.party_time),
      venueName: party.venue_name,
    }).catch((err) => {
      console.error('Failed to send RSVP confirmation email:', err);
    });
  }

  return NextResponse.json({ success: true, rsvpId });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rsvpEditSchema } from '@/lib/utils/validation';
import { sendRsvpConfirmation } from '@/lib/email/resend';
import { formatDate, formatTime } from '@/lib/utils/format';
import { APP_URL } from '@/lib/constants';
import { isRateLimited } from '@/lib/utils/rate-limit';
import { encryptAllergyData, decryptAllergyData } from '@/lib/utils/crypto';
import type { Database } from '@/types/database';

function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET: Fetch existing RSVP data for edit form pre-fill
export async function GET(request: NextRequest) {
  try {
    return await handleGet(request);
  } catch (err) {
    console.error('Unhandled RSVP GET error:', err);
    return NextResponse.json(
      { error: 'Oväntat fel. Försök igen om en stund.' },
      { status: 500 },
    );
  }
}

async function handleGet(request: NextRequest) {
  const editToken = request.nextUrl.searchParams.get('editToken');
  if (!editToken) {
    return NextResponse.json({ error: 'Edit-token krävs' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up RSVP by edit_token
  const { data: rsvp, error: rsvpError } = await supabase
    .from('rsvp_responses')
    .select('id, invitation_id, child_name, attending, parent_name, parent_phone, parent_email, message')
    .eq('edit_token', editToken)
    .single();

  if (rsvpError || !rsvp) {
    return NextResponse.json({ error: 'Ogiltigt edit-token' }, { status: 404 });
  }

  // Get allergy data for this RSVP
  const { data: allergyData } = await supabase
    .from('allergy_data')
    .select('allergies, other_dietary')
    .eq('rsvp_id', rsvp.id)
    .single();

  // Get invitation token for URL verification
  const { data: invitation } = await supabase
    .from('invitations')
    .select('token')
    .eq('id', rsvp.invitation_id)
    .single();

  return NextResponse.json({
    rsvp: {
      childName: rsvp.child_name,
      attending: rsvp.attending,
      parentName: rsvp.parent_name,
      parentPhone: rsvp.parent_phone,
      parentEmail: rsvp.parent_email,
      message: rsvp.message,
    },
    ...decryptAllergyData(allergyData?.allergies ?? [], allergyData?.other_dietary ?? null),
    invitationToken: invitation?.token ?? null,
  });
}

// POST: Update existing RSVP via edit_token
export async function POST(request: NextRequest) {
  try {
    return await handlePost(request);
  } catch (err) {
    console.error('Unhandled RSVP edit error:', err);
    return NextResponse.json(
      { error: 'Oväntat fel. Försök igen om en stund.' },
      { status: 500 },
    );
  }
}

async function handlePost(request: NextRequest) {
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

  const parsed = rsvpEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Look up RSVP by edit_token
  const { data: existing, error: lookupError } = await supabase
    .from('rsvp_responses')
    .select('id, invitation_id')
    .eq('edit_token', parsed.data.editToken)
    .single();

  if (lookupError || !existing) {
    return NextResponse.json({ error: 'Ogiltigt edit-token' }, { status: 404 });
  }

  // Update the RSVP response
  const { error: updateError } = await supabase
    .from('rsvp_responses')
    .update({
      child_name: parsed.data.childName,
      attending: parsed.data.attending,
      parent_name: parsed.data.parentName || null,
      parent_phone: parsed.data.parentPhone || null,
      message: parsed.data.message || null,
    })
    .eq('id', existing.id);

  if (updateError) {
    return NextResponse.json({ error: 'Kunde inte uppdatera svar' }, { status: 500 });
  }

  // Delete old allergy data and insert new if applicable
  await supabase.from('allergy_data').delete().eq('rsvp_id', existing.id);

  const allergies = parsed.data.allergies ?? [];
  const otherDietary = parsed.data.otherDietary;
  const hasAllergyData = allergies.length > 0 || (otherDietary && otherDietary.length > 0);

  if (parsed.data.attending && hasAllergyData && parsed.data.allergyConsent) {
    // Get party date for auto-delete calculation
    const { data: invitation } = await supabase
      .from('invitations')
      .select('party_id')
      .eq('id', existing.invitation_id)
      .single();

    if (invitation) {
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
        rsvp_id: existing.id,
        allergies: encrypted.allergies_enc,
        other_dietary: encrypted.other_dietary_enc,
        consent_given_at: new Date().toISOString(),
        auto_delete_at: autoDeleteAt.toISOString(),
      });
    }
  }

  // Send updated confirmation email (fire-and-forget)
  const { data: invitationForEmail } = await supabase
    .from('invitations')
    .select('token, party_id')
    .eq('id', existing.invitation_id)
    .single();

  if (invitationForEmail) {
    const { data: party } = await supabase
      .from('parties')
      .select('child_name, party_date, party_time, venue_name')
      .eq('id', invitationForEmail.party_id)
      .single();

    if (party) {
      const editUrl = `${APP_URL}/r/${invitationForEmail.token}/edit?token=${parsed.data.editToken}`;
      sendRsvpConfirmation({
        to: parsed.data.parentEmail,
        childName: parsed.data.childName,
        partyChildName: party.child_name,
        attending: parsed.data.attending,
        editUrl,
        partyDate: formatDate(party.party_date),
        partyTime: formatTime(party.party_time),
        venueName: party.venue_name,
      }).catch((err) => {
        console.error('Failed to send RSVP update confirmation email:', err);
      });
    }
  }

  return NextResponse.json({ success: true, rsvpId: existing.id });
}

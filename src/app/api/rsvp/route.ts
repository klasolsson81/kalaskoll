import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rsvpMultiChildSchema } from '@/lib/utils/validation';
import { sendRsvpConfirmation } from '@/lib/email/resend';
import { notifyPartyOwner } from '@/lib/email/notify-owner';
import { formatDate, formatTime } from '@/lib/utils/format';
import { APP_URL } from '@/lib/constants';
import { isRateLimited } from '@/lib/utils/rate-limit';
import { encryptAllergyData } from '@/lib/utils/crypto';
import { logAudit } from '@/lib/utils/audit';
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
  try {
    return await handlePost(request);
  } catch (err) {
    console.error('Unhandled RSVP error:', err);
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

  const parsed = rsvpMultiChildSchema.safeParse(body);
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
  const children = parsed.data.children;

  // Check for duplicate email on this invitation → 409
  const { data: existingResponses } = await supabase
    .from('rsvp_responses')
    .select('id, child_name')
    .eq('invitation_id', invitation.id)
    .eq('parent_email', email);

  if (existingResponses && existingResponses.length > 0) {
    const names = existingResponses.map((r) => r.child_name).join(', ');
    return NextResponse.json(
      { error: `Du har redan svarat för ${names}. Kolla din e-post för en länk att ändra ditt svar.` },
      { status: 409 },
    );
  }

  // Get party date for allergy auto-delete
  const { data: party } = await supabase
    .from('parties')
    .select('child_name, party_date, party_time, party_time_end, venue_name, venue_address')
    .eq('id', invitation.party_id)
    .single();

  const partyDate = party?.party_date ? new Date(party.party_date) : new Date();
  const autoDeleteAt = new Date(partyDate);
  autoDeleteAt.setDate(autoDeleteAt.getDate() + 7);

  // Insert one row per child
  let primaryEditToken = '';
  const rsvpIds: string[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const editToken = generateEditToken();
    if (i === 0) primaryEditToken = editToken;

    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvp_responses')
      .insert({
        invitation_id: invitation.id,
        child_name: child.childName,
        attending: child.attending,
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

    rsvpIds.push(rsvp.id);

    // Store allergy data if attending and has allergies with consent
    const allergies = child.allergies ?? [];
    const otherDietary = child.otherDietary;
    const hasAllergyData = allergies.length > 0 || (otherDietary && otherDietary.length > 0);

    if (child.attending && hasAllergyData && child.allergyConsent) {
      const encrypted = encryptAllergyData(allergies, otherDietary || null);
      const { error: allergyError } = await supabase.from('allergy_data').insert({
        rsvp_id: rsvp.id,
        allergies: encrypted.allergies_enc,
        other_dietary: encrypted.other_dietary_enc,
        consent_given_at: new Date().toISOString(),
        auto_delete_at: autoDeleteAt.toISOString(),
      });
      if (allergyError) {
        console.error('[RSVP] Failed to store allergy data for rsvp_id:', rsvp.id, allergyError);
      }
    }
  }

  // Send ONE confirmation email listing all children
  let emailSent = false;
  if (party) {
    const childNames = children.map((c) => c.childName);
    const anyAttending = children.some((c) => c.attending);
    const editUrl = `${APP_URL}/r/${encodeURIComponent(invitation.token)}/edit?token=${encodeURIComponent(primaryEditToken)}`;
    try {
      await sendRsvpConfirmation({
        to: email,
        childName: childNames[0],
        childNames,
        partyChildName: party.child_name,
        attending: anyAttending,
        editUrl,
        partyDate: formatDate(party.party_date),
        partyTime: formatTime(party.party_time),
        venueName: party.venue_name,
        partyDateRaw: party.party_date,
        partyTimeRaw: party.party_time,
        partyTimeEndRaw: party.party_time_end,
        venueAddress: party.venue_address,
      });
      emailSent = true;
    } catch (err) {
      console.error('[RSVP] Failed to send confirmation email:', err);
    }
  }

  // Notify party owner
  const anyAttendingForNotify = children.some((c) => c.attending);
  await notifyPartyOwner(
    supabase,
    invitation.party_id,
    children.map((c) => c.childName),
    anyAttendingForNotify,
    parsed.data.message || null,
    false,
  );

  // Audit log (fire-and-forget)
  logAudit(supabase, {
    action: 'rsvp.submit',
    resourceType: 'rsvp_response',
    resourceId: rsvpIds[0],
    metadata: {
      childCount: children.length,
      invitationId: invitation.id,
    },
  });

  return NextResponse.json({ success: true, rsvpIds, emailSent });
}

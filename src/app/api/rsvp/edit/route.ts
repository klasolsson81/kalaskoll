import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rsvpMultiChildEditSchema } from '@/lib/utils/validation';
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

function generateEditToken(): string {
  return randomBytes(32).toString('hex');
}

// GET: Fetch existing RSVP data for edit form pre-fill (with siblings)
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

  // Look up primary RSVP by edit_token
  const { data: rsvp, error: rsvpError } = await supabase
    .from('rsvp_responses')
    .select('id, invitation_id, child_name, attending, parent_name, parent_phone, parent_email, message, edit_token')
    .eq('edit_token', editToken)
    .single();

  if (rsvpError || !rsvp) {
    return NextResponse.json({ error: 'Ogiltigt edit-token' }, { status: 404 });
  }

  // Get all siblings (same invitation + email)
  const { data: siblings } = await supabase
    .from('rsvp_responses')
    .select('id, child_name, attending, edit_token')
    .eq('invitation_id', rsvp.invitation_id)
    .eq('parent_email', rsvp.parent_email)
    .order('responded_at', { ascending: true });

  const allChildren = siblings ?? [{ id: rsvp.id, child_name: rsvp.child_name, attending: rsvp.attending, edit_token: rsvp.edit_token }];

  // Get allergy data for all children
  const childIds = allChildren.map((c) => c.id);
  const { data: allergyRows } = await supabase
    .from('allergy_data')
    .select('rsvp_id, allergies, other_dietary')
    .in('rsvp_id', childIds);

  const allergyMap = new Map<string, { allergies: string[]; other_dietary: string | null }>();
  for (const row of allergyRows ?? []) {
    allergyMap.set(row.rsvp_id, decryptAllergyData(row.allergies, row.other_dietary));
  }

  // Get invitation token for URL verification
  const { data: invitation } = await supabase
    .from('invitations')
    .select('token')
    .eq('id', rsvp.invitation_id)
    .single();

  const childrenData = allChildren.map((c) => {
    const allergy = allergyMap.get(c.id);
    return {
      id: c.id,
      childName: c.child_name,
      attending: c.attending,
      editToken: c.edit_token,
      allergies: allergy?.allergies ?? [],
      otherDietary: allergy?.other_dietary ?? null,
    };
  });

  return NextResponse.json({
    parentInfo: {
      parentName: rsvp.parent_name,
      parentPhone: rsvp.parent_phone,
      parentEmail: rsvp.parent_email,
      message: rsvp.message,
    },
    children: childrenData,
    invitationToken: invitation?.token ?? null,
  });
}

// POST: Update existing RSVP via edit_token (with siblings)
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

  const parsed = rsvpMultiChildEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Look up primary RSVP by edit_token
  const { data: existing, error: lookupError } = await supabase
    .from('rsvp_responses')
    .select('id, invitation_id, parent_email')
    .eq('edit_token', parsed.data.editToken)
    .single();

  if (lookupError || !existing) {
    return NextResponse.json({ error: 'Ogiltigt edit-token' }, { status: 404 });
  }

  // Get all existing siblings
  const { data: existingSiblings } = await supabase
    .from('rsvp_responses')
    .select('id')
    .eq('invitation_id', existing.invitation_id)
    .eq('parent_email', existing.parent_email);

  const existingIds = new Set((existingSiblings ?? []).map((s) => s.id));

  // Get party date for allergy auto-delete
  const { data: invForParty } = await supabase
    .from('invitations')
    .select('party_id')
    .eq('id', existing.invitation_id)
    .single();

  let autoDeleteAt = new Date();
  if (invForParty) {
    const { data: partyForDate } = await supabase
      .from('parties')
      .select('party_date')
      .eq('id', invForParty.party_id)
      .single();
    const partyDate = partyForDate?.party_date ? new Date(partyForDate.party_date) : new Date();
    autoDeleteAt = new Date(partyDate);
    autoDeleteAt.setDate(autoDeleteAt.getDate() + 7);
  }

  const children = parsed.data.children;
  const updatedIds = new Set<string>();
  let primaryEditToken = parsed.data.editToken;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.id && existingIds.has(child.id)) {
      // UPDATE existing child
      updatedIds.add(child.id);

      const { error: updateError } = await supabase
        .from('rsvp_responses')
        .update({
          child_name: child.childName,
          attending: child.attending,
          parent_name: parsed.data.parentName || null,
          parent_phone: parsed.data.parentPhone || null,
          message: parsed.data.message || null,
        })
        .eq('id', child.id);

      if (updateError) {
        console.error('[RSVP Edit] Failed to update rsvp_id:', child.id, updateError);
      }

      // Replace allergy data
      const { error: deleteAllergyError } = await supabase.from('allergy_data').delete().eq('rsvp_id', child.id);
      if (deleteAllergyError) {
        console.error('[RSVP Edit] Failed to delete allergy data for rsvp_id:', child.id, deleteAllergyError);
      }

      const allergies = child.allergies ?? [];
      const otherDietary = child.otherDietary;
      const hasAllergyData = allergies.length > 0 || (otherDietary && otherDietary.length > 0);

      if (child.attending && hasAllergyData && child.allergyConsent) {
        const encrypted = encryptAllergyData(allergies, otherDietary || null);
        const { error: allergyInsertError } = await supabase.from('allergy_data').insert({
          rsvp_id: child.id,
          allergies: encrypted.allergies_enc,
          other_dietary: encrypted.other_dietary_enc,
          consent_given_at: new Date().toISOString(),
          auto_delete_at: autoDeleteAt.toISOString(),
        });
        if (allergyInsertError) {
          console.error('[RSVP Edit] Failed to insert allergy data for rsvp_id:', child.id, allergyInsertError);
        }
      }
    } else {
      // INSERT new sibling
      const newToken = generateEditToken();
      if (i === 0 && !child.id) primaryEditToken = newToken;

      const { data: newRsvp } = await supabase
        .from('rsvp_responses')
        .insert({
          invitation_id: existing.invitation_id,
          child_name: child.childName,
          attending: child.attending,
          parent_name: parsed.data.parentName || null,
          parent_phone: parsed.data.parentPhone || null,
          parent_email: parsed.data.parentEmail,
          message: parsed.data.message || null,
          edit_token: newToken,
        })
        .select('id')
        .single();

      if (newRsvp) {
        updatedIds.add(newRsvp.id);

        const allergies = child.allergies ?? [];
        const otherDietary = child.otherDietary;
        const hasAllergyData = allergies.length > 0 || (otherDietary && otherDietary.length > 0);

        if (child.attending && hasAllergyData && child.allergyConsent) {
          const encrypted = encryptAllergyData(allergies, otherDietary || null);
          await supabase.from('allergy_data').insert({
            rsvp_id: newRsvp.id,
            allergies: encrypted.allergies_enc,
            other_dietary: encrypted.other_dietary_enc,
            consent_given_at: new Date().toISOString(),
            auto_delete_at: autoDeleteAt.toISOString(),
          });
        }
      }
    }
  }

  // DELETE siblings that were removed (not in payload)
  for (const existingId of existingIds) {
    if (!updatedIds.has(existingId)) {
      await supabase.from('allergy_data').delete().eq('rsvp_id', existingId);
      await supabase.from('rsvp_responses').delete().eq('id', existingId);
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
      const childNames = children.map((c) => c.childName);
      const anyAttending = children.some((c) => c.attending);
      const editUrl = `${APP_URL}/r/${encodeURIComponent(invitationForEmail.token)}/edit?token=${encodeURIComponent(primaryEditToken)}`;
      sendRsvpConfirmation({
        to: parsed.data.parentEmail,
        childName: childNames[0],
        childNames,
        partyChildName: party.child_name,
        attending: anyAttending,
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

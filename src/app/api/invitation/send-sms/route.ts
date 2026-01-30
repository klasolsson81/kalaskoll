import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSmsInvitationSchema } from '@/lib/utils/validation';
import { sendPartySms } from '@/lib/sms/elks';
import { APP_URL, SMS_MAX_PER_PARTY, ADMIN_EMAILS } from '@/lib/constants';
import type { SendSmsInvitationResponse } from '@/types/api';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  const body = await request.json();
  const parsed = sendSmsInvitationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { partyId, phones } = parsed.data;

  // Verify ownership
  const { data: party } = await supabase
    .from('parties')
    .select('id, owner_id, child_name, child_age, party_date, party_time, venue_name, venue_address, rsvp_deadline')
    .eq('id', partyId)
    .single();

  if (!party || party.owner_id !== user.id) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
  }

  // Get invitation token
  const { data: invitation } = await supabase
    .from('invitations')
    .select('token')
    .eq('party_id', partyId)
    .single();

  if (!invitation) {
    return NextResponse.json(
      { error: 'Ingen inbjudan finns för detta kalas' },
      { status: 404 },
    );
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');
  const currentMonth = getCurrentMonth();

  // Check SMS limits (skip for admins)
  if (!isAdmin) {
    const { data: usage } = await supabase
      .from('sms_usage')
      .select('party_id, sms_count')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single();

    if (usage) {
      // Row exists – check if it's for a different party
      if (usage.party_id !== null && usage.party_id !== partyId) {
        return NextResponse.json(
          { error: 'Du har redan använt SMS-inbjudningar för ett annat kalas denna månad' },
          { status: 429 },
        );
      }
      // Same party (or party was deleted → party_id is NULL but we allow re-use)
      // However if party_id is NULL, another party already used SMS and was deleted
      if (usage.party_id === null) {
        return NextResponse.json(
          { error: 'Du har redan använt SMS-inbjudningar denna månad' },
          { status: 429 },
        );
      }
      // Check count limit
      if (usage.sms_count + phones.length > SMS_MAX_PER_PARTY) {
        return NextResponse.json(
          {
            error: `Max ${SMS_MAX_PER_PARTY} SMS per kalas. Du har redan skickat ${usage.sms_count}.`,
            remainingSmsThisParty: SMS_MAX_PER_PARTY - usage.sms_count,
          },
          { status: 429 },
        );
      }
    }
  }

  const rsvpUrl = `${APP_URL}/r/${invitation.token}`;

  // Save invited guests with phone + invite_method='sms'
  // Individual inserts because the partial unique index (party_id, phone WHERE phone IS NOT NULL)
  // is not supported by Supabase upsert's onConflict parameter
  await Promise.allSettled(
    phones.map((phone) =>
      supabase.from('invited_guests').insert({
        party_id: partyId,
        phone,
        invite_method: 'sms',
      }),
    ),
  );

  // Send SMS in parallel
  const results = await Promise.allSettled(
    phones.map((phone) =>
      sendPartySms({
        to: phone,
        childName: party.child_name,
        childAge: party.child_age,
        partyDate: party.party_date,
        partyTime: party.party_time,
        venueName: party.venue_name,
        venueAddress: party.venue_address,
        rsvpDeadline: party.rsvp_deadline,
        rsvpUrl,
      }),
    ),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  // Update sms_usage (upsert: insert or increment)
  if (sent > 0) {
    const { data: existing } = await supabase
      .from('sms_usage')
      .select('id, sms_count')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single();

    if (existing) {
      await supabase
        .from('sms_usage')
        .update({
          sms_count: existing.sms_count + sent,
          party_id: partyId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('sms_usage').insert({
        user_id: user.id,
        party_id: partyId,
        sms_count: sent,
        month: currentMonth,
      });
    }
  }

  // Calculate remaining
  const { data: updatedUsage } = await supabase
    .from('sms_usage')
    .select('sms_count')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .single();

  const remainingSmsThisParty = isAdmin
    ? SMS_MAX_PER_PARTY
    : SMS_MAX_PER_PARTY - (updatedUsage?.sms_count ?? 0);

  const response: SendSmsInvitationResponse = { sent, failed, remainingSmsThisParty };
  return NextResponse.json(response);
}

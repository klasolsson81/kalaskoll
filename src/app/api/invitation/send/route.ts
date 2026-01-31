import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendInvitationSchema } from '@/lib/utils/validation';
import { sendPartyInvitation } from '@/lib/email/resend';
import { APP_URL } from '@/lib/constants';
import type { SendInvitationResponse } from '@/types/api';

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
  const parsed = sendInvitationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { partyId, emails } = parsed.data;

  // Verify ownership
  const { data: party } = await supabase
    .from('parties')
    .select('id, owner_id, child_name, child_age, party_date, party_time, party_time_end, venue_name, venue_address, theme, description, invitation_image_url')
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

  const baseRsvpUrl = `${APP_URL}/r/${invitation.token}`;

  // Save invited guests (ON CONFLICT DO NOTHING)
  await supabase.from('invited_guests').upsert(
    emails.map((e) => ({
      party_id: partyId,
      email: e.email.toLowerCase(),
      name: e.name ?? null,
      invite_method: 'email',
    })),
    { onConflict: 'party_id,email', ignoreDuplicates: true },
  );

  // Send emails in parallel (append ?email= so RSVP form is pre-filled)
  const results = await Promise.allSettled(
    emails.map((e) => {
      const rsvpUrl = `${baseRsvpUrl}?email=${encodeURIComponent(e.email)}`;
      return sendPartyInvitation({
        to: e.email,
        partyChildName: party.child_name,
        childAge: party.child_age,
        partyDate: party.party_date,
        partyTime: party.party_time,
        partyTimeEnd: party.party_time_end,
        venueName: party.venue_name,
        venueAddress: party.venue_address,
        theme: party.theme,
        description: party.description,
        rsvpUrl,
        imageUrl: party.invitation_image_url,
      });
    }),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  const response: SendInvitationResponse = { sent, failed };
  return NextResponse.json(response);
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTimeRange } from '@/lib/utils/format';
import { DeletePartyButton } from './DeletePartyButton';
import { InvitationSection } from './InvitationSection';
import { SendInvitationsSection } from './SendInvitationsSection';
import { ADMIN_EMAILS } from '@/lib/constants';

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('id', id)
    .single();

  if (!party) {
    notFound();
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, token')
    .eq('party_id', id)
    .single();

  const { count: guestCount } = await supabase
    .from('rsvp_responses')
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation?.id ?? '');

  const { count: attendingCount } = await supabase
    .from('rsvp_responses')
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation?.id ?? '')
    .eq('attending', true);

  // Fetch party images for gallery
  const { data: partyImages } = await supabase
    .from('party_images')
    .select('id, image_url, is_selected')
    .eq('party_id', id)
    .order('created_at', { ascending: true });

  // Fetch invited guests with phone and invite_method
  const { data: invitedGuests } = await supabase
    .from('invited_guests')
    .select('email, phone, invite_method, name, invited_at')
    .eq('party_id', id)
    .order('invited_at', { ascending: true });

  // Fetch RSVP responses for matching
  const { data: rsvpResponses } = invitation
    ? await supabase
        .from('rsvp_responses')
        .select('parent_email, parent_phone')
        .eq('invitation_id', invitation.id)
    : { data: null };

  // Normalize phone to E.164 for matching: "070..." → "+4670..."
  function normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('07')) return '+46' + cleaned.slice(1);
    return cleaned;
  }

  const respondedEmails = new Set(
    (rsvpResponses ?? [])
      .map((r) => r.parent_email?.toLowerCase())
      .filter(Boolean),
  );
  const respondedPhones = new Set(
    (rsvpResponses ?? [])
      .map((r) => r.parent_phone ? normalizePhone(r.parent_phone) : null)
      .filter(Boolean),
  );

  const invitedGuestsWithStatus = (invitedGuests ?? []).map((g) => {
    const isSms = g.invite_method === 'sms';
    let hasResponded = false;
    if (isSms && g.phone) {
      hasResponded = respondedPhones.has(normalizePhone(g.phone));
    } else if (g.email) {
      hasResponded = respondedEmails.has(g.email.toLowerCase());
    }
    return { ...g, hasResponded };
  });

  // Fetch SMS usage for current month
  const currentMonth = getCurrentMonth();
  const { data: smsUsageData } = user
    ? await supabase
        .from('sms_usage')
        .select('party_id, sms_count')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()
    : { data: null };

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? '');

  // Determine SMS availability
  let smsUsage: { smsCount: number; allowed: boolean } | undefined;
  if (smsUsageData) {
    const isThisParty = smsUsageData.party_id === id;
    smsUsage = {
      smsCount: isThisParty ? smsUsageData.sms_count : 0,
      allowed: isThisParty, // Only allowed if this party is the one that used SMS
    };
  } else {
    // No usage this month – SMS is available
    smsUsage = { smsCount: 0, allowed: true };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-3xl font-bold">{party.child_name}s kalas</h1>
        <div className="flex gap-2">
          <Link href={`/kalas/${id}/edit`}>
            <Button variant="outline">Redigera</Button>
          </Link>
          <Link href={`/kalas/${id}/guests`}>
            <Button variant="outline">Gästlista</Button>
          </Link>
          <DeletePartyButton partyId={id} />
        </div>
      </div>

      {/* Invitation Card */}
      {invitation?.token && (
        <InvitationSection
          partyId={id}
          imageUrl={party.invitation_image_url}
          childName={party.child_name}
          childAge={party.child_age}
          partyDate={formatDate(party.party_date)}
          partyTime={formatTimeRange(party.party_time, party.party_time_end)}
          venueName={party.venue_name}
          venueAddress={party.venue_address}
          rsvpDeadline={party.rsvp_deadline ? formatDate(party.rsvp_deadline) : null}
          description={party.description}
          theme={party.theme}
          token={invitation.token}
          images={(partyImages ?? []).map((img) => ({
            id: img.id,
            imageUrl: img.image_url,
            isSelected: img.is_selected,
          }))}
          isAdmin={isAdmin}
          invitationTemplate={party.invitation_template ?? null}
          childPhotoUrl={party.child_photo_url ?? null}
          childPhotoFrame={party.child_photo_frame ?? null}
        />
      )}

      {/* Share & send invitations */}
      <div className="print:hidden">
        {invitation?.token && (
          <SendInvitationsSection
            partyId={id}
            token={invitation.token}
            childName={party.child_name}
            invitedGuests={invitedGuestsWithStatus}
            smsUsage={smsUsage}
            isAdmin={isAdmin}
          />
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Barn</p>
              <p className="font-medium">
                {party.child_name}, fyller {party.child_age} år
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Datum & tid</p>
              <p className="font-medium">
                {formatDate(party.party_date)} kl {formatTimeRange(party.party_time, party.party_time_end)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plats</p>
              <p className="font-medium">{party.venue_name}</p>
              {party.venue_address && (
                <p className="text-sm text-muted-foreground">{party.venue_address}</p>
              )}
            </div>
            {party.theme && (
              <div>
                <p className="text-sm text-muted-foreground">Tema</p>
                <p className="font-medium capitalize">{party.theme}</p>
              </div>
            )}
            {party.description && (
              <div>
                <p className="text-sm text-muted-foreground">Beskrivning</p>
                <p className="font-medium">{party.description}</p>
              </div>
            )}
            {party.rsvp_deadline && (
              <div>
                <p className="text-sm text-muted-foreground">Sista OSA</p>
                <p className="font-medium">{formatDate(party.rsvp_deadline)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gäster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{attendingCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Kommer</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{guestCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Svar totalt</p>
              </div>
            </div>
            {party.max_guests && (
              <p className="text-sm text-muted-foreground">
                Max {party.max_guests} gäster
              </p>
            )}
            {invitation?.token && (
              <div>
                <p className="text-sm text-muted-foreground">QR-kod token</p>
                <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                  {invitation.token}
                </code>
              </div>
            )}
            <Link href={`/kalas/${id}/guests`}>
              <Button variant="outline" className="w-full">
                Se gästlista
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

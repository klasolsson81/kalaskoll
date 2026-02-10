import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTimeRange } from '@/lib/utils/format';
import { DeletePartyButton } from './DeletePartyButton';
import { InvitationSection } from './InvitationSection';
import { SendInvitationsSection } from './SendInvitationsSection';
import { ADMIN_EMAILS, SMS_MAX_PER_PARTY } from '@/lib/constants';
import { BETA_CONFIG } from '@/lib/beta-config';

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PartyPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: party } = await supabase
    .from('parties')
    .select('child_name')
    .eq('id', id)
    .single();

  return {
    title: party ? `${party.child_name}s kalas` : 'Kalas',
    robots: { index: false, follow: false },
  };
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

  // Fetch invited guests with phone, invite_method, and send status
  const { data: invitedGuests } = await supabase
    .from('invited_guests')
    .select('id, email, phone, invite_method, name, invited_at, send_status, error_message')
    .eq('party_id', id)
    .order('invited_at', { ascending: true });

  // Fetch RSVP responses for matching
  const { data: rsvpResponses } = invitation
    ? await supabase
        .from('rsvp_responses')
        .select('parent_email, parent_phone')
        .eq('invitation_id', invitation.id)
    : { data: null };

  // Normalize phone to E.164 for matching: "070..." -> "+4670..."
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

  // Fetch profile for beta role
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role, beta_sms_used')
        .eq('id', user.id)
        .single()
    : { data: null };

  const isTester = profile?.role === 'tester';
  const smsLimit = isTester ? BETA_CONFIG.freeSmsInvites : SMS_MAX_PER_PARTY;

  // Determine SMS availability
  // allowed = true when: no usage yet, same party, or party was deleted (reusable quota)
  let smsUsage: { smsCount: number; allowed: boolean } | undefined;
  if (smsUsageData) {
    const isThisParty = smsUsageData.party_id === id;
    const isDeletedParty = smsUsageData.party_id === null;
    smsUsage = {
      smsCount: (isThisParty || isDeletedParty) ? smsUsageData.sms_count : 0,
      allowed: isThisParty || isDeletedParty,
    };
  } else {
    smsUsage = { smsCount: 0, allowed: true };
  }

  const isUpcoming = new Date(party.party_date) >= new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl font-display">{party.child_name}s kalas</h1>
            <Badge variant={isUpcoming ? 'success' : 'outline'}>
              {isUpcoming ? 'Kommande' : 'Avslutat'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {formatDate(party.party_date)} kl {formatTimeRange(party.party_time, party.party_time_end)}
          </p>
        </div>
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
            smsLimit={smsLimit}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Details & Guests grid */}
      <div className="grid gap-6 sm:grid-cols-2 print:hidden">
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="font-display">Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                👶
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Barn</p>
                <p className="font-medium">
                  {party.child_name}, fyller {party.child_age} år
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-lg">
                📅
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Datum & tid</p>
                <p className="font-medium">
                  {formatDate(party.party_date)} kl {formatTimeRange(party.party_time, party.party_time_end)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-lg">
                📍
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plats</p>
                <p className="font-medium">{party.venue_name}</p>
                {party.venue_address && (
                  <p className="text-sm text-muted-foreground">{party.venue_address}</p>
                )}
              </div>
            </div>
            {party.theme && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                  🎨
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tema</p>
                  <p className="font-medium capitalize">{party.theme}</p>
                </div>
              </div>
            )}
            {party.description && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                  📝
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Beskrivning</p>
                  <p className="font-medium">{party.description}</p>
                </div>
              </div>
            )}
            {party.rsvp_deadline && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                  ⏰
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sista OSA</p>
                  <p className="font-medium">{formatDate(party.rsvp_deadline)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="font-display">Gäster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-success/5 p-4 text-center">
                <p className="text-3xl font-bold text-success">{attendingCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Kommer</p>
              </div>
              <div className="rounded-xl bg-muted p-4 text-center">
                <p className="text-3xl font-bold">{guestCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Svar totalt</p>
              </div>
            </div>
            {(invitedGuests ?? []).length > 0 && (() => {
              const sentCount = (invitedGuests ?? []).filter((g) => g.send_status !== 'failed').length;
              const failedCount = (invitedGuests ?? []).filter((g) => g.send_status === 'failed').length;
              return (
                <>
                  <p className="text-sm text-muted-foreground">
                    {sentCount} {sentCount === 1 ? 'inbjudan skickad' : 'inbjudningar skickade'}
                  </p>
                  {failedCount > 0 && (
                    <p className="text-sm text-destructive">
                      {failedCount} misslyckade
                    </p>
                  )}
                </>
              );
            })()}
            {party.max_guests && (
              <p className="text-sm text-muted-foreground">
                Max {party.max_guests} gäster
              </p>
            )}
            {invitation?.token && (
              <div>
                <p className="text-sm text-muted-foreground">QR-kod token</p>
                <code className="rounded-lg bg-muted px-2 py-1 text-sm font-mono">
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

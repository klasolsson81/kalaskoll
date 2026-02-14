import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTimeRange } from '@/lib/utils/format';
import { DeletePartyButton } from './DeletePartyButton';
import { InvitationSection } from './InvitationSection';
import { SendInvitationsSection } from './SendInvitationsSection';
import { PartyDetailsCard } from './PartyDetailsCard';
import { PartyGuestSummary } from './PartyGuestSummary';
import { ADMIN_EMAILS, SMS_MAX_PER_PARTY } from '@/lib/constants';
import { normalizeSwedishPhone } from '@/lib/utils/validation';
import { BETA_CONFIG } from '@/lib/beta-config';
import { getImpersonationContext } from '@/lib/utils/impersonation';

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
  const ctx = await getImpersonationContext();
  if (!ctx) return null;

  const { effectiveUserId, client: supabase, isImpersonating } = ctx;

  // When impersonating, get the real admin user for admin checks
  let user: { id: string; email?: string | null } | null = null;
  if (isImpersonating) {
    const regularSupabase = await createClient();
    const { data } = await regularSupabase.auth.getUser();
    user = data.user;
  } else {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const { data: party } = await supabase
    .from('parties')
    .select('id, owner_id, child_name, child_age, party_date, party_time, party_time_end, venue_name, venue_address, description, theme, invitation_image_url, invitation_template, child_photo_url, child_photo_frame, rsvp_deadline, max_guests')
    .eq('id', id)
    .eq('owner_id', effectiveUserId)
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
    .select('id', { count: 'exact', head: true })
    .eq('invitation_id', invitation?.id ?? '');

  const { count: attendingCount } = await supabase
    .from('rsvp_responses')
    .select('id', { count: 'exact', head: true })
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

  const respondedEmails = new Set(
    (rsvpResponses ?? [])
      .map((r) => r.parent_email?.toLowerCase())
      .filter(Boolean),
  );
  const respondedPhones = new Set(
    (rsvpResponses ?? [])
      .map((r) => r.parent_phone ? normalizeSwedishPhone(r.parent_phone) : null)
      .filter(Boolean),
  );

  const invitedGuestsWithStatus = (invitedGuests ?? []).map((g) => {
    const isSms = g.invite_method === 'sms';
    let hasResponded = false;
    if (isSms && g.phone) {
      hasResponded = respondedPhones.has(normalizeSwedishPhone(g.phone));
    } else if (g.email) {
      hasResponded = respondedEmails.has(g.email.toLowerCase());
    }
    return { ...g, hasResponded };
  });

  // Fetch SMS usage for current month
  const currentMonth = getCurrentMonth();
  const { data: smsUsageData } = await supabase
    .from('sms_usage')
    .select('party_id, sms_count')
    .eq('user_id', effectiveUserId)
    .eq('month', currentMonth)
    .single();

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? '');

  // Fetch profile for beta role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, beta_sms_used')
    .eq('id', effectiveUserId)
    .single();

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
        <PartyDetailsCard
          childName={party.child_name}
          childAge={party.child_age}
          partyDate={party.party_date}
          partyTime={party.party_time}
          partyTimeEnd={party.party_time_end}
          venueName={party.venue_name}
          venueAddress={party.venue_address}
          theme={party.theme}
          description={party.description}
          rsvpDeadline={party.rsvp_deadline}
        />
        <PartyGuestSummary
          partyId={id}
          attendingCount={attendingCount ?? 0}
          guestCount={guestCount ?? 0}
          maxGuests={party.max_guests}
          invitationToken={invitation?.token ?? null}
          invitedGuests={invitedGuests ?? []}
        />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { decryptAllergyData } from '@/lib/utils/crypto';
import { GuestListRealtime } from './GuestListRealtime';
import { getImpersonationContext } from '@/lib/utils/impersonation';

export const metadata: Metadata = {
  title: 'Gästlista',
  robots: { index: false, follow: false },
};

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const { id } = await params;
  const ctx = await getImpersonationContext();
  if (!ctx) return null;

  const { effectiveUserId, client: supabase } = ctx;

  const { data: party } = await supabase
    .from('parties')
    .select('child_name')
    .eq('id', id)
    .eq('owner_id', effectiveUserId)
    .single();

  if (!party) {
    notFound();
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id')
    .eq('party_id', id)
    .single();

  const invitationId = invitation?.id ?? '';

  const { data: guests } = await supabase
    .from('rsvp_responses')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('responded_at', { ascending: false });

  // Fetch allergy data for attending guests (only visible to owner via RLS)
  const guestIds = (guests ?? []).filter((g) => g.attending).map((g) => g.id);
  const { data: allergies } = guestIds.length > 0
    ? await supabase
        .from('allergy_data')
        .select('rsvp_id, allergies, other_dietary, consent_given_at')
        .in('rsvp_id', guestIds)
        .not('consent_given_at', 'is', null)
    : { data: [] };

  // Fetch invited guests (email/SMS) with response matching
  const { data: invitedGuests } = await supabase
    .from('invited_guests')
    .select('id, email, phone, invite_method, name, invited_at, send_status, error_message')
    .eq('party_id', id)
    .order('invited_at', { ascending: true });

  function normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('07')) return '+46' + cleaned.slice(1);
    return cleaned;
  }

  const respondedEmails = new Set(
    (guests ?? [])
      .map((r) => r.parent_email?.toLowerCase())
      .filter(Boolean),
  );
  const respondedPhones = new Set(
    (guests ?? [])
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl font-display">
            Gästlista
          </h1>
          <p className="text-muted-foreground">{party.child_name}s kalas</p>
        </div>
        <Link href={`/kalas/${id}`}>
          <Button variant="outline">Tillbaka</Button>
        </Link>
      </div>

      <GuestListRealtime
        partyId={id}
        invitationId={invitationId}
        initialGuests={guests ?? []}
        initialAllergies={
          (allergies ?? []).map((a) => {
            const decrypted = decryptAllergyData(a.allergies, a.other_dietary);
            return {
              rsvp_id: a.rsvp_id,
              allergies: decrypted.allergies,
              other_dietary: decrypted.other_dietary,
            };
          })
        }
        invitedGuests={invitedGuestsWithStatus}
      />
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { GuestListRealtime } from './GuestListRealtime';

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: party } = await supabase
    .from('parties')
    .select('child_name')
    .eq('id', id)
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
        .select('rsvp_id, allergies, other_dietary')
        .in('rsvp_id', guestIds)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gästlista - {party.child_name}s kalas</h1>
        <Link href={`/kalas/${id}`}>
          <Button variant="outline">Tillbaka</Button>
        </Link>
      </div>

      <GuestListRealtime
        invitationId={invitationId}
        initialGuests={guests ?? []}
        initialAllergies={
          (allergies ?? []).map((a) => ({
            rsvp_id: a.rsvp_id,
            allergies: Array.isArray(a.allergies) ? (a.allergies as string[]) : [],
            other_dietary: a.other_dietary,
          }))
        }
      />
    </div>
  );
}

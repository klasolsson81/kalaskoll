import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PartyForm } from '@/components/forms/PartyForm';
import { updateParty } from '@/app/(dashboard)/kalas/actions';

export const metadata: Metadata = {
  title: 'Redigera kalas',
  robots: { index: false, follow: false },
};

interface EditPartyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartyPage({ params }: EditPartyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: party }, { data: children }] = await Promise.all([
    supabase.from('parties').select('id, owner_id, child_name, child_age, child_id, party_date, party_time, party_time_end, venue_name, venue_address, description, theme, rsvp_deadline, max_guests').eq('id', id).single(),
    supabase
      .from('children')
      .select('id, name, birth_date')
      .order('name', { ascending: true }),
  ]);

  if (!party) {
    notFound();
  }

  const boundAction = updateParty.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl font-display">Redigera kalas</h1>
        <p className="text-muted-foreground">{party.child_name}s kalas</p>
      </div>
      <PartyForm
        action={boundAction}
        submitLabel="Spara ändringar"
        savedChildren={children ?? []}
        defaultValues={{
          childName: party.child_name,
          childAge: party.child_age,
          childId: party.child_id ?? undefined,
          partyDate: party.party_date,
          partyTime: party.party_time,
          partyTimeEnd: party.party_time_end ?? undefined,
          venueName: party.venue_name,
          venueAddress: party.venue_address ?? undefined,
          description: party.description ?? undefined,
          theme: party.theme ?? undefined,
          rsvpDeadline: party.rsvp_deadline ?? undefined,
          maxGuests: party.max_guests ?? undefined,
        }}
      />
    </div>
  );
}

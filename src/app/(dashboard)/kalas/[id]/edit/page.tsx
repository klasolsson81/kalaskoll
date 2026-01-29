import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PartyForm } from '@/components/forms/PartyForm';
import { updateParty } from '@/app/(dashboard)/kalas/actions';

interface EditPartyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartyPage({ params }: EditPartyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('id', id)
    .single();

  if (!party) {
    notFound();
  }

  const boundAction = updateParty.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Redigera kalas</h1>
      <PartyForm
        action={boundAction}
        submitLabel="Spara ändringar"
        defaultValues={{
          childName: party.child_name,
          childAge: party.child_age,
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

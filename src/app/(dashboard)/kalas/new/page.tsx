import { createClient } from '@/lib/supabase/server';
import { PartyForm } from '@/components/forms/PartyForm';
import { createParty } from '@/app/(dashboard)/kalas/actions';

export default async function NewPartyPage() {
  const supabase = await createClient();
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birth_date')
    .order('name', { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Skapa nytt kalas</h1>
      <PartyForm
        action={createParty}
        submitLabel="Skapa kalas"
        savedChildren={children ?? []}
      />
    </div>
  );
}

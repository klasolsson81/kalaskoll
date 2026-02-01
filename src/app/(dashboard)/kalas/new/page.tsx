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
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl font-display">Skapa nytt kalas</h1>
        <p className="text-muted-foreground">Fyll i uppgifterna nedan för att komma igång.</p>
      </div>
      <PartyForm
        action={createParty}
        submitLabel="Skapa kalas"
        savedChildren={children ?? []}
      />
    </div>
  );
}

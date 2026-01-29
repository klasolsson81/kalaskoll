'use client';

import { Button } from '@/components/ui/button';
import { deleteParty } from '@/app/(dashboard)/kalas/actions';

export function DeletePartyButton({ partyId }: { partyId: string }) {
  async function handleDelete() {
    if (!confirm('Är du säker på att du vill ta bort detta kalas? Det går inte att ångra.')) {
      return;
    }
    await deleteParty(partyId);
  }

  return (
    <form action={handleDelete}>
      <Button variant="destructive" type="submit">
        Ta bort
      </Button>
    </form>
  );
}

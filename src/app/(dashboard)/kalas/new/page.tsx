import { PartyForm } from '@/components/forms/PartyForm';
import { createParty } from '@/app/(dashboard)/kalas/actions';

export default function NewPartyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Skapa nytt kalas</h1>
      <PartyForm action={createParty} submitLabel="Skapa kalas" />
    </div>
  );
}

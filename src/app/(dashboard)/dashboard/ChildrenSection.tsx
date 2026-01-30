'use client';

import { useState, useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/forms/SubmitButton';
import {
  createChild,
  updateChild,
  deleteChild,
  type ChildActionResult,
} from '@/app/(dashboard)/children/actions';
import { calculateAge } from '@/lib/utils/format';

interface Child {
  id: string;
  name: string;
  birth_date: string;
}

interface ChildrenSectionProps {
  savedChildren: Child[];
}

function AddChildForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState<ChildActionResult, FormData>(createChild, {});

  if (state.success) {
    onDone();
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="new-child-name">Namn</Label>
        <Input id="new-child-name" name="name" placeholder="t.ex. Klas" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="new-child-birth">Födelsedatum</Label>
        <Input id="new-child-birth" name="birthDate" type="date" required />
      </div>
      <SubmitButton size="sm">Spara</SubmitButton>
      <Button type="button" variant="ghost" size="sm" onClick={onDone}>
        Avbryt
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

function EditChildForm({ child, onDone }: { child: Child; onDone: () => void }) {
  const boundAction = updateChild.bind(null, child.id);
  const [state, formAction] = useActionState<ChildActionResult, FormData>(boundAction, {});

  if (state.success) {
    onDone();
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor={`edit-name-${child.id}`}>Namn</Label>
        <Input
          id={`edit-name-${child.id}`}
          name="name"
          defaultValue={child.name}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`edit-birth-${child.id}`}>Födelsedatum</Label>
        <Input
          id={`edit-birth-${child.id}`}
          name="birthDate"
          type="date"
          defaultValue={child.birth_date}
          required
        />
      </div>
      <SubmitButton size="sm">Spara</SubmitButton>
      <Button type="button" variant="ghost" size="sm" onClick={onDone}>
        Avbryt
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

function ChildRow({ child }: { child: Child }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view');

  const age = calculateAge(child.birth_date);

  if (mode === 'edit') {
    return <EditChildForm child={child} onDone={() => setMode('view')} />;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">
        {child.name} &bull; {age} år
      </span>
      <div className="flex gap-2">
        {mode === 'confirm-delete' ? (
          <>
            <span className="text-sm text-muted-foreground">Säker?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await deleteChild(child.id);
              }}
            >
              Ja
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode('view')}>
              Nej
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setMode('edit')}>
              Redigera
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode('confirm-delete')}>
              Ta bort
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function ChildrenSection({ savedChildren }: ChildrenSectionProps) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mina barn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedChildren.length > 0 ? (
          <div className="space-y-3">
            {savedChildren.map((child) => (
              <ChildRow key={child.id} child={child} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Inga sparade barn. Lägg till ett barn för att snabbt kunna skapa kalas.
          </p>
        )}

        {showAdd ? (
          <AddChildForm onDone={() => setShowAdd(false)} />
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            + Lägg till barn
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

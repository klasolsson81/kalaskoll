'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { deleteParty } from '@/app/(dashboard)/kalas/actions';

export function DeletePartyButton({ partyId }: { partyId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (!deleting) setShowConfirm(false);
  }, [deleting]);

  useEffect(() => {
    if (!showConfirm) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showConfirm, handleClose]);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteParty(partyId);
    } catch {
      setError('Kunde inte ta bort kalaset. Försök igen.');
      setDeleting(false);
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)}>
        Ta bort
      </Button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-lg font-semibold">
              Ta bort kalas?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Detta tar bort kalaset, alla inbjudningar och OSA-svar permanent. Det går inte att ångra.
            </p>

            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={deleting}>
                Avbryt
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Tar bort...' : 'Ja, ta bort'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

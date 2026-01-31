'use client';

import { useState, useRef, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { PhotoFrame } from '@/components/shared/PhotoFrame';
import { PhotoCropDialog } from '@/components/shared/PhotoCropDialog';
import {
  createChild,
  updateChild,
  deleteChild,
  type ChildActionResult,
} from '@/app/(dashboard)/children/actions';
import { calculateAge } from '@/lib/utils/format';
import { PHOTO_MAX_FILE_SIZE } from '@/lib/constants';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

interface Child {
  id: string;
  name: string;
  birth_date: string;
  photo_url: string | null;
  photo_frame: string | null;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
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
        <Input id="new-child-birth" name="birthDate" type="date" max={todayString()} required />
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
          max={todayString()}
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
  const router = useRouter();
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view');
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const age = calculateAge(child.birth_date);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Välj en bildfil');
      return;
    }
    if (file.size > PHOTO_MAX_FILE_SIZE) {
      setPhotoError('Bilden är för stor (max 10 MB)');
      return;
    }
    setCropFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  async function handleCropSave(dataUrl: string, frame: PhotoFrameType) {
    setCropFile(null);
    setUploading(true);
    setPhotoError(null);
    try {
      const res = await fetch('/api/children/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, photoData: dataUrl, frame }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPhotoError(data.error || 'Kunde inte spara foto');
        return;
      }
      router.refresh();
    } catch {
      setPhotoError('Nätverksfel');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setUploading(true);
    setPhotoError(null);
    try {
      const res = await fetch('/api/children/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, photoData: null, frame: 'circle' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPhotoError(data.error || 'Kunde inte ta bort foto');
        return;
      }
      router.refresh();
    } catch {
      setPhotoError('Nätverksfel');
    } finally {
      setUploading(false);
    }
  }

  if (mode === 'edit') {
    return <EditChildForm child={child} onDone={() => setMode('view')} />;
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2.5 mr-auto">
          {child.photo_url && (
            <PhotoFrame
              src={child.photo_url}
              alt={`Foto på ${child.name}`}
              shape={(child.photo_frame as PhotoFrameType) || 'circle'}
              size={40}
            />
          )}
          <span className="text-sm">
            {child.name} &bull; {age} år
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Sparar...' : child.photo_url ? 'Byt foto' : 'Foto'}
              </Button>
              {child.photo_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                >
                  Ta bort foto
                </Button>
              )}
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
      {photoError && <p className="text-xs text-destructive">{photoError}</p>}
      {cropFile && (
        <PhotoCropDialog
          imageFile={cropFile}
          initialFrame={(child.photo_frame as PhotoFrameType) || 'circle'}
          onSave={handleCropSave}
          onCancel={() => setCropFile(null)}
        />
      )}
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

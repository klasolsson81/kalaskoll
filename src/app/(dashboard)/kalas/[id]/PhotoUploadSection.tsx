'use client';

import { Button } from '@/components/ui/button';
import { PhotoFrame } from '@/components/shared/PhotoFrame';
import { PHOTO_MAX_FILE_SIZE } from '@/lib/constants';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

interface PhotoUploadSectionProps {
  childName: string;
  photoUrl: string | null;
  photoFrame: PhotoFrameType;
  uploadingPhoto: boolean;
  onFileSelect: (file: File) => void;
  onRemovePhoto: () => void;
  onError: (msg: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function PhotoUploadSection({
  childName,
  photoUrl,
  photoFrame,
  uploadingPhoto,
  onFileSelect,
  onRemovePhoto,
  onError,
  fileInputRef,
}: PhotoUploadSectionProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > PHOTO_MAX_FILE_SIZE) {
      onError('Bilden är för stor (max 10MB)');
      return;
    }
    onFileSelect(file);
  }

  const frameLabel =
    photoFrame === 'circle'
      ? 'cirkel'
      : photoFrame === 'star'
        ? 'stjärna'
        : photoFrame === 'heart'
          ? 'hjärta'
          : 'diamant';

  return (
    <div className="space-y-3 border-t pt-4 print:hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {!photoUrl ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground disabled:opacity-50"
        >
          {uploadingPhoto ? (
            'Laddar upp...'
          ) : (
            <>
              <span className="text-lg">📷</span>
              Ladda upp foto på {childName}
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <PhotoFrame
              src={photoUrl}
              alt={`Foto på ${childName}`}
              shape={photoFrame}
              size={64}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Foto med {frameLabel}ram
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              Byt foto
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemovePhoto}
              disabled={uploadingPhoto}
              className="text-red-600 hover:text-red-700"
            >
              Ta bort foto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { AI_MAX_IMAGES_PER_PARTY } from '@/lib/constants';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';
import type { AiGenerateOptions } from './AiGenerateDialog';

interface PartyImage {
  id: string;
  imageUrl: string;
  isSelected: boolean;
}

interface UseInvitationParams {
  partyId: string;
  imageUrl: string | null;
  images: PartyImage[];
  isAdmin: boolean;
  invitationTemplate: string | null;
  childPhotoUrl: string | null;
  childPhotoFrame: string | null;
}

export function useInvitation({
  partyId,
  imageUrl,
  images: initialImages,
  isAdmin,
  invitationTemplate,
  childPhotoUrl: initialPhotoUrl,
  childPhotoFrame: initialPhotoFrame,
}: UseInvitationParams) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [images, setImages] = useState<PartyImage[]>(initialImages);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [activeTemplate, setActiveTemplate] = useState<string | null>(invitationTemplate);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [photoFrame, setPhotoFrame] = useState<PhotoFrameType>(
    (initialPhotoFrame as PhotoFrameType) || 'circle',
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const activeMode: 'template' | 'ai' | null = activeTemplate
    ? 'template'
    : currentImageUrl
      ? 'ai'
      : null;

  const maxImages = AI_MAX_IMAGES_PER_PARTY;
  const canGenerate = isAdmin || images.length < maxImages;

  const selectTemplate = useCallback(async (templateId: string) => {
    setSavingTemplate(true);
    setError(null);
    try {
      const res = await fetch('/api/invitation/select-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte spara mall');
        return;
      }
      setActiveTemplate(templateId);
      setCurrentImageUrl(null);
      setImages((prev) => prev.map((img) => ({ ...img, isSelected: false })));
      setExpanded(true);
    } catch {
      setError('Något gick fel');
    } finally {
      setSavingTemplate(false);
    }
  }, [partyId]);

  const generateImage = useCallback(async (options: AiGenerateOptions) => {
    setGenerating(true);
    setShowGenerateDialog(false);
    setError(null);
    try {
      const res = await fetch('/api/invitation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId,
          theme: options.theme,
          style: options.style,
          customPrompt: options.customPrompt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte generera bild');
        return;
      }
      if (data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
        setActiveTemplate(null);
        setExpanded(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
        if (data.imageId) {
          const isFirst = images.length === 0;
          const newImage: PartyImage = {
            id: data.imageId,
            imageUrl: data.imageUrl,
            isSelected: isFirst,
          };
          if (isFirst) {
            setImages([newImage]);
          } else {
            setImages((prev) => [...prev, newImage]);
          }
        }
      }
    } catch {
      setError('Något gick fel vid bildgenerering');
    } finally {
      setGenerating(false);
    }
  }, [partyId, images.length]);

  const selectImage = useCallback(async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    setSelecting(imageId);
    setError(null);
    try {
      const res = await fetch('/api/invitation/select-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, imageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte välja bild');
        return;
      }
      setCurrentImageUrl(data.imageUrl);
      setActiveTemplate(null);
      setImages((prev) =>
        prev.map((img) => ({ ...img, isSelected: img.id === imageId })),
      );
      setExpanded(true);
    } catch {
      setError('Något gick fel');
    } finally {
      setSelecting(null);
    }
  }, [partyId, images]);

  const handleCropSave = useCallback(async (dataUrl: string, frame: PhotoFrameType) => {
    setCropFile(null);
    setUploadingPhoto(true);
    setError(null);
    try {
      const res = await fetch('/api/invitation/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, photoData: dataUrl, frame }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte ladda upp foto');
        return;
      }
      setPhotoUrl(dataUrl);
      setPhotoFrame(frame);
    } catch {
      setError('Något gick fel vid uppladdning');
    } finally {
      setUploadingPhoto(false);
    }
  }, [partyId]);

  const handleCropCancel = useCallback(() => {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removePhoto = useCallback(async () => {
    setUploadingPhoto(true);
    setError(null);
    try {
      const res = await fetch('/api/invitation/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, photoData: null, frame: photoFrame }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Kunde inte ta bort foto');
        return;
      }
      setPhotoUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError('Något gick fel');
    } finally {
      setUploadingPhoto(false);
    }
  }, [partyId, photoFrame]);

  return {
    // State
    currentImageUrl,
    images,
    generating,
    selecting,
    error,
    showSuccess,
    activeTemplate,
    savingTemplate,
    photoUrl,
    photoFrame,
    uploadingPhoto,
    cropFile,
    fileInputRef,
    showGenerateDialog,
    expanded,
    activeMode,
    maxImages,
    canGenerate,
    // Actions
    setError,
    setExpanded,
    setShowGenerateDialog,
    setCropFile,
    selectTemplate,
    generateImage,
    selectImage,
    handleCropSave,
    handleCropCancel,
    removePhoto,
  };
}

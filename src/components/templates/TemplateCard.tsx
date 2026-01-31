'use client';

import Image from 'next/image';
import { QRCode } from '@/components/shared/QRCode';
import { PhotoFrame } from '@/components/shared/PhotoFrame';
import { cn } from '@/lib/utils';
import { getThemeConfig } from './theme-configs';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

interface TemplateCardProps {
  templateId: string;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  description?: string | null;
  token: string;
  preview?: boolean;
  childPhotoUrl?: string | null;
  childPhotoFrame?: string | null;
}

export function TemplateCard({
  templateId,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  description,
  token,
  preview = false,
  childPhotoUrl,
  childPhotoFrame,
}: TemplateCardProps) {
  const theme = getThemeConfig(templateId);
  const hasImage = !!theme.bgImage;
  const textStyle = theme.textShadow ? { textShadow: theme.textShadow } : undefined;

  if (preview) {
    return (
      <div
        className={cn(
          'relative aspect-[3/4] overflow-hidden',
          hasImage ? 'rounded-xl' : theme.borderClass,
          !hasImage && theme.bgGradient,
        )}
      >
        {/* Background image */}
        {hasImage && (
          <Image
            src={theme.bgImage}
            alt={theme.label}
            fill
            className="object-cover"
            sizes="128px"
          />
        )}

        {/* CSS pattern fallback */}
        {!hasImage && theme.patternStyle && (
          <div className="absolute inset-0" style={theme.patternStyle} />
        )}

        <div
          className="relative flex h-full flex-col items-center justify-center px-3 py-4 text-center"
          style={textStyle}
        >
          {!hasImage && (
            <p className="mb-1 text-xs leading-tight">{theme.emoji}</p>
          )}
          <h3
            className={cn(
              'text-sm font-extrabold leading-tight sm:text-base',
              theme.headlineColor,
            )}
          >
            {childName} fyller {childAge} år!
          </h3>
          <p
            className={cn(
              'mt-0.5 text-[10px] italic sm:text-xs',
              theme.subtitleColor,
            )}
          >
            Hipp hipp hurra!
          </p>

          <div className={cn('my-2 w-2/3 border-t', theme.accentBorder)} />

          <p className={cn('text-[10px] sm:text-xs', theme.detailColor)}>
            {partyDate}
          </p>
          <p className={cn('text-[10px] sm:text-xs', theme.detailColor)}>
            {venueName}
          </p>

          {!hasImage && (
            <p className="mt-2 text-xs leading-tight">{theme.emoji}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-md overflow-hidden print:max-w-none print:mx-0 print:h-[100vh] print:rounded-none print:border-0',
        hasImage ? 'rounded-2xl' : theme.borderClass,
        !hasImage && theme.bgGradient,
      )}
    >
      {/* Background image */}
      {hasImage && (
        <Image
          src={theme.bgImage}
          alt={theme.label}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
          priority
        />
      )}

      {/* CSS pattern fallback */}
      {!hasImage && theme.patternStyle && (
        <div className="absolute inset-0" style={theme.patternStyle} />
      )}

      {/* Text content */}
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center',
          hasImage
            ? [
                // Inline: relative with fixed padding — card grows to fit content
                'relative pt-32 pb-28 px-10 sm:pt-36 sm:pb-32 sm:px-14',
                // Print: absolute positioning in the image center zone
                'print:absolute print:inset-x-[8%] print:top-[22%] print:bottom-[16%] print:p-0',
              ]
            : 'relative flex-1 px-6 py-8 sm:px-8 sm:py-10',
        )}
        style={textStyle}
      >
        {/* Top emoji decoration (fallback only) */}
        {!hasImage && (
          <p className="mb-4 text-2xl tracking-widest sm:text-3xl">
            {theme.emoji}
          </p>
        )}

        {/* Headline */}
        <h2 className={cn(theme.headlineClass, theme.headlineColor)}>
          {childName} fyller {childAge} år!
        </h2>
        {/* Subtitle + optional child photo side by side */}
        {childPhotoUrl ? (
          <div className="mt-2 flex items-center justify-center gap-3 print:mt-3 print:gap-4">
            <PhotoFrame
              src={childPhotoUrl}
              alt={`Foto på ${childName}`}
              shape={(childPhotoFrame as PhotoFrameType) || 'circle'}
              size={100}
              className="w-[100px] h-[100px] shrink-0 print:w-36 print:h-36"
            />
            <p className={cn('italic', theme.subtitleClass, theme.subtitleColor)}>
              Hipp hipp hurra!
            </p>
          </div>
        ) : (
          <p className={cn('mt-1', theme.subtitleClass, theme.subtitleColor)}>
            Hipp hipp hurra!
          </p>
        )}

        {/* Separator */}
        <div
          className={cn('my-4 w-3/4 border-t-2 sm:my-5', theme.accentBorder)}
        />

        {/* Party details */}
        <div className={cn('space-y-1 text-base sm:text-lg', theme.detailColor)}>
          <p>📅 {partyDate}</p>
          <p>🕐 {partyTime}</p>
          <p>📍 {venueName}</p>
          {venueAddress && (
            <p className="text-sm opacity-80">{venueAddress}</p>
          )}
        </div>

        {rsvpDeadline && (
          <p className={cn('mt-3 text-sm font-medium', theme.detailColor)}>
            OSA senast {rsvpDeadline}
          </p>
        )}

        {/* Description */}
        {description && (
          <p
            className={cn(
              'mt-3 max-w-xs whitespace-pre-line text-sm italic leading-relaxed',
              theme.detailColor,
            )}
          >
            {description}
          </p>
        )}

        {/* Separator */}
        <div
          className={cn('my-4 w-3/4 border-t-2 sm:my-5', theme.accentBorder)}
        />

        {/* Welcome + QR */}
        <p
          className={cn(
            'mb-3 text-lg font-semibold sm:text-xl',
            theme.subtitleColor,
          )}
        >
          Kan du komma?
        </p>

        <div className={cn('rounded-xl p-2', theme.qrBgClass)}>
          <QRCode token={token} size={80} />
        </div>
        <p className={cn('mt-1.5 text-xs', theme.detailColor)}>
          Scanna och tacka ja eller nej
        </p>

        {/* Bottom emoji decoration (fallback only) */}
        {!hasImage && (
          <p className="mt-4 text-2xl tracking-widest sm:text-3xl">
            {theme.emoji}
          </p>
        )}
      </div>
    </div>
  );
}

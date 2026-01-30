'use client';

import { QRCode } from '@/components/shared/QRCode';
import { cn } from '@/lib/utils';
import { getThemeConfig } from './theme-configs';

interface TemplateCardProps {
  templateId: string;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  token: string;
  preview?: boolean;
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
  token,
  preview = false,
}: TemplateCardProps) {
  const theme = getThemeConfig(templateId);

  if (preview) {
    return (
      <div
        className={cn(
          'relative aspect-[3/4] overflow-hidden',
          theme.bgGradient,
          theme.borderClass,
        )}
      >
        {/* Pattern overlay */}
        {theme.patternStyle && (
          <div className="absolute inset-0" style={theme.patternStyle} />
        )}

        <div className="relative flex h-full flex-col items-center justify-center px-3 py-4 text-center">
          <p className="mb-1 text-xs leading-tight">{theme.emoji}</p>
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

          <p className="mt-2 text-xs leading-tight">{theme.emoji}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-md overflow-hidden print:max-w-none',
        theme.bgGradient,
        theme.borderClass,
      )}
    >
      {/* Pattern overlay */}
      {theme.patternStyle && (
        <div className="absolute inset-0" style={theme.patternStyle} />
      )}

      <div className="relative flex flex-col items-center px-6 py-8 text-center sm:px-8 sm:py-10">
        {/* Top emoji decoration */}
        <p className="mb-4 text-2xl tracking-widest sm:text-3xl">
          {theme.emoji}
        </p>

        {/* Headline */}
        <h2 className={cn(theme.headlineClass, theme.headlineColor)}>
          {childName} fyller {childAge} år!
        </h2>
        <p className={cn('mt-1', theme.subtitleClass, theme.subtitleColor)}>
          Hipp hipp hurra!
        </p>

        {/* Separator */}
        <div
          className={cn('my-5 w-3/4 border-t-2 sm:my-6', theme.accentBorder)}
        />

        {/* Party details */}
        <div className={cn('space-y-1.5 text-base sm:text-lg', theme.detailColor)}>
          <p>📅 {partyDate}</p>
          <p>🕐 {partyTime}</p>
          <p>📍 {venueName}</p>
          {venueAddress && (
            <p className="text-sm opacity-80">{venueAddress}</p>
          )}
        </div>

        {rsvpDeadline && (
          <p className={cn('mt-4 text-sm font-medium', theme.detailColor)}>
            OSA senast {rsvpDeadline}
          </p>
        )}

        {/* Separator */}
        <div
          className={cn('my-5 w-3/4 border-t-2 sm:my-6', theme.accentBorder)}
        />

        {/* Welcome + QR */}
        <p
          className={cn(
            'mb-4 text-lg font-semibold sm:text-xl',
            theme.subtitleColor,
          )}
        >
          Välkomna!
        </p>

        <div className={cn('rounded-xl p-3', theme.qrBgClass)}>
          <QRCode token={token} size={120} />
        </div>
        <p className={cn('mt-2 text-xs', theme.detailColor)}>
          Scanna för att OSA
        </p>

        {/* Bottom emoji decoration */}
        <p className="mt-4 text-2xl tracking-widest sm:text-3xl">
          {theme.emoji}
        </p>
      </div>
    </div>
  );
}

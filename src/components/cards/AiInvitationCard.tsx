'use client';

import Image from 'next/image';
import { QRCode } from '@/components/shared/QRCode';
import { PhotoFrame } from '@/components/shared/PhotoFrame';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

interface AiInvitationCardProps {
  imageUrl: string;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  description?: string | null;
  token: string;
  childPhotoUrl?: string | null;
  childPhotoFrame?: PhotoFrameType;
}

const textShadow = '0 2px 8px rgba(0,0,0,0.7)';

export function AiInvitationCard({
  imageUrl,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  description,
  token,
  childPhotoUrl,
  childPhotoFrame = 'circle',
}: AiInvitationCardProps) {
  const isSvg = imageUrl.endsWith('.svg');

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl print:max-w-none print:mx-0 print:h-[100vh] print:rounded-none print:border-0">
      {/* AI background image — full bleed */}
      <Image
        src={imageUrl}
        alt={`AI-genererad inbjudan till ${childName}s kalas`}
        fill
        className="object-cover"
        sizes="(max-width: 448px) 100vw, 448px"
        priority
        unoptimized={isSvg}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/30" />

      {/* Text content — centered over image */}
      <div
        className="relative flex flex-col items-center justify-center text-center pt-32 pb-28 px-10 sm:pt-36 sm:pb-32 sm:px-14 print:absolute print:inset-x-[8%] print:top-[22%] print:bottom-[16%] print:p-0"
      >
        {/* Headline */}
        <h2
          className="text-2xl font-extrabold text-white sm:text-3xl print:text-4xl"
          style={{ textShadow }}
        >
          {childName} fyller {childAge} år!
        </h2>

        {/* Photo + subtitle */}
        {childPhotoUrl ? (
          <div className="mt-2 flex items-center justify-center gap-3 print:mt-3 print:gap-4">
            <PhotoFrame
              src={childPhotoUrl}
              alt={`Foto på ${childName}`}
              shape={childPhotoFrame}
              size={100}
              className="w-[100px] h-[100px] shrink-0 print:w-36 print:h-36"
            />
            <p
              className="text-lg italic text-white sm:text-xl"
              style={{ textShadow }}
            >
              Hipp hipp hurra!
            </p>
          </div>
        ) : (
          <p
            className="mt-1 text-lg italic text-white sm:text-xl"
            style={{ textShadow }}
          >
            Hipp hipp hurra!
          </p>
        )}

        {/* Separator */}
        <div className="my-4 w-3/4 border-t-2 border-white/40 sm:my-5" />

        {/* Party details */}
        <div className="space-y-1 text-base text-white sm:text-lg" style={{ textShadow }}>
          <p>{partyDate}</p>
          <p>{partyTime}</p>
          <p>{venueName}</p>
          {venueAddress && (
            <p className="text-sm opacity-90">{venueAddress}</p>
          )}
        </div>

        {rsvpDeadline && (
          <p
            className="mt-3 text-sm font-medium text-white"
            style={{ textShadow }}
          >
            OSA senast {rsvpDeadline}
          </p>
        )}

        {description && (
          <p
            className="mt-3 max-w-xs whitespace-pre-line text-sm italic leading-relaxed text-white"
            style={{ textShadow }}
          >
            {description}
          </p>
        )}

        {/* Separator */}
        <div className="my-4 w-3/4 border-t-2 border-white/40 sm:my-5" />

        {/* Welcome + QR */}
        <p
          className="mb-3 text-lg font-semibold text-white sm:text-xl"
          style={{ textShadow }}
        >
          Välkomna!
        </p>

        <div className="rounded-xl bg-white p-2">
          <QRCode token={token} size={80} />
        </div>
        <p
          className="mt-1.5 text-xs text-white"
          style={{ textShadow }}
        >
          Scanna för att OSA
        </p>
      </div>
    </div>
  );
}

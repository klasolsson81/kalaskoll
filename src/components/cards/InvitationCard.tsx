'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { QRCode } from '@/components/shared/QRCode';

interface InvitationCardProps {
  imageUrl: string;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  token: string;
}

export function InvitationCard({
  imageUrl,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  token,
}: InvitationCardProps) {
  return (
    <Card className="overflow-hidden print:shadow-none print:border-none">
      <CardContent className="p-0">
        <div className="relative">
          {/* Invitation image */}
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={imageUrl}
              alt={`Inbjudan till ${childName}s kalas`}
              fill
              className="object-cover"
              unoptimized={imageUrl.endsWith('.svg')}
            />
          </div>

          {/* Party details overlay */}
          <div className="bg-white p-6 print:p-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">
                  {childName} fyller {childAge} år!
                </h3>
                <p className="text-sm text-muted-foreground">
                  {partyDate} kl {partyTime}
                </p>
                <p className="text-sm text-muted-foreground">{venueName}</p>
                {venueAddress && (
                  <p className="text-xs text-muted-foreground">{venueAddress}</p>
                )}
                {rsvpDeadline && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    OSA senast {rsvpDeadline}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Scanna QR-koden för att OSA
                </p>
              </div>
              <div className="shrink-0">
                <QRCode token={token} size={100} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

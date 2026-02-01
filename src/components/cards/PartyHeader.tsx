import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTimeRange } from '@/lib/utils/format';

interface PartyHeaderProps {
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  partyTimeEnd?: string | null;
  venueName: string;
  venueAddress?: string | null;
  description?: string | null;
  rsvpDeadline?: string | null;
}

export function PartyHeader({
  childName,
  childAge,
  partyDate,
  partyTime,
  partyTimeEnd,
  venueName,
  venueAddress,
  description,
  rsvpDeadline,
}: PartyHeaderProps) {
  return (
    <Card className="overflow-hidden border-0 glass-card shadow-warm">
      {/* Festive gradient header */}
      <div className="gradient-celebration p-6 text-center text-white">
        <p className="mb-1 text-sm font-medium opacity-90">Du är inbjuden till</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl font-display">
          {childName} fyller {childAge} år!
        </h1>
      </div>

      <CardContent className="space-y-4 pt-6">
        {/* Date & Time */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
            📅
          </div>
          <div>
            <p className="font-semibold">{formatDate(partyDate)}</p>
            <p className="text-sm text-muted-foreground">kl {formatTimeRange(partyTime, partyTimeEnd)}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-lg">
            📍
          </div>
          <div>
            <p className="font-semibold">{venueName}</p>
            {venueAddress && (
              <p className="text-sm text-muted-foreground">{venueAddress}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground/70 mb-0.5">Info</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        {/* Meta info */}
        {rsvpDeadline && (
          <div>
            <Badge variant="warning">
              OSA senast {formatDate(rsvpDeadline)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

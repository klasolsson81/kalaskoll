import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTimeRange } from '@/lib/utils/format';

interface PartyDetailsCardProps {
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  partyTimeEnd: string | null;
  venueName: string;
  venueAddress: string | null;
  theme: string | null;
  description: string | null;
  rsvpDeadline: string | null;
}

export function PartyDetailsCard({
  childName,
  childAge,
  partyDate,
  partyTime,
  partyTimeEnd,
  venueName,
  venueAddress,
  theme,
  description,
  rsvpDeadline,
}: PartyDetailsCardProps) {
  return (
    <Card className="border-0 glass-card">
      <CardHeader>
        <CardTitle className="font-display">Detaljer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
            👶
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Barn</p>
            <p className="font-medium">
              {childName}, fyller {childAge} år
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-lg">
            📅
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Datum & tid</p>
            <p className="font-medium">
              {formatDate(partyDate)} kl {formatTimeRange(partyTime, partyTimeEnd)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-lg">
            📍
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plats</p>
            <p className="font-medium">{venueName}</p>
            {venueAddress && (
              <p className="text-sm text-muted-foreground">{venueAddress}</p>
            )}
          </div>
        </div>
        {theme && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
              🎨
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tema</p>
              <p className="font-medium capitalize">{theme}</p>
            </div>
          </div>
        )}
        {description && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
              📝
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Beskrivning</p>
              <p className="font-medium">{description}</p>
            </div>
          </div>
        )}
        {rsvpDeadline && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
              ⏰
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sista OSA</p>
              <p className="font-medium">{formatDate(rsvpDeadline)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

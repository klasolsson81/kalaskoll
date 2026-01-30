import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  theme?: string | null;
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
  theme,
  rsvpDeadline,
}: PartyHeaderProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {childName} fyller {childAge} år!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-center">
        <div>
          <p className="text-lg font-medium">{formatDate(partyDate)}</p>
          <p className="text-muted-foreground">kl {formatTimeRange(partyTime, partyTimeEnd)}</p>
        </div>
        <div>
          <p className="font-medium">{venueName}</p>
          {venueAddress && (
            <p className="text-sm text-muted-foreground">{venueAddress}</p>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {rsvpDeadline && (
          <p className="text-sm text-muted-foreground">
            OSA senast {formatDate(rsvpDeadline)}
          </p>
        )}
        {theme && (
          <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium capitalize text-primary">
            Tema: {theme}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

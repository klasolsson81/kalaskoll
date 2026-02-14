import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PartyGuestSummaryProps {
  partyId: string;
  attendingCount: number;
  guestCount: number;
  maxGuests: number | null;
  invitationToken: string | null;
  invitedGuests: Array<{ send_status: string | null }>;
}

export function PartyGuestSummary({
  partyId,
  attendingCount,
  guestCount,
  maxGuests,
  invitationToken,
  invitedGuests,
}: PartyGuestSummaryProps) {
  const sentCount = invitedGuests.filter((g) => g.send_status !== 'failed').length;
  const failedCount = invitedGuests.filter((g) => g.send_status === 'failed').length;

  return (
    <Card className="border-0 glass-card">
      <CardHeader>
        <CardTitle className="font-display">Gäster</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-success/5 p-4 text-center">
            <p className="text-3xl font-bold text-success">{attendingCount}</p>
            <p className="text-sm text-muted-foreground">Kommer</p>
          </div>
          <div className="rounded-xl bg-muted p-4 text-center">
            <p className="text-3xl font-bold">{guestCount}</p>
            <p className="text-sm text-muted-foreground">Svar totalt</p>
          </div>
        </div>
        {invitedGuests.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              {sentCount} {sentCount === 1 ? 'inbjudan skickad' : 'inbjudningar skickade'}
            </p>
            {failedCount > 0 && (
              <p className="text-sm text-destructive">
                {failedCount} misslyckade
              </p>
            )}
          </>
        )}
        {maxGuests && (
          <p className="text-sm text-muted-foreground">
            Max {maxGuests} gäster
          </p>
        )}
        {invitationToken && (
          <div>
            <p className="text-sm text-muted-foreground">QR-kod token</p>
            <code className="rounded-lg bg-muted px-2 py-1 text-sm font-mono">
              {invitationToken}
            </code>
          </div>
        )}
        <Link href={`/kalas/${partyId}/guests`}>
          <Button variant="outline" className="w-full">
            Se gästlista
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

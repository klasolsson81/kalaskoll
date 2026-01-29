import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTimeRange } from '@/lib/utils/format';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: parties } = await supabase
    .from('parties')
    .select('*')
    .order('party_date', { ascending: true });

  // Fetch guest counts for all parties
  const guestCounts: Record<string, { attending: number; total: number }> = {};

  if (parties && parties.length > 0) {
    const partyIds = parties.map((p) => p.id);

    const { data: invitations } = await supabase
      .from('invitations')
      .select('id, party_id')
      .in('party_id', partyIds);

    if (invitations) {
      const invIds = invitations.map((i) => i.id);

      const { data: responses } = await supabase
        .from('rsvp_responses')
        .select('invitation_id, attending')
        .in('invitation_id', invIds);

      if (responses) {
        // Map invitation_id → party_id
        const invToParty: Record<string, string> = {};
        for (const inv of invitations) {
          invToParty[inv.id] = inv.party_id;
        }

        for (const partyId of partyIds) {
          guestCounts[partyId] = { attending: 0, total: 0 };
        }

        for (const r of responses) {
          const partyId = invToParty[r.invitation_id];
          if (partyId && guestCounts[partyId]) {
            guestCounts[partyId].total++;
            if (r.attending) guestCounts[partyId].attending++;
          }
        }
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mina kalas</h1>
        <Link href="/kalas/new">
          <Button>Skapa nytt kalas</Button>
        </Link>
      </div>

      {parties && parties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parties.map((party) => {
            const isUpcoming = new Date(party.party_date) >= new Date();
            const counts = guestCounts[party.id];
            return (
              <Link key={party.id} href={`/kalas/${party.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{party.child_name}s kalas</span>
                      {party.theme && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                          {party.theme}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      {party.child_name} fyller {party.child_age} år
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(party.party_date)} kl {formatTimeRange(party.party_time, party.party_time_end)}
                    </p>
                    <p className="text-sm text-muted-foreground">{party.venue_name}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isUpcoming
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isUpcoming ? 'Kommande' : 'Avslutat'}
                      </span>
                      {counts && counts.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {counts.attending} kommer / {counts.total} svar
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Inga kalas ännu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Du har inte skapat något kalas ännu. Klicka på &quot;Skapa nytt kalas&quot; för att
              komma igång!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

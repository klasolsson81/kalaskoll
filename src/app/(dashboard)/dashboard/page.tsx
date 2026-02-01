import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTimeRange } from '@/lib/utils/format';
import { ChildrenSection } from './ChildrenSection';
import { BetaLimitsDisplay } from '@/components/beta/BetaLimitsDisplay';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try auth metadata first, then fall back to profiles table
  let displayName = user?.user_metadata?.full_name?.split(' ')[0] || '';

  if (!displayName && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    displayName = profile?.full_name?.split(' ')[0] || '';
  }

  if (!displayName) displayName = 'kompis';

  const partiesQuery = supabase.from('parties').select('*').order('party_date', { ascending: true });
  const childrenQuery = supabase.from('children').select('*').order('name', { ascending: true });

  let parties: Awaited<typeof partiesQuery>['data'] = null;
  let children: Awaited<typeof childrenQuery>['data'] = null;

  try {
    const [partiesResult, childrenResult] = await Promise.all([partiesQuery, childrenQuery]);
    parties = partiesResult.data;
    children = childrenResult.data;
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }

  // Fetch guest counts for all parties
  const guestCounts: Record<string, { attending: number; declined: number; total: number }> = {};

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
        // Map invitation_id -> party_id
        const invToParty: Record<string, string> = {};
        for (const inv of invitations) {
          invToParty[inv.id] = inv.party_id;
        }

        for (const partyId of partyIds) {
          guestCounts[partyId] = { attending: 0, declined: 0, total: 0 };
        }

        for (const r of responses) {
          const partyId = invToParty[r.invitation_id];
          if (partyId && guestCounts[partyId]) {
            guestCounts[partyId].total++;
            if (r.attending) {
              guestCounts[partyId].attending++;
            } else {
              guestCounts[partyId].declined++;
            }
          }
        }
      }
    }
  }

  const upcomingParties = (parties ?? []).filter(
    (p) => new Date(p.party_date) >= new Date(),
  );
  const totalAttending = Object.values(guestCounts).reduce((sum, c) => sum + c.attending, 0);
  const totalPending = Object.values(guestCounts).reduce(
    (sum, c) => sum + (c.total - c.attending - c.declined),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-2xl glass-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold sm:text-3xl font-display">
              Hej {displayName}!
            </h1>
            {upcomingParties.length > 0 ? (
              <p className="text-muted-foreground">
                Du har{' '}
                <span className="font-semibold text-foreground">
                  {upcomingParties.length} kommande kalas
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground">Dags att planera nästa kalas?</p>
            )}
          </div>
          <Link href="/kalas/new">
            <Button className="font-semibold gradient-celebration text-white shadow-warm">
              Skapa nytt kalas
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        {(parties ?? []).length > 0 && (
          <div className="relative mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl glass-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{upcomingParties.length}</p>
              <p className="text-xs text-muted-foreground">Kommande kalas</p>
            </div>
            <div className="rounded-xl glass-card p-4 text-center">
              <p className="text-2xl font-bold text-success">{totalAttending}</p>
              <p className="text-xs text-muted-foreground">Svarat ja</p>
            </div>
            <div className="rounded-xl glass-card p-4 text-center">
              <p className="text-2xl font-bold text-warning-foreground">{totalPending}</p>
              <p className="text-xs text-muted-foreground">Väntar svar</p>
            </div>
          </div>
        )}
      </section>

      {/* Beta limits */}
      <BetaLimitsDisplay />

      {/* Children */}
      <ChildrenSection savedChildren={children ?? []} />

      {/* Parties */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold font-display">Mina kalas</h2>
        </div>

        {parties && parties.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parties.map((party) => {
              const isUpcoming = new Date(party.party_date) >= new Date();
              const counts = guestCounts[party.id];
              const pending = counts ? counts.total - counts.attending - counts.declined : 0;
              return (
                <Link key={party.id} href={`/kalas/${party.id}`}>
                  <Card className="h-full border-0 glass-card">
                    {/* Theme accent strip */}
                    <div className="h-1.5 rounded-t-[inherit] gradient-celebration" />
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base">{party.child_name}s kalas</span>
                        <Badge variant={isUpcoming ? 'success' : 'outline'}>
                          {isUpcoming ? 'Kommande' : 'Avslutat'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(party.party_date)} kl{' '}
                        {formatTimeRange(party.party_time, party.party_time_end)}
                      </p>
                      <p className="text-sm text-muted-foreground">{party.venue_name}</p>
                      {party.theme && (
                        <Badge variant="outline" className="capitalize">
                          {party.theme}
                        </Badge>
                      )}
                      {counts && counts.total > 0 && (
                        <div className="flex gap-3 pt-1">
                          <span className="text-xs">
                            <span className="font-bold text-success">{counts.attending}</span>{' '}
                            <span className="text-muted-foreground">kommer</span>
                          </span>
                          {counts.declined > 0 && (
                            <span className="text-xs">
                              <span className="font-bold text-destructive">{counts.declined}</span>{' '}
                              <span className="text-muted-foreground">nej</span>
                            </span>
                          )}
                          {pending > 0 && (
                            <span className="text-xs">
                              <span className="font-bold text-warning-foreground">{pending}</span>{' '}
                              <span className="text-muted-foreground">väntar</span>
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border-0 glass-card">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
                🎉
              </div>
              <h3 className="mb-2 text-lg font-bold font-display">Inga kalas ännu</h3>
              <p className="mb-6 text-muted-foreground">
                Skapa ditt första kalas och börja samla in OSA-svar!
              </p>
              <Link href="/kalas/new">
                <Button className="font-semibold gradient-celebration text-white shadow-warm">
                  Skapa nytt kalas
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

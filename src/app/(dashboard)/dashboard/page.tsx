import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTimeRange } from '@/lib/utils/format';
import { ChildrenSection } from './ChildrenSection';
import { OnboardingCard } from './OnboardingCard';
import { BetaLimitsDisplay } from '@/components/beta/BetaLimitsDisplay';
import { getImpersonationContext } from '@/lib/utils/impersonation';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const ctx = await getImpersonationContext();
  if (!ctx) return null;

  const { effectiveUserId, client: supabase, isImpersonating } = ctx;

  // When impersonating, use the target user's name
  let displayName = '';

  if (isImpersonating) {
    displayName = ctx.impersonatedName?.split(' ')[0] || '';
  } else {
    // Try auth metadata first
    const {
      data: { user },
    } = await supabase.auth.getUser();
    displayName = user?.user_metadata?.full_name?.split(' ')[0] || '';
  }

  if (!displayName) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', effectiveUserId)
      .single();
    displayName = profile?.full_name?.split(' ')[0] || '';
  }

  if (!displayName) displayName = 'kompis';

  const partiesQuery = supabase.from('parties').select('id, child_name, child_age, party_date, party_time, party_time_end, venue_name, theme, max_guests').eq('owner_id', effectiveUserId).order('party_date', { ascending: true });
  const childrenQuery = supabase.from('children').select('id, name, birth_date, photo_url, photo_frame').eq('owner_id', effectiveUserId).order('name', { ascending: true });

  let parties: Awaited<typeof partiesQuery>['data'] = null;
  let children: Awaited<typeof childrenQuery>['data'] = null;

  try {
    const [partiesResult, childrenResult] = await Promise.all([partiesQuery, childrenQuery]);
    parties = partiesResult.data;
    children = childrenResult.data;
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }

  // Fetch guest counts for all parties (single query with join)
  const guestCounts: Record<string, { attending: number; declined: number; total: number }> = {};

  if (parties && parties.length > 0) {
    const partyIds = parties.map((p) => p.id);

    const { data: invitationsWithRsvps } = await supabase
      .from('invitations')
      .select('party_id, rsvp_responses(attending)')
      .in('party_id', partyIds);

    if (invitationsWithRsvps) {
      for (const partyId of partyIds) {
        guestCounts[partyId] = { attending: 0, declined: 0, total: 0 };
      }

      for (const inv of invitationsWithRsvps) {
        const responses = (inv.rsvp_responses ?? []) as { attending: boolean }[];
        for (const r of responses) {
          if (guestCounts[inv.party_id]) {
            guestCounts[inv.party_id].total++;
            if (r.attending) {
              guestCounts[inv.party_id].attending++;
            } else {
              guestCounts[inv.party_id].declined++;
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
          <OnboardingCard />
        )}
      </section>
    </div>
  );
}

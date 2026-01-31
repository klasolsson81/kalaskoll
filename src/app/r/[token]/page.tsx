import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartyHeader } from '@/components/cards/PartyHeader';
import { RsvpForm } from '@/components/forms/RsvpForm';
import type { Database } from '@/types/database';

interface RsvpPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ phone?: string; email?: string }>;
}

// Use service role for public page (no auth)
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function RsvpPage({ params, searchParams }: RsvpPageProps) {
  const { token } = await params;
  const { phone: phoneParam, email: emailParam } = await searchParams;
  const supabase = createServiceClient();

  // Look up invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, party_id')
    .eq('token', token)
    .single();

  if (!invitation) {
    notFound();
  }

  // Get party details
  const { data: party } = await supabase
    .from('parties')
    .select('child_name, child_age, party_date, party_time, party_time_end, venue_name, venue_address, theme, description, rsvp_deadline')
    .eq('id', invitation.party_id)
    .single();

  if (!party) {
    notFound();
  }

  // Fetch all responses for this invitation
  const { data: responses } = await supabase
    .from('rsvp_responses')
    .select('child_name, attending')
    .eq('invitation_id', invitation.id)
    .order('responded_at', { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        {/* Party header */}
        <PartyHeader
          childName={party.child_name}
          childAge={party.child_age}
          partyDate={party.party_date}
          partyTime={party.party_time}
          partyTimeEnd={party.party_time_end}
          venueName={party.venue_name}
          venueAddress={party.venue_address}
          description={party.description}
          theme={party.theme}
          rsvpDeadline={party.rsvp_deadline}
        />

        {/* Guest responses */}
        {responses && responses.length > 0 && (
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">
                Vilka har svarat ({responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {responses.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={r.attending ? 'success' : 'outline'}
                      className="h-5 w-5 justify-center rounded-full p-0 text-[10px]"
                    >
                      {r.attending ? '✓' : '✗'}
                    </Badge>
                    <span className="font-medium">{r.child_name}</span>
                    <span className="text-muted-foreground">
                      – {r.attending ? 'Kommer' : 'Kan inte komma'}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Har du redan svarat? Kolla din e-post för en länk att ändra ditt svar.
              </p>
            </CardContent>
          </Card>
        )}

        {/* RSVP Form */}
        <RsvpForm
          token={token}
          childName={party.child_name}
          defaultValues={
            phoneParam || emailParam
              ? {
                  ...(phoneParam && { parentPhone: phoneParam }),
                  ...(emailParam && { parentEmail: emailParam }),
                }
              : undefined
          }
        />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Drivs av{' '}
          <span className="font-semibold text-primary">KalasKoll</span>
          {' '}– Smarta inbjudningar för barnkalas
        </p>
      </div>
    </div>
  );
}

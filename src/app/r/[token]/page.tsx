import type { Metadata } from 'next';
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

export async function generateMetadata({ params }: RsvpPageProps): Promise<Metadata> {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: invitation } = await supabase
    .from('invitations')
    .select('party_id')
    .eq('token', token)
    .single();

  if (!invitation) {
    return { title: 'Inbjudan', robots: { index: false, follow: false } };
  }

  const { data: party } = await supabase
    .from('parties')
    .select('child_name, child_age')
    .eq('id', invitation.party_id)
    .single();

  if (!party) {
    return { title: 'Inbjudan', robots: { index: false, follow: false } };
  }

  const title = `Du är bjuden på ${party.child_name}s kalas!`;
  const description = `${party.child_name} fyller ${party.child_age} år och vill bjuda in dig! Svara på inbjudan direkt via mobilen.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
    },
  };
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
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display">Inbjudan hittades inte</h1>
          <p className="mt-2 text-muted-foreground">
            QR-koden verkar vara ogiltig eller har gått ut.
            Kontakta den som bjöd in dig.
          </p>
        </div>
      </div>
    );
  }

  // Get party details
  const { data: party } = await supabase
    .from('parties')
    .select('child_name, child_age, party_date, party_time, party_time_end, venue_name, venue_address, theme, description, rsvp_deadline')
    .eq('id', invitation.party_id)
    .single();

  if (!party) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display">Kalas hittades inte</h1>
          <p className="mt-2 text-muted-foreground">
            Något gick fel. Kontakta den som bjöd in dig.
          </p>
        </div>
      </div>
    );
  }

  // Check RSVP deadline
  const deadlinePassed = party.rsvp_deadline
    ? new Date() > new Date(party.rsvp_deadline + 'T23:59:59')
    : false;

  if (deadlinePassed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold font-display">Sista svarsdatum har passerat</h1>
          <p className="mt-2 text-muted-foreground">
            Tyvärr går det inte längre att svara på denna inbjudan.
            Kontakta den som bjöd in dig om du har frågor.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all responses for this invitation
  const { data: responses } = await supabase
    .from('rsvp_responses')
    .select('child_name, attending')
    .eq('invitation_id', invitation.id)
    .order('responded_at', { ascending: true });

  return (
    <div className="min-h-screen bg-app-gradient-rsvp px-4 py-8">
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
          rsvpDeadline={party.rsvp_deadline}
        />

        {/* Guest responses */}
        {responses && responses.length > 0 && (
          <Card className="border-0 glass-card">
            <CardHeader>
              <CardTitle className="text-base font-display">
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
          <span className="font-semibold text-primary font-display">KalasKoll</span>
          {' '}– Smarta inbjudningar för barnkalas
        </p>
      </div>
    </div>
  );
}

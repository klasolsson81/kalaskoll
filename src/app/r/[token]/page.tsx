import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils/format';
import { RsvpForm } from '@/components/forms/RsvpForm';
import type { Database } from '@/types/database';

interface RsvpPageProps {
  params: Promise<{ token: string }>;
}

// Use service role for public page (no auth)
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function RsvpPage({ params }: RsvpPageProps) {
  const { token } = await params;
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
    .select('child_name, child_age, party_date, party_time, venue_name, venue_address, theme, description')
    .eq('id', invitation.party_id)
    .single();

  if (!party) {
    notFound();
  }

  // Check if already responded
  const { data: existingResponse } = await supabase
    .from('rsvp_responses')
    .select('child_name, attending')
    .eq('invitation_id', invitation.id)
    .single();

  return (
    <div className="min-h-screen bg-muted/50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        {/* Party header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {party.child_name} fyller {party.child_age} år!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
            <div>
              <p className="text-lg font-medium">
                {formatDate(party.party_date)}
              </p>
              <p className="text-muted-foreground">kl {formatTime(party.party_time)}</p>
            </div>
            <div>
              <p className="font-medium">{party.venue_name}</p>
              {party.venue_address && (
                <p className="text-sm text-muted-foreground">{party.venue_address}</p>
              )}
            </div>
            {party.description && (
              <p className="text-sm text-muted-foreground">{party.description}</p>
            )}
            {party.theme && (
              <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium capitalize text-primary">
                Tema: {party.theme}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Already responded */}
        {existingResponse ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg font-medium">
                Du har redan svarat!
              </p>
              <p className="mt-1 text-muted-foreground">
                {existingResponse.child_name} -{' '}
                {existingResponse.attending ? 'Kommer' : 'Kan inte komma'}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Vill du ändra ditt svar? Fyll i formuläret igen nedan.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* RSVP Form */}
        <RsvpForm token={token} childName={party.child_name} />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Drivs av KalasFix – Smarta inbjudningar för barnkalas
        </p>
      </div>
    </div>
  );
}

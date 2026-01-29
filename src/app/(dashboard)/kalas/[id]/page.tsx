import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils/format';
import { DeletePartyButton } from './DeletePartyButton';
import { QRCodeSection } from './QRCodeSection';
import { InvitationSection } from './InvitationSection';

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('id', id)
    .single();

  if (!party) {
    notFound();
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, token')
    .eq('party_id', id)
    .single();

  const { count: guestCount } = await supabase
    .from('rsvp_responses')
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation?.id ?? '');

  const { count: attendingCount } = await supabase
    .from('rsvp_responses')
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation?.id ?? '')
    .eq('attending', true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{party.child_name}s kalas</h1>
        <div className="flex gap-2">
          <Link href={`/kalas/${id}/edit`}>
            <Button variant="outline">Redigera</Button>
          </Link>
          <Link href={`/kalas/${id}/guests`}>
            <Button variant="outline">Gästlista</Button>
          </Link>
          <DeletePartyButton partyId={id} />
        </div>
      </div>

      {/* Invitation Card */}
      {invitation?.token && (
        <InvitationSection
          partyId={id}
          imageUrl={party.invitation_image_url}
          childName={party.child_name}
          childAge={party.child_age}
          partyDate={formatDate(party.party_date)}
          partyTime={formatTime(party.party_time)}
          venueName={party.venue_name}
          theme={party.theme}
          token={invitation.token}
        />
      )}

      {/* QR Code */}
      {invitation?.token && <QRCodeSection token={invitation.token} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Barn</p>
              <p className="font-medium">
                {party.child_name}, fyller {party.child_age} år
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Datum & tid</p>
              <p className="font-medium">
                {formatDate(party.party_date)} kl {formatTime(party.party_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plats</p>
              <p className="font-medium">{party.venue_name}</p>
              {party.venue_address && (
                <p className="text-sm text-muted-foreground">{party.venue_address}</p>
              )}
            </div>
            {party.theme && (
              <div>
                <p className="text-sm text-muted-foreground">Tema</p>
                <p className="font-medium capitalize">{party.theme}</p>
              </div>
            )}
            {party.description && (
              <div>
                <p className="text-sm text-muted-foreground">Beskrivning</p>
                <p className="font-medium">{party.description}</p>
              </div>
            )}
            {party.rsvp_deadline && (
              <div>
                <p className="text-sm text-muted-foreground">Sista OSA</p>
                <p className="font-medium">{formatDate(party.rsvp_deadline)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gäster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{attendingCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Kommer</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{guestCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Svar totalt</p>
              </div>
            </div>
            {party.max_guests && (
              <p className="text-sm text-muted-foreground">
                Max {party.max_guests} gäster
              </p>
            )}
            {invitation?.token && (
              <div>
                <p className="text-sm text-muted-foreground">QR-kod token</p>
                <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                  {invitation.token}
                </code>
              </div>
            )}
            <Link href={`/kalas/${id}/guests`}>
              <Button variant="outline" className="w-full">
                Se gästlista
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

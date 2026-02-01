import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PartyHeader } from '@/components/cards/PartyHeader';
import { RsvpForm } from '@/components/forms/RsvpForm';
import type { Database } from '@/types/database';

interface EditPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ token?: string }>;
}

function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function EditRsvpPage({ params, searchParams }: EditPageProps) {
  const { token: invitationToken } = await params;
  const { token: editToken } = await searchParams;

  if (!editToken) {
    notFound();
  }

  const supabase = createServiceClient();

  // Look up RSVP by edit_token
  const { data: rsvp } = await supabase
    .from('rsvp_responses')
    .select('id, invitation_id, child_name, attending, parent_name, parent_phone, parent_email, message')
    .eq('edit_token', editToken)
    .single();

  if (!rsvp) {
    notFound();
  }

  // Verify the invitation token matches (defense-in-depth)
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, party_id, token')
    .eq('id', rsvp.invitation_id)
    .single();

  if (!invitation || invitation.token !== invitationToken) {
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

  // Get allergy data for this RSVP
  const { data: allergyData } = await supabase
    .from('allergy_data')
    .select('allergies, other_dietary')
    .eq('rsvp_id', rsvp.id)
    .single();

  const allergies = Array.isArray(allergyData?.allergies) ? (allergyData.allergies as string[]) : [];

  return (
    <div className="min-h-screen bg-app-gradient-rsvp px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
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

        <RsvpForm
          token={invitationToken}
          childName={party.child_name}
          mode="edit"
          editToken={editToken}
          defaultValues={{
            childName: rsvp.child_name,
            attending: rsvp.attending,
            parentName: rsvp.parent_name,
            parentPhone: rsvp.parent_phone,
            parentEmail: rsvp.parent_email,
            message: rsvp.message,
            allergies,
            otherDietary: allergyData?.other_dietary,
          }}
        />

        <p className="text-center text-xs text-muted-foreground">
          Drivs av <span className="font-display">KalasKoll</span> – Smarta inbjudningar för barnkalas
        </p>
      </div>
    </div>
  );
}

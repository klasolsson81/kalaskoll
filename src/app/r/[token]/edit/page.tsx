import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PartyHeader } from '@/components/cards/PartyHeader';
import { RsvpForm } from '@/components/forms/RsvpForm';
import { decryptAllergyData } from '@/lib/utils/crypto';
import type { Database } from '@/types/database';

export const metadata: Metadata = {
  title: 'Ändra ditt svar',
  description: 'Ändra ditt OSA-svar på barnkalasinbjudan.',
  robots: { index: false, follow: false },
};

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

  // Look up primary RSVP by edit_token
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

  // Get all siblings (same invitation + email)
  const { data: siblings } = await supabase
    .from('rsvp_responses')
    .select('id, child_name, attending')
    .eq('invitation_id', rsvp.invitation_id)
    .eq('parent_email', rsvp.parent_email)
    .order('responded_at', { ascending: true });

  const allChildren = siblings ?? [{ id: rsvp.id, child_name: rsvp.child_name, attending: rsvp.attending }];

  // Get allergy data for all siblings
  const childIds = allChildren.map((c) => c.id);
  const { data: allergyRows } = await supabase
    .from('allergy_data')
    .select('rsvp_id, allergies, other_dietary')
    .in('rsvp_id', childIds);

  const allergyMap = new Map<string, { allergies: string[]; other_dietary: string | null }>();
  for (const row of allergyRows ?? []) {
    allergyMap.set(row.rsvp_id, decryptAllergyData(row.allergies, row.other_dietary));
  }

  const childrenDefaults = allChildren.map((c) => {
    const allergy = allergyMap.get(c.id);
    return {
      id: c.id,
      childName: c.child_name,
      attending: c.attending,
      allergies: allergy?.allergies ?? [],
      otherDietary: allergy?.other_dietary,
    };
  });

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
            children: childrenDefaults,
            parentName: rsvp.parent_name,
            parentPhone: rsvp.parent_phone,
            parentEmail: rsvp.parent_email,
            message: rsvp.message,
          }}
        />

        <p className="text-center text-xs text-muted-foreground">
          Drivs av <span className="font-display">KalasKoll</span> – Smarta inbjudningar för barnkalas
        </p>
      </div>
    </div>
  );
}

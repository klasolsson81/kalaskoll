'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { partySchema } from '@/lib/utils/validation';

export interface PartyActionResult {
  error?: string;
}

function parsePartyForm(formData: FormData) {
  return {
    childName: formData.get('childName') as string,
    childAge: Number(formData.get('childAge')),
    partyDate: formData.get('partyDate') as string,
    partyTime: formData.get('partyTime') as string,
    partyTimeEnd: (formData.get('partyTimeEnd') as string) || undefined,
    venueName: formData.get('venueName') as string,
    venueAddress: (formData.get('venueAddress') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    theme: (formData.get('theme') as string) || undefined,
    rsvpDeadline: (formData.get('rsvpDeadline') as string) || undefined,
    maxGuests: formData.get('maxGuests') ? Number(formData.get('maxGuests')) : undefined,
  };
}

export async function createParty(
  _prev: PartyActionResult,
  formData: FormData,
): Promise<PartyActionResult> {
  const raw = parsePartyForm(formData);

  const parsed = partySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Du måste vara inloggad' };
  }

  const { data: party, error } = await supabase
    .from('parties')
    .insert({
      owner_id: user.id,
      child_name: parsed.data.childName,
      child_age: parsed.data.childAge,
      party_date: parsed.data.partyDate,
      party_time: parsed.data.partyTime,
      party_time_end: parsed.data.partyTimeEnd ?? null,
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress ?? null,
      description: parsed.data.description ?? null,
      theme: parsed.data.theme ?? null,
      rsvp_deadline: parsed.data.rsvpDeadline ?? null,
      max_guests: parsed.data.maxGuests ?? null,
    })
    .select('id')
    .single();

  if (error) {
    return { error: 'Kunde inte skapa kalas. Försök igen.' };
  }

  // Auto-create one invitation with a unique token
  const token = crypto.randomUUID().slice(0, 8);
  await supabase.from('invitations').insert({
    party_id: party.id,
    token,
  });

  redirect(`/kalas/${party.id}`);
}

export async function updateParty(
  partyId: string,
  _prev: PartyActionResult,
  formData: FormData,
): Promise<PartyActionResult> {
  const raw = parsePartyForm(formData);

  const parsed = partySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('parties')
    .update({
      child_name: parsed.data.childName,
      child_age: parsed.data.childAge,
      party_date: parsed.data.partyDate,
      party_time: parsed.data.partyTime,
      party_time_end: parsed.data.partyTimeEnd ?? null,
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress ?? null,
      description: parsed.data.description ?? null,
      theme: parsed.data.theme ?? null,
      rsvp_deadline: parsed.data.rsvpDeadline ?? null,
      max_guests: parsed.data.maxGuests ?? null,
    })
    .eq('id', partyId);

  if (error) {
    return { error: 'Kunde inte uppdatera kalas. Försök igen.' };
  }

  revalidatePath(`/kalas/${partyId}`);
  redirect(`/kalas/${partyId}`);
}

export async function deleteParty(partyId: string): Promise<void> {
  const supabase = await createClient();

  await supabase.from('parties').delete().eq('id', partyId);

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

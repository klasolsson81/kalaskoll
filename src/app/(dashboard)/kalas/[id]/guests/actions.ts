'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { manualGuestSchema } from '@/lib/utils/validation';

export interface GuestActionResult {
  error?: string;
  success?: boolean;
}

export async function createGuest(
  partyId: string,
  _prev: GuestActionResult,
  formData: FormData,
): Promise<GuestActionResult> {
  const raw = {
    childName: formData.get('childName') as string,
    attending: formData.get('attending') as string,
    parentName: formData.get('parentName') as string,
    parentPhone: formData.get('parentPhone') as string,
    parentEmail: formData.get('parentEmail') as string,
    message: formData.get('message') as string,
  };

  const parsed = manualGuestSchema.safeParse(raw);
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

  // Verify ownership and get invitation_id
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, party_id')
    .eq('party_id', partyId)
    .single();

  if (!invitation) {
    return { error: 'Kalaset hittades inte' };
  }

  // Verify party ownership via RLS (if we got invitation, we own the party)
  const { data: party } = await supabase
    .from('parties')
    .select('id')
    .eq('id', partyId)
    .single();

  if (!party) {
    return { error: 'Du har inte behörighet till detta kalas' };
  }

  const editToken = crypto.randomBytes(32).toString('hex');
  const email = parsed.data.parentEmail || `manual-${crypto.randomUUID()}@kalaskoll.local`;

  const { error } = await supabase.from('rsvp_responses').insert({
    invitation_id: invitation.id,
    child_name: parsed.data.childName,
    attending: parsed.data.attending === 'yes',
    parent_name: parsed.data.parentName || null,
    parent_phone: parsed.data.parentPhone || null,
    parent_email: email,
    message: parsed.data.message || null,
    edit_token: editToken,
  });

  if (error) {
    return { error: 'Kunde inte lägga till gäst. Försök igen.' };
  }

  revalidatePath(`/kalas/${partyId}/guests`);
  return { success: true };
}

export async function updateGuest(
  partyId: string,
  rsvpId: string,
  _prev: GuestActionResult,
  formData: FormData,
): Promise<GuestActionResult> {
  const raw = {
    childName: formData.get('childName') as string,
    attending: formData.get('attending') as string,
    parentName: formData.get('parentName') as string,
    parentPhone: formData.get('parentPhone') as string,
    parentEmail: formData.get('parentEmail') as string,
    message: formData.get('message') as string,
  };

  const parsed = manualGuestSchema.safeParse(raw);
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

  // Verify party ownership
  const { data: party } = await supabase
    .from('parties')
    .select('id')
    .eq('id', partyId)
    .single();

  if (!party) {
    return { error: 'Du har inte behörighet till detta kalas' };
  }

  const updateData: Record<string, unknown> = {
    child_name: parsed.data.childName,
    attending: parsed.data.attending === 'yes',
    parent_name: parsed.data.parentName || null,
    parent_phone: parsed.data.parentPhone || null,
    message: parsed.data.message || null,
  };

  // Only update email if provided (don't overwrite real emails with generated ones)
  if (parsed.data.parentEmail) {
    updateData.parent_email = parsed.data.parentEmail;
  }

  const { error } = await supabase
    .from('rsvp_responses')
    .update(updateData)
    .eq('id', rsvpId);

  if (error) {
    return { error: 'Kunde inte uppdatera gäst. Försök igen.' };
  }

  revalidatePath(`/kalas/${partyId}/guests`);
  return { success: true };
}

export async function deleteGuest(partyId: string, rsvpId: string): Promise<void> {
  const supabase = await createClient();

  // Verify party ownership
  const { data: party } = await supabase
    .from('parties')
    .select('id')
    .eq('id', partyId)
    .single();

  if (!party) return;

  await supabase.from('rsvp_responses').delete().eq('id', rsvpId);
  revalidatePath(`/kalas/${partyId}/guests`);
}

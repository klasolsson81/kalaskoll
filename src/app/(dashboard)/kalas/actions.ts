'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { partySchema } from '@/lib/utils/validation';
import { logAudit } from '@/lib/utils/audit';
import { TEMPLATE_IDS } from '@/components/templates/theme-configs';

export interface PartyActionResult {
  error?: string;
}

function parsePartyForm(formData: FormData) {
  // Normalize \r\n → \n so line breaks don't inflate the character count
  // (browsers count \n as 1 char for maxLength but submit \r\n in FormData)
  const rawDesc = (formData.get('description') as string) || undefined;
  const description = rawDesc?.replace(/\r\n/g, '\n') || undefined;

  return {
    childName: formData.get('childName') as string,
    childAge: Number(formData.get('childAge')),
    childId: (formData.get('childId') as string) || '',
    partyDate: formData.get('partyDate') as string,
    partyTime: formData.get('partyTime') as string,
    partyTimeEnd: (formData.get('partyTimeEnd') as string) || undefined,
    venueName: formData.get('venueName') as string,
    venueAddress: (formData.get('venueAddress') as string) || undefined,
    description,
    theme: (formData.get('theme') as string) || undefined,
    rsvpDeadline: (formData.get('rsvpDeadline') as string) || undefined,
    maxGuests: formData.get('maxGuests') ? Number(formData.get('maxGuests')) : undefined,
    // Use getAll() — hidden input "off" is always first; checkbox "on" is second when checked
    notifyOnRsvp: formData.getAll('notifyOnRsvp').includes('on'),
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
      child_id: parsed.data.childId || null,
      party_date: parsed.data.partyDate,
      party_time: parsed.data.partyTime,
      party_time_end: parsed.data.partyTimeEnd ?? null,
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress ?? null,
      description: parsed.data.description ?? null,
      theme: parsed.data.theme ?? null,
      rsvp_deadline: parsed.data.rsvpDeadline ?? null,
      max_guests: parsed.data.maxGuests ?? null,
      notify_on_rsvp: parsed.data.notifyOnRsvp ?? true,
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

  // Auto-select matching template when theme matches a template ID
  const theme = parsed.data.theme;
  const postInsertUpdate: Record<string, string> = {};

  if (theme && TEMPLATE_IDS.includes(theme)) {
    postInsertUpdate.invitation_template = theme;
  } else if (!postInsertUpdate.invitation_template) {
    postInsertUpdate.invitation_template = 'default';
  }

  // Auto-copy child photo to party when a saved child is selected
  const childId = parsed.data.childId;
  if (childId) {
    const { data: childData } = await supabase
      .from('children')
      .select('photo_url, photo_frame')
      .eq('id', childId)
      .single();

    if (childData?.photo_url) {
      postInsertUpdate.child_photo_url = childData.photo_url;
      postInsertUpdate.child_photo_frame = childData.photo_frame || 'circle';
    }
  }

  if (Object.keys(postInsertUpdate).length > 0) {
    await supabase
      .from('parties')
      .update(postInsertUpdate)
      .eq('id', party.id);
  }

  logAudit(supabase, {
    userId: user.id,
    action: 'party.create',
    resourceType: 'party',
    resourceId: party.id,
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
      child_id: parsed.data.childId || null,
      party_date: parsed.data.partyDate,
      party_time: parsed.data.partyTime,
      party_time_end: parsed.data.partyTimeEnd ?? null,
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress ?? null,
      description: parsed.data.description ?? null,
      theme: parsed.data.theme ?? null,
      rsvp_deadline: parsed.data.rsvpDeadline ?? null,
      max_guests: parsed.data.maxGuests ?? null,
      notify_on_rsvp: parsed.data.notifyOnRsvp ?? true,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from('parties')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', partyId);

  logAudit(supabase, {
    userId: user?.id,
    action: 'party.soft_delete',
    resourceType: 'party',
    resourceId: partyId,
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

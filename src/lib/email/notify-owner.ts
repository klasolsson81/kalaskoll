import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { sendRsvpNotification } from '@/lib/email/resend';
import { APP_URL } from '@/lib/constants';

/**
 * Notify the party owner when a guest submits or edits an RSVP response.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function notifyPartyOwner(
  supabase: SupabaseClient<Database>,
  partyId: string,
  childNames: string[],
  attending: boolean,
  message: string | null,
  isEdit: boolean,
): Promise<void> {
  try {
    // Get party with owner info and notification preference
    const { data: party } = await supabase
      .from('parties')
      .select('owner_id, child_name, notify_on_rsvp')
      .eq('id', partyId)
      .single();

    if (!party || party.notify_on_rsvp === false) return;

    // Get owner email via auth admin
    const { data: userData } = await supabase.auth.admin.getUserById(party.owner_id);
    if (!userData?.user?.email) return;

    // Get owner name from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', party.owner_id)
      .single();

    const ownerName = profile?.full_name?.split(' ')[0] ?? '';

    // Count RSVP stats for this party
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id')
      .eq('party_id', partyId);

    const invitationIds = (invitations ?? []).map((inv) => inv.id);

    let stats = { attending: 0, declined: 0, pending: 0 };

    if (invitationIds.length > 0) {
      const { data: responses } = await supabase
        .from('rsvp_responses')
        .select('attending')
        .in('invitation_id', invitationIds);

      const attendingCount = (responses ?? []).filter((r) => r.attending).length;
      const declinedCount = (responses ?? []).filter((r) => !r.attending).length;

      // Pending = invited_guests who haven't responded
      const { count: invitedCount } = await supabase
        .from('invited_guests')
        .select('id', { count: 'exact', head: true })
        .eq('party_id', partyId);

      const totalResponses = attendingCount + declinedCount;
      const pending = Math.max(0, (invitedCount ?? 0) - totalResponses);

      stats = { attending: attendingCount, declined: declinedCount, pending };
    }

    const guestListUrl = `${APP_URL}/kalas/${partyId}/guests`;

    await sendRsvpNotification({
      to: userData.user.email,
      ownerName,
      childNames,
      attending,
      partyChildName: party.child_name,
      message,
      guestListUrl,
      isEdit,
      stats,
    });
  } catch (err) {
    console.error('[NotifyOwner] Failed to notify party owner:', err);
  }
}

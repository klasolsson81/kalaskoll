import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { adminUpdateUserSchema } from '@/lib/utils/validation';
import { logAudit } from '@/lib/utils/audit';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    // Fetch auth users + profiles + counts
    const [usersListRes, profilesRes, partiesRes, feedbackRes] = await Promise.all([
      adminClient.auth.admin.listUsers({ perPage: 1000 }),
      adminClient.from('profiles').select('id, full_name, role, beta_expires_at, beta_ai_images_used, beta_sms_used'),
      adminClient.from('parties').select('id, owner_id').is('deleted_at', null),
      adminClient.from('feedback').select('id, user_id'),
    ]);

    const authUsers = usersListRes.data?.users ?? [];
    const profiles = profilesRes.data ?? [];
    const parties = partiesRes.data ?? [];
    const feedback = feedbackRes.data ?? [];

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    const users = authUsers.map((u) => {
      const profile = profileMap.get(u.id);
      const partyCount = parties.filter((p) => p.owner_id === u.id).length;
      const feedbackCount = feedback.filter((f) => f.user_id === u.id).length;

      return {
        id: u.id,
        email: u.email,
        fullName: profile?.full_name ?? null,
        role: profile?.role ?? 'user',
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        emailConfirmedAt: u.email_confirmed_at ?? null,
        betaExpiresAt: profile?.beta_expires_at ?? null,
        betaAiImagesUsed: profile?.beta_ai_images_used ?? 0,
        betaSmsUsed: profile?.beta_sms_used ?? 0,
        partyCount,
        feedbackCount,
      };
    });

    // Sort by created_at desc
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { user: adminUser, adminClient } = guard;

    const body = await request.json();
    const result = adminUpdateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { userId, role, action } = result.data;

    if (action === 'delete') {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      await logAudit(adminClient, {
        userId: adminUser.id,
        action: 'admin.user.delete',
        resourceType: 'user',
        resourceId: userId,
        metadata: { deletedBy: adminUser.email },
      });

      return NextResponse.json({ success: true, message: 'User deleted' });
    }

    if (action === 'update' && role) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (updateError) throw updateError;

      await logAudit(adminClient, {
        userId: adminUser.id,
        action: 'admin.user.role_change',
        resourceType: 'user',
        resourceId: userId,
        metadata: { newRole: role, changedBy: adminUser.email },
      });

      return NextResponse.json({ success: true, message: 'User updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

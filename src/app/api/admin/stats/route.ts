import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    // Fetch counts in parallel
    const [
      profilesRes,
      partiesRes,
      rsvpRes,
      feedbackRes,
      waitlistRes,
      usersListRes,
    ] = await Promise.all([
      adminClient.from('profiles').select('id, role, beta_ai_images_used, beta_sms_used'),
      adminClient.from('parties').select('id', { count: 'exact', head: true }),
      adminClient.from('rsvp_responses').select('id', { count: 'exact', head: true }),
      adminClient.from('feedback').select('id, status'),
      adminClient.from('waitlist').select('id', { count: 'exact', head: true }),
      adminClient.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const profiles = profilesRes.data ?? [];
    const authUsers = usersListRes.data?.users ?? [];

    const totalUsers = profiles.length;
    const testers = profiles.filter((p) => p.role === 'tester').length;
    const admins = profiles.filter((p) => p.role === 'admin').length;
    const regularUsers = profiles.filter((p) => p.role === 'user').length;

    const verifiedUsers = authUsers.filter((u) => u.email_confirmed_at).length;
    const unverifiedUsers = authUsers.length - verifiedUsers;

    // Active = logged in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const activeUsers = authUsers.filter(
      (u) => u.last_sign_in_at && u.last_sign_in_at > thirtyDaysAgo,
    ).length;

    const totalParties = partiesRes.count ?? 0;
    const totalRsvp = rsvpRes.count ?? 0;
    const totalWaitlist = waitlistRes.count ?? 0;

    const feedbackItems = feedbackRes.data ?? [];
    const feedbackByStatus = {
      new: feedbackItems.filter((f) => f.status === 'new').length,
      read: feedbackItems.filter((f) => f.status === 'read').length,
      resolved: feedbackItems.filter((f) => f.status === 'resolved').length,
      wontfix: feedbackItems.filter((f) => f.status === 'wontfix').length,
    };
    const totalFeedback = feedbackItems.length;

    const totalAiImages = profiles.reduce((sum, p) => sum + (p.beta_ai_images_used || 0), 0);
    const totalSms = profiles.reduce((sum, p) => sum + (p.beta_sms_used || 0), 0);

    return NextResponse.json({
      users: {
        total: totalUsers,
        testers,
        admins,
        regular: regularUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        active: activeUsers,
      },
      parties: totalParties,
      rsvpResponses: totalRsvp,
      feedback: {
        total: totalFeedback,
        byStatus: feedbackByStatus,
      },
      waitlist: totalWaitlist,
      aiImagesUsed: totalAiImages,
      smsUsed: totalSms,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { logAudit } from '@/lib/utils/audit';
import { sendTesterInvite } from '@/lib/email/resend';
import { APP_URL } from '@/lib/constants';
import { BETA_END_DATE } from '@/lib/beta-config';

const inviteSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { user: adminUser, adminClient } = guard;

    const body = await request.json();
    const result = inviteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, name } = result.data;

    // Single generateLink call — creates the user AND produces the invite OTP.
    // Previously we called generateLink(invite) + updateUserById(email_confirm)
    // + generateLink(magiclink), but the second generateLink was invalidating the
    // token before the user could click the email link.
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: 'invite',
        email,
      });

    if (linkError || !linkData) {
      console.error('[Admin invite] generateLink failed:', linkError?.message);
      return NextResponse.json(
        { error: linkError?.message || 'Kunde inte skapa inbjudningslänk' },
        { status: 500 },
      );
    }

    // Upsert profile with tester role — all testers expire on BETA_END_DATE
    const { error: profileError } = await adminClient.from('profiles').upsert(
      {
        id: linkData.user.id,
        role: 'tester',
        full_name: name || null,
        beta_expires_at: new Date(`${BETA_END_DATE}T23:59:59`).toISOString(),
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      console.error('[Admin invite] profile upsert failed:', profileError.message);
    }

    // Use the invite token directly — verifyOtp(type:'invite') will confirm
    // the email AND create a session in one step.
    const emailOtp = linkData.properties.email_otp;
    const inviteUrl = `${APP_URL}/auth/callback?email=${encodeURIComponent(email)}&token=${encodeURIComponent(emailOtp)}&type=invite&next=/set-password`;

    // Send custom invite email
    const emailResult = await sendTesterInvite({
      to: email,
      name,
      inviteUrl,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Användare skapad men e-post misslyckades: ${emailResult.error}` },
        { status: 500 },
      );
    }

    // Audit log
    await logAudit(adminClient, {
      userId: adminUser.id,
      action: 'admin.user.invite',
      resourceType: 'user',
      resourceId: linkData.user.id,
      metadata: { email, name: name || null, invitedBy: adminUser.email },
    });

    return NextResponse.json({ success: true, message: `Inbjudan skickad till ${email}` });
  } catch (error) {
    console.error('Admin invite error:', error);
    return NextResponse.json({ error: 'Kunde inte bjuda in testare' }, { status: 500 });
  }
}

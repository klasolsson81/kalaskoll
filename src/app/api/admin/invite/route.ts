import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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

/** HMAC-sign the invite parameters so the callback can trust them. */
function signInvite(email: string, uid: string, expires: number): string {
  const data = `${email}:${uid}:${expires}`;
  const secret = process.env.INVITE_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

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

    // Create the user via admin API (confirmed email, no tokens generated)
    const { data: userData, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
      });

    if (createError) {
      // If user already exists, try to fetch them
      if (createError.message?.includes('already been registered')) {
        const { data: listData } = await adminClient.auth.admin.listUsers();
        const existing = listData?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase(),
        );
        if (!existing) {
          return NextResponse.json(
            { error: 'Användaren finns redan men kunde inte hittas' },
            { status: 400 },
          );
        }
        // Continue with existing user ID below
        Object.assign(userData ?? {}, { user: existing });
      } else {
        console.error('[Admin invite] createUser failed:', createError.message);
        return NextResponse.json(
          { error: createError.message || 'Kunde inte skapa användare' },
          { status: 500 },
        );
      }
    }

    const userId = userData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Kunde inte hämta användar-ID' }, { status: 500 });
    }

    // Upsert profile with tester role
    const { error: profileError } = await adminClient.from('profiles').upsert(
      {
        id: userId,
        role: 'tester',
        full_name: name || null,
        beta_expires_at: new Date(`${BETA_END_DATE}T23:59:59`).toISOString(),
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      console.error('[Admin invite] profile upsert failed:', profileError.message);
    }

    // Build HMAC-signed invite URL. The callback will verify the signature,
    // then generate + verify a magic link in the same request (no pre-generated
    // tokens that can expire or be invalidated).
    const expires = Math.floor(Date.now() / 1000) + 86400; // 24 hours
    const sig = signInvite(email, userId, expires);

    const inviteUrl =
      `${APP_URL}/auth/callback` +
      `?invite_email=${encodeURIComponent(email)}` +
      `&invite_uid=${encodeURIComponent(userId)}` +
      `&expires=${expires}` +
      `&sig=${sig}` +
      `&next=/set-password`;

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
      resourceId: userId,
      metadata: { email, name: name || null, invitedBy: adminUser.email },
    });

    return NextResponse.json({ success: true, message: `Inbjudan skickad till ${email}` });
  } catch (error) {
    console.error('Admin invite error:', error);
    return NextResponse.json({ error: 'Kunde inte bjuda in testare' }, { status: 500 });
  }
}

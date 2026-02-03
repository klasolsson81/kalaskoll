import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { adminUpdateFeedbackSchema } from '@/lib/utils/validation';
import { sendFeedbackResolved } from '@/lib/email/resend';
import { z } from 'zod';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    // Fetch feedback + profiles separately (service role can't do FK joins to auth)
    const { data: feedbackData, error } = await adminClient
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user names from profiles
    const userIds = [...new Set((feedbackData ?? []).map((f) => f.user_id).filter(Boolean))] as string[];
    let profileMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? '']));
    }

    const feedback = (feedbackData ?? []).map((f) => ({
      ...f,
      user_name: f.user_id ? profileMap.get(f.user_id) ?? null : null,
    }));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Admin feedback error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    const body = await request.json();
    const result = adminUpdateFeedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { feedbackId, status, adminNotes } = result.data;

    const updateData: Record<string, string> = {};
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { error } = await adminClient
      .from('feedback')
      .update(updateData)
      .eq('id', feedbackId);

    if (error) {
      console.error('Supabase feedback update error:', error);
      return NextResponse.json(
        { error: `DB: ${error.message} (${error.code})` },
        { status: 500 },
      );
    }

    // Send notification email when feedback is marked as resolved
    if (status === 'resolved') {
      const { data: fb } = await adminClient
        .from('feedback')
        .select('user_email, message')
        .eq('id', feedbackId)
        .single();

      if (fb?.user_email) {
        // Fire-and-forget — don't block the response
        sendFeedbackResolved({
          to: fb.user_email,
          feedbackMessage: fb.message,
        }).catch((err) => {
          console.error('Failed to send feedback resolved email:', err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin feedback update error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const parsed = z.string().uuid().safeParse(id);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid feedback ID' }, { status: 400 });
    }

    const { error } = await adminClient
      .from('feedback')
      .delete()
      .eq('id', parsed.data);

    if (error) {
      console.error('Supabase feedback delete error:', error);
      return NextResponse.json(
        { error: `DB: ${error.message} (${error.code})` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin feedback delete error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}

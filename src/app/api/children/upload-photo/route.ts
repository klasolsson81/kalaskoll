import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadChildPhotoSchema } from '@/lib/utils/validation';
import { uploadPhotoToStorage, deletePhotoFromStorage } from '@/lib/utils/storage';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltigt format' }, { status: 400 });
  }

  const parsed = uploadChildPhotoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ogiltig data' },
      { status: 400 },
    );
  }

  const { childId, photoData, frame } = parsed.data;

  // Verify child ownership (RLS handles this, but check explicitly)
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .single();

  if (childError || !child) {
    return NextResponse.json({ error: 'Barn hittades inte' }, { status: 404 });
  }

  let photoUrl: string | null = null;

  if (photoData) {
    const storageUrl = await uploadPhotoToStorage(supabase, user.id, `child-${childId}`, photoData);
    photoUrl = storageUrl ?? photoData;
  } else {
    await deletePhotoFromStorage(supabase, user.id, `child-${childId}`);
  }

  // Update photo and frame
  const { error: updateError } = await supabase
    .from('children')
    .update({
      photo_url: photoUrl,
      photo_frame: frame,
    })
    .eq('id', childId);

  if (updateError) {
    return NextResponse.json({ error: 'Kunde inte spara foto' }, { status: 500 });
  }

  return NextResponse.json({ success: true, frame });
}

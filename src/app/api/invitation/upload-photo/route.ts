import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadPhotoSchema } from '@/lib/utils/validation';

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

  const parsed = uploadPhotoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ogiltig data' },
      { status: 400 },
    );
  }

  const { partyId, photoData, frame } = parsed.data;

  // Verify party ownership (RLS handles this, but check explicitly)
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('id')
    .eq('id', partyId)
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
  }

  // Update photo and frame
  const { error: updateError } = await supabase
    .from('parties')
    .update({
      child_photo_url: photoData,
      child_photo_frame: frame,
    })
    .eq('id', partyId);

  if (updateError) {
    return NextResponse.json({ error: 'Kunde inte spara foto' }, { status: 500 });
  }

  return NextResponse.json({ success: true, frame });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { selectImageSchema } from '@/lib/utils/validation';

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

  const parsed = selectImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ogiltiga parametrar' },
      { status: 400 },
    );
  }

  const { partyId, imageId } = parsed.data;

  // Verify party ownership
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('id, owner_id')
    .eq('id', partyId)
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
  }

  if (party.owner_id !== user.id) {
    return NextResponse.json({ error: 'Åtkomst nekad' }, { status: 403 });
  }

  // Verify image belongs to this party
  const { data: image, error: imageError } = await supabase
    .from('party_images')
    .select('id, image_url')
    .eq('id', imageId)
    .eq('party_id', partyId)
    .single();

  if (imageError || !image) {
    return NextResponse.json({ error: 'Bild hittades inte' }, { status: 404 });
  }

  // Deselect all images for this party
  await supabase
    .from('party_images')
    .update({ is_selected: false })
    .eq('party_id', partyId);

  // Select the chosen image
  await supabase
    .from('party_images')
    .update({ is_selected: true })
    .eq('id', imageId);

  // Update party's invitation_image_url
  await supabase
    .from('parties')
    .update({ invitation_image_url: image.image_url, invitation_template: null })
    .eq('id', partyId);

  return NextResponse.json({ imageUrl: image.image_url });
}

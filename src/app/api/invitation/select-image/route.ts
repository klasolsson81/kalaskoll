import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const { partyId, imageId } = body;

  if (!partyId || typeof partyId !== 'string') {
    return NextResponse.json({ error: 'partyId krävs' }, { status: 400 });
  }

  if (!imageId || typeof imageId !== 'string') {
    return NextResponse.json({ error: 'imageId krävs' }, { status: 400 });
  }

  // Verify party ownership
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('id')
    .eq('id', partyId)
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
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
    .update({ invitation_image_url: image.image_url })
    .eq('id', partyId);

  return NextResponse.json({ imageUrl: image.image_url });
}

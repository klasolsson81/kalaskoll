import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInvitationImage } from '@/lib/ai/ideogram';
import { generateInvitationImageFallback } from '@/lib/ai/openai';
import { ADMIN_EMAILS, AI_MAX_IMAGES_PER_PARTY } from '@/lib/constants';
import type { PartyDetails } from '@/types';

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

  const { partyId, theme } = body;

  if (!partyId || typeof partyId !== 'string') {
    return NextResponse.json({ error: 'partyId krävs' }, { status: 400 });
  }

  // Fetch party details
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('*')
    .eq('id', partyId)
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');

  // Check image limit (skip for admins)
  const { count: imageCount } = await supabase
    .from('party_images')
    .select('*', { count: 'exact', head: true })
    .eq('party_id', partyId);

  const currentCount = imageCount ?? 0;

  if (!isAdmin && currentCount >= AI_MAX_IMAGES_PER_PARTY) {
    return NextResponse.json(
      { error: `Max ${AI_MAX_IMAGES_PER_PARTY} bilder per kalas` },
      { status: 429 },
    );
  }

  const partyDetails: PartyDetails = {
    id: party.id,
    childName: party.child_name,
    childAge: party.child_age,
    partyDate: party.party_date,
    partyTime: party.party_time,
    venueName: party.venue_name,
    venueAddress: party.venue_address ?? undefined,
    description: party.description ?? undefined,
    theme: (theme || party.theme) ?? undefined,
  };

  // Superadmins bypass mock mode and can always generate real AI images
  const aiOptions = isAdmin ? { forceLive: true } : undefined;

  let imageUrl: string;

  try {
    imageUrl = await generateInvitationImage(theme || party.theme || 'default', partyDetails, aiOptions);
  } catch {
    // Fallback to OpenAI
    try {
      imageUrl = await generateInvitationImageFallback(
        theme || party.theme || 'default',
        partyDetails,
        aiOptions,
      );
    } catch {
      return NextResponse.json(
        { error: 'Kunde inte generera bild' },
        { status: 500 },
      );
    }
  }

  // Insert into party_images
  const isFirstImage = currentCount === 0;
  const { data: newImage, error: insertError } = await supabase
    .from('party_images')
    .insert({
      party_id: partyId,
      image_url: imageUrl,
      is_selected: isFirstImage,
    })
    .select('id')
    .single();

  if (insertError || !newImage) {
    return NextResponse.json(
      { error: 'Kunde inte spara bild' },
      { status: 500 },
    );
  }

  // If first image, also set it on the party
  if (isFirstImage) {
    await supabase
      .from('parties')
      .update({ invitation_image_url: imageUrl })
      .eq('id', partyId);
  }

  return NextResponse.json({
    imageUrl,
    imageId: newImage.id,
    imageCount: currentCount + 1,
    maxImages: AI_MAX_IMAGES_PER_PARTY,
  });
}

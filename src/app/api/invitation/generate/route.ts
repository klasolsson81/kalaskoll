import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWithFal } from '@/lib/ai/fal';
import { generateInvitationImageFallback } from '@/lib/ai/openai';
import { ADMIN_EMAILS, AI_MAX_IMAGES_PER_PARTY } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { generateImageSchema } from '@/lib/utils/validation';

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

  const parsed = generateImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ogiltiga parametrar' },
      { status: 400 },
    );
  }

  const { partyId, theme: requestTheme, style } = parsed.data;

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
  const { count: imageCount, error: countError } = await supabase
    .from('party_images')
    .select('*', { count: 'exact', head: true })
    .eq('party_id', partyId);

  const tableExists = !countError;
  const currentCount = imageCount ?? 0;

  if (!isAdmin && currentCount >= AI_MAX_IMAGES_PER_PARTY) {
    return NextResponse.json(
      { error: `Max ${AI_MAX_IMAGES_PER_PARTY} bilder per kalas` },
      { status: 429 },
    );
  }

  const resolvedTheme = requestTheme || party.theme || 'default';
  const resolvedStyle: AiStyle = style;
  const forceLive = isAdmin;

  // Generate: fal.ai -> OpenAI -> error
  let imageUrl: string | null = null;

  try {
    imageUrl = await generateWithFal({
      theme: resolvedTheme,
      style: resolvedStyle,
      forceLive,
    });
  } catch (falError) {
    console.error('[AI] fal.ai failed:', falError);
    try {
      imageUrl = await generateInvitationImageFallback(
        resolvedTheme,
        resolvedStyle,
        { forceLive },
      );
    } catch (openaiError) {
      console.error('[AI] OpenAI fallback failed:', openaiError);
    }
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Kunde inte generera bild' },
      { status: 500 },
    );
  }

  // Try to insert into party_images (if table exists)
  if (tableExists) {
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
      await supabase
        .from('parties')
        .update({ invitation_image_url: imageUrl })
        .eq('id', partyId);

      return NextResponse.json({ imageUrl, imageId: null, imageCount: 0, maxImages: AI_MAX_IMAGES_PER_PARTY });
    }

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

  // Fallback: party_images table doesn't exist yet
  await supabase
    .from('parties')
    .update({ invitation_image_url: imageUrl })
    .eq('id', partyId);

  return NextResponse.json({ imageUrl, imageId: null, imageCount: 0, maxImages: AI_MAX_IMAGES_PER_PARTY });
}

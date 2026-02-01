import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateWithReplicate } from '@/lib/ai/replicate';
import { generateInvitationImageFallback } from '@/lib/ai/openai';
import { ADMIN_EMAILS, AI_MAX_IMAGES_PER_PARTY } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { generateImageSchema } from '@/lib/utils/validation';
import { isAiRateLimited } from '@/lib/utils/rate-limit';
import { BETA_CONFIG } from '@/lib/beta-config';

/**
 * Download a temporary AI image and upload to Supabase Storage.
 * Returns a permanent public URL. Falls back to the original URL
 * if storage upload fails (e.g. bucket not created yet).
 */
async function persistImage(
  tempUrl: string,
  partyId: string,
): Promise<string> {
  // Mock/local images don't need persisting
  if (tempUrl.startsWith('/') || tempUrl.startsWith('data:')) {
    return tempUrl;
  }

  try {
    const res = await fetch(tempUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    const blob = await res.blob();
    const ext = blob.type === 'image/webp' ? 'webp' : 'png';
    const filename = `${partyId}/${crypto.randomUUID()}.${ext}`;

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from('ai-images')
      .upload(filename, blob, {
        contentType: blob.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage] Upload failed:', uploadError.message);
      return tempUrl;
    }

    const { data: publicData } = admin.storage
      .from('ai-images')
      .getPublicUrl(filename);

    return publicData.publicUrl;
  } catch (err) {
    console.error('[Storage] persistImage failed:', err);
    return tempUrl;
  }
}

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

  const { partyId, theme: requestTheme, style, customPrompt } = parsed.data;

  // Fetch party details
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('*')
    .eq('id', partyId)
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
  }

  if (party.owner_id !== user.id) {
    return NextResponse.json({ error: 'Åtkomst nekad' }, { status: 403 });
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');

  // Beta tester limit check
  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, beta_ai_images_used')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'tester') {
      const used = profile.beta_ai_images_used || 0;
      if (used >= BETA_CONFIG.freeAiImages) {
        return NextResponse.json(
          { error: `Du har använt alla dina ${BETA_CONFIG.freeAiImages} gratis AI-bilder.` },
          { status: 403 },
        );
      }
    }
  }

  // Per-user rate limit (skip for admins)
  if (!isAdmin && await isAiRateLimited(user.id)) {
    return NextResponse.json(
      { error: 'För många bildgenereringar. Vänta en stund.' },
      { status: 429 },
    );
  }

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

  // Generate: Replicate Flux (primary) -> OpenAI DALL-E 3 (fallback) -> error
  let tempImageUrl: string | null = null;

  try {
    tempImageUrl = await generateWithReplicate({
      theme: resolvedTheme,
      style: resolvedStyle,
      customPrompt,
      forceLive,
    });
  } catch (replicateError) {
    console.error('[AI] Replicate failed:', replicateError);
    try {
      tempImageUrl = await generateInvitationImageFallback(
        resolvedTheme,
        resolvedStyle,
        { customPrompt, forceLive },
      );
    } catch (openaiError) {
      console.error('[AI] OpenAI fallback failed:', openaiError);
    }
  }

  if (!tempImageUrl) {
    return NextResponse.json(
      { error: 'Kunde inte generera bild' },
      { status: 500 },
    );
  }

  // Persist to Supabase Storage (temporary URLs expire after ~1h)
  const imageUrl = await persistImage(tempImageUrl, partyId);

  // Increment beta AI image counter for testers
  if (!isAdmin) {
    const { data: testerProfile } = await supabase
      .from('profiles')
      .select('role, beta_ai_images_used')
      .eq('id', user.id)
      .single();

    if (testerProfile?.role === 'tester') {
      await supabase
        .from('profiles')
        .update({ beta_ai_images_used: (testerProfile.beta_ai_images_used || 0) + 1 })
        .eq('id', user.id);
    }
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

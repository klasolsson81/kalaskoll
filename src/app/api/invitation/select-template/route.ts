import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TEMPLATE_IDS } from '@/components/templates';
import { selectTemplateSchema } from '@/lib/utils/validation';

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

  const parsed = selectTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ogiltiga parametrar' },
      { status: 400 },
    );
  }

  const { partyId, templateId } = parsed.data;

  if (!TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: 'Okänd mall' }, { status: 400 });
  }

  // Verify party ownership (RLS handles this, but check explicitly)
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

  // Set template and clear AI image as active invitation
  const { error: updateError } = await supabase
    .from('parties')
    .update({
      invitation_template: templateId,
      invitation_image_url: null,
    })
    .eq('id', partyId);

  if (updateError) {
    return NextResponse.json({ error: 'Kunde inte spara mall' }, { status: 500 });
  }

  return NextResponse.json({ templateId });
}

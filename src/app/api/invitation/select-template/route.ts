import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TEMPLATE_IDS } from '@/components/templates';

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

  const { partyId, templateId } = body;

  if (!partyId || typeof partyId !== 'string') {
    return NextResponse.json({ error: 'partyId krävs' }, { status: 400 });
  }

  if (!templateId || typeof templateId !== 'string') {
    return NextResponse.json({ error: 'templateId krävs' }, { status: 400 });
  }

  if (!TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: 'Okänd mall' }, { status: 400 });
  }

  // Verify party ownership (RLS handles this, but check explicitly)
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('id')
    .eq('id', partyId)
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: 'Kalas hittades inte' }, { status: 404 });
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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rsvpSchema } from '@/lib/utils/validation';
import type { Database } from '@/types/database';

// Use service role for public RSVP (no auth required)
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'För många förfrågningar. Vänta en stund.' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltigt format' }, { status: 400 });
  }

  // Validate
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { token } = body;
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token krävs' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up invitation by token
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('id, party_id')
    .eq('token', token)
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: 'Ogiltig inbjudan' }, { status: 404 });
  }

  const email = parsed.data.parentEmail;

  // Check for existing response by invitation + email (upsert)
  const { data: existing } = await supabase
    .from('rsvp_responses')
    .select('id')
    .eq('invitation_id', invitation.id)
    .eq('parent_email', email)
    .single();

  let rsvpId: string;
  let isUpdate = false;

  if (existing) {
    // Update existing response
    const { error: updateError } = await supabase
      .from('rsvp_responses')
      .update({
        child_name: parsed.data.childName,
        attending: parsed.data.attending,
        parent_name: parsed.data.parentName || null,
        parent_phone: parsed.data.parentPhone || null,
        parent_email: email,
        message: parsed.data.message || null,
      })
      .eq('id', existing.id);

    if (updateError) {
      return NextResponse.json({ error: 'Kunde inte uppdatera svar' }, { status: 500 });
    }

    rsvpId = existing.id;
    isUpdate = true;

    // Delete old allergy data if updating
    await supabase.from('allergy_data').delete().eq('rsvp_id', rsvpId);
  } else {
    // Insert new response
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvp_responses')
      .insert({
        invitation_id: invitation.id,
        child_name: parsed.data.childName,
        attending: parsed.data.attending,
        parent_name: parsed.data.parentName || null,
        parent_phone: parsed.data.parentPhone || null,
        parent_email: email,
        message: parsed.data.message || null,
      })
      .select('id')
      .single();

    if (rsvpError || !rsvp) {
      return NextResponse.json({ error: 'Kunde inte spara svar' }, { status: 500 });
    }

    rsvpId = rsvp.id;
  }

  // Store allergy data if attending and has allergies with consent
  const allergies = parsed.data.allergies ?? [];
  const otherDietary = parsed.data.otherDietary;
  const hasAllergyData = allergies.length > 0 || (otherDietary && otherDietary.length > 0);

  if (parsed.data.attending && hasAllergyData && parsed.data.allergyConsent) {
    // Get party date for auto-delete calculation
    const { data: party } = await supabase
      .from('parties')
      .select('party_date')
      .eq('id', invitation.party_id)
      .single();

    const partyDate = party?.party_date ? new Date(party.party_date) : new Date();
    const autoDeleteAt = new Date(partyDate);
    autoDeleteAt.setDate(autoDeleteAt.getDate() + 7);

    await supabase.from('allergy_data').insert({
      rsvp_id: rsvpId,
      allergies: allergies,
      other_dietary: otherDietary || null,
      consent_given_at: new Date().toISOString(),
      auto_delete_at: autoDeleteAt.toISOString(),
    });
  }

  return NextResponse.json({ success: true, rsvpId, isUpdate });
}

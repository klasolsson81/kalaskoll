import { z } from 'zod';
import { SMS_SENDER_ID } from '@/lib/constants';
import { formatDateShort, formatTime } from '@/lib/utils/format';

const elksResponseSchema = z.object({
  status: z.string(),
  id: z.string(),
  created: z.string(),
});

interface SendPartySmsParams {
  to: string; // E.164 format, e.g. +46701234567
  childName: string;
  childAge: number;
  partyDate: string; // ISO date
  partyTime: string; // HH:MM or HH:MM:SS
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null; // ISO date
  rsvpUrl: string;
}

interface ElksResponse {
  status: string;
  id: string;
  created: string;
}

function buildSmsMessage(params: SendPartySmsParams): string {
  const { childName, childAge, partyDate, partyTime, venueName, venueAddress, rsvpDeadline, rsvpUrl } = params;
  const date = formatDateShort(partyDate);
  const time = formatTime(partyTime);

  // Build venue string: "Leos Lekland, Storgatan 1" or just "Leos Lekland"
  const venue = venueAddress ? `${venueName}, ${venueAddress}` : venueName;

  // Build deadline string
  const deadline = rsvpDeadline ? `\nSvara senast ${formatDateShort(rsvpDeadline)}.` : '';

  // Full message with all details
  const full = `Hej! Du ar bjuden till ${childName}s kalas. ${childName} fyller ${childAge}!\n${date} kl ${time}\n${venue}${deadline}\nOSA: ${rsvpUrl}`;

  if (full.length <= 160) {
    return full;
  }

  // Without address
  const noAddr = `Hej! Du ar bjuden till ${childName}s kalas. ${childName} fyller ${childAge}!\n${date} kl ${time}, ${venueName}${deadline}\nOSA: ${rsvpUrl}`;
  if (noAddr.length <= 160) {
    return noAddr;
  }

  // Without deadline
  const noDeadline = `Hej! Du ar bjuden till ${childName}s kalas. ${childName} fyller ${childAge}!\n${date} kl ${time}, ${venueName}\nOSA: ${rsvpUrl}`;
  if (noDeadline.length <= 160) {
    return noDeadline;
  }

  // Minimal fallback
  return `Du ar bjuden till ${childName}s kalas ${date} kl ${time}. OSA: ${rsvpUrl}`;
}

export async function sendPartySms(params: SendPartySmsParams): Promise<ElksResponse> {
  const username = process.env.ELKS_API_USERNAME;
  const password = process.env.ELKS_API_PASSWORD;

  if (!username || !password) {
    throw new Error('46elks credentials not configured');
  }

  const message = buildSmsMessage(params);
  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  const body = new URLSearchParams({
    from: SMS_SENDER_ID,
    to: params.to,
    message,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch('https://api.46elks.com/a1/sms', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`46elks API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const parsed = elksResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Unexpected 46elks API response format');
  }
  return parsed.data;
}

// Re-export for testing
export { buildSmsMessage };

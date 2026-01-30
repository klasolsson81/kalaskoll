import { SMS_SENDER_ID } from '@/lib/constants';
import { formatDateShort, formatTime } from '@/lib/utils/format';

interface SendPartySmsParams {
  to: string; // E.164 format, e.g. +46701234567
  childName: string;
  childAge: number;
  partyDate: string; // ISO date
  partyTime: string; // HH:MM or HH:MM:SS
  venueName: string;
  rsvpUrl: string;
}

interface ElksResponse {
  status: string;
  id: string;
  created: string;
}

function buildSmsMessage(params: SendPartySmsParams): string {
  const { childName, childAge, partyDate, partyTime, venueName, rsvpUrl } = params;
  const date = formatDateShort(partyDate);
  const time = formatTime(partyTime);

  const full = `${childName} fyller ${childAge}! Kalas ${date} kl ${time}, ${venueName}. OSA: ${rsvpUrl}`;

  // SMS is 160 chars for GSM-7. If over, use a shorter version.
  if (full.length <= 160) {
    return full;
  }

  // Fallback: shorter message without venue
  const short = `${childName} fyller ${childAge}! Kalas ${date} kl ${time}. OSA: ${rsvpUrl}`;
  if (short.length <= 160) {
    return short;
  }

  // Absolute fallback
  return `${childName}s kalas ${date}. OSA: ${rsvpUrl}`;
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

  const response = await fetch('https://api.46elks.com/a1/sms', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`46elks API error: ${response.status} ${text}`);
  }

  return response.json() as Promise<ElksResponse>;
}

// Re-export for testing
export { buildSmsMessage };

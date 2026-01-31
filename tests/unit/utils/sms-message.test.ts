import { describe, it, expect } from 'vitest';
import { buildSmsMessage } from '@/lib/sms/elks';

describe('buildSmsMessage', () => {
  const baseParams = {
    to: '+46701234567',
    childName: 'Klas',
    childAge: 7,
    partyDate: '2026-03-27',
    partyTime: '14:00',
    venueName: "Leo's Lekland",
    rsvpUrl: 'https://kalaskoll.se/r/abc12345',
  };

  it('builds a message with key details', () => {
    const msg = buildSmsMessage({
      ...baseParams,
      venueAddress: 'Storgatan 1',
      rsvpDeadline: '2026-03-20',
    });
    expect(msg).toContain('Klas');
    expect(msg).toContain('fyller 7');
    expect(msg).toContain('Svara senast');
    expect(msg).toContain('abc12345');
    expect(msg).toContain("Leo's Lekland");
  });

  it('omits address when not provided', () => {
    const msg = buildSmsMessage(baseParams);
    expect(msg).toContain("Leo's Lekland");
    expect(msg).not.toContain('Storgatan');
  });

  it('message length is <= 160 characters for short inputs', () => {
    const msg = buildSmsMessage({
      ...baseParams,
      childName: 'Li',
      venueName: 'Hem',
      rsvpUrl: 'https://ka.se/r/a',
    });
    expect(msg.length).toBeLessThanOrEqual(160);
  });

  it('produces a minimal fallback for very long inputs', () => {
    const msg = buildSmsMessage({
      ...baseParams,
      childName: 'A',
      venueName: 'A'.repeat(100),
      venueAddress: 'B'.repeat(100),
      rsvpDeadline: '2026-03-20',
    });
    expect(msg).toContain('OSA:');
    expect(msg).toContain('A');
  });
});

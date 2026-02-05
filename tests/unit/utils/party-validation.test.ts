import { describe, it, expect } from 'vitest';
import { partySchema } from '@/lib/utils/validation';

describe('partySchema', () => {
  const validParty = {
    childName: 'Klas',
    childAge: 7,
    partyDate: '2026-03-27',
    partyTime: '14:00',
    venueName: "Leo's Lekland",
  };

  it('accepts valid party data with required fields only', () => {
    const result = partySchema.safeParse(validParty);
    expect(result.success).toBe(true);
  });

  it('accepts valid party data with all optional fields', () => {
    const result = partySchema.safeParse({
      ...validParty,
      partyTimeEnd: '16:00',
      venueAddress: 'Storgatan 1, Stockholm',
      description: 'Kom och fira!',
      theme: 'dinosaurier',
      rsvpDeadline: '2026-03-20',
      maxGuests: 15,
    });
    expect(result.success).toBe(true);
  });

  it('accepts party without end time', () => {
    const result = partySchema.safeParse(validParty);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.partyTimeEnd).toBeUndefined();
    }
  });

  it('accepts party with end time', () => {
    const result = partySchema.safeParse({
      ...validParty,
      partyTimeEnd: '16:30',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.partyTimeEnd).toBe('16:30');
    }
  });

  it('rejects empty child name', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childName: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects child name over 100 characters', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childName: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects child age of 0', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childAge: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects child age of 20', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childAge: 20,
    });
    expect(result.success).toBe(false);
  });

  it('accepts child age of 1', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childAge: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts child age of 19', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childAge: 19,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty party date', () => {
    const result = partySchema.safeParse({
      ...validParty,
      partyDate: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects party date in the past', () => {
    const result = partySchema.safeParse({
      ...validParty,
      partyDate: '2020-01-01',
      rsvpDeadline: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty party time', () => {
    const result = partySchema.safeParse({
      ...validParty,
      partyTime: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty venue name', () => {
    const result = partySchema.safeParse({
      ...validParty,
      venueName: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects max guests below 1', () => {
    const result = partySchema.safeParse({
      ...validParty,
      maxGuests: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects max guests above 100', () => {
    const result = partySchema.safeParse({
      ...validParty,
      maxGuests: 101,
    });
    expect(result.success).toBe(false);
  });

  it('rejects description over 200 characters', () => {
    const result = partySchema.safeParse({
      ...validParty,
      description: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('rejects description with more than 5 lines', () => {
    const result = partySchema.safeParse({
      ...validParty,
      description: 'rad1\nrad2\nrad3\nrad4\nrad5\nrad6',
    });
    expect(result.success).toBe(false);
  });

  it('accepts description with exactly 5 lines', () => {
    const result = partySchema.safeParse({
      ...validParty,
      description: 'rad1\nrad2\nrad3\nrad4\nrad5',
    });
    expect(result.success).toBe(true);
  });

  it('accepts party without childId', () => {
    const result = partySchema.safeParse(validParty);
    expect(result.success).toBe(true);
  });

  it('accepts party with valid uuid childId', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts party with empty string childId', () => {
    const result = partySchema.safeParse({
      ...validParty,
      childId: '',
    });
    expect(result.success).toBe(true);
  });

  it('accepts rsvpDeadline on party date', () => {
    const result = partySchema.safeParse({
      ...validParty,
      rsvpDeadline: '2026-03-27',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rsvpDeadline after party date', () => {
    const result = partySchema.safeParse({
      ...validParty,
      rsvpDeadline: '2026-03-28',
    });
    expect(result.success).toBe(false);
  });

  it('rejects rsvpDeadline in the past', () => {
    const result = partySchema.safeParse({
      ...validParty,
      rsvpDeadline: '2020-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('accepts party without rsvpDeadline', () => {
    const result = partySchema.safeParse(validParty);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rsvpDeadline).toBeUndefined();
    }
  });
});

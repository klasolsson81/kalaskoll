import { describe, it, expect } from 'vitest';
import { manualGuestSchema } from '@/lib/utils/validation';

describe('manualGuestSchema', () => {
  const validGuest = { childName: 'Lisa', attending: 'yes' as const };

  it('accepts minimal valid guest (name + attending)', () => {
    const result = manualGuestSchema.safeParse(validGuest);
    expect(result.success).toBe(true);
  });

  it('accepts full valid guest with all optional fields', () => {
    const result = manualGuestSchema.safeParse({
      childName: 'Lisa',
      attending: 'yes',
      parentName: 'Anna Svensson',
      parentPhone: '0701234567',
      parentEmail: 'anna@example.com',
      message: 'Vi kommer gärna!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty childName', () => {
    const result = manualGuestSchema.safeParse({ childName: '', attending: 'yes' });
    expect(result.success).toBe(false);
  });

  it('rejects childName over 100 characters', () => {
    const result = manualGuestSchema.safeParse({
      childName: 'A'.repeat(101),
      attending: 'yes',
    });
    expect(result.success).toBe(false);
  });

  it('accepts attending "yes"', () => {
    const result = manualGuestSchema.safeParse({ childName: 'Lisa', attending: 'yes' });
    expect(result.success).toBe(true);
  });

  it('accepts attending "no"', () => {
    const result = manualGuestSchema.safeParse({ childName: 'Lisa', attending: 'no' });
    expect(result.success).toBe(true);
  });

  it('rejects attending with invalid value', () => {
    const result = manualGuestSchema.safeParse({ childName: 'Lisa', attending: 'maybe' });
    expect(result.success).toBe(false);
  });

  it('accepts valid Swedish phone number (07x format)', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentPhone: '0701234567' });
    expect(result.success).toBe(true);
  });

  it('accepts valid Swedish phone number (+46 format)', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentPhone: '+46701234567' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone number', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentPhone: '12345' });
    expect(result.success).toBe(false);
  });

  it('allows empty phone number', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentPhone: '' });
    expect(result.success).toBe(true);
  });

  it('accepts valid email', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentEmail: 'anna@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentEmail: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('allows empty email', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, parentEmail: '' });
    expect(result.success).toBe(true);
  });

  it('rejects message over 500 characters', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, message: 'A'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('allows empty message', () => {
    const result = manualGuestSchema.safeParse({ ...validGuest, message: '' });
    expect(result.success).toBe(true);
  });
});

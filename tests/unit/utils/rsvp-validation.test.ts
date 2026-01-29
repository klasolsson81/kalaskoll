import { describe, it, expect } from 'vitest';
import { rsvpSchema } from '@/lib/utils/validation';

describe('rsvpSchema', () => {
  const validRsvp = {
    childName: 'Emma',
    attending: true,
    parentEmail: 'anna@example.com',
  };

  it('accepts valid RSVP with required fields only', () => {
    const result = rsvpSchema.safeParse(validRsvp);
    expect(result.success).toBe(true);
  });

  it('accepts valid RSVP with all optional fields', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentName: 'Anna Andersson',
      parentPhone: '+46701234567',
      message: 'Vi ser fram emot det!',
      allergies: ['Laktos', 'Gluten'],
      otherDietary: 'Vegetarian',
      allergyConsent: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty child name', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      childName: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects child name over 100 chars', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      childName: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('accepts Swedish +46 phone format', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentPhone: '+46701234567',
    });
    expect(result.success).toBe(true);
  });

  it('accepts Swedish 0-prefix phone format', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentPhone: '0701234567',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone format', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentPhone: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty phone string', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentPhone: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = rsvpSchema.safeParse({
      childName: 'Emma',
      attending: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email string', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentEmail: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentEmail: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentEmail: 'Anna@Example.COM',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentEmail).toBe('anna@example.com');
    }
  });

  it('normalizes mixed-case email correctly', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      parentEmail: 'Test.User+Tag@Gmail.Com',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentEmail).toBe('test.user+tag@gmail.com');
    }
  });

  it('rejects message over 500 chars', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      message: 'A'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('accepts attending false (declining)', () => {
    const result = rsvpSchema.safeParse({
      childName: 'Erik',
      attending: false,
      parentEmail: 'erik@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts allergy array', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      allergies: ['Laktos', 'Nötter'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects other dietary text over 200 chars', () => {
    const result = rsvpSchema.safeParse({
      ...validRsvp,
      otherDietary: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

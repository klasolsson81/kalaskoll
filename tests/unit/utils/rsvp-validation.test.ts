import { describe, it, expect } from 'vitest';
import { rsvpSchema, rsvpEditSchema, rsvpMultiChildSchema, rsvpMultiChildEditSchema } from '@/lib/utils/validation';

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

describe('rsvpEditSchema', () => {
  const validEdit = {
    editToken: 'a'.repeat(64),
    childName: 'Emma',
    attending: true,
    parentEmail: 'anna@example.com',
  };

  it('accepts valid edit request with required fields', () => {
    const result = rsvpEditSchema.safeParse(validEdit);
    expect(result.success).toBe(true);
  });

  it('accepts valid edit request with all optional fields', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      parentName: 'Anna Andersson',
      parentPhone: '+46701234567',
      message: 'Vi ändrade oss!',
      allergies: ['Gluten'],
      otherDietary: 'Vegan',
      allergyConsent: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing editToken', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { editToken: _editToken, ...noToken } = validEdit;
    const result = rsvpEditSchema.safeParse(noToken);
    expect(result.success).toBe(false);
  });

  it('rejects empty editToken', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      editToken: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects editToken over 64 chars', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      editToken: 'a'.repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      parentEmail: 'Anna@Example.COM',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentEmail).toBe('anna@example.com');
    }
  });

  it('accepts Swedish phone formats', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      parentPhone: '+46701234567',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone format', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      parentPhone: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty child name', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      childName: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts attending false', () => {
    const result = rsvpEditSchema.safeParse({
      ...validEdit,
      attending: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parentEmail: _email, ...noEmail } = validEdit;
    const result = rsvpEditSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });
});

describe('rsvpMultiChildSchema', () => {
  const validMulti = {
    children: [
      { childName: 'Mila', attending: true },
    ],
    parentEmail: 'anna@example.com',
  };

  it('accepts 1 child', () => {
    const result = rsvpMultiChildSchema.safeParse(validMulti);
    expect(result.success).toBe(true);
  });

  it('accepts 5 children', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      children: Array.from({ length: 5 }, (_, i) => ({
        childName: `Barn ${i + 1}`,
        attending: true,
      })),
    });
    expect(result.success).toBe(true);
  });

  it('rejects 0 children', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      children: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects 6 children', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      children: Array.from({ length: 6 }, (_, i) => ({
        childName: `Barn ${i + 1}`,
        attending: true,
      })),
    });
    expect(result.success).toBe(false);
  });

  it('rejects child without name', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      children: [{ childName: '', attending: true }],
    });
    expect(result.success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      parentEmail: 'Anna@Example.COM',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentEmail).toBe('anna@example.com');
    }
  });

  it('accepts children with allergies and consent', () => {
    const result = rsvpMultiChildSchema.safeParse({
      children: [
        { childName: 'Mila', attending: true, allergies: ['Laktos'], otherDietary: 'Vegan', allergyConsent: true },
        { childName: 'Wera', attending: true, allergies: ['Gluten'] },
      ],
      parentEmail: 'anna@example.com',
      parentName: 'Anna',
      parentPhone: '+46701234567',
      message: 'Vi ser fram emot det!',
    });
    expect(result.success).toBe(true);
  });

  it('accepts mixed attending statuses', () => {
    const result = rsvpMultiChildSchema.safeParse({
      children: [
        { childName: 'Mila', attending: true },
        { childName: 'Wera', attending: false },
      ],
      parentEmail: 'anna@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = rsvpMultiChildSchema.safeParse({
      children: [{ childName: 'Mila', attending: true }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone format', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      parentPhone: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty phone string', () => {
    const result = rsvpMultiChildSchema.safeParse({
      ...validMulti,
      parentPhone: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('rsvpMultiChildEditSchema', () => {
  const validMultiEdit = {
    editToken: 'a'.repeat(64),
    children: [
      { childName: 'Mila', attending: true },
    ],
    parentEmail: 'anna@example.com',
  };

  it('accepts valid edit with 1 child', () => {
    const result = rsvpMultiChildEditSchema.safeParse(validMultiEdit);
    expect(result.success).toBe(true);
  });

  it('accepts edit with existing child id', () => {
    const result = rsvpMultiChildEditSchema.safeParse({
      ...validMultiEdit,
      children: [
        { id: '550e8400-e29b-41d4-a716-446655440000', childName: 'Mila', attending: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts mix of existing and new children', () => {
    const result = rsvpMultiChildEditSchema.safeParse({
      ...validMultiEdit,
      children: [
        { id: '550e8400-e29b-41d4-a716-446655440000', childName: 'Mila', attending: true },
        { childName: 'Wera', attending: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing editToken', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { editToken: _editToken, ...noToken } = validMultiEdit;
    const result = rsvpMultiChildEditSchema.safeParse(noToken);
    expect(result.success).toBe(false);
  });

  it('rejects 0 children', () => {
    const result = rsvpMultiChildEditSchema.safeParse({
      ...validMultiEdit,
      children: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects 6 children', () => {
    const result = rsvpMultiChildEditSchema.safeParse({
      ...validMultiEdit,
      children: Array.from({ length: 6 }, (_, i) => ({
        childName: `Barn ${i + 1}`,
        attending: true,
      })),
    });
    expect(result.success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const result = rsvpMultiChildEditSchema.safeParse({
      ...validMultiEdit,
      parentEmail: 'Anna@Example.COM',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentEmail).toBe('anna@example.com');
    }
  });
});

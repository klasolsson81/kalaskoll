import { describe, it, expect } from 'vitest';
import { childSchema } from '@/lib/utils/validation';

describe('childSchema', () => {
  it('accepts valid child data', () => {
    const result = childSchema.safeParse({ name: 'Klas', birthDate: '2019-03-27' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = childSchema.safeParse({ name: '', birthDate: '2019-03-27' });
    expect(result.success).toBe(false);
  });

  it('rejects name over 100 characters', () => {
    const result = childSchema.safeParse({ name: 'A'.repeat(101), birthDate: '2019-03-27' });
    expect(result.success).toBe(false);
  });

  it('rejects empty birth date', () => {
    const result = childSchema.safeParse({ name: 'Klas', birthDate: '' });
    expect(result.success).toBe(false);
  });
});

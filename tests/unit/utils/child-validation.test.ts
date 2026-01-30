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

  it('rejects future birth date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureStr = future.toISOString().slice(0, 10);
    const result = childSchema.safeParse({ name: 'Klas', birthDate: futureStr });
    expect(result.success).toBe(false);
  });

  it('accepts today as birth date', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const result = childSchema.safeParse({ name: 'Klas', birthDate: todayStr });
    expect(result.success).toBe(true);
  });
});

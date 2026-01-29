import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, formatDate, formatTime } from '@/lib/utils/format';

describe('formatPhoneNumber', () => {
  it('formats +46 numbers correctly', () => {
    expect(formatPhoneNumber('+46701234567')).toBe('+46 70 123 4567');
  });

  it('formats 0-prefix numbers correctly', () => {
    expect(formatPhoneNumber('0701234567')).toBe('070 123 4567');
  });

  it('returns original if unrecognized format', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });

  it('handles numbers with spaces', () => {
    expect(formatPhoneNumber('+46 70 123 4567')).toBe('+46 70 123 4567');
  });
});

describe('formatDate', () => {
  it('formats a date in Swedish locale', () => {
    const result = formatDate('2026-03-27');
    expect(result).toContain('2026');
    expect(result).toContain('mars');
  });

  it('accepts a Date object', () => {
    const result = formatDate(new Date(2026, 2, 27));
    expect(result).toContain('27');
  });
});

describe('formatTime', () => {
  it('returns HH:MM format', () => {
    expect(formatTime('14:30:00')).toBe('14:30');
  });

  it('handles already short format', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });
});

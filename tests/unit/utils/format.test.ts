import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, formatDate, formatTime, formatTimeRange } from '@/lib/utils/format';

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

describe('formatTimeRange', () => {
  it('returns start time only when no end time', () => {
    expect(formatTimeRange('14:00')).toBe('14:00');
  });

  it('returns start time only when end is null', () => {
    expect(formatTimeRange('14:00', null)).toBe('14:00');
  });

  it('returns start time only when end is undefined', () => {
    expect(formatTimeRange('14:00', undefined)).toBe('14:00');
  });

  it('returns start time only when end is empty string', () => {
    expect(formatTimeRange('14:00', '')).toBe('14:00');
  });

  it('returns range when both start and end given', () => {
    expect(formatTimeRange('14:00', '16:00')).toBe('14:00\u201316:00');
  });

  it('handles full time strings with seconds', () => {
    expect(formatTimeRange('14:00:00', '16:30:00')).toBe('14:00\u201316:30');
  });
});

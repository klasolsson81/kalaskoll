import { describe, it, expect } from 'vitest';
import {
  formatPhoneNumber,
  formatDate,
  formatDateShort,
  formatTime,
  formatTimeRange,
  calculateAge,
} from '@/lib/utils/format';

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

describe('formatDateShort', () => {
  it('formats a date as "day month" in Swedish', () => {
    const result = formatDateShort('2026-03-15');
    // Should contain "15" and "mar" (short month)
    expect(result).toContain('15');
    expect(result.toLowerCase()).toContain('mar');
  });

  it('accepts a Date object', () => {
    const result = formatDateShort(new Date(2026, 5, 1)); // June 1
    expect(result).toContain('1');
    expect(result.toLowerCase()).toContain('jun');
  });

  it('formats January correctly', () => {
    const result = formatDateShort('2026-01-29');
    expect(result).toContain('29');
    expect(result.toLowerCase()).toContain('jan');
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

describe('calculateAge', () => {
  it('calculates age when birthday has passed this year', () => {
    // Born 2019-01-15, checked on 2026-03-27 → 7
    expect(calculateAge('2019-01-15', '2026-03-27')).toBe(7);
  });

  it('calculates age when birthday has not yet passed this year', () => {
    // Born 2019-06-15, checked on 2026-03-27 → still 6
    expect(calculateAge('2019-06-15', '2026-03-27')).toBe(6);
  });

  it('calculates age on exact birthday', () => {
    // Born 2019-03-27, checked on 2026-03-27 → 7
    expect(calculateAge('2019-03-27', '2026-03-27')).toBe(7);
  });

  it('returns 0 for infants', () => {
    // Born 2026-01-01, checked on 2026-06-01 → 0
    expect(calculateAge('2026-01-01', '2026-06-01')).toBe(0);
  });

  it('accepts Date objects', () => {
    expect(calculateAge(new Date(2019, 0, 15), new Date(2026, 2, 27))).toBe(7);
  });

  it('accepts string birth date and Date atDate', () => {
    expect(calculateAge('2019-01-15', new Date(2026, 2, 27))).toBe(7);
  });

  it('accepts Date birth date and string atDate', () => {
    expect(calculateAge(new Date(2019, 0, 15), '2026-03-27')).toBe(7);
  });

  it('uses today when no atDate provided', () => {
    // Born exactly 5 years ago
    const today = new Date();
    const fiveYearsAgo = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate(),
    );
    expect(calculateAge(fiveYearsAgo)).toBe(5);
  });
});

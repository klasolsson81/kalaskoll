/**
 * Format a Swedish phone number for display.
 * Accepts +46 or 0-prefix formats.
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');

  if (cleaned.startsWith('+46')) {
    const local = cleaned.slice(3);
    return `+46 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`.trim();
  }

  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`.trim();
  }

  return phone;
}

/**
 * Format a date for Swedish locale.
 */
export function formatDate(date: Date | string, locale = 'sv-SE'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time string (HH:MM) for display.
 */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Format a time range for display.
 * Returns "14:00" if no end time, or "14:00–16:00" if both provided.
 */
export function formatTimeRange(start: string, end?: string | null): string {
  const s = formatTime(start);
  if (!end) return s;
  return `${s}–${formatTime(end)}`;
}

/**
 * Calculate age in full years from a birth date.
 * If `atDate` is provided, calculates age at that date; otherwise uses today.
 */
export function calculateAge(
  birthDate: Date | string,
  atDate?: Date | string,
): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const at = atDate
    ? typeof atDate === 'string'
      ? new Date(atDate)
      : atDate
    : new Date();

  let age = at.getFullYear() - birth.getFullYear();
  const monthDiff = at.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

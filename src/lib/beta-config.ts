/** Fixed beta end date — all testers end on the same day */
export const BETA_END_DATE = '2026-02-28';

/** Testers with extended access beyond the standard beta end date */
export const PROTECTED_TESTERS: { id: string; until: string; name: string }[] = [
  { id: '93fcbe34-e2aa-4fa9-b986-101f58f27ad0', until: '2026-03-15', name: 'Caroline Friberg Wolk' },
  { id: '0aeb9d75-4d44-48ba-9c7f-15197e1b7a93', until: '2026-03-15', name: 'Klas Olsson (test)' },
];

/** Returns the effective end date for a specific user (extended if protected) */
export function getEndDateForUser(userId: string): string {
  const protected_ = PROTECTED_TESTERS.find((t) => t.id === userId);
  return protected_ ? protected_.until : BETA_END_DATE;
}

/** Returns true if the beta has ended for a specific user */
export function isBetaEndedForUser(userId: string): boolean {
  const endDate = getEndDateForUser(userId);
  return new Date() > new Date(`${endDate}T23:59:59`);
}

/** Returns days remaining for a specific user */
export function betaDaysRemainingForUser(userId: string): number {
  const endDate = getEndDateForUser(userId);
  const end = new Date(`${endDate}T23:59:59`);
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const BETA_CONFIG = {
  maxTesters: 100,
  freeAiImages: 15,
  freeSmsInvites: 15,
  registrationOpen: true,
  waitlistEnabled: true,
  maxRegistrationsPerIpPerHour: 3,
} as const;

/** Returns true if the beta period has ended */
export function isBetaEnded(): boolean {
  return new Date() > new Date(`${BETA_END_DATE}T23:59:59`);
}

/** Returns the number of full days remaining in the beta (min 0) */
export function betaDaysRemaining(): number {
  const end = new Date(`${BETA_END_DATE}T23:59:59`);
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export type BetaRole = 'user' | 'tester' | 'admin';

export interface BetaStatus {
  role: BetaRole;
  isTester: boolean;
  isAdmin: boolean;
  isExpired: boolean;
  aiImagesUsed: number;
  aiImagesRemaining: number;
  smsUsed: number;
  smsRemaining: number;
  expiresAt: Date | null;
  daysRemaining: number;
  feedbackCount: number;
}

export interface BetaStats {
  totalTesters: number;
  activeTesters: number;
  spotsRemaining: number;
  waitlistCount: number;
  percentFull: number;
}

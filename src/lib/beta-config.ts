/** Fixed beta end date — all testers end on the same day */
export const BETA_END_DATE = '2026-02-28';

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

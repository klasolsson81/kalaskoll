export const BETA_CONFIG = {
  maxTesters: 100,
  freeAiImages: 5,
  freeSmsInvites: 5,
  expiresInDays: 30,
  registrationOpen: true,
  waitlistEnabled: true,
  maxRegistrationsPerIpPerHour: 3,
} as const;

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

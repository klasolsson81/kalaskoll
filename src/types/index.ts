// Shared types for KalasKoll
export type PartyTheme =
  | 'dinosaurier'
  | 'prinsessor'
  | 'superhjältar'
  | 'fotboll'
  | 'default';

export interface PartyDetails {
  id: string;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string;
  description?: string;
  theme?: PartyTheme;
  invitationImageUrl?: string;
  rsvpDeadline?: string;
  maxGuests?: number;
}

export interface RsvpResponse {
  id: string;
  invitationId: string;
  childName: string;
  attending: boolean;
  parentName?: string;
  parentPhone?: string;
  parentEmail: string;
  message?: string;
  respondedAt: string;
}

export interface AllergyData {
  id: string;
  rsvpId: string;
  allergies: string[];
  otherDietary?: string;
  consentGivenAt: string;
}

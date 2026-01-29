// API request/response types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RsvpRequest {
  token: string;
  childName: string;
  attending: boolean;
  parentName?: string;
  parentPhone?: string;
  parentEmail: string;
  message?: string;
  allergies?: string[];
  otherDietary?: string;
  allergyConsent?: boolean;
}

export interface GenerateInvitationRequest {
  partyId: string;
  theme: string;
}

export interface GenerateInvitationResponse {
  imageUrl: string;
}

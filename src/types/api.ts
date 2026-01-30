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

export interface RsvpEditRequest {
  editToken: string;
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
  imageId: string;
  imageCount: number;
  maxImages: number;
}

export interface SelectImageRequest {
  partyId: string;
  imageId: string;
}

export interface SelectImageResponse {
  imageUrl: string;
}

export interface SendInvitationRequest {
  partyId: string;
  emails: Array<{ email: string; name?: string }>;
}

export interface SendInvitationResponse {
  sent: number;
  failed: number;
}

export interface SendSmsInvitationRequest {
  partyId: string;
  phones: string[];
}

export interface SendSmsInvitationResponse {
  sent: number;
  failed: number;
  remainingSmsThisParty: number;
}

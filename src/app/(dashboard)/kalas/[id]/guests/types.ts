export interface Guest {
  id: string;
  child_name: string;
  attending: boolean;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  message: string | null;
  responded_at: string;
}

export interface AllergyInfo {
  rsvp_id: string;
  allergies: string[];
  other_dietary: string | null;
}

export interface InvitedGuest {
  email: string | null;
  phone: string | null;
  invite_method: string;
  name: string | null;
  invited_at: string;
  hasResponded: boolean;
}

-- Migration: Add SMS invitation support
-- Adds sms_usage tracking table and extends invited_guests for SMS

-- 1. Create sms_usage table (tracks SMS consumption per user/month)
CREATE TABLE sms_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  sms_count INTEGER NOT NULL DEFAULT 0,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX idx_sms_usage_user_month ON sms_usage(user_id, month);

-- RLS for sms_usage
ALTER TABLE sms_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sms_usage"
  ON sms_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sms_usage"
  ON sms_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sms_usage"
  ON sms_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Extend invited_guests for SMS support
ALTER TABLE invited_guests
  ADD COLUMN phone TEXT,
  ADD COLUMN invite_method TEXT NOT NULL DEFAULT 'email';

-- Make email nullable (SMS guests may not have email)
ALTER TABLE invited_guests ALTER COLUMN email DROP NOT NULL;

-- Ensure at least one contact method
ALTER TABLE invited_guests
  ADD CONSTRAINT invited_guests_contact_check
  CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Partial unique index for phone per party
CREATE UNIQUE INDEX idx_invited_guests_party_phone
  ON invited_guests(party_id, phone)
  WHERE phone IS NOT NULL;

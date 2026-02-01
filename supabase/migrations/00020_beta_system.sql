-- ============================================
-- BETA SYSTEM MIGRATION
-- ============================================

-- 1. Add role and beta fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'tester', 'admin'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS beta_ai_images_used INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS beta_sms_used INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS beta_registered_at TIMESTAMPTZ;

-- 2. Set existing admins (profiles has no email column, must join auth.users)
UPDATE profiles SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('klasolsson81@gmail.com', 'zeback_@hotmail.com')
);

-- 3. Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_notified ON waitlist(notified_at) WHERE notified_at IS NULL;

-- 4. Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  page_url TEXT NOT NULL,
  message TEXT NOT NULL,
  screenshot_url TEXT,
  user_agent TEXT,
  screen_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved', 'wontfix')),
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

-- 5. Beta registration rate limiting
CREATE TABLE IF NOT EXISTS beta_rate_limit (
  ip_address TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS Policies

-- Waitlist: anyone can insert, admins can read
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read waitlist" ON waitlist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Feedback: authenticated can insert, users read own, admins read/update all
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read own feedback" ON feedback
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all feedback" ON feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update feedback" ON feedback
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Rate limit: service role only (no RLS policies = only service role can access)
ALTER TABLE beta_rate_limit ENABLE ROW LEVEL SECURITY;

-- 7. Function for beta stats
CREATE OR REPLACE FUNCTION get_beta_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_testers', (SELECT COUNT(*) FROM profiles WHERE role = 'tester'),
    'active_testers', (SELECT COUNT(*) FROM profiles WHERE role = 'tester' AND beta_expires_at > NOW()),
    'waitlist_count', (SELECT COUNT(*) FROM waitlist WHERE converted_at IS NULL),
    'spots_remaining', 100 - (SELECT COUNT(*) FROM profiles WHERE role = 'tester')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

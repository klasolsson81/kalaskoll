-- Move zeback_@hotmail.com from admin to tester with beta privileges
UPDATE profiles SET
  role = 'tester',
  beta_registered_at = NOW(),
  beta_expires_at = NOW() + INTERVAL '30 days',
  beta_ai_images_used = 0,
  beta_sms_used = 0
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'zeback_@hotmail.com'
);

-- Fix Supabase linter warnings

-- 1. Set search_path on update_updated_at function to prevent mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Tighten audit_log INSERT policy: only allow inserts where action is not null
-- (replaces the always-true WITH CHECK)
DROP POLICY IF EXISTS "Anyone can insert audit log" ON audit_log;
CREATE POLICY "Authenticated or anon can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (action IS NOT NULL AND resource_type IS NOT NULL);

-- 3. Tighten rsvp_responses INSERT policy: require valid invitation_id and child_name
DROP POLICY IF EXISTS "Anyone can insert response" ON rsvp_responses;
CREATE POLICY "Anyone can insert response with valid data"
  ON rsvp_responses FOR INSERT
  WITH CHECK (
    invitation_id IS NOT NULL
    AND child_name IS NOT NULL
    AND child_name <> ''
  );

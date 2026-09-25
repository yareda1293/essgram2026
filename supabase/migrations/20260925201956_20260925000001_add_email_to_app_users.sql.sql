-- Add email column to app_users for email-based authentication.
-- The phone column already exists and will now be used purely as profile info.
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS email text;

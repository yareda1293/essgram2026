/*
# Tighten RLS on app_users table

## What changed
The app_users table previously had open RLS policies (USING true / WITH CHECK true)
that allowed any anon or authenticated user to read, insert, update, or delete
any user's profile. This is a security risk in a multi-user app.

## New policies
- SELECT: any authenticated user can see all profiles (needed for messaging —
  users need to see other users' profiles to chat with them).
- INSERT: a user can only insert their own profile (auth.uid()::text = id).
- UPDATE: a user can only update their own profile (auth.uid()::text = id).
- DELETE: a user can only delete their own profile (auth.uid()::text = id).

## Why
The app now has real authentication (email + phone). Users should only be able
to modify their own profile, not anyone else's. Reading all profiles is allowed
because the app is a messaging platform — users need to discover and message
each other. The id column is text, so auth.uid() is cast to text for comparison.

## Security
- RLS remains enabled.
- No data is lost — only policies change.
*/

-- Drop old open policies
DROP POLICY IF EXISTS "demo_select_app_users" ON public.app_users;
DROP POLICY IF EXISTS "demo_insert_app_users" ON public.app_users;
DROP POLICY IF EXISTS "demo_update_app_users" ON public.app_users;
DROP POLICY IF EXISTS "demo_delete_app_users" ON public.app_users;

-- Allow authenticated users to read all profiles (needed for messaging)
CREATE POLICY "users_select_all_profiles"
  ON public.app_users FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon to read profiles too (needed before sign-in for seed data display)
CREATE POLICY "anon_select_all_profiles"
  ON public.app_users FOR SELECT
  TO anon
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "users_insert_own_profile"
  ON public.app_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.app_users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Users can only delete their own profile
CREATE POLICY "users_delete_own_profile"
  ON public.app_users FOR DELETE
  TO authenticated
  USING (auth.uid()::text = id);

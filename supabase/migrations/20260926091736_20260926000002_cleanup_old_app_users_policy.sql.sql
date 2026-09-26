/*
# Clean up redundant old app_users SELECT policy

The old `demo_read_app_users` SELECT policy (USING true) was not dropped
in the previous migration because the drop statement used the wrong name
(`demo_select_app_users` instead of `demo_read_app_users`).

This migration drops the redundant old policy. The new policies
(`anon_select_all_profiles`, `users_select_all_profiles`) already cover
SELECT access, so this old policy is unnecessary.
*/

DROP POLICY IF EXISTS "demo_read_app_users" ON public.app_users;

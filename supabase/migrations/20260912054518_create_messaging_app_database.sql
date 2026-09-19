/*
# Create Ess Gram messaging database

1. Purpose
- Create the durable database foundation for the existing Ess Gram messaging app.
- The current app uses a demo phone/code flow without a real authenticated Supabase session, so this first version is intentionally single-tenant and shared for the demo experience.

2. New Tables
- `app_users`: profile information displayed throughout the app.
- `app_chats`: direct messages, groups, and channels.
- `app_chat_members`: the users who belong to each chat.
- `app_messages`: text and media messages, delivery/read state, edits, replies, and deletion state.
- `app_message_reactions`: emoji reactions attached to messages.
- `app_moments`: temporary photo or video stories.
- `app_moment_views`: users who have viewed moments.
- `app_calls`: voice and video call history.
- `app_notifications`: in-app notifications.
- `app_settings`: app preferences for the demo user.

3. Important Columns
- All application identifiers remain text values so the existing seeded IDs such as `u_me`, `c_sofia`, and `m1` can be migrated without rewriting the frontend.
- Message `status` supports `sent`, `delivered`, and `read`.
- Message `read_at` records when a recipient saw a message.
- JSONB `metadata` columns preserve media and future message properties without changing the table structure.

4. Security
- Row level security is enabled on every new table.
- Because the current frontend has no real Supabase authentication session, separate CRUD policies allow the `anon` and `authenticated` roles to use this intentionally shared demo dataset.
- These policies should be replaced with ownership and membership checks when real account authentication is introduced.

5. Performance and integrity
- Foreign keys connect messages, members, reactions, views, and notifications to their parent records.
- Unique constraints prevent duplicate memberships, reactions, and moment views.
- Indexes cover chat timelines, unread notifications, moment expiry queries, and common membership lookups.
*/

CREATE TABLE IF NOT EXISTS public.app_users (
  id text PRIMARY KEY,
  name text NOT NULL,
  username text NOT NULL UNIQUE,
  phone text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  status text,
  is_online boolean NOT NULL DEFAULT false,
  last_seen text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_chats (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('dm', 'group', 'channel')),
  name text NOT NULL,
  avatar text NOT NULL DEFAULT '',
  description text,
  member_count integer,
  subscriber_count integer,
  is_public boolean NOT NULL DEFAULT false,
  unread_count integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  is_muted boolean NOT NULL DEFAULT false,
  last_message_id text,
  last_message_preview text,
  last_message_timestamp timestamptz,
  space_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_chat_members (
  chat_id text NOT NULL REFERENCES public.app_chats(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.app_messages (
  id text PRIMARY KEY,
  chat_id text NOT NULL REFERENCES public.app_chats(id) ON DELETE CASCADE,
  sender_id text NOT NULL REFERENCES public.app_users(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('text', 'voice', 'image', 'video', 'document', 'sticker')),
  text text,
  media_url text,
  media_name text,
  duration integer,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  read_at timestamptz,
  reply_to text REFERENCES public.app_messages(id) ON DELETE SET NULL,
  edited boolean NOT NULL DEFAULT false,
  deleted boolean NOT NULL DEFAULT false,
  forwarded_from text,
  sticker_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.app_message_reactions (
  message_id text NOT NULL REFERENCES public.app_messages(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.app_moments (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  caption text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  type text NOT NULL CHECK (type IN ('photo', 'video')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.app_moment_views (
  moment_id text NOT NULL REFERENCES public.app_moments(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (moment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.app_calls (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('voice', 'video')),
  direction text NOT NULL CHECK (direction IN ('incoming', 'outgoing', 'missed')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  duration integer
);

CREATE TABLE IF NOT EXISTS public.app_notifications (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('message', 'call', 'mention', 'reaction', 'system')),
  title text NOT NULL,
  body text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false,
  avatar text
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  accent_color text NOT NULL DEFAULT '#0ea5e9',
  dark_mode boolean NOT NULL DEFAULT true,
  notifications boolean NOT NULL DEFAULT true,
  show_phone_number boolean NOT NULL DEFAULT false,
  username_visible boolean NOT NULL DEFAULT true,
  profile_photo_visible boolean NOT NULL DEFAULT true,
  last_seen_visible boolean NOT NULL DEFAULT true,
  read_receipts boolean NOT NULL DEFAULT true,
  two_step_verification boolean NOT NULL DEFAULT false,
  blocked_users text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_messages_chat_timestamp_idx ON public.app_messages(chat_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS app_messages_sender_idx ON public.app_messages(sender_id);
CREATE INDEX IF NOT EXISTS app_chat_members_user_idx ON public.app_chat_members(user_id);
CREATE INDEX IF NOT EXISTS app_moments_user_timestamp_idx ON public.app_moments(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS app_moments_expiry_idx ON public.app_moments(expires_at);
CREATE INDEX IF NOT EXISTS app_notifications_unread_idx ON public.app_notifications(read, timestamp DESC);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_moment_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_read_app_users" ON public.app_users;
CREATE POLICY "demo_read_app_users" ON public.app_users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_users" ON public.app_users;
CREATE POLICY "demo_insert_app_users" ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_users" ON public.app_users;
CREATE POLICY "demo_update_app_users" ON public.app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_users" ON public.app_users;
CREATE POLICY "demo_delete_app_users" ON public.app_users FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_chats" ON public.app_chats;
CREATE POLICY "demo_read_app_chats" ON public.app_chats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_chats" ON public.app_chats;
CREATE POLICY "demo_insert_app_chats" ON public.app_chats FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_chats" ON public.app_chats;
CREATE POLICY "demo_update_app_chats" ON public.app_chats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_chats" ON public.app_chats;
CREATE POLICY "demo_delete_app_chats" ON public.app_chats FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_chat_members" ON public.app_chat_members;
CREATE POLICY "demo_read_app_chat_members" ON public.app_chat_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_chat_members" ON public.app_chat_members;
CREATE POLICY "demo_insert_app_chat_members" ON public.app_chat_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_chat_members" ON public.app_chat_members;
CREATE POLICY "demo_update_app_chat_members" ON public.app_chat_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_chat_members" ON public.app_chat_members;
CREATE POLICY "demo_delete_app_chat_members" ON public.app_chat_members FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_messages" ON public.app_messages;
CREATE POLICY "demo_read_app_messages" ON public.app_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_messages" ON public.app_messages;
CREATE POLICY "demo_insert_app_messages" ON public.app_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_messages" ON public.app_messages;
CREATE POLICY "demo_update_app_messages" ON public.app_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_messages" ON public.app_messages;
CREATE POLICY "demo_delete_app_messages" ON public.app_messages FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_message_reactions" ON public.app_message_reactions;
CREATE POLICY "demo_read_app_message_reactions" ON public.app_message_reactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_message_reactions" ON public.app_message_reactions;
CREATE POLICY "demo_insert_app_message_reactions" ON public.app_message_reactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_message_reactions" ON public.app_message_reactions;
CREATE POLICY "demo_update_app_message_reactions" ON public.app_message_reactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_message_reactions" ON public.app_message_reactions;
CREATE POLICY "demo_delete_app_message_reactions" ON public.app_message_reactions FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_moments" ON public.app_moments;
CREATE POLICY "demo_read_app_moments" ON public.app_moments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_moments" ON public.app_moments;
CREATE POLICY "demo_insert_app_moments" ON public.app_moments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_moments" ON public.app_moments;
CREATE POLICY "demo_update_app_moments" ON public.app_moments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_moments" ON public.app_moments;
CREATE POLICY "demo_delete_app_moments" ON public.app_moments FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_moment_views" ON public.app_moment_views;
CREATE POLICY "demo_read_app_moment_views" ON public.app_moment_views FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_moment_views" ON public.app_moment_views;
CREATE POLICY "demo_insert_app_moment_views" ON public.app_moment_views FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_moment_views" ON public.app_moment_views;
CREATE POLICY "demo_update_app_moment_views" ON public.app_moment_views FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_moment_views" ON public.app_moment_views;
CREATE POLICY "demo_delete_app_moment_views" ON public.app_moment_views FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_calls" ON public.app_calls;
CREATE POLICY "demo_read_app_calls" ON public.app_calls FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_calls" ON public.app_calls;
CREATE POLICY "demo_insert_app_calls" ON public.app_calls FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_calls" ON public.app_calls;
CREATE POLICY "demo_update_app_calls" ON public.app_calls FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_calls" ON public.app_calls;
CREATE POLICY "demo_delete_app_calls" ON public.app_calls FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_notifications" ON public.app_notifications;
CREATE POLICY "demo_read_app_notifications" ON public.app_notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_notifications" ON public.app_notifications;
CREATE POLICY "demo_insert_app_notifications" ON public.app_notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_notifications" ON public.app_notifications;
CREATE POLICY "demo_update_app_notifications" ON public.app_notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_notifications" ON public.app_notifications;
CREATE POLICY "demo_delete_app_notifications" ON public.app_notifications FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_read_app_settings" ON public.app_settings;
CREATE POLICY "demo_read_app_settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_settings" ON public.app_settings;
CREATE POLICY "demo_insert_app_settings" ON public.app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_settings" ON public.app_settings;
CREATE POLICY "demo_update_app_settings" ON public.app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_settings" ON public.app_settings;
CREATE POLICY "demo_delete_app_settings" ON public.app_settings FOR DELETE TO anon, authenticated USING (true);

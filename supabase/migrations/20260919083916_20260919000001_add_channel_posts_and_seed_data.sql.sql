/*
# Add channel posts/comments tables and seed all demo data

1. New Tables
- `app_channel_posts`: broadcast posts published in a channel (text + optional media, pinned state, view count).
- `app_channel_comments`: comments on channel posts, with optional emoji reactions stored as JSONB.
- `app_channel_post_reactions`: emoji reactions on channel posts (one per user per emoji per post).

2. Columns of note
- `app_channel_posts.channel_id` → references `app_chats(id)` ON DELETE CASCADE
- `app_channel_posts.author_id` → references `app_users(id)` ON DELETE CASCADE
- `app_channel_posts.is_pinned` / `views` — for pinned posts and view counters
- `app_channel_comments.post_id` → references `app_channel_posts(id)` ON DELETE CASCADE
- `app_channel_comments.reactions` — JSONB array of {emoji, userId} pairs

3. Security
- RLS enabled on all new tables with anon+authenticated CRUD (single-tenant demo, no real auth session).

4. Seed data
- Inserts all 12 seed users, 11 chats, 40+ messages, message reactions, 9 moments + views,
  8 calls, 5 notifications, 3 channel posts, 9 comments, 5 post reactions, and default settings.
- Uses `ON CONFLICT DO NOTHING` so re-running the migration won't duplicate rows.
*/

-- ===== Channel posts table =====
CREATE TABLE IF NOT EXISTS public.app_channel_posts (
  id text PRIMARY KEY,
  channel_id text NOT NULL REFERENCES public.app_chats(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  text text NOT NULL DEFAULT '',
  media_url text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_channel_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_read_app_channel_posts" ON public.app_channel_posts;
CREATE POLICY "demo_read_app_channel_posts" ON public.app_channel_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_channel_posts" ON public.app_channel_posts;
CREATE POLICY "demo_insert_app_channel_posts" ON public.app_channel_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_channel_posts" ON public.app_channel_posts;
CREATE POLICY "demo_update_app_channel_posts" ON public.app_channel_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_channel_posts" ON public.app_channel_posts;
CREATE POLICY "demo_delete_app_channel_posts" ON public.app_channel_posts FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS app_channel_posts_channel_idx ON public.app_channel_posts(channel_id, timestamp DESC);

-- ===== Channel post reactions =====
CREATE TABLE IF NOT EXISTS public.app_channel_post_reactions (
  post_id text NOT NULL REFERENCES public.app_channel_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id, emoji)
);

ALTER TABLE public.app_channel_post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_read_app_channel_post_reactions" ON public.app_channel_post_reactions;
CREATE POLICY "demo_read_app_channel_post_reactions" ON public.app_channel_post_reactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_channel_post_reactions" ON public.app_channel_post_reactions;
CREATE POLICY "demo_insert_app_channel_post_reactions" ON public.app_channel_post_reactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_channel_post_reactions" ON public.app_channel_post_reactions;
CREATE POLICY "demo_update_app_channel_post_reactions" ON public.app_channel_post_reactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_channel_post_reactions" ON public.app_channel_post_reactions;
CREATE POLICY "demo_delete_app_channel_post_reactions" ON public.app_channel_post_reactions FOR DELETE TO anon, authenticated USING (true);

-- ===== Channel comments table =====
CREATE TABLE IF NOT EXISTS public.app_channel_comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES public.app_channel_posts(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  text text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  reactions jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.app_channel_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_read_app_channel_comments" ON public.app_channel_comments;
CREATE POLICY "demo_read_app_channel_comments" ON public.app_channel_comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_insert_app_channel_comments" ON public.app_channel_comments;
CREATE POLICY "demo_insert_app_channel_comments" ON public.app_channel_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_update_app_channel_comments" ON public.app_channel_comments;
CREATE POLICY "demo_update_app_channel_comments" ON public.app_channel_comments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_delete_app_channel_comments" ON public.app_channel_comments;
CREATE POLICY "demo_delete_app_channel_comments" ON public.app_channel_comments FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS app_channel_comments_post_idx ON public.app_channel_comments(post_id, timestamp ASC);

-- ===== SEED DATA (idempotent via ON CONFLICT DO NOTHING) =====

-- Users
INSERT INTO app_users (id, name, username, phone, avatar, bio, status, is_online, last_seen, is_verified) VALUES
('u_me', 'Alex Rivera', '@alexrivera', '+1 (415) 555-0192', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', 'Designer & coffee enthusiast. Building beautiful things.', 'Available', true, NULL, true),
('u_sofia', 'Sofia Nakamura', '@sofiadesigns', '+1 (628) 555-0143', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', 'Product designer at Lumen. Pixel perfectionist.', 'In a meeting', true, 'online', true),
('u_marcus', 'Marcus Bellingham', '@marcusb', '+1 (917) 555-0267', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200', 'Frontend dev. TypeScript enthusiast.', NULL, false, '2m ago', false),
('u_priya', 'Priya Sharma', '@priyacodes', '+44 20 7946 0312', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', 'AI researcher. Dog mom. Tea over coffee.', '✨ Building something cool', true, 'online', false),
('u_leon', 'Leon Okonkwo', '@leonpixel', '+234 803 555 0188', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', 'Visual artist & illustrator. Lagos → Berlin.', NULL, false, '1h ago', false),
('u_ella', 'Ela Castellanos', '@elacast', '+34 612 555 077', 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200', 'Photographer. Wanderer. Cat person.', NULL, true, 'online', false),
('u_james', 'James Wright', '@jwright', '+1 (650) 555-0351', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200', 'Startup founder. Always shipping.', NULL, false, '5h ago', true),
('u_amara', 'Amara Chen', '@amarachen', '+65 8123 5550', 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=200', 'Music producer. Lo-fi beats & jazz.', NULL, false, '1d ago', false),
('u_diego', 'Diego Morales', '@diegom', '+52 55 5555 0199', 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200', 'Travel vlogger. 47 countries and counting.', NULL, true, 'online', false),
('u_natasha', 'Natasha Volkov', '@natashav', '+7 921 555 0144', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', 'UX writer. Word nerd. Plant killer (accidentally).', NULL, false, '3h ago', false),
('u_omar', 'Omar Hassan', '@omarhassan', '+971 50 555 0233', 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=200', 'Fintech builder. Crypto curious.', NULL, true, 'online', false),
('u_luna', 'Luna Park', '@lunapark', '+82 10 5555 0178', 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=200', 'Illustrator & comic artist. Seoul-based.', NULL, false, '12m ago', false)
ON CONFLICT (id) DO NOTHING;

-- Chats
INSERT INTO app_chats (id, type, name, avatar, description, member_count, subscriber_count, is_public, unread_count, is_pinned, is_muted, last_message_id, last_message_preview, last_message_timestamp, space_id) VALUES
('c_sofia', 'dm', 'Sofia Nakamura', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', NULL, NULL, NULL, false, 3, true, false, 'm8', 'Let me know what you think of that voice note!', now() - interval '12 minutes', NULL),
('c_lumen_channel', 'channel', 'Lumen', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200', 'The official Lumen channel. Product updates, design insights, and community news.', NULL, 12847, true, 2, true, false, 'p3', 'Beta tester sign-ups are OPEN! Only 3 spots left...', now() - interval '1 hour', 's_lumen'),
('c_lumen_group', 'group', 'Lumen Community', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200', 'Discussion group for the Lumen community.', 248, NULL, false, 5, false, false, 'm95', 'Just posted a sneak peek of the new theme in the channel!', now() - interval '3 hours', 's_lumen'),
('c_priya', 'dm', 'Priya Sharma', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', NULL, NULL, NULL, false, 1, false, false, 'm24', '🐾', now() - interval '3 minutes', NULL),
('c_design_team', 'group', 'Design Team', 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=200', 'Internal design team chat', 6, NULL, false, 2, false, false, 'm66', 'Reminder: please vote on the poll above so we know about catering', now() - interval '30 minutes', NULL),
('c_ella', 'dm', 'Ela Castellanos', 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200', NULL, NULL, NULL, false, 1, false, false, 'm33', 'I''m flying back to Madrid this weekend. We should catch up!', now() - interval '40 minutes', NULL),
('c_marcus', 'dm', 'Marcus Bellingham', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200', NULL, NULL, NULL, false, 1, false, true, 'm13', 'Also — are we still on for the team sync tomorrow?', now() - interval '1 hour', NULL),
('c_hikers', 'group', 'Weekend Hikers', 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=200', 'Weekend hiking crew', 8, NULL, false, 1, false, false, 'm75', 'Count me in too! I''ll make a playlist for the drive', now() - interval '2 hours', NULL),
('c_music', 'group', 'Music Producers', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=200', 'Beat makers & producers', 15, NULL, false, 1, false, false, 'm84', 'On it! Will send something back by tonight', now() - interval '55 minutes', NULL),
('c_leon', 'dm', 'Leon Okonkwo', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', NULL, NULL, NULL, false, 0, false, false, 'm43', 'Wouldn''t miss it.', now() - interval '17 hours', NULL),
('c_natasha', 'dm', 'Natasha Volkov', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', NULL, NULL, NULL, false, 0, false, false, 'm53', 'The microcopy for the empty states is my favorite part.', now() - interval '8 hours', NULL)
ON CONFLICT (id) DO NOTHING;

-- Messages
INSERT INTO app_messages (id, chat_id, sender_id, type, text, media_url, media_name, duration, timestamp, status, read_at, reply_to, edited, deleted, forwarded_from, sticker_url) VALUES
('m1', 'c_sofia', 'u_sofia', 'text', 'Hey! Did you see the new design system I shared? 🎨', NULL, NULL, NULL, now() - interval '5 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m2', 'c_sofia', 'u_me', 'text', 'Yes! The color palette is gorgeous. Love the coral accents.', NULL, NULL, NULL, now() - interval '4 hours 48 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m3', 'c_sofia', 'u_sofia', 'text', 'Thanks! I was going for something warm but still premium. Can we hop on a call later to review the components?', NULL, NULL, NULL, now() - interval '4 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m4', 'c_sofia', 'u_me', 'text', 'Absolutely. How about 3pm?', NULL, NULL, NULL, now() - interval '4 hours 18 minutes', 'read', now() - interval '4 hours 12 minutes', NULL, false, false, NULL, NULL),
('m5', 'c_sofia', 'u_sofia', 'text', 'Perfect 🙌', NULL, NULL, NULL, now() - interval '4 hours 6 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m6', 'c_sofia', 'u_sofia', 'image', 'Here''s the updated card component', 'https://images.pexels.com/photos/1966448/pexels-photo-1966448.jpeg?auto=compress&cs=tinysrgb&w=400', NULL, NULL, now() - interval '2 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m7', 'c_sofia', 'u_sofia', 'voice', NULL, NULL, NULL, 23, now() - interval '15 minutes', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m8', 'c_sofia', 'u_sofia', 'text', 'Let me know what you think of that voice note when you get a sec!', NULL, NULL, NULL, now() - interval '12 minutes', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m10', 'c_marcus', 'u_marcus', 'text', 'Did you push the fix for the chat scroll bug?', NULL, NULL, NULL, now() - interval '8 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m11', 'c_marcus', 'u_me', 'text', 'Yeah, it was a useRef cleanup issue. Should be solid now.', NULL, NULL, NULL, now() - interval '7 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m12', 'c_marcus', 'u_marcus', 'document', 'Here''s the diff if you want to review', '#', 'chat-fix-diff.pdf', NULL, now() - interval '7 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m13', 'c_marcus', 'u_marcus', 'text', 'Also — are we still on for the team sync tomorrow?', NULL, NULL, NULL, now() - interval '1 hour', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m20', 'c_priya', 'u_priya', 'text', 'OMG you have to see this AI demo 🤯', NULL, NULL, NULL, now() - interval '3 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m21', 'c_priya', 'u_priya', 'video', 'It can generate UI from sketches!', 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400', NULL, NULL, now() - interval '2 hours 54 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m22', 'c_priya', 'u_me', 'text', 'That''s insane. Is the model open source?', NULL, NULL, NULL, now() - interval '2 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m23', 'c_priya', 'u_priya', 'text', 'Not yet but they said they''re releasing weights next month', NULL, NULL, NULL, now() - interval '2 hours 18 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m24', 'c_priya', 'u_priya', 'sticker', '', NULL, NULL, NULL, now() - interval '3 minutes', 'delivered', NULL, NULL, false, false, NULL, '🐾'),
('m30', 'c_ella', 'u_ella', 'image', 'Golden hour in Lisbon today 🌅', 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=400', NULL, NULL, now() - interval '6 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m31', 'c_ella', 'u_me', 'text', 'Unreal. You always find the best light.', NULL, NULL, NULL, now() - interval '5 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m32', 'c_ella', 'u_ella', 'text', 'It''s all about patience 😊 how are things on your end?', NULL, NULL, NULL, now() - interval '5 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m33', 'c_ella', 'u_ella', 'text', 'I''m flying back to Madrid this weekend. We should catch up!', NULL, NULL, NULL, now() - interval '40 minutes', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m40', 'c_leon', 'u_leon', 'image', 'Working on a new series — what do you think of this composition?', 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=400', NULL, NULL, now() - interval '20 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m41', 'c_leon', 'u_me', 'text', 'The negative space is *chef''s kiss*. Is this for the Berlin show?', NULL, NULL, NULL, now() - interval '19 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m42', 'c_leon', 'u_leon', 'text', 'Yes! Opening night is the 28th. You coming?', NULL, NULL, NULL, now() - interval '18 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m43', 'c_leon', 'u_me', 'text', 'Wouldn''t miss it.', NULL, NULL, NULL, now() - interval '17 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m50', 'c_natasha', 'u_natasha', 'text', 'I rewrote the onboarding copy. Want to take a look?', NULL, NULL, NULL, now() - interval '10 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m51', 'c_natasha', 'u_me', 'text', 'Send it over!', NULL, NULL, NULL, now() - interval '9 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m52', 'c_natasha', 'u_natasha', 'document', '', '#', 'onboarding-copy-v3.docx', NULL, now() - interval '8 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m53', 'c_natasha', 'u_natasha', 'text', 'The microcopy for the empty states is my favorite part. Let me know if anything feels off.', NULL, NULL, NULL, now() - interval '8 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m60', 'c_design_team', 'u_sofia', 'text', 'Team! Design review at 2pm today. Please bring your latest mockups.', NULL, NULL, NULL, now() - interval '6 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m61', 'c_design_team', 'u_ella', 'text', 'I''ll have the photography guidelines ready', NULL, NULL, NULL, now() - interval '5 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m62', 'c_design_team', 'u_leon', 'text', 'Working on the icon set updates now', NULL, NULL, NULL, now() - interval '5 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m63', 'c_design_team', 'u_me', 'text', 'I''ll present the component library audit', NULL, NULL, NULL, now() - interval '4 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m64', 'c_design_team', 'u_natasha', 'text', 'I dropped new copy suggestions in the shared doc. Focus on the empty states section.', NULL, NULL, NULL, now() - interval '3 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m65', 'c_design_team', 'u_sofia', 'text', 'Perfect. Don''t forget we have the client walkthrough on Friday!', NULL, NULL, NULL, now() - interval '90 minutes', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m66', 'c_design_team', 'u_leon', 'text', 'Reminder: please vote on the poll above so we know about catering', NULL, NULL, NULL, now() - interval '30 minutes', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m70', 'c_hikers', 'u_diego', 'image', 'Found this trail for Saturday — looks incredible 🏔️', 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400', NULL, NULL, now() - interval '26 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m71', 'c_hikers', 'u_ella', 'text', 'That view! What''s the difficulty level?', NULL, NULL, NULL, now() - interval '25 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m72', 'c_hikers', 'u_diego', 'text', 'Moderate. About 8km with 400m elevation gain.', NULL, NULL, NULL, now() - interval '24 hours 30 minutes', 'read', NULL, NULL, false, false, NULL, NULL),
('m73', 'c_hikers', 'u_me', 'text', 'I''m in. What time do we start?', NULL, NULL, NULL, now() - interval '24 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m74', 'c_hikers', 'u_diego', 'text', '7am at the trailhead parking lot. Bring water and snacks!', NULL, NULL, NULL, now() - interval '23 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m75', 'c_hikers', 'u_amara', 'text', 'Count me in too! I''ll make a playlist for the drive', NULL, NULL, NULL, now() - interval '2 hours', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m80', 'c_music', 'u_amara', 'text', 'New beat drop. Lo-fi meets synthwave. Thoughts?', NULL, NULL, NULL, now() - interval '12 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m81', 'c_music', 'u_me', 'text', 'The bass line is fire 🔥', NULL, NULL, NULL, now() - interval '11 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m82', 'c_music', 'u_luna', 'text', 'Can you send the stems? I want to try something with the bridge', NULL, NULL, NULL, now() - interval '10 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m83', 'c_music', 'u_amara', 'document', 'Here you go! Can''t wait to hear what you do with it', '#', 'midnight-stems.zip', NULL, now() - interval '9 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m84', 'c_music', 'u_luna', 'text', 'On it! Will send something back by tonight', NULL, NULL, NULL, now() - interval '55 minutes', 'delivered', NULL, NULL, false, false, NULL, NULL),
('m90', 'c_lumen_group', 'u_james', 'text', 'Welcome to the Lumen Community discussion group! This is where we talk about everything product, design, and community.', NULL, NULL, NULL, now() - interval '48 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m91', 'c_lumen_group', 'u_sofia', 'text', 'So excited to have everyone here! We''ll be sharing behind-the-scenes design work regularly.', NULL, NULL, NULL, now() - interval '47 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m92', 'c_lumen_group', 'u_omar', 'text', 'Quick question — will there be a beta program for new features?', NULL, NULL, NULL, now() - interval '46 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m93', 'c_lumen_group', 'u_james', 'text', 'Yes! We''ll open beta signups through the channel next week. Stay tuned.', NULL, NULL, NULL, now() - interval '45 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m94', 'c_lumen_group', 'u_me', 'text', 'This is such a great initiative. Looking forward to the community growing here!', NULL, NULL, NULL, now() - interval '20 hours', 'read', NULL, NULL, false, false, NULL, NULL),
('m95', 'c_lumen_group', 'u_sofia', 'text', 'Just posted a sneak peek of the new theme in the channel. Check it out!', NULL, NULL, NULL, now() - interval '3 hours', 'delivered', NULL, NULL, false, false, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Message reactions
INSERT INTO app_message_reactions (message_id, user_id, emoji) VALUES
('m2', 'u_sofia', '❤️'),
('m6', 'u_me', '🔥'),
('m11', 'u_marcus', '👍'),
('m21', 'u_me', '🤯'),
('m21', 'u_priya', '🔥'),
('m30', 'u_me', '😍'),
('m30', 'u_me', '🌅'),
('m43', 'u_leon', '🎉'),
('m60', 'u_me', '👍'),
('m60', 'u_ella', '👍'),
('m60', 'u_leon', '👍'),
('m63', 'u_sofia', '🙌'),
('m70', 'u_me', '🔥'),
('m70', 'u_ella', '🏔️'),
('m73', 'u_diego', '👍'),
('m75', 'u_me', '🎶'),
('m81', 'u_amara', '🔥'),
('m83', 'u_luna', '🎉'),
('m90', 'u_me', '👋'),
('m90', 'u_sofia', '👋'),
('m90', 'u_omar', '👋'),
('m93', 'u_omar', '🚀'),
('m93', 'u_me', '🚀'),
('m94', 'u_james', '❤️')
ON CONFLICT (message_id, user_id, emoji) DO NOTHING;

-- Moments
INSERT INTO app_moments (id, user_id, media_url, caption, timestamp, type) VALUES
('mo0', 'u_me', 'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=400', 'Morning coffee run ☕', now() - interval '1 hour', 'photo'),
('mo1', 'u_sofia', 'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=400', 'Designing in the zone ✨', now() - interval '2 hours', 'photo'),
('mo2', 'u_sofia', 'https://images.pexels.com/photos/317356/pexels-photo-317356.jpeg?auto=compress&cs=tinysrgb&w=400', 'New desk setup', now() - interval '1 hour', 'photo'),
('mo3', 'u_priya', 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400', 'AI lab life 🤖', now() - interval '3 hours', 'photo'),
('mo4', 'u_ella', 'https://images.pexels.com/photos/35888/amazing-beautiful-breathtaking-clouds.jpg?auto=compress&cs=tinysrgb&w=400', 'Lisbon sunsets never get old 🌅', now() - interval '4 hours', 'photo'),
('mo5', 'u_diego', 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400', 'On top of the world 🏔️', now() - interval '6 hours', 'photo'),
('mo6', 'u_leon', 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=400', 'Studio session', now() - interval '8 hours', 'photo'),
('mo7', 'u_amara', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400', 'Late night in the studio 🎵', now() - interval '10 hours', 'photo'),
('mo8', 'u_luna', 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400', 'New comic drops Friday!', now() - interval '14 hours', 'photo')
ON CONFLICT (id) DO NOTHING;

-- Moment views
INSERT INTO app_moment_views (moment_id, user_id) VALUES
('mo4', 'u_me'),
('mo6', 'u_me')
ON CONFLICT (moment_id, user_id) DO NOTHING;

-- Calls
INSERT INTO app_calls (id, user_id, type, direction, timestamp, duration) VALUES
('call1', 'u_sofia', 'video', 'outgoing', now() - interval '2 hours 30 minutes', 1820),
('call2', 'u_marcus', 'voice', 'incoming', now() - interval '8 hours', 340),
('call3', 'u_priya', 'voice', 'outgoing', now() - interval '14 hours', 720),
('call4', 'u_ella', 'video', 'missed', now() - interval '20 hours', NULL),
('call5', 'u_james', 'voice', 'incoming', now() - interval '28 hours', 600),
('call6', 'u_leon', 'video', 'outgoing', now() - interval '48 hours', 2400),
('call7', 'u_diego', 'voice', 'missed', now() - interval '52 hours', NULL),
('call8', 'u_natasha', 'voice', 'incoming', now() - interval '72 hours', 180)
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO app_notifications (id, type, title, body, timestamp, read, avatar) VALUES
('n1', 'message', 'Sofia Nakamura', 'Let me know what you think of that voice note!', now() - interval '12 minutes', false, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'),
('n2', 'message', 'Priya Sharma', 'Sent a sticker', now() - interval '3 minutes', false, 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200'),
('n3', 'reaction', 'Sofia Nakamura', 'reacted ❤️ to your message', now() - interval '1 hour', true, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'),
('n4', 'call', 'Missed video call', 'from Ela Castellanos', now() - interval '20 hours', true, 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200'),
('n5', 'system', 'Ess Gram', 'Two-step verification is now available. Enable it in Settings → Privacy.', now() - interval '48 hours', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- Channel posts
INSERT INTO app_channel_posts (id, channel_id, author_id, text, media_url, timestamp, is_pinned, views) VALUES
('p1', 'c_lumen_channel', 'u_james', 'Lumen 2.0 is shaping up beautifully. Here''s a sneak peek at our new glassmorphism design language — every surface is designed to feel depth-rich, tactile, and alive. We can''t wait to share more with you all. The beta is right around the corner. 🚀', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600', now() - interval '24 hours', true, 12847),
('p2', 'c_lumen_channel', 'u_sofia', 'A closer look at our color system. We chose deep navy surfaces with violet, pink, and coral accents to create a palette that feels both calm and expressive. Every color has a 10-shade ramp for maximum flexibility. What do you think of the direction? 🎨', 'https://images.pexels.com/photos/13450828/pexels-photo-13450828.jpeg?auto=compress&cs=tinysrgb&w=600', now() - interval '3 hours', false, 5234),
('p3', 'c_lumen_channel', 'u_james', '📣 Beta tester sign-ups are OPEN! We''re looking for 500 passionate community members to test Lumen 2.0 before public launch. As a beta tester you''ll get early access, a direct line to our team, and an exclusive founder badge on your profile. Only 3 spots left out of the initial 50!', NULL, now() - interval '1 hour', false, 3201)
ON CONFLICT (id) DO NOTHING;

-- Channel post reactions
INSERT INTO app_channel_post_reactions (post_id, user_id, emoji) VALUES
('p1', 'u_omar', '🔥'),
('p1', 'u_priya', '🔥'),
('p1', 'u_ella', '❤️'),
('p1', 'u_me', '🚀'),
('p1', 'u_leon', '👏'),
('p2', 'u_ella', '😍'),
('p2', 'u_leon', '🎨'),
('p2', 'u_me', '❤️'),
('p2', 'u_omar', '🔥'),
('p3', 'u_omar', '🚀'),
('p3', 'u_priya', '🚀'),
('p3', 'u_leon', '🎉'),
('p3', 'u_ella', '🙌'),
('p3', 'u_me', '🚀')
ON CONFLICT (post_id, user_id, emoji) DO NOTHING;

-- Channel comments
INSERT INTO app_channel_comments (id, post_id, author_id, text, timestamp, reactions) VALUES
('cm1', 'p1', 'u_omar', 'This is stunning. The attention to detail is next level!', now() - interval '23 hours', '[{"emoji":"🔥","userId":"u_james"}]'::jsonb),
('cm2', 'p1', 'u_priya', 'The micro-interactions are so smooth. What animation library are you using?', now() - interval '22 hours', '[]'::jsonb),
('cm3', 'p1', 'u_james', 'Built from scratch with custom springs. We''ll share a technical breakdown soon!', now() - interval '21 hours', '[{"emoji":"👏","userId":"u_omar"},{"emoji":"👏","userId":"u_priya"}]'::jsonb),
('cm4', 'p1', 'u_luna', 'Can''t wait for the beta! Signed up immediately.', now() - interval '18 hours', '[]'::jsonb),
('cm5', 'p2', 'u_ella', 'The coral accents are my favorite part. Very warm and inviting.', now() - interval '2 hours 30 minutes', '[{"emoji":"❤️","userId":"u_sofia"}]'::jsonb),
('cm6', 'p2', 'u_marcus', 'Any chance of a light mode too?', now() - interval '2 hours', '[]'::jsonb),
('cm7', 'p2', 'u_james', 'Light mode is in the works! Beta will ship with dark first though.', now() - interval '90 minutes', '[{"emoji":"👍","userId":"u_marcus"}]'::jsonb),
('cm8', 'p3', 'u_leon', '3 spots left! If you''re on the fence, just do it. The community is amazing.', now() - interval '45 minutes', '[{"emoji":"🙌","userId":"u_omar"}]'::jsonb),
('cm9', 'p3', 'u_diego', 'Just signed up. Looking forward to it!', now() - interval '20 minutes', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Default settings
INSERT INTO app_settings (id, accent_color, dark_mode, notifications, show_phone_number, username_visible, profile_photo_visible, last_seen_visible, read_receipts, two_step_verification, blocked_users) VALUES
('demo', '#0ea5e9', true, true, false, true, true, true, true, false, '{}')
ON CONFLICT (id) DO NOTHING;
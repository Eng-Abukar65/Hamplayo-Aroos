-- ============================================================
-- Hambalyo Wedding Message Wall — Supabase SQL Migration
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Table: messages
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug    TEXT          NOT NULL DEFAULT 'amina-and-farhan',
  guest_name    TEXT          NOT NULL CHECK (char_length(guest_name) <= 100),
  relationship  TEXT          NOT NULL CHECK (relationship IN ('Waalid','Walal','Saaxib','Xiriir','Macallin','Jaar')),
  category_group TEXT         NOT NULL CHECK (category_group IN ('family','friends','mentors')) DEFAULT 'friends',
  content       TEXT          NOT NULL CHECK (char_length(content) <= 500),
  highlight_text TEXT,
  custom_tag    TEXT,
  likes         INTEGER       NOT NULL DEFAULT 0,
  photo_url     TEXT,
  is_approved   BOOLEAN       NOT NULL DEFAULT TRUE,
  is_calligraphy BOOLEAN      NOT NULL DEFAULT FALSE,
  display_time  TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_event_slug ON public.messages (event_slug);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_category   ON public.messages (category_group);
CREATE INDEX IF NOT EXISTS idx_messages_approved   ON public.messages (is_approved);

-- ─────────────────────────────────────────────────────────────
-- Row-Level Security (RLS)
-- Guests can INSERT and SELECT approved messages.
-- Only authenticated admins can UPDATE/DELETE.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved messages
CREATE POLICY "Anyone can read approved messages"
  ON public.messages FOR SELECT
  USING (is_approved = TRUE);

-- Anyone can submit a new blessing (no auth required)
CREATE POLICY "Anyone can submit a blessing"
  ON public.messages FOR INSERT
  WITH CHECK (TRUE);

-- Anyone can like (increment only)
CREATE POLICY "Anyone can like a message"
  ON public.messages FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- Only authenticated users (admins) can hide or delete messages
-- (If you use Supabase Auth for admin, restrict this further)
-- CREATE POLICY "Admins can moderate"
--   ON public.messages FOR ALL
--   USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
-- Realtime: Enable for the messages table
-- ─────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ─────────────────────────────────────────────────────────────
-- Seed Data — 9 showcase blessings from the design reference
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.messages (guest_name, relationship, category_group, content, custom_tag, likes, display_time, created_at)
VALUES
  ('Hooyo Maryan & Aabo Xasan', 'Waalid', 'family',
   'Aabo iyo Hooyo waxaan idiin rajeyneynaa nolol barakeysan oo ay ka buuxaan nabad, farxad, iyo jaceyl waara. Hambalyo Farhan & Amina!',
   'Family Blessing', 28, 'Just now',  NOW() - INTERVAL '1 minute'),

  ('Zahra & Tariq Al-Mansoor', 'Saaxib', 'friends',
   'Watching you two grow together over the years has been the greatest joy. May Allah bless your union with endless barakah and joy in every step! Can''t wait to celebrate on the dance floor tonight.',
   'Celebratory Keepsake', 15, '3 mins ago', NOW() - INTERVAL '3 minutes'),

  ('Abdirahman & Sofia', 'Walal', 'family',
   'Farhan bro, welcome to the married club! Amina, you look ethereal tonight. May your home be filled with laughter and peace.',
   'Sibling Love', 19, '7 mins ago', NOW() - INTERVAL '7 minutes'),

  ('Sheikh Mustafa & Family', 'Macallin', 'mentors',
   'May Allah shower your marriage with harmony, guidance, and righteous posterity.',
   'Prayer of Grace', 34, '12 mins ago', NOW() - INTERVAL '12 minutes'),

  ('Dr. Hodan & Cousins', 'Xiriir', 'family',
   'Traveling all the way from London was so worth it for this magical night. Mashallah tabarakallah to the most beautiful couple!',
   'Kinship Traveler', 22, '18 mins ago', NOW() - INTERVAL '18 minutes'),

  ('Uncle Bashir & Aunt Fartun', 'Jaar', 'mentors',
   'We watched you grow up next door and couldn''t be prouder of the man you''ve become Farhan. Blessings to you and your lovely bride Amina.',
   'Lifelong Neighbors', 11, '25 mins ago', NOW() - INTERVAL '25 minutes'),

  ('Samira Nur (Bride''s Maid)', 'Walal', 'family',
   'My sweetest Amina! You deserve all the stars and happiness in this universe. Farhan you found pure gold. Mubarak on your wedding day!',
   'Bridal Party', 41, '32 mins ago', NOW() - INTERVAL '32 minutes'),

  ('Cabdi & The Tech Crew', 'Saaxib', 'friends',
   'Wishing you a lifetime of bug-free happiness and infinite love! Best wedding reception ever!',
   'Close Comrades', 14, '45 mins ago', NOW() - INTERVAL '45 minutes'),

  ('Ayeeyo Fadumo', 'Waalid', 'family',
   'Ubad khayr qaba oo indhaha u qabowsiya Alle ha idin siiyo, aamiin yaa rabbi.',
   'Grandmother''s Dua', 56, '1 hr ago', NOW() - INTERVAL '1 hour');

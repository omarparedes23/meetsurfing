-- ============================================================
-- Spanish Club Moscow — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM: event type
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('friday', 'party');
  END IF;
END
$$;

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT          NOT NULL,
  description       TEXT,
  date              TIMESTAMPTZ   NOT NULL,
  location_name     TEXT          NOT NULL DEFAULT 'Casa Agave',
  location_url      TEXT,                          -- Yandex/Google Maps URL
  type              event_type    NOT NULL DEFAULT 'friday',
  price             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  telegram_bot_link TEXT,                          -- Payment bot link for paid events
  cover_image_url   TEXT,                          -- URL from Supabase Storage
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for querying upcoming events by date (most common query)
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date ASC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);

-- ============================================================
-- TABLE: gallery
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID        REFERENCES events(id) ON DELETE SET NULL,
  image_url    TEXT        NOT NULL,
  caption      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_event_id  ON gallery (event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Public read, no public write
-- ============================================================

ALTER TABLE events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read events
CREATE POLICY "Public read events"
  ON events FOR SELECT
  USING (true);

-- Allow anyone to read gallery
CREATE POLICY "Public read gallery"
  ON gallery FOR SELECT
  USING (true);

-- NOTE: Inserts/updates/deletes are done via Supabase Dashboard
-- or a server-side admin client with the service_role key.
-- Do NOT expose service_role key to the frontend.

-- ============================================================
-- STORAGE BUCKET
-- Run these in: Supabase Dashboard > Storage > Policies
-- Or via SQL as shown below
-- ============================================================

-- Create the 'gallery' bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read files from 'gallery' bucket
CREATE POLICY "Public read gallery storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- ============================================================
-- SAMPLE DATA (optional — uncomment to insert test events)
-- ============================================================

/*
INSERT INTO events (title, description, date, location_name, location_url, type, price, telegram_bot_link)
VALUES
  (
    'Viernes en Casa Agave — Charla libre',
    'Reunión semanal gratuita. Charla en español y ruso, música latina, ambiente nocturno. ¡Todos bienvenidos!',
    NOW() + INTERVAL '3 days',
    'Casa Agave',
    'https://yandex.ru/maps/?text=Casa+Agave+Москва',
    'friday',
    0.00,
    NULL
  ),
  (
    'Fiesta de Primavera — Весенняя Вечеринка',
    'Fiesta temática especial de primavera. DJ, cócteles, baile latino y mucho más. Plazas limitadas.',
    NOW() + INTERVAL '14 days',
    'Club Arma Moscow',
    'https://yandex.ru/maps/?text=Arma+Moscow',
    'party',
    1500.00,
    'https://t.me/your_payment_bot'
  );
*/

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Get upcoming events ordered by date:
-- SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC;

-- Get next event:
-- SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC LIMIT 1;

-- Get gallery images for a specific event:
-- SELECT * FROM gallery WHERE event_id = 'YOUR-EVENT-UUID' ORDER BY created_at ASC;

-- Get all gallery images newest first:
-- SELECT * FROM gallery ORDER BY created_at DESC LIMIT 24;

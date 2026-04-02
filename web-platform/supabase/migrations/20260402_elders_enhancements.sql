-- Migration: Elders Enhancements
-- Adds elder_trip_stops, youth_engagement, and elder_room_settings tables
-- Date: 2026-04-02

-- ============================================================
-- 1. elder_trip_stops — dynamic trip stop data (replaces hardcoded)
-- ============================================================
CREATE TABLE IF NOT EXISTS elder_trip_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_name text NOT NULL DEFAULT 'elders-trip-2024',
  stop_order integer NOT NULL,
  name text NOT NULL,
  description text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  photos jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed the 5 existing stops from the Elders trip
INSERT INTO elder_trip_stops (trip_name, stop_order, name, description, lat, lng) VALUES
  ('elders-trip-2024', 1, 'Palm Island',          'Departing from Country with Elders and community.',              -18.753,  146.581),
  ('elders-trip-2024', 2, 'Lucinda',              'Barged over to Lucinda before the coastal journey north.',       -18.449,  146.459),
  ('elders-trip-2024', 3, 'Ingham',               'On the way to the traditional sites at Hull River.',             -18.6455, 146.1643),
  ('elders-trip-2024', 4, 'Hull River',            'Return journey to place and memory.',                            -17.865,  146.102),
  ('elders-trip-2024', 5, 'Lucinda',              'Barged back to Lucinda at the end of the trip.',                 -18.449,  146.459);

-- RLS
ALTER TABLE elder_trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read trip stops"
  ON elder_trip_stops FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert trip stops"
  ON elder_trip_stops FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update trip stops"
  ON elder_trip_stops FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete trip stops"
  ON elder_trip_stops FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- 2. youth_engagement — youth questions, reflections, responses
-- ============================================================
CREATE TABLE IF NOT EXISTS youth_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id uuid REFERENCES profiles(id),
  story_id uuid REFERENCES stories(id),
  quote_id uuid,
  engagement_type text NOT NULL CHECK (engagement_type IN ('question', 'response', 'reflection', 'connection_request')),
  content text NOT NULL,
  author_name text,
  author_age_group text CHECK (author_age_group IN ('under-12', '12-17', '18-25', '26-35')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  elder_responded boolean DEFAULT false,
  elder_response text,
  elder_responded_at timestamptz,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE youth_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit youth engagements"
  ON youth_engagement FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "Authenticated can view youth engagements"
  ON youth_engagement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view approved engagements"
  ON youth_engagement FOR SELECT
  TO anon
  USING (status = 'approved' AND is_public = true);

CREATE POLICY "Authenticated can update youth engagements"
  ON youth_engagement FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. elder_room_settings — per-elder curation preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS elder_room_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id uuid REFERENCES profiles(id) UNIQUE,
  display_name_override text,
  welcome_message text,
  featured_quote_ids uuid[] DEFAULT '{}',
  featured_story_ids uuid[] DEFAULT '{}',
  hidden_content_ids uuid[] DEFAULT '{}',
  sharing_preferences jsonb DEFAULT '{"allow_external": false, "allow_youth_engagement": true}',
  theme_preference text DEFAULT 'default',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE elder_room_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view elder room settings"
  ON elder_room_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can insert their own settings"
  ON elder_room_settings FOR INSERT
  TO authenticated
  WITH CHECK (elder_id = auth.uid());

CREATE POLICY "Owners can update their own settings"
  ON elder_room_settings FOR UPDATE
  TO authenticated
  USING (elder_id = auth.uid())
  WITH CHECK (elder_id = auth.uid());

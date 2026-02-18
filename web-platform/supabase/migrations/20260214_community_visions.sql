-- Community Visions table for PICC 20th Anniversary
-- Stores aspirations and visions from community members

CREATE TABLE IF NOT EXISTS community_visions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vision_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'services', 'culture', 'youth', 'economic', 'environment', 'governance', 'other'
  )),
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'explore-chat',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  related_themes TEXT[]
);

-- RLS policies
ALTER TABLE community_visions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a vision
CREATE POLICY "Anyone can submit visions"
  ON community_visions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only approved visions are publicly visible
CREATE POLICY "Public can view approved visions"
  ON community_visions
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

-- Admin can manage all visions
CREATE POLICY "Admin full access to visions"
  ON community_visions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_community_visions_category ON community_visions(category);
CREATE INDEX IF NOT EXISTS idx_community_visions_approved ON community_visions(is_approved, created_at DESC);

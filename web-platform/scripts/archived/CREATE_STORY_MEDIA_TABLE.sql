-- ============================================================================
-- CREATE STORY_MEDIA TABLE
-- Links photos, videos, and audio files to stories
-- ============================================================================

-- Create the table
CREATE TABLE IF NOT EXISTS story_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Story Connection
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Media Details
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'audio', 'document')),
  file_path TEXT NOT NULL,
  supabase_bucket TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,

  -- Media Analysis (for future AI features)
  media_embedding vector(512), -- For image search
  ml_analysis JSONB, -- Face/place/object detection results

  -- Permissions
  requires_permission BOOLEAN DEFAULT FALSE,
  people_in_media UUID[], -- References to profiles
  all_permissions_obtained BOOLEAN DEFAULT FALSE,

  -- Display & Accessibility
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,

  -- Status
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS story_media_story_id_idx ON story_media(story_id);
CREATE INDEX IF NOT EXISTS story_media_media_type_idx ON story_media(media_type);
CREATE INDEX IF NOT EXISTS story_media_display_order_idx ON story_media(display_order);
CREATE INDEX IF NOT EXISTS story_media_is_public_idx ON story_media(is_public);

-- Enable Row Level Security
ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;

-- Policy: Public media viewable by everyone
CREATE POLICY "Public media viewable by all" ON story_media
  FOR SELECT
  USING (
    is_public = TRUE
    AND EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_media.story_id
      AND stories.is_public = TRUE
      AND stories.status = 'published'
    )
  );

-- Policy: Users can upload media to their own stories
CREATE POLICY "Users can upload media to own stories" ON story_media
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_media.story_id
      AND stories.storyteller_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can update/delete media from their own stories
CREATE POLICY "Users can manage own story media" ON story_media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_media.story_id
      AND stories.storyteller_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_story_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_media_updated_at_trigger
  BEFORE UPDATE ON story_media
  FOR EACH ROW
  EXECUTE FUNCTION update_story_media_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ story_media table created successfully!';
  RAISE NOTICE '📸 Ready to upload photos, videos, and audio';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run setup_image_storage.sql to create Storage buckets';
END $$;

-- Verify the table was created
SELECT
  'story_media' as table_name,
  COUNT(*) as row_count,
  '✅ Table ready for media uploads' as status
FROM story_media;
[
  {
    "table_name": "story_media",
    "row_count": 0,
    "status": "✅ Table ready for media uploads"
  }
]
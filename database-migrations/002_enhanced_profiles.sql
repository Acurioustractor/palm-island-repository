-- Enhanced Profiles Database Schema
-- Run this in Supabase SQL Editor

-- 1. Storyteller Photos Table
CREATE TABLE IF NOT EXISTS storyteller_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  supabase_bucket TEXT DEFAULT 'storyteller-photos',
  caption TEXT,
  photo_type TEXT CHECK (photo_type IN ('portrait', 'event', 'family', 'historical', 'other')),
  taken_date DATE,
  uploaded_by UUID REFERENCES profiles(id),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_storyteller_photos_storyteller ON storyteller_photos(storyteller_id);
CREATE INDEX idx_storyteller_photos_primary ON storyteller_photos(storyteller_id, is_primary);

-- 2. Storyteller Relationships Table
CREATE TABLE IF NOT EXISTS storyteller_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_a_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  storyteller_b_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('family', 'mentor', 'colleague', 'collaborator', 'friend')),
  relationship_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  CONSTRAINT unique_relationship UNIQUE(storyteller_a_id, storyteller_b_id, relationship_type),
  CONSTRAINT different_storytellers CHECK (storyteller_a_id != storyteller_b_id)
);

CREATE INDEX idx_relationships_a ON storyteller_relationships(storyteller_a_id);
CREATE INDEX idx_relationships_b ON storyteller_relationships(storyteller_b_id);

-- 3. Storyteller Statistics Cache Table
CREATE TABLE IF NOT EXISTS storyteller_stats (
  storyteller_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_stories INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  total_characters INTEGER DEFAULT 0,
  first_story_date TIMESTAMP,
  last_story_date TIMESTAMP,
  top_themes TEXT[],
  category_breakdown JSONB DEFAULT '{}',
  average_reading_time INTEGER DEFAULT 0, -- in seconds
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_storyteller_stats_updated ON storyteller_stats(last_updated);

-- 4. Function to Calculate and Update Storyteller Stats
CREATE OR REPLACE FUNCTION update_storyteller_stats(p_storyteller_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_stories INTEGER;
  v_total_words INTEGER;
  v_total_chars INTEGER;
  v_first_date TIMESTAMP;
  v_last_date TIMESTAMP;
  v_category_breakdown JSONB;
BEGIN
  -- Calculate statistics
  SELECT
    COUNT(*),
    SUM(LENGTH(content)),
    SUM(CHAR_LENGTH(content)),
    MIN(created_at),
    MAX(created_at)
  INTO
    v_total_stories,
    v_total_chars,
    v_total_words,
    v_first_date,
    v_last_date
  FROM stories
  WHERE storyteller_id = p_storyteller_id
    AND status = 'published';

  -- Calculate category breakdown
  SELECT json_object_agg(story_category, count)
  INTO v_category_breakdown
  FROM (
    SELECT story_category, COUNT(*) as count
    FROM stories
    WHERE storyteller_id = p_storyteller_id
      AND status = 'published'
    GROUP BY story_category
  ) category_counts;

  -- Insert or update stats
  INSERT INTO storyteller_stats (
    storyteller_id,
    total_stories,
    total_words,
    total_characters,
    first_story_date,
    last_story_date,
    category_breakdown,
    average_reading_time,
    last_updated
  )
  VALUES (
    p_storyteller_id,
    COALESCE(v_total_stories, 0),
    COALESCE(v_total_words, 0),
    COALESCE(v_total_chars, 0),
    v_first_date,
    v_last_date,
    COALESCE(v_category_breakdown, '{}'::jsonb),
    ROUND((COALESCE(v_total_words, 0)::FLOAT / 250) * 60), -- ~250 words per minute reading
    NOW()
  )
  ON CONFLICT (storyteller_id)
  DO UPDATE SET
    total_stories = EXCLUDED.total_stories,
    total_words = EXCLUDED.total_words,
    total_characters = EXCLUDED.total_characters,
    first_story_date = EXCLUDED.first_story_date,
    last_story_date = EXCLUDED.last_story_date,
    category_breakdown = EXCLUDED.category_breakdown,
    average_reading_time = EXCLUDED.average_reading_time,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to Auto-Update Stats When Stories Change
CREATE OR REPLACE FUNCTION trigger_update_storyteller_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the affected storyteller
  IF TG_OP = 'DELETE' THEN
    PERFORM update_storyteller_stats(OLD.storyteller_id);
  ELSE
    PERFORM update_storyteller_stats(NEW.storyteller_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_story_change ON stories;
CREATE TRIGGER update_stats_on_story_change
  AFTER INSERT OR UPDATE OR DELETE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_storyteller_stats();

-- 6. Enable Row Level Security
ALTER TABLE storyteller_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_stats ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for Storyteller Photos
CREATE POLICY "Anyone can view photos"
  ON storyteller_photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON storyteller_photos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploads"
  ON storyteller_photos FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own uploads"
  ON storyteller_photos FOR DELETE
  USING (auth.uid() = uploaded_by);

-- 8. RLS Policies for Relationships
CREATE POLICY "Anyone can view relationships"
  ON storyteller_relationships FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create relationships"
  ON storyteller_relationships FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 9. RLS Policies for Stats
CREATE POLICY "Anyone can view stats"
  ON storyteller_stats FOR SELECT
  USING (true);

-- 10. Helper View for Profile Details with Stats
CREATE OR REPLACE VIEW profile_details_with_stats AS
SELECT
  p.*,
  s.total_stories,
  s.total_words,
  s.total_characters,
  s.first_story_date,
  s.last_story_date,
  s.category_breakdown,
  s.average_reading_time,
  (SELECT COUNT(*) FROM storyteller_photos WHERE storyteller_id = p.id) as photo_count,
  (SELECT file_path FROM storyteller_photos WHERE storyteller_id = p.id AND is_primary = true LIMIT 1) as primary_photo
FROM profiles p
LEFT JOIN storyteller_stats s ON p.id = s.storyteller_id;

-- 11. Initialize Stats for Existing Storytellers
DO $$
DECLARE
  storyteller_record RECORD;
BEGIN
  FOR storyteller_record IN
    SELECT DISTINCT storyteller_id
    FROM stories
    WHERE storyteller_id IS NOT NULL
  LOOP
    PERFORM update_storyteller_stats(storyteller_record.storyteller_id);
  END LOOP;
END $$;

-- 12. Create Supabase Storage Bucket (execute via Supabase Dashboard or API)
-- Bucket name: 'storyteller-photos'
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

COMMENT ON TABLE storyteller_photos IS 'Photo gallery for storytellers';
COMMENT ON TABLE storyteller_relationships IS 'Connections between storytellers';
COMMENT ON TABLE storyteller_stats IS 'Cached statistics for storyteller profiles';
COMMENT ON FUNCTION update_storyteller_stats IS 'Updates cached statistics for a storyteller';

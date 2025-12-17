-- ============================================================================
-- SUPABASE STORAGE SETUP FOR STORY IMAGES
-- Best practices for photo management in Empathy Ledger
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE STORAGE BUCKETS
-- ============================================================================

-- Story Images Bucket (public - for story photos in annual reports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-images',
  'story-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

-- Profile Images Bucket (public - for storyteller photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ============================================================================
-- STEP 2: CREATE STORAGE POLICIES
-- ============================================================================

-- Story Images: Anyone can view (public bucket)
CREATE POLICY "Public read access for story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- Story Images: Authenticated users can upload
CREATE POLICY "Authenticated users can upload story images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-images');

-- Story Images: Users can update their own uploads
CREATE POLICY "Users can update their own story images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'story-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Story Images: Users can delete their own uploads
CREATE POLICY "Users can delete their own story images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'story-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profile Images: Anyone can view
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Profile Images: Authenticated users can upload
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Profile Images: Users can update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profile Images: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- STEP 3: CREATE STORY IMAGES TABLE (Better than just URLs in stories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Storage info
  storage_path TEXT NOT NULL, -- Full path in storage bucket
  public_url TEXT NOT NULL, -- Public URL for display
  thumbnail_url TEXT, -- Optional thumbnail (can be generated)
  
  -- Image metadata
  alt_text TEXT, -- Accessibility description
  caption TEXT, -- Photo caption for display
  photographer_name TEXT,
  photographer_id UUID REFERENCES profiles(id),
  photo_location TEXT, -- Where photo was taken
  photo_date DATE, -- When photo was taken
  
  -- Display order
  is_primary BOOLEAN DEFAULT FALSE, -- Main story image
  display_order INTEGER DEFAULT 0,
  
  -- Technical metadata
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  
  -- Cultural sensitivity
  cultural_sensitivity_flag BOOLEAN DEFAULT FALSE,
  requires_elder_approval BOOLEAN DEFAULT FALSE,
  elder_approved BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS story_images_story_id_idx ON story_images(story_id);
CREATE INDEX IF NOT EXISTS story_images_photographer_idx ON story_images(photographer_id);
CREATE INDEX IF NOT EXISTS story_images_order_idx ON story_images(story_id, display_order);
CREATE INDEX IF NOT EXISTS story_images_primary_idx ON story_images(story_id, is_primary) WHERE is_primary = TRUE;

-- Enable RLS
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_images
CREATE POLICY "Public can view published story images"
ON story_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_images.story_id
    AND stories.is_public = TRUE
    AND stories.status = 'published'
  )
);

CREATE POLICY "Authenticated users can upload story images"
ON story_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update images for stories they can edit"
ON story_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_images.story_id
    AND (
      stories.author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      OR stories.storyteller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  )
);

-- ============================================================================
-- STEP 4: HELPER FUNCTIONS
-- ============================================================================

-- Function to get all images for a story
CREATE OR REPLACE FUNCTION get_story_images(story_uuid UUID)
RETURNS TABLE (
  id UUID,
  public_url TEXT,
  thumbnail_url TEXT,
  alt_text TEXT,
  caption TEXT,
  photographer_name TEXT,
  is_primary BOOLEAN,
  display_order INTEGER,
  photo_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id,
    si.public_url,
    si.thumbnail_url,
    si.alt_text,
    si.caption,
    si.photographer_name,
    si.is_primary,
    si.display_order,
    si.photo_date
  FROM story_images si
  WHERE si.story_id = story_uuid
  ORDER BY si.is_primary DESC, si.display_order ASC, si.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to set primary image for a story
CREATE OR REPLACE FUNCTION set_primary_story_image(story_uuid UUID, image_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Remove primary flag from all images for this story
  UPDATE story_images
  SET is_primary = FALSE
  WHERE story_id = story_uuid;
  
  -- Set the specified image as primary
  UPDATE story_images
  SET is_primary = TRUE
  WHERE id = image_uuid AND story_id = story_uuid;
  
  -- Update story's main image URL
  UPDATE stories
  SET story_image_url = (
    SELECT public_url FROM story_images WHERE id = image_uuid
  )
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: UPDATE EXISTING STORIES TABLE (if needed)
-- ============================================================================

-- Add image metadata column if it doesn't exist
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '{}'::jsonb;

-- Add has_images computed column for easy filtering
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS has_images BOOLEAN GENERATED ALWAYS AS (
  story_image_url IS NOT NULL OR 
  EXISTS (SELECT 1 FROM story_images WHERE story_images.story_id = stories.id)
) STORED;

-- ============================================================================
-- STEP 6: CREATE VIEW FOR STORIES WITH IMAGE COUNTS
-- ============================================================================

CREATE OR REPLACE VIEW stories_with_images AS
SELECT 
  s.*,
  COUNT(si.id) as image_count,
  COALESCE(
    (SELECT public_url FROM story_images WHERE story_id = s.id AND is_primary = TRUE LIMIT 1),
    s.story_image_url
  ) as primary_image_url,
  ARRAY_AGG(si.public_url ORDER BY si.display_order) FILTER (WHERE si.id IS NOT NULL) as all_image_urls
FROM stories s
LEFT JOIN story_images si ON s.id = si.story_id
GROUP BY s.id;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SUPABASE STORAGE SETUP COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Storage buckets created:';
  RAISE NOTICE '   - story-images (10MB limit, public)';
  RAISE NOTICE '   - profile-images (5MB limit, public)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Storage policies configured';
  RAISE NOTICE '✅ story_images table created with full metadata';
  RAISE NOTICE '✅ Helper functions created';
  RAISE NOTICE '✅ Views created for stories with images';
  RAISE NOTICE '';
  RAISE NOTICE '📁 Recommended folder structure in storage:';
  RAISE NOTICE '   story-images/';
  RAISE NOTICE '   ├── picc/';
  RAISE NOTICE '   │   ├── youth-services/';
  RAISE NOTICE '   │   ├── cultural-centre/';
  RAISE NOTICE '   │   ├── healing-service/';
  RAISE NOTICE '   │   └── [other-services]/';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Upload photos using the React component!';
  RAISE NOTICE '================================================';
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('story-images', 'profile-images');

-- Check story_images table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'story_images'
ORDER BY ordinal_position;

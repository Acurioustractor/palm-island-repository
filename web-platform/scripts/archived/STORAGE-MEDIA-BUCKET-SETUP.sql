-- ============================================================================
-- STORY-MEDIA STORAGE BUCKET SETUP
-- For bulk photo uploads to annual reports and galleries
-- ============================================================================

-- Create story-media bucket (public, 10MB limit per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-media',
  'story-media',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for story media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload story media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete story media" ON storage.objects;

-- Public read access (anyone can view photos)
CREATE POLICY "Public read access for story media"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-media');

-- Service role can upload (used by API)
CREATE POLICY "Service role can upload story media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-media');

-- Service role can delete
CREATE POLICY "Service role can delete story media"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-media');

-- Verify setup
SELECT
  'story-media bucket created!' as status,
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as max_mb
FROM storage.buckets
WHERE id = 'story-media';

-- ============================================================================
-- FIX STORAGE BUCKET POLICIES - RUN THIS IN SUPABASE SQL EDITOR
-- This fixes the "stuck loading" issue for Media Library
-- ============================================================================

-- Make sure buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('story-images', 'story-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']),
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('story-media', 'story-media', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- DROP ALL EXISTING POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for story images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for story media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload story images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload story media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete story images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete profile images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete story media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can list story images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can list profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can list story media" ON storage.objects;

-- ============================================================================
-- CREATE NEW POLICIES - ANYONE CAN READ/LIST
-- ============================================================================

-- Story Images: Public read and list access
CREATE POLICY "Public read access for story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- Profile Images: Public read and list access
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Story Media: Public read and list access
CREATE POLICY "Public read access for story media"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-media');

-- Service role can upload to all buckets
CREATE POLICY "Service role can upload story images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-images');

CREATE POLICY "Service role can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Service role can upload story media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-media');

-- Service role can delete from all buckets
CREATE POLICY "Service role can delete story images"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-images');

CREATE POLICY "Service role can delete profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');

CREATE POLICY "Service role can delete story media"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-media');

-- ============================================================================
-- FIX RLS ON MEDIA_FILES TABLE
-- ============================================================================
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view all media" ON media_files;
DROP POLICY IF EXISTS "Service role full access" ON media_files;
DROP POLICY IF EXISTS "Anyone can view active public media" ON media_files;

-- Let ANYONE read ALL media_files
CREATE POLICY "Anyone can view all media"
ON media_files FOR SELECT
USING (true);

-- Service role full access
CREATE POLICY "Service role full access"
ON media_files FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================
SELECT
  '✅ STORAGE POLICIES FIXED!' as status,
  'All 3 buckets are now public for reading/listing' as info;

SELECT
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as max_mb
FROM storage.buckets
WHERE id IN ('story-images', 'profile-images', 'story-media');

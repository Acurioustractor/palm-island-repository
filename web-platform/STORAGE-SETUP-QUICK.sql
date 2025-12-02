-- ============================================================================
-- QUICK STORAGE SETUP FOR PROFILE IMAGES
-- Run this in your Supabase SQL Editor to enable photo uploads
-- ============================================================================

-- Create profile-images bucket (public, 5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist (ignore errors if they don't)
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete profile images" ON storage.objects;

-- Public read access (anyone can view photos)
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Service role can upload (used by API)
CREATE POLICY "Service role can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- Service role can delete
CREATE POLICY "Service role can delete profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');

-- Verify setup
SELECT 
  'profile-images bucket created!' as status,
  id, 
  name, 
  public,
  file_size_limit / 1024 / 1024 as max_mb
FROM storage.buckets 
WHERE id = 'profile-images';

-- ============================================================================
-- PLATFORM ASSET STORAGE BUCKETS
-- Three buckets to replace heavy public/ assets with Supabase Storage
-- ============================================================================

-- 1. platform-documents: PDFs, annual reports, governance docs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-documents',
  'platform-documents',
  true,
  104857600, -- 100MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

-- 2. platform-media: photos, videos, hero assets, report assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-media',
  'platform-media',
  true,
  209715200, -- 200MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];

-- 3. platform-icons: bespoke icons, SVGs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-icons',
  'platform-icons',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/svg+xml', 'image/webp'];

-- ── Policies ──────────────────────────────────────────

-- platform-documents policies
DROP POLICY IF EXISTS "Public read access for platform documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload platform documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete platform documents" ON storage.objects;

CREATE POLICY "Public read access for platform documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-documents');

CREATE POLICY "Service role can upload platform documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'platform-documents');

CREATE POLICY "Service role can delete platform documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'platform-documents');

-- platform-media policies
DROP POLICY IF EXISTS "Public read access for platform media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload platform media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete platform media" ON storage.objects;

CREATE POLICY "Public read access for platform media"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-media');

CREATE POLICY "Service role can upload platform media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'platform-media');

CREATE POLICY "Service role can delete platform media"
ON storage.objects FOR DELETE
USING (bucket_id = 'platform-media');

-- platform-icons policies
DROP POLICY IF EXISTS "Public read access for platform icons" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload platform icons" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete platform icons" ON storage.objects;

CREATE POLICY "Public read access for platform icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-icons');

CREATE POLICY "Service role can upload platform icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'platform-icons');

CREATE POLICY "Service role can delete platform icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'platform-icons');

-- Verify setup
SELECT
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as max_mb
FROM storage.buckets
WHERE id IN ('platform-documents', 'platform-media', 'platform-icons');

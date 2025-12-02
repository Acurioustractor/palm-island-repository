-- ============================================================================
-- MEDIA FILES RLS POLICIES
-- Enable Row Level Security and create policies for client access
-- ============================================================================

-- Enable RLS on media_files table
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view public media" ON media_files;
DROP POLICY IF EXISTS "Anyone can view active public media" ON media_files;
DROP POLICY IF EXISTS "Service role has full access to media" ON media_files;

-- 1. PUBLIC READ ACCESS
-- Allow anyone to view public, non-deleted media
CREATE POLICY "Anyone can view active public media"
ON media_files FOR SELECT
USING (
  is_public = true
  AND deleted_at IS NULL
);

-- 2. SERVICE ROLE FULL ACCESS
-- API routes use service role, so they bypass RLS anyway
-- But this makes it explicit
CREATE POLICY "Service role has full access to media"
ON media_files FOR ALL
USING (true)
WITH CHECK (true);

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  '✅ RLS policies created for media_files' as status
FROM pg_tables
WHERE tablename = 'media_files';

-- Show active policies
SELECT
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'media_files';

-- ============================================================================
-- COMPLETE BULK PHOTO UPLOAD SETUP
-- Run this ONE file to set up everything needed for bulk photo uploads
-- ============================================================================

-- 1. CREATE STORAGE BUCKET
-- ============================================================================
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

-- 2. CREATE STORAGE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for story media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload story media" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete story media" ON storage.objects;

CREATE POLICY "Public read access for story media"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-media');

CREATE POLICY "Service role can upload story media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-media');

CREATE POLICY "Service role can delete story media"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-media');

-- 3. CREATE MEDIA_FILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- File Identity
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  public_url TEXT NOT NULL,

  -- File Metadata
  file_type TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  duration INTEGER,

  -- Relationships
  tenant_id UUID NOT NULL DEFAULT '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
  uploaded_by UUID REFERENCES profiles(id),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Organization
  title TEXT,
  description TEXT,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[],

  -- Location & Context
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  taken_at TIMESTAMP,

  -- Cultural Protocol
  requires_elder_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  cultural_sensitivity_notes TEXT,
  faces_detected TEXT[],

  -- Usage & Status
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  usage_context TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT media_files_type_check CHECK (
    file_type IN ('image', 'video', 'audio', 'document', 'other')
  ),
  CONSTRAINT media_files_bucket_check CHECK (
    bucket_name IN ('story-images', 'profile-images', 'story-media', 'project-media')
  ),
  CONSTRAINT media_files_usage_check CHECK (
    usage_context IN (
      'story_hero', 'story_inline', 'profile_photo', 'gallery',
      'project_showcase', 'immersive_story', 'thumbnail', 'other'
    ) OR usage_context IS NULL
  )
);

-- 4. CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS media_files_tenant_id_idx ON media_files(tenant_id);
CREATE INDEX IF NOT EXISTS media_files_uploaded_by_idx ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS media_files_story_id_idx ON media_files(story_id);
CREATE INDEX IF NOT EXISTS media_files_project_id_idx ON media_files(project_id);
CREATE INDEX IF NOT EXISTS media_files_storyteller_id_idx ON media_files(storyteller_id);
CREATE INDEX IF NOT EXISTS media_files_file_type_idx ON media_files(file_type);
CREATE INDEX IF NOT EXISTS media_files_bucket_name_idx ON media_files(bucket_name);
CREATE INDEX IF NOT EXISTS media_files_created_at_idx ON media_files(created_at);
CREATE INDEX IF NOT EXISTS media_files_tags_idx ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS media_files_deleted_at_idx ON media_files(deleted_at);

-- 5. CREATE TRIGGER FOR AUTO-UPDATE
-- ============================================================================
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS media_files_updated_at ON media_files;

CREATE TRIGGER media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

-- 6. CREATE HELPER VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW active_media_files AS
SELECT * FROM media_files
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW media_files_by_type AS
SELECT
  file_type,
  bucket_name,
  COUNT(*) as file_count,
  SUM(file_size) as total_size,
  AVG(file_size) as avg_size
FROM media_files
WHERE deleted_at IS NULL
GROUP BY file_type, bucket_name;

CREATE OR REPLACE VIEW recent_media_uploads AS
SELECT
  mf.*,
  p.full_name as uploader_name,
  p.preferred_name as uploader_preferred_name
FROM media_files mf
LEFT JOIN profiles p ON mf.uploaded_by = p.id
WHERE mf.deleted_at IS NULL
ORDER BY mf.created_at DESC
LIMIT 100;

-- 7. VERIFY SETUP
-- ============================================================================
SELECT
  '✅ BULK UPLOAD SETUP COMPLETE!' as status,
  'Storage bucket: story-media (10MB limit)' as bucket_info,
  'Table: media_files with ' || COUNT(*) || ' existing records' as table_info
FROM media_files;

-- Show bucket details
SELECT
  '📦 Storage Bucket' as component,
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as max_mb
FROM storage.buckets
WHERE id = 'story-media';

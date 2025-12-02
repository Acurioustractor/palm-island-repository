-- ============================================================================
-- MEDIA FILES TABLE - Track metadata for all uploaded media
-- Links media files to stories, projects, and storytellers
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- File Identity
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT NOT NULL, -- Path in storage bucket
  bucket_name TEXT NOT NULL, -- story-images, profile-images, story-media
  public_url TEXT NOT NULL,

  -- File Metadata
  file_type TEXT NOT NULL, -- image, video, audio, document
  mime_type TEXT,
  file_size BIGINT, -- Size in bytes
  width INTEGER, -- For images/videos
  height INTEGER, -- For images/videos
  duration INTEGER, -- For videos/audio (seconds)

  -- Relationships
  tenant_id UUID NOT NULL DEFAULT '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
  uploaded_by UUID REFERENCES profiles(id),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Organization
  title TEXT,
  description TEXT,
  alt_text TEXT, -- Accessibility description
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
  faces_detected TEXT[], -- List of storyteller IDs whose faces are in this media

  -- Usage & Status
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  usage_context TEXT, -- Where this media is used (story_hero, profile_photo, gallery, etc.)
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  metadata JSONB DEFAULT '{}'::jsonb, -- EXIF, camera info, etc.

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS media_files_tenant_id_idx ON media_files(tenant_id);
CREATE INDEX IF NOT EXISTS media_files_uploaded_by_idx ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS media_files_story_id_idx ON media_files(story_id);
CREATE INDEX IF NOT EXISTS media_files_project_id_idx ON media_files(project_id);
CREATE INDEX IF NOT EXISTS media_files_storyteller_id_idx ON media_files(storyteller_id);
CREATE INDEX IF NOT EXISTS media_files_file_type_idx ON media_files(file_type);
CREATE INDEX IF NOT EXISTS media_files_bucket_name_idx ON media_files(bucket_name);
CREATE INDEX IF NOT EXISTS media_files_created_at_idx ON media_files(created_at);
CREATE INDEX IF NOT EXISTS media_files_tags_idx ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS media_files_deleted_at_idx ON media_files(deleted_at); -- For soft delete queries

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS media_files_updated_at ON media_files;

CREATE TRIGGER media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

-- Comments
COMMENT ON TABLE media_files IS 'Metadata tracking for all uploaded media files across the platform';
COMMENT ON COLUMN media_files.file_path IS 'Relative path in storage bucket (e.g., "abc123-photo.jpg")';
COMMENT ON COLUMN media_files.bucket_name IS 'Supabase storage bucket name';
COMMENT ON COLUMN media_files.faces_detected IS 'Array of profile IDs for people whose faces appear in this media';
COMMENT ON COLUMN media_files.usage_context IS 'Where/how this media is being used on the platform';
COMMENT ON COLUMN media_files.metadata IS 'EXIF data, camera settings, GPS coordinates, etc.';
COMMENT ON COLUMN media_files.deleted_at IS 'Soft delete timestamp - NULL means active, non-NULL means deleted';

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for active (non-deleted) media
CREATE OR REPLACE VIEW active_media_files AS
SELECT * FROM media_files
WHERE deleted_at IS NULL;

-- View for media by type
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

-- View for recent uploads
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

-- Verify table creation
SELECT 'Media files table created successfully' AS status;

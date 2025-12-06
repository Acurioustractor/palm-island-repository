-- ============================================================================
-- MEDIA PAGE CONTEXT EXTENSION
-- Extends media_files to support site-wide media management
-- ============================================================================

-- Add page_context column for site-wide media (hero images, service photos, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'page_context'
  ) THEN
    ALTER TABLE media_files
    ADD COLUMN page_context TEXT;
  END IF;
END $$;

-- Add page_section column for specific sections within pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'page_section'
  ) THEN
    ALTER TABLE media_files
    ADD COLUMN page_section TEXT;
  END IF;
END $$;

-- Add display_order for controlling order of media in galleries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE media_files
    ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add context_metadata for flexible context-specific data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_files' AND column_name = 'context_metadata'
  ) THEN
    ALTER TABLE media_files
    ADD COLUMN context_metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS media_files_page_context_idx ON media_files(page_context);
CREATE INDEX IF NOT EXISTS media_files_page_section_idx ON media_files(page_section);
CREATE INDEX IF NOT EXISTS media_files_display_order_idx ON media_files(display_order);
CREATE INDEX IF NOT EXISTS media_files_context_metadata_idx ON media_files USING GIN(context_metadata);

-- Update the usage_context check constraint to include new contexts
ALTER TABLE media_files DROP CONSTRAINT IF EXISTS media_files_usage_check;
ALTER TABLE media_files ADD CONSTRAINT media_files_usage_check CHECK (
  usage_context IN (
    'story_hero', 'story_inline', 'profile_photo', 'gallery',
    'project_showcase', 'immersive_story', 'thumbnail',
    'page_hero', 'page_section', 'service_photo', 'leadership_photo',
    'testimonial_photo', 'timeline_photo', 'video_embed', 'other'
  ) OR usage_context IS NULL
);

-- Update the page_context check constraint
ALTER TABLE media_files ADD CONSTRAINT media_files_page_context_check CHECK (
  page_context IN (
    -- Public pages
    'home', 'about', 'impact', 'community', 'stories', 'share-voice',
    'annual-reports', 'search', 'chat', 'assistant',
    -- Sections
    'hero', 'vision', 'timeline', 'leadership', 'services',
    'testimonials', 'future', 'contact',
    -- Story contexts
    'story', 'storyteller', 'project',
    -- Other
    'global', 'other'
  ) OR page_context IS NULL
);

-- Comments
COMMENT ON COLUMN media_files.page_context IS 'Which page this media appears on (home, about, timeline, etc.)';
COMMENT ON COLUMN media_files.page_section IS 'Specific section within the page (hero, services, testimonials, etc.)';
COMMENT ON COLUMN media_files.display_order IS 'Order for displaying media in galleries/carousels (lower = first)';
COMMENT ON COLUMN media_files.context_metadata IS 'Flexible JSON for context-specific data (e.g., quote for testimonial, year for timeline)';

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for page media
CREATE OR REPLACE VIEW page_media AS
SELECT
  mf.*,
  p.full_name as uploader_name,
  p.preferred_name as uploader_preferred_name
FROM media_files mf
LEFT JOIN profiles p ON mf.uploaded_by = p.id
WHERE mf.deleted_at IS NULL
  AND mf.page_context IS NOT NULL
ORDER BY mf.page_context, mf.page_section, mf.display_order;

-- View for featured page media
CREATE OR REPLACE VIEW featured_page_media AS
SELECT
  mf.*,
  p.full_name as uploader_name
FROM media_files mf
LEFT JOIN profiles p ON mf.uploaded_by = p.id
WHERE mf.deleted_at IS NULL
  AND mf.page_context IS NOT NULL
  AND mf.is_featured = TRUE
ORDER BY mf.page_context, mf.display_order;

-- View for media by page context
CREATE OR REPLACE VIEW media_by_page_context AS
SELECT
  page_context,
  page_section,
  file_type,
  COUNT(*) as media_count,
  SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as featured_count
FROM media_files
WHERE deleted_at IS NULL
  AND page_context IS NOT NULL
GROUP BY page_context, page_section, file_type;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get media for a specific page and section
CREATE OR REPLACE FUNCTION get_page_media(
  p_page_context TEXT,
  p_page_section TEXT DEFAULT NULL,
  p_file_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  file_path TEXT,
  bucket_name TEXT,
  public_url TEXT,
  file_type TEXT,
  title TEXT,
  description TEXT,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[],
  is_featured BOOLEAN,
  display_order INTEGER,
  context_metadata JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mf.id,
    mf.filename,
    mf.file_path,
    mf.bucket_name,
    mf.public_url,
    mf.file_type,
    mf.title,
    mf.description,
    mf.alt_text,
    mf.caption,
    mf.tags,
    mf.is_featured,
    mf.display_order,
    mf.context_metadata,
    mf.created_at
  FROM media_files mf
  WHERE mf.deleted_at IS NULL
    AND mf.is_public = TRUE
    AND mf.page_context = p_page_context
    AND (p_page_section IS NULL OR mf.page_section = p_page_section)
    AND (p_file_type IS NULL OR mf.file_type = p_file_type)
  ORDER BY mf.display_order, mf.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get featured media for a page
CREATE OR REPLACE FUNCTION get_featured_page_media(
  p_page_context TEXT,
  p_file_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  public_url TEXT,
  title TEXT,
  alt_text TEXT,
  context_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mf.id,
    mf.public_url,
    mf.title,
    mf.alt_text,
    mf.context_metadata
  FROM media_files mf
  WHERE mf.deleted_at IS NULL
    AND mf.is_public = TRUE
    AND mf.is_featured = TRUE
    AND mf.page_context = p_page_context
    AND (p_file_type IS NULL OR mf.file_type = p_file_type)
  ORDER BY mf.display_order
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Verify migration
SELECT 'Media page context extension completed successfully' AS status;

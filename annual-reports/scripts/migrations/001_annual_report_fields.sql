-- Migration: Add Annual Report Fields to Stories Table
-- Run this in your Supabase SQL Editor

-- Add annual report tracking fields to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS annual_report_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS annual_report_year INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS annual_report_section TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 1;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add constraints for annual report section values
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_annual_report_section_check;
ALTER TABLE stories ADD CONSTRAINT stories_annual_report_section_check CHECK (
  annual_report_section IS NULL OR annual_report_section IN (
    'cover',
    'leadership',
    'highlights',
    'services',
    'community',
    'data',
    'looking_forward',
    'acknowledgments'
  )
);

-- Add constraint for featured priority
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_featured_priority_check;
ALTER TABLE stories ADD CONSTRAINT stories_featured_priority_check CHECK (
  featured_priority >= 1 AND featured_priority <= 5
);

-- Create index for annual report queries
CREATE INDEX IF NOT EXISTS stories_annual_report_idx ON stories(annual_report_eligible, annual_report_year, status);

-- Add comment for documentation
COMMENT ON COLUMN stories.annual_report_eligible IS 'Whether this story should be considered for annual reports';
COMMENT ON COLUMN stories.annual_report_year IS 'Which annual report year this story is assigned to (e.g., 2025)';
COMMENT ON COLUMN stories.annual_report_section IS 'Which section of the report this story belongs to';
COMMENT ON COLUMN stories.featured_priority IS 'Priority for featuring (1=low, 5=high)';
COMMENT ON COLUMN stories.summary IS 'Short summary for previews and report excerpts';

-- Create a view for annual report stories
CREATE OR REPLACE VIEW annual_report_stories AS
SELECT
  s.*,
  p.full_name as storyteller_name,
  p.preferred_name as storyteller_preferred_name,
  p.community_role as storyteller_role,
  p.is_elder as storyteller_is_elder,
  array_agg(DISTINCT sm.file_path) FILTER (WHERE sm.media_type = 'photo') as photos,
  array_agg(DISTINCT ssl.service_name) FILTER (WHERE ssl.service_name IS NOT NULL) as services
FROM stories s
INNER JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN story_media sm ON s.id = sm.story_id
LEFT JOIN service_story_links ssl ON s.id = ssl.story_id
WHERE s.annual_report_eligible = true
  AND s.status = 'published'
GROUP BY s.id, p.id;

-- Grant access to the view
-- GRANT SELECT ON annual_report_stories TO authenticated;
-- GRANT SELECT ON annual_report_stories TO anon;

COMMENT ON VIEW annual_report_stories IS 'Pre-joined view of stories marked for annual reports with storyteller and media info';

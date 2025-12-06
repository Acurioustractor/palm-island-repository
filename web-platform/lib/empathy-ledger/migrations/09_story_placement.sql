-- ============================================================================
-- Migration 09: Story Intelligent Placement System
-- Adds columns for automated story placement across website pages
-- ============================================================================

-- ============================================================================
-- STEP 1: Add Placement Columns
-- ============================================================================

-- WHERE stories appear
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS page_context TEXT,
ADD COLUMN IF NOT EXISTS page_section TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS placement_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS auto_placed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_placement_update TIMESTAMP;

-- Scoring columns for intelligent placement
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS cultural_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS recency_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS diversity_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_score DECIMAL DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN stories.page_context IS 'Page where story appears (home, about, stories, impact, etc.)';
COMMENT ON COLUMN stories.page_section IS 'Section within page (hero, featured, sidebar, grid, etc.)';
COMMENT ON COLUMN stories.display_order IS 'Order within section (0 = first)';
COMMENT ON COLUMN stories.placement_metadata IS 'Additional placement data (tags matched, rule used, etc.)';
COMMENT ON COLUMN stories.auto_placed IS 'True if placed by auto-assignment algorithm';
COMMENT ON COLUMN stories.cultural_score IS 'Cultural significance score (0-100)';
COMMENT ON COLUMN stories.recency_score IS 'Recency score based on creation date (0-100)';
COMMENT ON COLUMN stories.diversity_score IS 'Diversity score to avoid repetition (0-100)';
COMMENT ON COLUMN stories.total_score IS 'Weighted total score for ranking';

-- ============================================================================
-- STEP 2: Create Performance Indexes
-- ============================================================================

-- Index for querying by page context and section
CREATE INDEX IF NOT EXISTS idx_stories_page_context
ON stories(page_context)
WHERE page_context IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_page_section
ON stories(page_section)
WHERE page_section IS NOT NULL;

-- Composite index for efficient page queries
CREATE INDEX IF NOT EXISTS idx_stories_context_section_order
ON stories(page_context, page_section, display_order)
WHERE page_context IS NOT NULL AND page_section IS NOT NULL;

-- Index for score-based queries
CREATE INDEX IF NOT EXISTS idx_stories_total_score
ON stories(total_score DESC)
WHERE total_score > 0;

-- Index for auto-placed stories
CREATE INDEX IF NOT EXISTS idx_stories_auto_placed
ON stories(auto_placed)
WHERE auto_placed = true;

-- ============================================================================
-- STEP 3: Add Constraints
-- ============================================================================

-- Valid page contexts
ALTER TABLE stories
ADD CONSTRAINT stories_page_context_check
CHECK (
  page_context IS NULL OR
  page_context IN (
    'home', 'about', 'impact', 'community', 'stories',
    'services', 'health', 'youth', 'elders', 'culture',
    'education', 'environment', 'partnerships', 'featured'
  )
);

-- Valid page sections
ALTER TABLE stories
ADD CONSTRAINT stories_page_section_check
CHECK (
  page_section IS NULL OR
  page_section IN (
    'hero', 'featured', 'grid', 'carousel', 'sidebar',
    'testimonials', 'voices', 'elder-wisdom', 'recent',
    'trending', 'related', 'highlights', 'background'
  )
);

-- Score ranges
ALTER TABLE stories
ADD CONSTRAINT stories_scores_range_check
CHECK (
  (cultural_score >= 0 AND cultural_score <= 100) AND
  (recency_score >= 0 AND recency_score <= 100) AND
  (diversity_score >= 0 AND diversity_score <= 100) AND
  (quality_score >= 0 AND quality_score <= 100) AND
  (engagement_score >= 0 AND engagement_score <= 100)
);

-- ============================================================================
-- STEP 4: Helper Functions for Placement
-- ============================================================================

-- Function to get stories for a specific page section
CREATE OR REPLACE FUNCTION get_page_stories(
  p_page_context TEXT,
  p_page_section TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  story_type TEXT,
  display_order INTEGER,
  total_score DECIMAL,
  storyteller_id UUID,
  is_featured BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.content,
    s.story_type,
    s.display_order,
    s.total_score,
    s.storyteller_id,
    s.is_featured
  FROM stories s
  WHERE s.page_context = p_page_context
    AND (p_page_section IS NULL OR s.page_section = p_page_section)
    AND s.is_public = true
  ORDER BY
    s.is_featured DESC,
    s.display_order ASC,
    s.total_score DESC
  LIMIT p_limit;
END;
$$;

-- Function to get featured stories across all pages
CREATE OR REPLACE FUNCTION get_featured_stories(
  p_limit INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  story_type TEXT,
  total_score DECIMAL,
  storyteller_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.content,
    s.story_type,
    s.total_score,
    s.storyteller_id
  FROM stories s
  WHERE s.is_featured = true
    AND s.is_public = true
  ORDER BY s.total_score DESC
  LIMIT p_limit;
END;
$$;

-- Function to get elder stories
CREATE OR REPLACE FUNCTION get_elder_stories(
  p_limit INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  story_type TEXT,
  storyteller_id UUID,
  storyteller_name TEXT,
  total_score DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.content,
    s.story_type,
    s.storyteller_id,
    COALESCE(p.preferred_name, p.full_name) as storyteller_name,
    s.total_score
  FROM stories s
  JOIN profiles p ON s.storyteller_id = p.id
  WHERE s.is_public = true
    AND p.is_elder = true
  ORDER BY s.total_score DESC
  LIMIT p_limit;
END;
$$;

-- Function to calculate recency score
CREATE OR REPLACE FUNCTION calculate_recency_score(
  story_date TIMESTAMP
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  days_old INTEGER;
  score DECIMAL;
BEGIN
  days_old := EXTRACT(DAY FROM NOW() - story_date)::INTEGER;

  -- Score based on age
  IF days_old <= 7 THEN
    score := 100;
  ELSIF days_old <= 30 THEN
    score := 90 - ((days_old - 7) * 2);
  ELSIF days_old <= 90 THEN
    score := 50 - ((days_old - 30) * 0.5);
  ELSIF days_old <= 365 THEN
    score := 20 - ((days_old - 90) * 0.05);
  ELSE
    score := GREATEST(0, 10 - ((days_old - 365) * 0.01));
  END IF;

  RETURN GREATEST(0, LEAST(100, score));
END;
$$;

-- ============================================================================
-- STEP 5: Update Existing Stories with Initial Scores
-- ============================================================================

-- Calculate recency scores for all stories
UPDATE stories
SET recency_score = calculate_recency_score(created_at)
WHERE created_at IS NOT NULL;

-- Set cultural scores based on existing fields
UPDATE stories
SET cultural_score = (
  CASE WHEN contains_traditional_knowledge THEN 30 ELSE 0 END +
  CASE WHEN elder_approval_given THEN 20 ELSE 0 END +
  CASE
    WHEN cultural_sensitivity_level = 'high' THEN 30
    WHEN cultural_sensitivity_level = 'medium' THEN 20
    WHEN cultural_sensitivity_level = 'low' THEN 10
    ELSE 0
  END
);

-- Calculate initial total scores
UPDATE stories
SET total_score = (
  COALESCE(quality_score, 0) * 0.30 +
  COALESCE(engagement_score, 0) * 0.25 +
  COALESCE(cultural_score, 0) * 0.20 +
  COALESCE(recency_score, 0) * 0.15
);

-- ============================================================================
-- STEP 6: Create View for Placement Dashboard
-- ============================================================================

CREATE OR REPLACE VIEW story_placement_overview AS
SELECT
  s.id,
  s.title,
  s.story_type,
  s.page_context,
  s.page_section,
  s.display_order,
  s.total_score,
  s.quality_score,
  s.engagement_score,
  s.cultural_score,
  s.recency_score,
  s.auto_placed,
  s.is_featured,
  s.is_public,
  COALESCE(p.preferred_name, p.full_name) as storyteller_name,
  p.is_elder as storyteller_is_elder,
  s.created_at,
  s.last_placement_update
FROM stories s
LEFT JOIN profiles p ON s.storyteller_id = p.id
WHERE s.is_public = true
ORDER BY s.total_score DESC;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'page_context'
  ) THEN
    RAISE NOTICE '✓ page_context column added';
  ELSE
    RAISE EXCEPTION '✗ page_context column missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'cultural_score'
  ) THEN
    RAISE NOTICE '✓ cultural_score column added';
  ELSE
    RAISE EXCEPTION '✗ cultural_score column missing';
  END IF;

  -- Check indexes exist
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'stories' AND indexname = 'idx_stories_context_section_order'
  ) THEN
    RAISE NOTICE '✓ Placement indexes created';
  END IF;

  -- Check functions exist
  IF EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'get_page_stories'
  ) THEN
    RAISE NOTICE '✓ get_page_stories() function created';
  END IF;

  -- Check view exists
  IF EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_name = 'story_placement_overview'
  ) THEN
    RAISE NOTICE '✓ story_placement_overview view created';
  END IF;

  RAISE NOTICE '✓ All placement infrastructure created successfully!';
END;
$$;

-- Show placement statistics
SELECT
  'Total Stories' as metric,
  COUNT(*)::TEXT as value
FROM stories
WHERE is_public = true
UNION ALL
SELECT
  'Stories with Scores',
  COUNT(*)::TEXT
FROM stories
WHERE total_score > 0
UNION ALL
SELECT
  'Auto-Placed Stories',
  COUNT(*)::TEXT
FROM stories
WHERE auto_placed = true
UNION ALL
SELECT
  'Average Total Score',
  ROUND(AVG(total_score), 2)::TEXT
FROM stories
WHERE total_score > 0;

SELECT '✓ Migration 09 complete - Story placement system ready!' as status;

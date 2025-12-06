-- Migration 08: Story Placement System
-- Adds intelligent placement columns to stories table
-- Enables automatic story assignment to page contexts and sections

-- Add placement columns to stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS page_context TEXT,
ADD COLUMN IF NOT EXISTS page_section TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS placement_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS auto_placed BOOLEAN DEFAULT FALSE,

-- Cached scores for performance (refreshed daily)
ADD COLUMN IF NOT EXISTS quality_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS cultural_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS recency_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_placement_update TIMESTAMP;

-- Performance indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_stories_page_context ON stories(page_context);
CREATE INDEX IF NOT EXISTS idx_stories_page_section ON stories(page_section);
CREATE INDEX IF NOT EXISTS idx_stories_display_order ON stories(display_order);
CREATE INDEX IF NOT EXISTS idx_stories_total_score ON stories(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_stories_context_section_order ON stories(page_context, page_section, display_order);
CREATE INDEX IF NOT EXISTS idx_stories_auto_placed ON stories(auto_placed);
CREATE INDEX IF NOT EXISTS idx_stories_is_featured ON stories(is_featured);

-- Comment on columns
COMMENT ON COLUMN stories.page_context IS 'Page where story should appear (home, about, impact, community, stories, health, youth, elder-care, culture, featured, trending)';
COMMENT ON COLUMN stories.page_section IS 'Section within page (hero, featured, grid, sidebar, testimonials, voices, recent, related)';
COMMENT ON COLUMN stories.display_order IS 'Order within section (lower = higher priority)';
COMMENT ON COLUMN stories.placement_metadata IS 'JSON metadata about placement (scores, reasoning, curator overrides)';
COMMENT ON COLUMN stories.auto_placed IS 'Whether story was placed by auto-assignment algorithm or manually curated';

COMMENT ON COLUMN stories.quality_score IS 'Quality score 0-100 (verified, featured, elder approval, media, length)';
COMMENT ON COLUMN stories.engagement_score IS 'Engagement score 0-100 (views, shares, likes with recency weighting)';
COMMENT ON COLUMN stories.cultural_score IS 'Cultural significance score 0-100 (elder storyteller, traditional knowledge, cultural advisor)';
COMMENT ON COLUMN stories.recency_score IS 'Recency score 0-100 (decay function based on created_at)';
COMMENT ON COLUMN stories.total_score IS 'Weighted total score for placement ranking';
COMMENT ON COLUMN stories.last_placement_update IS 'Last time scores were recalculated';

-- Create function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(story_record stories)
RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL := 50; -- Base score
BEGIN
  -- Featured stories get significant boost
  IF story_record.is_featured THEN
    score := score + 25;
  END IF;

  -- Verified stories
  IF story_record.is_verified THEN
    score := score + 20;
  END IF;

  -- Elder approval for traditional knowledge
  IF story_record.elder_approval_given THEN
    score := score + 15;
  END IF;

  -- Contains traditional knowledge
  IF story_record.contains_traditional_knowledge THEN
    score := score + 10;
  END IF;

  -- Has media attached
  IF story_record.story_media IS NOT NULL AND jsonb_array_length(story_record.story_media) > 0 THEN
    score := score + 5;
  END IF;

  -- Content length (longer = more substantial)
  IF LENGTH(story_record.content) > 500 THEN
    score := score + 5;
  END IF;

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate cultural score
CREATE OR REPLACE FUNCTION calculate_cultural_score(story_record stories, storyteller_record storytellers)
RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL := 0;
BEGIN
  -- Elder storyteller (highest cultural authority)
  IF storyteller_record.is_elder THEN
    score := score + 40;
  END IF;

  -- Cultural advisor
  IF storyteller_record.is_cultural_advisor THEN
    score := score + 30;
  END IF;

  -- Contains traditional knowledge
  IF story_record.contains_traditional_knowledge THEN
    score := score + 30;
  END IF;

  -- Elder approval given
  IF story_record.elder_approval_given THEN
    score := score + 20;
  END IF;

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate recency score
CREATE OR REPLACE FUNCTION calculate_recency_score(created_date TIMESTAMP)
RETURNS DECIMAL AS $$
DECLARE
  days_old INTEGER;
  score DECIMAL;
BEGIN
  days_old := EXTRACT(DAY FROM NOW() - created_date)::INTEGER;

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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  views_count INTEGER,
  shares_count INTEGER,
  likes_count INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  raw_score DECIMAL;
  normalized_score DECIMAL;
BEGIN
  -- Weight shares higher than likes, likes higher than views
  raw_score := (COALESCE(views_count, 0) * 1) +
               (COALESCE(shares_count, 0) * 3) +
               (COALESCE(likes_count, 0) * 2);

  -- Logarithmic normalization to 0-100 scale
  normalized_score := LOG(10, raw_score + 1) * 20;

  RETURN LEAST(100, normalized_score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create comprehensive scoring function
CREATE OR REPLACE FUNCTION update_story_scores()
RETURNS TRIGGER AS $$
DECLARE
  storyteller_rec storytellers;
  quality DECIMAL;
  engagement DECIMAL;
  cultural DECIMAL;
  recency DECIMAL;
  total DECIMAL;
BEGIN
  -- Fetch storyteller record
  SELECT * INTO storyteller_rec FROM storytellers WHERE id = NEW.storyteller_id;

  -- Calculate individual scores
  quality := calculate_quality_score(NEW);
  engagement := calculate_engagement_score(NEW.views, NEW.shares, NEW.likes);
  recency := calculate_recency_score(NEW.created_at);

  IF storyteller_rec IS NOT NULL THEN
    cultural := calculate_cultural_score(NEW, storyteller_rec);
  ELSE
    cultural := 0;
  END IF;

  -- Calculate weighted total (default weights)
  -- quality (30%) + engagement (25%) + cultural (20%) + recency (15%) + diversity (10%)
  -- Note: diversity is calculated during auto-assignment, not per-story
  total := (quality * 0.30) +
           (engagement * 0.25) +
           (cultural * 0.20) +
           (recency * 0.15);

  -- Update scores
  NEW.quality_score := quality;
  NEW.engagement_score := engagement;
  NEW.cultural_score := cultural;
  NEW.recency_score := recency;
  NEW.total_score := total;
  NEW.last_placement_update := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update scores on story changes
DROP TRIGGER IF EXISTS trigger_update_story_scores ON stories;
CREATE TRIGGER trigger_update_story_scores
  BEFORE INSERT OR UPDATE OF is_featured, is_verified, elder_approval_given,
    contains_traditional_knowledge, views, shares, likes, content
  ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_story_scores();

-- Backfill scores for existing stories
-- (This will run the trigger function for all existing rows)
UPDATE stories SET last_placement_update = NOW() WHERE is_public = true;

-- Create view for easy score inspection
CREATE OR REPLACE VIEW story_scores AS
SELECT
  s.id,
  s.title,
  st.preferred_name AS storyteller,
  st.is_elder,
  s.page_context,
  s.page_section,
  s.display_order,
  s.quality_score,
  s.engagement_score,
  s.cultural_score,
  s.recency_score,
  s.total_score,
  s.auto_placed,
  s.is_featured,
  s.is_verified,
  s.views,
  s.shares,
  s.likes,
  s.created_at,
  s.last_placement_update
FROM stories s
LEFT JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.is_public = true
ORDER BY s.total_score DESC;

-- Grant permissions
GRANT SELECT ON story_scores TO anon, authenticated;

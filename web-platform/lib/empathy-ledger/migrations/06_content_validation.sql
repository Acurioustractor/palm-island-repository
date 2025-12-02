-- Migration 06: Content Validation System
-- Adds validation workflow for scraped content before public display

-- Add validation fields to scraped_content
ALTER TABLE scraped_content ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false;
ALTER TABLE scraped_content ADD COLUMN IF NOT EXISTS validated_by UUID;
ALTER TABLE scraped_content ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;
ALTER TABLE scraped_content ADD COLUMN IF NOT EXISTS validation_notes TEXT;
ALTER TABLE scraped_content ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE scraped_content ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100);

-- Add validation fields to content_chunks
ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false;
ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS is_quotable BOOLEAN DEFAULT false;  -- Can be used as a quote in reports
ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS quote_attribution TEXT;  -- Who said this
ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed'));
ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS topics TEXT[];  -- Auto-detected or manual topics

-- Create extracted quotes table for annual reports
CREATE TABLE IF NOT EXISTS extracted_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES content_chunks(id) ON DELETE CASCADE,
  story_id UUID,  -- Link to stories table if applicable
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  quote_text TEXT NOT NULL,
  attribution TEXT,  -- Who said it
  context TEXT,  -- Context around the quote

  -- Categorization
  theme TEXT,  -- e.g., 'community', 'services', 'culture', 'history', 'achievement'
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'inspiring', 'reflective')),
  impact_area TEXT,  -- e.g., 'employment', 'youth', 'health', 'culture'

  -- For annual reports
  suggested_for_report BOOLEAN DEFAULT false,
  used_in_report_id UUID,
  display_order INTEGER,

  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID,
  validated_at TIMESTAMPTZ,

  -- Media
  photo_url TEXT,  -- Associated photo if any

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content analysis table for AI-generated insights
CREATE TABLE IF NOT EXISTS content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,

  -- AI Analysis
  summary TEXT,
  key_points JSONB,  -- Array of key points
  entities JSONB,  -- People, places, organizations mentioned
  topics TEXT[],
  sentiment_overall TEXT,
  sentiment_score REAL,  -- -1 to 1

  -- For annual reports
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  suggested_sections TEXT[],  -- Which report sections this could fit

  -- Quotes extraction
  extracted_quotes JSONB,  -- Auto-extracted quotes with context

  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  model_used TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraped_content_validated ON scraped_content(is_validated);
CREATE INDEX IF NOT EXISTS idx_scraped_content_featured ON scraped_content(is_featured);
CREATE INDEX IF NOT EXISTS idx_content_chunks_quotable ON content_chunks(is_quotable);
CREATE INDEX IF NOT EXISTS idx_extracted_quotes_theme ON extracted_quotes(theme);
CREATE INDEX IF NOT EXISTS idx_extracted_quotes_suggested ON extracted_quotes(suggested_for_report);
CREATE INDEX IF NOT EXISTS idx_content_analysis_relevance ON content_analysis(relevance_score DESC);

-- RLS for new tables
ALTER TABLE extracted_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read extracted_quotes" ON extracted_quotes FOR SELECT USING (is_validated = true);
CREATE POLICY "Service write extracted_quotes" ON extracted_quotes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Public read content_analysis" ON content_analysis FOR SELECT USING (true);
CREATE POLICY "Service write content_analysis" ON content_analysis FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to get validated content for public display
CREATE OR REPLACE FUNCTION get_validated_content(
  limit_count INT DEFAULT 20,
  source_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  url TEXT,
  source_name TEXT,
  scraped_at TIMESTAMPTZ,
  quality_score INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.title,
    sc.markdown_content,
    sc.url,
    ss.name as source_name,
    sc.scraped_at,
    sc.quality_score
  FROM scraped_content sc
  JOIN scrape_sources ss ON sc.source_id = ss.id
  WHERE sc.is_validated = true
    AND (source_type_filter IS NULL OR ss.source_type = source_type_filter)
  ORDER BY sc.scraped_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get quotes for annual report
CREATE OR REPLACE FUNCTION get_report_quotes(
  theme_filter TEXT DEFAULT NULL,
  impact_area_filter TEXT DEFAULT NULL,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  quote_text TEXT,
  attribution TEXT,
  context TEXT,
  theme TEXT,
  sentiment TEXT,
  photo_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    eq.id,
    eq.quote_text,
    eq.attribution,
    eq.context,
    eq.theme,
    eq.sentiment,
    eq.photo_url
  FROM extracted_quotes eq
  WHERE eq.is_validated = true
    AND eq.suggested_for_report = true
    AND (theme_filter IS NULL OR eq.theme = theme_filter)
    AND (impact_area_filter IS NULL OR eq.impact_area = impact_area_filter)
  ORDER BY eq.created_at DESC
  LIMIT limit_count;
END;
$$;

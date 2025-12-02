-- Migration 07: Complete Reset & Setup
-- Run this to set up or reset the entire content/quotes system
-- This is safe to run multiple times (uses IF NOT EXISTS)

-- ============================================
-- CORE SCRAPER TABLES
-- ============================================

-- Scrape Sources - where we get content from
CREATE TABLE IF NOT EXISTS scrape_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN (
    'website', 'news_site', 'government', 'social_media', 'pdf_repository', 'rss_feed'
  )),
  scrape_frequency TEXT DEFAULT 'weekly' CHECK (scrape_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'manual'
  )),
  css_selectors JSONB,
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scrape Jobs - track scraping operations
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scrape_sources(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  pages_scraped INTEGER DEFAULT 0,
  chunks_created INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped Content - raw scraped content
CREATE TABLE IF NOT EXISTS scraped_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scrape_sources(id) ON DELETE CASCADE,
  job_id UUID REFERENCES scrape_jobs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  markdown_content TEXT,
  metadata JSONB,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  -- Validation fields
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  is_featured BOOLEAN DEFAULT false,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  UNIQUE(content_hash)
);

-- Content Chunks - chunked content for search
CREATE TABLE IF NOT EXISTS content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_hash TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB,
  -- Validation fields
  is_validated BOOLEAN DEFAULT false,
  is_quotable BOOLEAN DEFAULT false,
  quote_attribution TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  topics TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chunk_hash)
);

-- MinHash signatures for near-duplicate detection
CREATE TABLE IF NOT EXISTS content_minhash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,
  signature INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id)
);

-- ============================================
-- QUOTES SYSTEM
-- ============================================

-- Extracted Quotes - for annual reports
CREATE TABLE IF NOT EXISTS extracted_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES content_chunks(id) ON DELETE SET NULL,
  story_id UUID,
  profile_id UUID,

  quote_text TEXT NOT NULL,
  attribution TEXT,
  context TEXT,

  -- Categorization
  theme TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'inspiring', 'reflective')),
  impact_area TEXT,

  -- For annual reports
  suggested_for_report BOOLEAN DEFAULT false,
  used_in_report_id UUID,
  display_order INTEGER,

  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID,
  validated_at TIMESTAMPTZ,

  -- Media
  photo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Analysis - AI-generated insights
CREATE TABLE IF NOT EXISTS content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,

  summary TEXT,
  key_points JSONB,
  entities JSONB,
  topics TEXT[],
  sentiment_overall TEXT,
  sentiment_score REAL,

  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  suggested_sections TEXT[],
  extracted_quotes JSONB,

  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  model_used TEXT
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scrape_sources_active ON scrape_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraped_content_source ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_hash ON scraped_content(content_hash);
CREATE INDEX IF NOT EXISTS idx_scraped_content_validated ON scraped_content(is_validated);
CREATE INDEX IF NOT EXISTS idx_scraped_content_featured ON scraped_content(is_featured);
CREATE INDEX IF NOT EXISTS idx_content_chunks_content ON content_chunks(content_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_quotable ON content_chunks(is_quotable);
CREATE INDEX IF NOT EXISTS idx_extracted_quotes_theme ON extracted_quotes(theme);
CREATE INDEX IF NOT EXISTS idx_extracted_quotes_suggested ON extracted_quotes(suggested_for_report);
CREATE INDEX IF NOT EXISTS idx_extracted_quotes_validated ON extracted_quotes(is_validated);
CREATE INDEX IF NOT EXISTS idx_content_analysis_relevance ON content_analysis(relevance_score DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_content_chunks_text ON content_chunks USING gin(to_tsvector('english', chunk_text));
CREATE INDEX IF NOT EXISTS idx_scraped_content_title ON scraped_content USING gin(to_tsvector('english', COALESCE(title, '')));

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE scrape_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_minhash ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analysis ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to fail)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read scrape_sources" ON scrape_sources;
  DROP POLICY IF EXISTS "Public read scrape_jobs" ON scrape_jobs;
  DROP POLICY IF EXISTS "Public read scraped_content" ON scraped_content;
  DROP POLICY IF EXISTS "Public read content_chunks" ON content_chunks;
  DROP POLICY IF EXISTS "Public read content_minhash" ON content_minhash;
  DROP POLICY IF EXISTS "Public read extracted_quotes" ON extracted_quotes;
  DROP POLICY IF EXISTS "Public read content_analysis" ON content_analysis;
  DROP POLICY IF EXISTS "Service write scrape_sources" ON scrape_sources;
  DROP POLICY IF EXISTS "Service write scrape_jobs" ON scrape_jobs;
  DROP POLICY IF EXISTS "Service write scraped_content" ON scraped_content;
  DROP POLICY IF EXISTS "Service write content_chunks" ON content_chunks;
  DROP POLICY IF EXISTS "Service write content_minhash" ON content_minhash;
  DROP POLICY IF EXISTS "Service write extracted_quotes" ON extracted_quotes;
  DROP POLICY IF EXISTS "Service write content_analysis" ON content_analysis;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Public read policies
CREATE POLICY "Public read scrape_sources" ON scrape_sources FOR SELECT USING (true);
CREATE POLICY "Public read scrape_jobs" ON scrape_jobs FOR SELECT USING (true);
CREATE POLICY "Public read scraped_content" ON scraped_content FOR SELECT USING (true);
CREATE POLICY "Public read content_chunks" ON content_chunks FOR SELECT USING (true);
CREATE POLICY "Public read content_minhash" ON content_minhash FOR SELECT USING (true);
CREATE POLICY "Public read extracted_quotes" ON extracted_quotes FOR SELECT USING (true);
CREATE POLICY "Public read content_analysis" ON content_analysis FOR SELECT USING (true);

-- Service role write policies
CREATE POLICY "Service write scrape_sources" ON scrape_sources FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service write scrape_jobs" ON scrape_jobs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service write scraped_content" ON scraped_content FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service write content_chunks" ON content_chunks FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service write content_minhash" ON content_minhash FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service write extracted_quotes" ON extracted_quotes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service write content_analysis" ON content_analysis FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search content
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  url TEXT,
  source_name TEXT,
  scraped_at TIMESTAMPTZ,
  rank REAL
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
    ts_rank(to_tsvector('english', COALESCE(sc.title, '') || ' ' || COALESCE(sc.markdown_content, '')), plainto_tsquery('english', search_query)) as rank
  FROM scraped_content sc
  LEFT JOIN scrape_sources ss ON sc.source_id = ss.id
  WHERE to_tsvector('english', COALESCE(sc.title, '') || ' ' || COALESCE(sc.markdown_content, '')) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- Function to get quotes for annual report
CREATE OR REPLACE FUNCTION get_report_quotes(
  theme_filter TEXT DEFAULT NULL,
  impact_area_filter TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  quote_text TEXT,
  attribution TEXT,
  context TEXT,
  theme TEXT,
  sentiment TEXT,
  photo_url TEXT,
  is_validated BOOLEAN,
  suggested_for_report BOOLEAN
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
    eq.photo_url,
    eq.is_validated,
    eq.suggested_for_report
  FROM extracted_quotes eq
  WHERE (theme_filter IS NULL OR eq.theme = theme_filter)
    AND (impact_area_filter IS NULL OR eq.impact_area = impact_area_filter)
  ORDER BY eq.is_validated DESC, eq.suggested_for_report DESC, eq.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get sources due for scraping
CREATE OR REPLACE FUNCTION get_sources_due_for_scraping()
RETURNS TABLE (
  id UUID,
  name TEXT,
  url TEXT,
  source_type TEXT,
  scrape_frequency TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id,
    ss.name,
    ss.url,
    ss.source_type,
    ss.scrape_frequency
  FROM scrape_sources ss
  WHERE ss.is_active = true
    AND (
      ss.last_scraped_at IS NULL
      OR (ss.scrape_frequency = 'daily' AND ss.last_scraped_at < NOW() - INTERVAL '1 day')
      OR (ss.scrape_frequency = 'weekly' AND ss.last_scraped_at < NOW() - INTERVAL '1 week')
      OR (ss.scrape_frequency = 'monthly' AND ss.last_scraped_at < NOW() - INTERVAL '1 month')
      OR (ss.scrape_frequency = 'quarterly' AND ss.last_scraped_at < NOW() - INTERVAL '3 months')
    );
END;
$$;

-- ============================================
-- DEFAULT CONTENT SOURCES
-- ============================================

-- Clear existing sources (to reset)
DELETE FROM scrape_sources WHERE true;

-- Insert fresh sources
INSERT INTO scrape_sources (name, url, source_type, scrape_frequency) VALUES
  ('PICC Website', 'https://www.picc.com.au', 'website', 'weekly'),
  ('ABC News - Palm Island', 'https://www.abc.net.au/news/topic/palm-island', 'news_site', 'weekly'),
  ('Queensland Government', 'https://www.qld.gov.au/search?query=palm+island', 'government', 'monthly'),
  ('NIAA', 'https://www.niaa.gov.au/search?query=palm+island', 'government', 'monthly'),
  ('SNAICC News', 'https://www.snaicc.org.au/news/', 'news_site', 'monthly'),
  ('National Indigenous Times', 'https://nit.com.au/tag/palm-island/', 'news_site', 'weekly'),
  ('The Guardian Indigenous', 'https://www.theguardian.com/australia-news/indigenous-australians', 'news_site', 'weekly'),
  ('Koori Mail', 'https://koorimail.com/', 'news_site', 'weekly'),
  ('Indigenous X', 'https://indigenousx.com.au/', 'news_site', 'weekly'),
  ('Deadly Story', 'https://deadlystory.com/', 'news_site', 'monthly')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE QUOTES FOR TESTING
-- ============================================

-- Insert sample quotes so there's something to show immediately
INSERT INTO extracted_quotes (quote_text, attribution, context, theme, sentiment, impact_area, suggested_for_report, is_validated) VALUES
  ('Our community is our strength. When we work together, there is nothing we cannot achieve.', 'Community Elder', 'Speaking at the 2024 Community Meeting', 'community', 'inspiring', 'community', true, true),
  ('The young people are our future. We invest in them because they will carry our stories forward.', 'Youth Program Coordinator', 'Youth Services Annual Review', 'youth', 'positive', 'youth', true, true),
  ('Employment on Palm Island is not just about jobs - it is about building pride and purpose in our community.', 'Employment Services Manager', 'Employment Report 2024', 'achievement', 'inspiring', 'employment', true, true),
  ('We are seeing real change. Families are stronger, children are thriving, and our culture is alive.', 'Community Services Director', 'Community Impact Assessment', 'services', 'positive', 'community', true, true),
  ('Our cultural programs reconnect our young people with their identity. This is the foundation of everything.', 'Cultural Program Leader', 'Cultural Program Review', 'culture', 'inspiring', 'culture', true, true),
  ('Health outcomes are improving because we deliver services our way, with our people, in our community.', 'Health Services Coordinator', 'Health Services Report', 'services', 'positive', 'health', true, true),
  ('Every story we collect preserves our history for future generations. This work matters.', 'Story Archive Coordinator', 'Digital Archive Project Update', 'history', 'reflective', 'culture', true, true),
  ('The infrastructure projects have transformed our community. We now have facilities we can be proud of.', 'Infrastructure Manager', 'Infrastructure Report', 'achievement', 'positive', 'infrastructure', true, false)
ON CONFLICT DO NOTHING;

-- Mark completion
SELECT 'Migration 07 completed successfully. Tables created, indexes built, sample data inserted.' as status;

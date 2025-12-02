-- Migration 05: Scraper and RAG System
-- Creates tables for web scraping, content chunking, and vector search

-- ============================================
-- SCRAPE SOURCES - Configuration for web sources
-- ============================================
CREATE TABLE IF NOT EXISTS scrape_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN (
    'website', 'news_site', 'government', 'social_media', 'pdf_repository'
  )),
  scrape_frequency TEXT DEFAULT 'monthly' CHECK (scrape_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'manual'
  )),
  css_selectors JSONB,  -- Custom selectors for content extraction
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCRAPE JOBS - Track scraping operations
-- ============================================
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

-- ============================================
-- SCRAPED CONTENT - Raw scraped content
-- ============================================
CREATE TABLE IF NOT EXISTS scraped_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scrape_sources(id) ON DELETE CASCADE,
  job_id UUID REFERENCES scrape_jobs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- SHA-256 hash for exact deduplication
  markdown_content TEXT,  -- Cleaned markdown version
  metadata JSONB,  -- Author, date, tags, etc.
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_hash)
);

-- ============================================
-- CONTENT CHUNKS - Chunked content for RAG
-- ============================================
CREATE TABLE IF NOT EXISTS content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,
  knowledge_entry_id UUID REFERENCES knowledge_entries(id) ON DELETE SET NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_hash TEXT NOT NULL,  -- For chunk-level deduplication
  token_count INTEGER,
  -- Note: embedding column commented out - enable when pgvector is installed
  -- embedding vector(1024),  -- Voyage AI voyage-3-lite dimension
  metadata JSONB,  -- Position info, headers, surrounding context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chunk_hash)
);

-- ============================================
-- MINHASH SIGNATURES - For near-duplicate detection
-- ============================================
CREATE TABLE IF NOT EXISTS content_minhash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES scraped_content(id) ON DELETE CASCADE,
  signature INTEGER[] NOT NULL,  -- MinHash signature array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Scrape sources indexes
CREATE INDEX IF NOT EXISTS idx_scrape_sources_active ON scrape_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_scrape_sources_type ON scrape_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_scrape_sources_frequency ON scrape_sources(scrape_frequency);

-- Scrape jobs indexes
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_source ON scrape_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_created ON scrape_jobs(created_at DESC);

-- Scraped content indexes
CREATE INDEX IF NOT EXISTS idx_scraped_content_source ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_job ON scraped_content(job_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_hash ON scraped_content(content_hash);
CREATE INDEX IF NOT EXISTS idx_scraped_content_scraped_at ON scraped_content(scraped_at DESC);

-- Content chunks indexes
CREATE INDEX IF NOT EXISTS idx_content_chunks_content ON content_chunks(content_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_knowledge ON content_chunks(knowledge_entry_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_hash ON content_chunks(chunk_hash);

-- Full-text search on chunks
CREATE INDEX IF NOT EXISTS idx_content_chunks_text ON content_chunks USING gin(to_tsvector('english', chunk_text));

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE scrape_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_minhash ENABLE ROW LEVEL SECURITY;

-- Public read access for all scraper tables (content is public knowledge)
CREATE POLICY "Public read access for scrape_sources" ON scrape_sources
  FOR SELECT USING (true);

CREATE POLICY "Public read access for scrape_jobs" ON scrape_jobs
  FOR SELECT USING (true);

CREATE POLICY "Public read access for scraped_content" ON scraped_content
  FOR SELECT USING (true);

CREATE POLICY "Public read access for content_chunks" ON content_chunks
  FOR SELECT USING (true);

CREATE POLICY "Public read access for content_minhash" ON content_minhash
  FOR SELECT USING (true);

-- Service role full access (for scraper operations)
CREATE POLICY "Service role full access scrape_sources" ON scrape_sources
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access scrape_jobs" ON scrape_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access scraped_content" ON scraped_content
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access content_chunks" ON content_chunks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access content_minhash" ON content_minhash
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to search chunks by text similarity
CREATE OR REPLACE FUNCTION search_chunks(
  search_query TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  rank REAL,
  source_url TEXT,
  source_title TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.chunk_text,
    ts_rank(to_tsvector('english', cc.chunk_text), plainto_tsquery('english', search_query)) as rank,
    sc.url as source_url,
    sc.title as source_title,
    cc.metadata
  FROM content_chunks cc
  JOIN scraped_content sc ON cc.content_id = sc.id
  WHERE to_tsvector('english', cc.chunk_text) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
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
-- DEFAULT SCRAPE SOURCES
-- ============================================

INSERT INTO scrape_sources (name, url, source_type, scrape_frequency) VALUES
  ('PICC Website', 'https://www.picc.com.au', 'website', 'monthly'),
  ('Queensland Government - Palm Island', 'https://www.qld.gov.au/search?query=palm+island', 'government', 'monthly'),
  ('ABC News - Palm Island', 'https://www.abc.net.au/news/topic/palm-island', 'news_site', 'weekly'),
  ('NIAA - Palm Island', 'https://www.niaa.gov.au/search?query=palm+island', 'government', 'monthly'),
  ('SNAICC News', 'https://www.snaicc.org.au/news/', 'news_site', 'monthly')
ON CONFLICT DO NOTHING;

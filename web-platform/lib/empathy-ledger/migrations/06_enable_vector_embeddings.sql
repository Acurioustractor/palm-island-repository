-- ============================================================================
-- Migration 06: Enable Vector Embeddings
-- Activates pgvector columns and creates similarity search functions
-- ============================================================================

-- ============================================================================
-- STEP 1: Add Vector Columns
-- ============================================================================

-- Add vector column to knowledge_entries (OpenAI text-embedding-3-small dimension)
ALTER TABLE knowledge_entries
ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);

-- Add vector column to content_chunks (Voyage AI voyage-3-lite dimension)
ALTER TABLE content_chunks
ADD COLUMN IF NOT EXISTS embedding VECTOR(1024);

-- Add vector column to stories for semantic search
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);

-- ============================================================================
-- STEP 2: Create Vector Similarity Indexes
-- Using IVFFlat algorithm for efficient similarity search
-- Lists = sqrt(rows), aiming for ~100 lists for current scale
-- ============================================================================

-- Index for knowledge_entries
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_embedding
ON knowledge_entries
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for content_chunks
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding
ON content_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for stories
CREATE INDEX IF NOT EXISTS idx_stories_embedding
ON stories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================================
-- STEP 3: Vector Similarity Search Functions
-- ============================================================================

-- Function to search content chunks by vector similarity
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1024),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB,
  source_url TEXT,
  source_title TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.chunk_text,
    1 - (cc.embedding <=> query_embedding) as similarity,
    cc.metadata,
    sc.url as source_url,
    sc.title as source_title
  FROM content_chunks cc
  LEFT JOIN scraped_content sc ON cc.content_id = sc.id
  WHERE cc.embedding IS NOT NULL
    AND 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search knowledge entries by vector similarity
CREATE OR REPLACE FUNCTION match_knowledge_entries(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  summary TEXT,
  content TEXT,
  entry_type TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.slug,
    ke.title,
    ke.summary,
    ke.content,
    ke.entry_type,
    ke.category,
    1 - (ke.embedding <=> query_embedding) as similarity
  FROM knowledge_entries ke
  WHERE ke.embedding IS NOT NULL
    AND 1 - (ke.embedding <=> query_embedding) > match_threshold
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search stories by vector similarity
CREATE OR REPLACE FUNCTION match_stories(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  impact_area TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.content,
    s.category,
    s.impact_area,
    1 - (s.embedding <=> query_embedding) as similarity
  FROM stories s
  WHERE s.embedding IS NOT NULL
    AND 1 - (s.embedding <=> query_embedding) > match_threshold
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- STEP 4: Hybrid Search Function (Vector + Full-text)
-- Combines vector similarity with full-text search
-- ============================================================================

CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text TEXT,
  query_embedding VECTOR(1024),
  match_count INT DEFAULT 10,
  vector_weight FLOAT DEFAULT 0.7,
  keyword_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  hybrid_score FLOAT,
  vector_similarity FLOAT,
  keyword_rank FLOAT,
  source_url TEXT,
  source_title TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      cc.id,
      cc.chunk_text,
      1 - (cc.embedding <=> query_embedding) as similarity,
      cc.metadata,
      sc.url as source_url,
      sc.title as source_title
    FROM content_chunks cc
    LEFT JOIN scraped_content sc ON cc.content_id = sc.id
    WHERE cc.embedding IS NOT NULL
    ORDER BY cc.embedding <=> query_embedding
    LIMIT match_count * 3
  ),
  keyword_search AS (
    SELECT
      cc.id,
      cc.chunk_text,
      ts_rank(to_tsvector('english', cc.chunk_text), plainto_tsquery('english', query_text)) as rank,
      cc.metadata,
      sc.url as source_url,
      sc.title as source_title
    FROM content_chunks cc
    LEFT JOIN scraped_content sc ON cc.content_id = sc.id
    WHERE to_tsvector('english', cc.chunk_text) @@ plainto_tsquery('english', query_text)
    ORDER BY rank DESC
    LIMIT match_count * 3
  )
  SELECT
    COALESCE(vs.id, ks.id) as id,
    COALESCE(vs.chunk_text, ks.chunk_text) as chunk_text,
    (COALESCE(vs.similarity, 0) * vector_weight + COALESCE(ks.rank, 0) * keyword_weight) as hybrid_score,
    COALESCE(vs.similarity, 0) as vector_similarity,
    COALESCE(ks.rank, 0) as keyword_rank,
    COALESCE(vs.source_url, ks.source_url) as source_url,
    COALESCE(vs.source_title, ks.source_title) as source_title,
    COALESCE(vs.metadata, ks.metadata) as metadata
  FROM vector_search vs
  FULL OUTER JOIN keyword_search ks ON vs.id = ks.id
  ORDER BY hybrid_score DESC
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- STEP 5: Helper Functions
-- ============================================================================

-- Function to check if embeddings are enabled and populated
CREATE OR REPLACE FUNCTION check_embeddings_status()
RETURNS TABLE (
  table_name TEXT,
  total_rows BIGINT,
  rows_with_embeddings BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'knowledge_entries'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(embedding)::BIGINT,
    ROUND((COUNT(embedding)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM knowledge_entries
  UNION ALL
  SELECT
    'content_chunks'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(embedding)::BIGINT,
    ROUND((COUNT(embedding)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM content_chunks
  UNION ALL
  SELECT
    'stories'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(embedding)::BIGINT,
    ROUND((COUNT(embedding)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2)
  FROM stories;
END;
$$;

-- Function to find similar content (useful for deduplication)
CREATE OR REPLACE FUNCTION find_similar_content(
  source_id UUID,
  similarity_threshold FLOAT DEFAULT 0.95
)
RETURNS TABLE (
  similar_id UUID,
  similarity FLOAT,
  chunk_text TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  source_embedding VECTOR(1024);
BEGIN
  -- Get the embedding of the source chunk
  SELECT embedding INTO source_embedding
  FROM content_chunks
  WHERE id = source_id;

  IF source_embedding IS NULL THEN
    RAISE EXCEPTION 'Source chunk has no embedding';
  END IF;

  RETURN QUERY
  SELECT
    cc.id as similar_id,
    1 - (cc.embedding <=> source_embedding) as similarity,
    cc.chunk_text
  FROM content_chunks cc
  WHERE cc.id != source_id
    AND cc.embedding IS NOT NULL
    AND 1 - (cc.embedding <=> source_embedding) > similarity_threshold
  ORDER BY cc.embedding <=> source_embedding
  LIMIT 10;
END;
$$;

-- ============================================================================
-- STEP 6: Update Scraper Configuration
-- Enable embeddings in scrape_sources metadata
-- ============================================================================

UPDATE scrape_sources
SET css_selectors = COALESCE(css_selectors, '{}'::jsonb) || '{"generate_embeddings": true}'::jsonb
WHERE is_active = true;

-- ============================================================================
-- STEP 7: Test Queries (commented out - uncomment to test after indexing)
-- ============================================================================

/*
-- Test 1: Check embeddings status
SELECT * FROM check_embeddings_status();

-- Test 2: Test vector search (after you have embeddings)
-- You'll need to generate an embedding first, example:
-- SELECT * FROM match_chunks(
--   '[0.1, 0.2, ...]'::vector(1024),  -- Your query embedding
--   10,                                 -- Return top 10
--   0.7                                 -- Similarity threshold
-- );

-- Test 3: Test hybrid search (after you have embeddings)
-- SELECT * FROM hybrid_search_chunks(
--   'Palm Island community services',  -- Query text
--   '[0.1, 0.2, ...]'::vector(1024),  -- Query embedding
--   10,                                 -- Return top 10
--   0.7,                                -- Vector weight
--   0.3                                 -- Keyword weight
-- );
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify vector columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'knowledge_entries'
    AND column_name = 'embedding'
  ) THEN
    RAISE NOTICE '✓ knowledge_entries.embedding column exists';
  ELSE
    RAISE EXCEPTION '✗ knowledge_entries.embedding column missing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'content_chunks'
    AND column_name = 'embedding'
  ) THEN
    RAISE NOTICE '✓ content_chunks.embedding column exists';
  ELSE
    RAISE EXCEPTION '✗ content_chunks.embedding column missing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'stories'
    AND column_name = 'embedding'
  ) THEN
    RAISE NOTICE '✓ stories.embedding column exists';
  ELSE
    RAISE EXCEPTION '✗ stories.embedding column missing';
  END IF;

  RAISE NOTICE '✓ All vector columns created successfully';
END;
$$;

-- Verify indexes exist
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname IN (
  'idx_knowledge_entries_embedding',
  'idx_content_chunks_embedding',
  'idx_stories_embedding'
)
ORDER BY tablename, indexname;

-- ============================================================================
-- COMPLETE
-- ============================================================================

SELECT '✓ Migration 06 complete - Vector embeddings enabled!' as status;

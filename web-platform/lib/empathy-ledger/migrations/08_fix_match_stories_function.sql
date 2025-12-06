-- ============================================================================
-- Migration 08: Fix match_stories() Function
-- Updates the function to use correct column names from stories table
-- ============================================================================

-- Drop the old function first
DROP FUNCTION IF EXISTS match_stories(VECTOR(1536), INT, FLOAT);

-- Create corrected match_stories function
CREATE OR REPLACE FUNCTION match_stories(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  story_type TEXT,
  category TEXT,
  similarity FLOAT,
  is_public BOOLEAN,
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
    s.category,
    1 - (s.embedding <=> query_embedding) as similarity,
    s.is_public,
    s.is_featured
  FROM stories s
  WHERE s.embedding IS NOT NULL
    AND 1 - (s.embedding <=> query_embedding) > match_threshold
    AND s.is_public = true  -- Only return public stories
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create helper function to get similar stories (for "You might also like")
CREATE OR REPLACE FUNCTION get_similar_stories(
  source_story_id UUID,
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  story_type TEXT,
  similarity FLOAT,
  storyteller_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
  source_embedding VECTOR(1536);
BEGIN
  -- Get the embedding of the source story
  SELECT embedding INTO source_embedding
  FROM stories
  WHERE id = source_story_id;

  IF source_embedding IS NULL THEN
    RAISE EXCEPTION 'Source story has no embedding';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.story_type,
    1 - (s.embedding <=> source_embedding) as similarity,
    s.storyteller_id
  FROM stories s
  WHERE s.id != source_story_id
    AND s.embedding IS NOT NULL
    AND s.is_public = true
    AND 1 - (s.embedding <=> source_embedding) > match_threshold
  ORDER BY s.embedding <=> source_embedding
  LIMIT match_count;
END;
$$;

-- Create function to search stories by text and vector (hybrid)
CREATE OR REPLACE FUNCTION hybrid_search_stories(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  vector_weight FLOAT DEFAULT 0.7,
  keyword_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  story_type TEXT,
  hybrid_score FLOAT,
  vector_similarity FLOAT,
  keyword_rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      s.id,
      s.title,
      s.content,
      s.story_type,
      1 - (s.embedding <=> query_embedding) as similarity
    FROM stories s
    WHERE s.embedding IS NOT NULL
      AND s.is_public = true
    ORDER BY s.embedding <=> query_embedding
    LIMIT match_count * 3
  ),
  keyword_search AS (
    SELECT
      s.id,
      s.title,
      s.content,
      s.story_type,
      ts_rank(to_tsvector('english', s.title || ' ' || COALESCE(s.content, '')), plainto_tsquery('english', query_text)) as rank
    FROM stories s
    WHERE s.is_public = true
      AND to_tsvector('english', s.title || ' ' || COALESCE(s.content, '')) @@ plainto_tsquery('english', query_text)
    ORDER BY rank DESC
    LIMIT match_count * 3
  )
  SELECT
    COALESCE(vs.id, ks.id) as id,
    COALESCE(vs.title, ks.title) as title,
    COALESCE(vs.content, ks.content) as content,
    COALESCE(vs.story_type, ks.story_type) as story_type,
    (COALESCE(vs.similarity, 0) * vector_weight + COALESCE(ks.rank, 0) * keyword_weight) as hybrid_score,
    COALESCE(vs.similarity, 0) as vector_similarity,
    COALESCE(ks.rank, 0) as keyword_rank
  FROM vector_search vs
  FULL OUTER JOIN keyword_search ks ON vs.id = ks.id
  ORDER BY hybrid_score DESC
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- Test the functions (uncomment to run after embeddings are generated)
-- ============================================================================

/*
-- Test 1: Check if functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%stories%'
ORDER BY routine_name;

-- Test 2: Test match_stories with dummy embedding
-- SELECT * FROM match_stories(
--   array_fill(0.0, ARRAY[1536])::vector(1536),
--   5,
--   0.0  -- Use 0.0 threshold for testing
-- );
*/

-- Verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'match_stories'
  ) THEN
    RAISE NOTICE '✓ match_stories() function created successfully';
  ELSE
    RAISE EXCEPTION '✗ match_stories() function not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'get_similar_stories'
  ) THEN
    RAISE NOTICE '✓ get_similar_stories() function created successfully';
  ELSE
    RAISE EXCEPTION '✗ get_similar_stories() function not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'hybrid_search_stories'
  ) THEN
    RAISE NOTICE '✓ hybrid_search_stories() function created successfully';
  ELSE
    RAISE EXCEPTION '✗ hybrid_search_stories() function not found';
  END IF;

  RAISE NOTICE '✓ All story search functions fixed!';
END;
$$;

SELECT '✓ Migration 08 complete - Story search functions fixed!' as status;

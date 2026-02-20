-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Content embeddings table for semantic search
CREATE TABLE IF NOT EXISTS content_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id text NOT NULL,
  content_type text NOT NULL,
  embedding vector(1536),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_id, content_type)
);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_content_embeddings_type ON content_embeddings(content_type);

-- IVFFlat index for fast similarity search (will be created after data is loaded)
-- CREATE INDEX IF NOT EXISTS idx_content_embeddings_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);

-- Function: match content by embedding similarity
CREATE OR REPLACE FUNCTION match_content_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  content_types text[] DEFAULT NULL
)
RETURNS TABLE (
  id text,
  type text,
  title text,
  content text,
  summary text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.content_id AS id,
    ce.content_type AS type,
    COALESCE(
      s.title,
      ke.title,
      os.name,
      p.full_name,
      ce.content_type || ':' || ce.content_id
    ) AS title,
    COALESCE(
      LEFT(s.content, 500),
      LEFT(ke.content, 500),
      os.description,
      p.bio,
      ''
    ) AS content,
    COALESCE(s.summary, ke.summary, '') AS summary,
    (1 - (ce.embedding <=> query_embedding))::float AS similarity,
    '{}'::jsonb AS metadata
  FROM content_embeddings ce
  LEFT JOIN stories s ON ce.content_type = 'story' AND ce.content_id = s.id::text
  LEFT JOIN knowledge_entries ke ON ce.content_type = 'knowledge' AND ce.content_id = ke.id::text
  LEFT JOIN organization_services os ON ce.content_type = 'service' AND ce.content_id = os.id::text
  LEFT JOIN profiles p ON ce.content_type = 'person' AND ce.content_id = p.id::text
  WHERE (1 - (ce.embedding <=> query_embedding)) > match_threshold
    AND (content_types IS NULL OR ce.content_type = ANY(content_types))
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: match knowledge entries by embedding (used by rag-search.ts)
CREATE OR REPLACE FUNCTION match_knowledge_entries(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  match_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id text,
  slug text,
  title text,
  summary text,
  content text,
  entry_type text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id::text,
    ke.slug,
    ke.title,
    ke.summary,
    LEFT(ke.content, 1000),
    ke.entry_type,
    ke.category,
    (1 - (ce.embedding <=> query_embedding))::float AS similarity
  FROM content_embeddings ce
  JOIN knowledge_entries ke ON ce.content_type = 'knowledge' AND ce.content_id = ke.id::text
  WHERE (1 - (ce.embedding <=> query_embedding)) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

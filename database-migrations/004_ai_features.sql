-- ============================================================================
-- AI Features Migration
-- ============================================================================
-- This migration creates tables and functions for AI-powered research features
-- Prerequisites:
--   1. PostgreSQL 12+ with pgvector extension
--   2. Run this via Supabase Dashboard > SQL Editor

-- ============================================================================
-- 1. Enable pgvector Extension
-- ============================================================================

-- Create extension for vector operations (embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. Story Embeddings
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE UNIQUE,
  embedding vector(1536), -- OpenAI embedding dimension
  model_version TEXT DEFAULT 'text-embedding-3-small',
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_story_embeddings_vector
ON story_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_story_embeddings_story ON story_embeddings(story_id);

-- ============================================================================
-- 3. Document Embeddings
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE UNIQUE,
  embedding vector(1536),
  model_version TEXT DEFAULT 'text-embedding-3-small',
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_document ON document_embeddings(document_id);

-- ============================================================================
-- 4. Themes
-- ============================================================================

CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL, -- For hierarchical themes
  color TEXT DEFAULT '#6B7280', -- Hex color for visualization
  icon TEXT, -- Icon name for UI (lucide-react icon name)
  embedding vector(1536), -- Semantic representation of the theme
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_themes_parent ON themes(parent_theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);
CREATE INDEX IF NOT EXISTS idx_themes_embedding
ON themes USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 20);

-- ============================================================================
-- 5. Story-Theme Relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  confidence REAL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0), -- AI confidence score
  relevance_score REAL DEFAULT 0.0 CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0), -- Theme centrality
  extracted_by TEXT DEFAULT 'ai' CHECK (extracted_by IN ('ai', 'manual', 'community')),
  extracted_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_story_theme UNIQUE(story_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_story_themes_story ON story_themes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_theme ON story_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_confidence ON story_themes(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_story_themes_relevance ON story_themes(relevance_score DESC);

-- ============================================================================
-- 6. Story Quotes
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  context_before TEXT, -- Text before the quote
  context_after TEXT, -- Text after the quote
  position_in_story INTEGER, -- Character position in original story

  -- Analysis
  themes TEXT[], -- Associated theme names
  sentiment REAL CHECK (sentiment >= -1.0 AND sentiment <= 1.0), -- -1 (negative) to 1 (positive)
  impact_score REAL CHECK (impact_score >= 0.0 AND impact_score <= 1.0), -- How impactful/memorable

  -- Metadata
  embedding vector(1536), -- For semantic search
  extracted_by TEXT DEFAULT 'ai' CHECK (extracted_by IN ('ai', 'manual', 'community')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_quotes_story ON story_quotes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_quotes_impact ON story_quotes(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_story_quotes_featured ON story_quotes(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_story_quotes_embedding
ON story_quotes USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);
CREATE INDEX IF NOT EXISTS idx_story_quotes_themes ON story_quotes USING GIN(themes);

-- ============================================================================
-- 7. Research Assistant Chat Sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);

-- ============================================================================
-- 8. Chat Messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Context used for RAG (Retrieval Augmented Generation)
  context_stories UUID[], -- Story IDs used as context
  context_documents UUID[], -- Document IDs used as context
  context_quotes UUID[], -- Quote IDs referenced

  -- Metadata
  model_used TEXT, -- e.g., 'gpt-4-turbo-preview'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- ============================================================================
-- 9. Search History
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('semantic', 'keyword', 'theme', 'quote', 'hybrid')),
  filters JSONB, -- Store filter parameters
  results_count INTEGER,
  clicked_results UUID[], -- IDs of stories/docs clicked
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_type ON search_history(search_type);

-- ============================================================================
-- 10. Saved Searches (Bookmarks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('semantic', 'keyword', 'theme', 'quote', 'hybrid')),
  filters JSONB, -- Store filter parameters
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created ON saved_searches(created_at DESC);

-- ============================================================================
-- 11. Functions for AI Features
-- ============================================================================

-- Function to find similar stories using vector similarity
CREATE OR REPLACE FUNCTION find_similar_stories(
  query_embedding vector(1536),
  match_threshold REAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  story_id UUID,
  title TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM story_embeddings se
  JOIN stories s ON s.id = se.story_id
  WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
    AND s.is_published = true
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find similar documents
CREATE OR REPLACE FUNCTION find_similar_documents(
  query_embedding vector(1536),
  match_threshold REAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  document_id UUID,
  title TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  JOIN documents d ON d.id = de.document_id
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
    AND d.is_archived = false
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get theme statistics
CREATE OR REPLACE FUNCTION get_theme_stats(p_theme_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'story_count', COUNT(DISTINCT st.story_id),
    'avg_confidence', AVG(st.confidence),
    'avg_relevance', AVG(st.relevance_score),
    'top_storytellers', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT p.full_name, p.preferred_name, COUNT(*) as story_count
        FROM story_themes st2
        JOIN stories s ON s.id = st2.story_id
        JOIN profiles p ON p.id = s.storyteller_id
        WHERE st2.theme_id = p_theme_id
        GROUP BY p.id, p.full_name, p.preferred_name
        ORDER BY story_count DESC
        LIMIT 5
      ) t
    ),
    'related_themes', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT th.id, th.name, COUNT(*) as shared_stories
        FROM story_themes st1
        JOIN story_themes st2 ON st1.story_id = st2.story_id
        JOIN themes th ON th.id = st2.theme_id
        WHERE st1.theme_id = p_theme_id
          AND st2.theme_id != p_theme_id
        GROUP BY th.id, th.name
        ORDER BY shared_stories DESC
        LIMIT 5
      ) t
    )
  )
  INTO result
  FROM story_themes st
  WHERE st.theme_id = p_theme_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update theme story counts
CREATE OR REPLACE FUNCTION update_theme_story_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE themes t
  SET story_count = (
    SELECT COUNT(DISTINCT st.story_id)
    FROM story_themes st
    WHERE st.theme_id = t.id
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update theme counts when story_themes changes
CREATE OR REPLACE FUNCTION trigger_update_theme_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE themes SET story_count = story_count + 1 WHERE id = NEW.theme_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE themes SET story_count = story_count - 1 WHERE id = OLD.theme_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_counts_trigger
AFTER INSERT OR DELETE ON story_themes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_theme_count();

-- Function to search quotes by semantic similarity
CREATE OR REPLACE FUNCTION search_quotes_by_embedding(
  query_embedding vector(1536),
  match_threshold REAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  quote_id UUID,
  quote_text TEXT,
  story_id UUID,
  similarity REAL,
  impact_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sq.id,
    sq.quote_text,
    sq.story_id,
    1 - (sq.embedding <=> query_embedding) AS similarity,
    sq.impact_score
  FROM story_quotes sq
  WHERE 1 - (sq.embedding <=> query_embedding) > match_threshold
  ORDER BY
    (1 - (sq.embedding <=> query_embedding)) * 0.7 + sq.impact_score * 0.3 DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_embeddings_timestamp
BEFORE UPDATE ON story_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_document_embeddings_timestamp
BEFORE UPDATE ON document_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_themes_timestamp
BEFORE UPDATE ON themes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_chat_sessions_timestamp
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 12. Sample Themes (Optional - seed data)
-- ============================================================================

-- Uncomment to insert sample themes
/*
INSERT INTO themes (name, description, color, icon) VALUES
('Housing & Infrastructure', 'Stories about housing, buildings, and infrastructure', '#EF4444', 'Home'),
('Health & Wellbeing', 'Physical and mental health, healthcare access', '#10B981', 'Heart'),
('Cultural Heritage', 'Traditional practices, language, ceremonies', '#8B5CF6', 'Globe'),
('Education & Youth', 'Schools, learning, youth development', '#3B82F6', 'BookOpen'),
('Community Leadership', 'Governance, decision-making, elders', '#F59E0B', 'Users'),
('Family & Kinship', 'Family relationships, connections', '#EC4899', 'Users'),
('Environment & Land', 'Natural environment, land connection', '#059669', 'TreePine'),
('Economic Development', 'Jobs, business, economic opportunities', '#6366F1', 'DollarSign'),
('Justice & Rights', 'Legal issues, rights, advocacy', '#DC2626', 'Scale'),
('Arts & Culture', 'Music, art, storytelling, performance', '#7C3AED', 'Palette')
ON CONFLICT (name) DO NOTHING;
*/

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Next steps:
-- 1. Set up OpenAI API key in environment variables
-- 2. Install OpenAI SDK: npm install openai
-- 3. Create API routes for embeddings, search, themes, quotes, and chat
-- 4. Generate embeddings for existing stories
-- 5. Extract themes and quotes from stories
-- 6. Build frontend components for AI features

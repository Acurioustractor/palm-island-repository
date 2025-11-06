-- ============================================================================
-- STEP-BY-STEP DATABASE FIX
-- ============================================================================
-- Run these in order if you're getting errors
-- Copy each section separately into Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Check What You Have
-- ============================================================================
-- Run this first to see what tables exist

SELECT 'Tables you have:' AS info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- STEP 2: Add Missing role Column (if needed)
-- ============================================================================
-- Only run if you got error: column "role" does not exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'member';
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
            CHECK (role IN ('admin', 'editor', 'member', 'viewer'));
        CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
        RAISE NOTICE '✅ Added role column to profiles table';
    ELSE
        RAISE NOTICE 'ℹ️  role column already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Create documents Table (if missing)
-- ============================================================================
-- Only run if you got error: relation "documents" does not exist

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,

  -- File Information
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  supabase_bucket TEXT DEFAULT 'documents',

  -- Organization
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[],
  document_date DATE,

  -- Metadata
  author TEXT,
  source TEXT,
  related_storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  related_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  -- Access control
  access_level TEXT DEFAULT 'public' CHECK (access_level IN ('public', 'members', 'admin')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,

  -- Audit fields
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);
CREATE INDEX IF NOT EXISTS documents_document_date_idx ON documents(document_date DESC);

SELECT '✅ Documents table created' AS result;

-- ============================================================================
-- STEP 4: Enable pgvector Extension (for AI features)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

SELECT '✅ pgvector extension enabled' AS result;

-- ============================================================================
-- STEP 5: Create AI Tables
-- ============================================================================

-- Story Embeddings
CREATE TABLE IF NOT EXISTS story_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE UNIQUE,
  embedding vector(1536),
  model_version TEXT DEFAULT 'text-embedding-3-small',
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_embeddings_vector
ON story_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_story_embeddings_story ON story_embeddings(story_id);

-- Document Embeddings
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

-- Themes
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#6B7280',
  icon TEXT,
  embedding vector(1536),
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Story Themes
CREATE TABLE IF NOT EXISTS story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  confidence REAL DEFAULT 0.0,
  relevance_score REAL DEFAULT 0.0,
  extracted_by TEXT DEFAULT 'ai',
  extracted_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_story_theme UNIQUE(story_id, theme_id)
);

-- Story Quotes
CREATE TABLE IF NOT EXISTS story_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  context_before TEXT,
  context_after TEXT,
  position_in_story INTEGER,
  themes TEXT[],
  sentiment REAL,
  impact_score REAL,
  embedding vector(1536),
  extracted_by TEXT DEFAULT 'ai',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_stories UUID[],
  context_documents UUID[],
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT,
  filters JSONB,
  results_count INTEGER,
  clicked_results UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT,
  filters JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

SELECT '✅ AI tables created' AS result;

-- ============================================================================
-- STEP 6: Create AI Functions
-- ============================================================================

-- Function to find similar stories
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

SELECT '✅ AI functions created' AS result;

-- ============================================================================
-- STEP 7: Verify Everything
-- ============================================================================

SELECT '=== VERIFICATION ===' AS section;

-- Check role column exists
SELECT 'Checking role column:' AS check;
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'profiles' AND column_name = 'role'
) AS role_column_exists;

-- Check documents table exists
SELECT 'Checking documents table:' AS check;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'documents'
) AS documents_table_exists;

-- Check AI tables exist
SELECT 'Checking AI tables:' AS check;
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('story_embeddings', 'document_embeddings', 'themes')
ORDER BY table_name;

-- Check functions exist
SELECT 'Checking AI functions:' AS check;
SELECT routine_name
FROM information_schema.routines
WHERE routine_name LIKE 'find_similar%';

SELECT '✅ ALL DONE! Database is ready.' AS final_result;

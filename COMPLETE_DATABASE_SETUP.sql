-- ============================================================================
-- COMPLETE DATABASE SETUP FOR PALM ISLAND STORY SERVER
-- ============================================================================
-- This is a complete, all-in-one migration that sets up everything
-- Run this ONCE in a fresh database
-- Copy and paste entire file into Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- ============================================================================
-- PART 2: PROFILES TABLE (Base Schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  community_role TEXT,

  -- System Role (for permissions)
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'editor', 'member', 'viewer')),

  -- Contact
  email TEXT,
  phone TEXT,

  -- Demographics (optional, for impact tracking)
  age_range TEXT,
  gender TEXT,
  indigenous_status TEXT DEFAULT 'Aboriginal or Torres Strait Islander',

  -- Location
  location TEXT DEFAULT 'Palm Island',
  traditional_country TEXT,
  language_group TEXT,

  -- Storyteller Status
  storyteller_type TEXT NOT NULL DEFAULT 'community_member',
  is_elder BOOLEAN DEFAULT FALSE,
  is_cultural_advisor BOOLEAN DEFAULT FALSE,
  is_service_provider BOOLEAN DEFAULT FALSE,

  -- Bio and Background
  bio TEXT,
  expertise_areas TEXT[],
  languages_spoken TEXT[],

  -- Engagement Metrics
  stories_contributed INTEGER DEFAULT 0,
  last_story_date TIMESTAMP,
  engagement_score INTEGER DEFAULT 0,

  -- Cultural Permissions
  can_share_traditional_knowledge BOOLEAN DEFAULT FALSE,
  face_recognition_consent BOOLEAN DEFAULT FALSE,
  face_recognition_consent_date TIMESTAMP,
  photo_consent_contexts TEXT[],

  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'community',
  show_in_directory BOOLEAN DEFAULT TRUE,
  allow_messages BOOLEAN DEFAULT TRUE,

  -- Profile Photo
  avatar_url TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT profiles_storyteller_type_check CHECK (
    storyteller_type IN ('community_member', 'elder', 'youth', 'service_provider', 'cultural_advisor', 'visitor')
  ),
  CONSTRAINT profiles_visibility_check CHECK (
    profile_visibility IN ('public', 'community', 'private')
  )
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_storyteller_type_idx ON profiles(storyteller_type);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles(location);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- ============================================================================
-- PART 3: ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Contact
  website TEXT,
  email TEXT,
  phone TEXT,

  -- Location
  address TEXT,
  abn TEXT,

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0C4A6E',

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug);

-- ============================================================================
-- PART 4: STORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,

  -- Storyteller
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Classification
  category TEXT,
  tags TEXT[],
  themes TEXT[],

  -- Media
  featured_image TEXT,
  media_files TEXT[],

  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,

  -- Permissions
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'community', 'private')),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS stories_storyteller_id_idx ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS stories_organization_id_idx ON stories(organization_id);
CREATE INDEX IF NOT EXISTS stories_is_published_idx ON stories(is_published);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON stories(created_at DESC);

-- ============================================================================
-- PART 5: ANNUAL REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS annual_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Info
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,

  -- Content
  executive_summary TEXT,
  sections JSONB DEFAULT '[]'::jsonb,

  -- Data
  story_ids UUID[],
  statistics JSONB DEFAULT '{}'::jsonb,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),

  -- Publishing
  published_at TIMESTAMP,
  published_by UUID REFERENCES profiles(id),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  CONSTRAINT annual_reports_unique_org_year UNIQUE(organization_id, year)
);

CREATE INDEX IF NOT EXISTS annual_reports_organization_id_idx ON annual_reports(organization_id);
CREATE INDEX IF NOT EXISTS annual_reports_year_idx ON annual_reports(year DESC);

-- ============================================================================
-- PART 6: ENHANCED PROFILES TABLES
-- ============================================================================

-- Storyteller Photos
CREATE TABLE IF NOT EXISTS storyteller_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  caption TEXT,
  photo_date DATE,

  is_profile_photo BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS storyteller_photos_profile_id_idx ON storyteller_photos(profile_id);

-- Storyteller Relationships
CREATE TABLE IF NOT EXISTS storyteller_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  from_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  relationship_type TEXT NOT NULL,
  description TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  CONSTRAINT no_self_relationship CHECK (from_profile_id != to_profile_id),
  CONSTRAINT unique_relationship UNIQUE(from_profile_id, to_profile_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS storyteller_relationships_from_idx ON storyteller_relationships(from_profile_id);
CREATE INDEX IF NOT EXISTS storyteller_relationships_to_idx ON storyteller_relationships(to_profile_id);

-- Storyteller Stats (Cached)
CREATE TABLE IF NOT EXISTS storyteller_stats (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  total_stories INTEGER DEFAULT 0,
  published_stories INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  total_relationships INTEGER DEFAULT 0,

  last_story_date TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 7: DOCUMENTS SYSTEM
-- ============================================================================

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
CREATE INDEX IF NOT EXISTS documents_uploaded_by_idx ON documents(uploaded_by);

-- ============================================================================
-- PART 8: AI FEATURES
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

CREATE INDEX IF NOT EXISTS idx_themes_parent ON themes(parent_theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);

-- Story Themes
CREATE TABLE IF NOT EXISTS story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  confidence REAL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  relevance_score REAL DEFAULT 0.0 CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
  extracted_by TEXT DEFAULT 'ai' CHECK (extracted_by IN ('ai', 'manual', 'community')),
  extracted_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_story_theme UNIQUE(story_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_story_themes_story ON story_themes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_theme ON story_themes(theme_id);

-- Story Quotes
CREATE TABLE IF NOT EXISTS story_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  context_before TEXT,
  context_after TEXT,
  position_in_story INTEGER,
  themes TEXT[],
  sentiment REAL CHECK (sentiment >= -1.0 AND sentiment <= 1.0),
  impact_score REAL CHECK (impact_score >= 0.0 AND impact_score <= 1.0),
  embedding vector(1536),
  extracted_by TEXT DEFAULT 'ai' CHECK (extracted_by IN ('ai', 'manual', 'community')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_quotes_story ON story_quotes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_quotes_impact ON story_quotes(impact_score DESC);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_stories UUID[],
  context_documents UUID[],
  context_quotes UUID[],
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('semantic', 'keyword', 'theme', 'quote', 'hybrid')),
  filters JSONB,
  results_count INTEGER,
  clicked_results UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('semantic', 'keyword', 'theme', 'quote', 'hybrid')),
  filters JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- ============================================================================
-- PART 9: FUNCTIONS
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

-- Function to update storyteller stats
CREATE OR REPLACE FUNCTION update_storyteller_stats(p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO storyteller_stats (
    profile_id,
    total_stories,
    published_stories,
    total_photos,
    total_relationships,
    last_story_date,
    last_updated
  )
  SELECT
    p_profile_id,
    COUNT(DISTINCT s.id),
    COUNT(DISTINCT s.id) FILTER (WHERE s.is_published = true),
    COUNT(DISTINCT sp.id),
    COUNT(DISTINCT sr.id),
    MAX(s.created_at),
    NOW()
  FROM profiles p
  LEFT JOIN stories s ON s.storyteller_id = p.id
  LEFT JOIN storyteller_photos sp ON sp.profile_id = p.id
  LEFT JOIN storyteller_relationships sr ON sr.from_profile_id = p.id OR sr.to_profile_id = p.id
  WHERE p.id = p_profile_id
  ON CONFLICT (profile_id)
  DO UPDATE SET
    total_stories = EXCLUDED.total_stories,
    published_stories = EXCLUDED.published_stories,
    total_photos = EXCLUDED.total_photos,
    total_relationships = EXCLUDED.total_relationships,
    last_story_date = EXCLUDED.last_story_date,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 10: TRIGGERS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_stories_timestamp
BEFORE UPDATE ON stories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_organizations_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all created tables
SELECT 'Tables created:' AS status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check extensions
SELECT 'Extensions enabled:' AS status;
SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector', 'pgcrypto');

-- Check functions
SELECT 'Functions created:' AS status;
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'find_similar%';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

SELECT '✅ Database setup complete!' AS message;
SELECT 'Next steps:' AS todo;
SELECT '1. Create storage buckets in Supabase Storage' AS step_1;
SELECT '2. Configure RLS policies if needed' AS step_2;
SELECT '3. Add OpenAI API key to enable AI features' AS step_3;
SELECT '4. Generate embeddings for existing content' AS step_4;

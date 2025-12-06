-- Migration: Vector Embeddings and Cultural Calendar
-- Description: Add tables for semantic search embeddings and cultural calendar events

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Content Embeddings table for semantic search
CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'knowledge', 'person')),
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique embedding per content item
  UNIQUE(content_id, content_type)
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_content_embeddings_vector
ON content_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for content type filtering
CREATE INDEX IF NOT EXISTS idx_content_embeddings_type
ON content_embeddings(content_type);

-- Function to match content by embedding similarity
CREATE OR REPLACE FUNCTION match_content_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  content_types text[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  content TEXT,
  summary TEXT,
  similarity float,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.content_id AS id,
    ce.content_type AS type,
    COALESCE(s.title, ke.title, p.full_name) AS title,
    COALESCE(s.content, ke.content, p.bio) AS content,
    COALESCE(s.summary, ke.summary, NULL) AS summary,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    CASE
      WHEN ce.content_type = 'story' THEN jsonb_build_object(
        'category', s.category,
        'story_date', s.story_date
      )
      WHEN ce.content_type = 'knowledge' THEN jsonb_build_object(
        'entry_type', ke.entry_type,
        'category', ke.category
      )
      WHEN ce.content_type = 'person' THEN jsonb_build_object(
        'preferred_name', p.preferred_name,
        'profile_image_url', p.profile_image_url
      )
      ELSE '{}'::jsonb
    END AS metadata
  FROM content_embeddings ce
  LEFT JOIN stories s ON ce.content_type = 'story' AND ce.content_id = s.id
  LEFT JOIN knowledge_entries ke ON ce.content_type = 'knowledge' AND ce.content_id = ke.id
  LEFT JOIN profiles p ON ce.content_type = 'person' AND ce.content_id = p.id
  WHERE
    1 - (ce.embedding <=> query_embedding) > match_threshold
    AND (content_types IS NULL OR ce.content_type = ANY(content_types))
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Cultural Events table
CREATE TABLE IF NOT EXISTS cultural_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  end_date DATE,
  type TEXT NOT NULL CHECK (type IN (
    'community', 'cultural', 'national', 'local',
    'health', 'education', 'sports', 'memorial', 'celebration'
  )),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- iCal RRULE format
  location TEXT,
  organizer TEXT,
  related_story_ids UUID[] DEFAULT '{}',
  related_knowledge_ids UUID[] DEFAULT '{}',
  cultural_significance TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_cultural_events_date
ON cultural_events(date);

CREATE INDEX IF NOT EXISTS idx_cultural_events_type
ON cultural_events(type);

CREATE INDEX IF NOT EXISTS idx_cultural_events_public
ON cultural_events(is_public) WHERE is_public = TRUE;

-- Video/Audio Transcriptions table
CREATE TABLE IF NOT EXISTS media_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL, -- Reference to media asset
  language TEXT DEFAULT 'en',
  duration_seconds FLOAT,
  full_text TEXT NOT NULL,
  segments JSONB DEFAULT '[]', -- Array of {start, end, text} segments
  word_timestamps JSONB, -- Optional word-level timestamps
  highlights JSONB DEFAULT '[]', -- AI-extracted highlights
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(media_id)
);

-- Full-text search on transcriptions
CREATE INDEX IF NOT EXISTS idx_transcriptions_text
ON media_transcriptions
USING gin(to_tsvector('english', full_text));

-- Story Builder Sessions (for saving interview progress)
CREATE TABLE IF NOT EXISTS story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  template_id TEXT NOT NULL,
  answers JSONB DEFAULT '{}',
  generated_draft JSONB, -- {title, content, summary, category}
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_sessions_user
ON story_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_story_sessions_status
ON story_sessions(status);

-- RLS Policies

-- Content embeddings: readable by all, writable by authenticated
ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content embeddings are viewable by everyone"
ON content_embeddings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage embeddings"
ON content_embeddings FOR ALL
USING (auth.role() = 'authenticated');

-- Cultural events: public events readable by all
ALTER TABLE cultural_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are viewable by everyone"
ON cultural_events FOR SELECT
USING (is_public = true);

CREATE POLICY "Authenticated users can create events"
ON cultural_events FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own events"
ON cultural_events FOR UPDATE
USING (auth.uid() = created_by);

-- Transcriptions: readable by all
ALTER TABLE media_transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transcriptions are viewable by everyone"
ON media_transcriptions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage transcriptions"
ON media_transcriptions FOR ALL
USING (auth.role() = 'authenticated');

-- Story sessions: users can only see their own
ALTER TABLE story_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own story sessions"
ON story_sessions FOR ALL
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_embeddings_updated_at
BEFORE UPDATE ON content_embeddings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_events_updated_at
BEFORE UPDATE ON cultural_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_transcriptions_updated_at
BEFORE UPDATE ON media_transcriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_sessions_updated_at
BEFORE UPDATE ON story_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE content_embeddings IS 'Vector embeddings for semantic search across stories, knowledge entries, and profiles';
COMMENT ON TABLE cultural_events IS 'Cultural calendar events including national days, community events, and ceremonies';
COMMENT ON TABLE media_transcriptions IS 'Transcriptions of audio and video media with timestamps and AI-extracted highlights';
COMMENT ON TABLE story_sessions IS 'Saved progress for the AI-guided story builder interviews';

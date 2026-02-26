-- Chat system improvements: conversation logging, feedback, and analytics
-- Phases 1, 4, and 6 database tables

-- Drop old chat_sessions table (had wrong schema — only id + last_message_at)
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS chat_feedback CASCADE;
DROP TABLE IF EXISTS chat_analytics CASCADE;

-- 1. Chat sessions (conversation logging)
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  audience TEXT DEFAULT 'community',
  messages JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_audience ON chat_sessions(audience);
CREATE INDEX idx_chat_sessions_started_at ON chat_sessions(started_at DESC);

-- 2. Chat feedback (thumbs up/down) — unique per session+message
CREATE TABLE chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, message_index)
);

CREATE INDEX idx_chat_feedback_session ON chat_feedback(session_id);
CREATE INDEX idx_chat_feedback_rating ON chat_feedback(rating);

-- 3. Chat analytics (nightly batch classification)
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  intent TEXT,
  was_resolved BOOLEAN,
  tools_used TEXT[] DEFAULT '{}',
  audience TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_analytics_session ON chat_analytics(session_id);
CREATE INDEX idx_chat_analytics_sentiment ON chat_analytics(sentiment);
CREATE INDEX idx_chat_analytics_analyzed_at ON chat_analytics(analyzed_at DESC);
CREATE INDEX idx_chat_analytics_tools_used ON chat_analytics USING GIN (tools_used);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

-- chat_sessions: anon can insert, update, and select (public chat)
CREATE POLICY "Allow public insert on chat_sessions" ON chat_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on chat_sessions" ON chat_sessions
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public select on chat_sessions" ON chat_sessions
  FOR SELECT USING (true);

-- chat_feedback: anon can insert and read
CREATE POLICY "Allow public insert on chat_feedback" ON chat_feedback
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on chat_feedback" ON chat_feedback
  FOR SELECT USING (true);

-- chat_analytics: service role only for writes, public reads for dashboard
CREATE POLICY "Allow public select on chat_analytics" ON chat_analytics
  FOR SELECT USING (true);
CREATE POLICY "Service role insert on chat_analytics" ON chat_analytics
  FOR INSERT WITH CHECK (true);

-- Atomic message append function (avoids race condition)
CREATE OR REPLACE FUNCTION append_chat_message(
  p_session_id TEXT,
  p_message JSONB
) RETURNS void AS $$
BEGIN
  UPDATE chat_sessions
  SET
    messages = messages || jsonb_build_array(p_message),
    message_count = message_count + 1,
    last_message_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

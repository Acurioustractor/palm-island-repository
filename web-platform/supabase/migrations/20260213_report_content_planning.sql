-- Migration: Report Content Planning (Votes + Page Assignments)
-- Supports team voting on content and page-by-page planning for editions

-- Team votes on content for inclusion in reports
CREATE TABLE IF NOT EXISTS report_content_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('story','media','quote','person')),
  content_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT DEFAULT 'upvote' CHECK (vote_type IN ('upvote','love','star')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, content_type, content_id, user_id)
);

-- Page-by-page content assignments per edition
CREATE TABLE IF NOT EXISTS report_page_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  edition TEXT NOT NULL DEFAULT 'standard',
  page_number INT NOT NULL,
  page_type TEXT NOT NULL,
  content_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, edition, page_number)
);

-- Report editions (multi-edition system)
CREATE TABLE IF NOT EXISTS report_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  edition_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  page_count INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','approved','published')),
  cover_photo_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, edition_key)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_votes_report_content
  ON report_content_votes(report_id, content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_votes_user
  ON report_content_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_page_assignments_report_edition
  ON report_page_assignments(report_id, edition);

CREATE INDEX IF NOT EXISTS idx_editions_report
  ON report_editions(report_id);

-- RLS policies
ALTER TABLE report_content_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_page_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_editions ENABLE ROW LEVEL SECURITY;

-- Votes: authenticated users can read all, insert/delete own
CREATE POLICY "Votes are viewable by authenticated users"
  ON report_content_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can cast their own votes"
  ON report_content_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
  ON report_content_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Page assignments: authenticated users can read and write
CREATE POLICY "Page assignments are viewable by authenticated users"
  ON report_page_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage page assignments"
  ON report_page_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Editions: authenticated users can read and write
CREATE POLICY "Editions are viewable by authenticated users"
  ON report_editions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage editions"
  ON report_editions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Vote count view for quick aggregation
CREATE OR REPLACE VIEW report_content_vote_counts AS
SELECT
  report_id,
  content_type,
  content_id,
  COUNT(*) AS total_votes,
  COUNT(*) FILTER (WHERE vote_type = 'upvote') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'love') AS loves,
  COUNT(*) FILTER (WHERE vote_type = 'star') AS stars
FROM report_content_votes
GROUP BY report_id, content_type, content_id;

-- Interview Deep Review: transcript segments, review artifacts, and quote provenance
-- Purpose: Support respectful, citation-backed quote extraction and story drafting workflows.

-- ----------------------------------------------------------------------------
-- Common updated_at trigger helper
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Transcript Segments (for grounded citations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interview_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  speaker TEXT,
  start_time_seconds REAL,
  end_time_seconds REAL,
  segment_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT interview_segments_unique_per_interview UNIQUE (interview_id, segment_index)
);

CREATE INDEX IF NOT EXISTS idx_interview_segments_interview_id
  ON interview_segments(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_segments_interview_segment_index
  ON interview_segments(interview_id, segment_index);

CREATE INDEX IF NOT EXISTS idx_interview_segments_text_fts
  ON interview_segments
  USING GIN (to_tsvector('english', segment_text));

DROP TRIGGER IF EXISTS interview_segments_set_updated_at ON interview_segments;
CREATE TRIGGER interview_segments_set_updated_at
  BEFORE UPDATE ON interview_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ----------------------------------------------------------------------------
-- Interview Review Artifacts (index, quote library, story drafts, tags)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interview_review_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  artifact_type TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'internal',

  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT interview_review_artifacts_type_check CHECK (
    artifact_type IN ('index', 'quote_library', 'trip_story_draft', 'tags', 'notes')
  ),
  CONSTRAINT interview_review_artifacts_status_check CHECK (
    status IN ('draft', 'needs_review', 'approved', 'archived')
  ),
  CONSTRAINT interview_review_artifacts_visibility_check CHECK (
    visibility IN ('public', 'community', 'internal', 'restricted')
  )
);

CREATE INDEX IF NOT EXISTS idx_interview_review_artifacts_interview_id
  ON interview_review_artifacts(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_review_artifacts_profile_id
  ON interview_review_artifacts(profile_id);

CREATE INDEX IF NOT EXISTS idx_interview_review_artifacts_type_status
  ON interview_review_artifacts(artifact_type, status);

DROP TRIGGER IF EXISTS interview_review_artifacts_set_updated_at ON interview_review_artifacts;
CREATE TRIGGER interview_review_artifacts_set_updated_at
  BEFORE UPDATE ON interview_review_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ----------------------------------------------------------------------------
-- Quote provenance: link extracted quotes to segments / interviews
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extracted_quote_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES extracted_quotes(id) ON DELETE CASCADE,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES interview_segments(id) ON DELETE SET NULL,
  segment_index INTEGER,
  excerpt TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extracted_quote_citations_quote
  ON extracted_quote_citations(quote_id);

CREATE INDEX IF NOT EXISTS idx_extracted_quote_citations_interview
  ON extracted_quote_citations(interview_id);

CREATE INDEX IF NOT EXISTS idx_extracted_quote_citations_segment
  ON extracted_quote_citations(segment_id);

-- Add a direct link on extracted_quotes (nullable for backwards compatibility)
ALTER TABLE extracted_quotes
  ADD COLUMN IF NOT EXISTS interview_id UUID;

CREATE INDEX IF NOT EXISTS idx_extracted_quotes_interview_id
  ON extracted_quotes(interview_id);

-- Add FK if possible (safe re-run; will error if already exists under same name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f'
      AND t.relname = 'extracted_quotes'
      AND a.attname = 'interview_id'
  ) THEN
    ALTER TABLE extracted_quotes
      ADD CONSTRAINT extracted_quotes_interview_id_fkey
      FOREIGN KEY (interview_id) REFERENCES interviews(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Row Level Security (staff/service only by default)
-- ----------------------------------------------------------------------------
ALTER TABLE interview_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_review_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_quote_citations ENABLE ROW LEVEL SECURITY;

-- Interview segments policies
DROP POLICY IF EXISTS "Service role full access interview_segments" ON interview_segments;
CREATE POLICY "Service role full access interview_segments"
  ON interview_segments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Staff can read interview_segments" ON interview_segments;
CREATE POLICY "Staff can read interview_segments"
  ON interview_segments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can manage interview_segments" ON interview_segments;
CREATE POLICY "Staff can manage interview_segments"
  ON interview_segments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can update interview_segments" ON interview_segments;
CREATE POLICY "Staff can update interview_segments"
  ON interview_segments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can delete interview_segments" ON interview_segments;
CREATE POLICY "Staff can delete interview_segments"
  ON interview_segments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

-- Interview artifacts policies
DROP POLICY IF EXISTS "Service role full access interview_review_artifacts" ON interview_review_artifacts;
CREATE POLICY "Service role full access interview_review_artifacts"
  ON interview_review_artifacts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Staff can read interview_review_artifacts" ON interview_review_artifacts;
CREATE POLICY "Staff can read interview_review_artifacts"
  ON interview_review_artifacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can manage interview_review_artifacts" ON interview_review_artifacts;
CREATE POLICY "Staff can manage interview_review_artifacts"
  ON interview_review_artifacts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can update interview_review_artifacts" ON interview_review_artifacts;
CREATE POLICY "Staff can update interview_review_artifacts"
  ON interview_review_artifacts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can delete interview_review_artifacts" ON interview_review_artifacts;
CREATE POLICY "Staff can delete interview_review_artifacts"
  ON interview_review_artifacts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

-- Quote citation policies
DROP POLICY IF EXISTS "Service role full access extracted_quote_citations" ON extracted_quote_citations;
CREATE POLICY "Service role full access extracted_quote_citations"
  ON extracted_quote_citations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Staff can read extracted_quote_citations" ON extracted_quote_citations;
CREATE POLICY "Staff can read extracted_quote_citations"
  ON extracted_quote_citations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can manage extracted_quote_citations" ON extracted_quote_citations;
CREATE POLICY "Staff can manage extracted_quote_citations"
  ON extracted_quote_citations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can update extracted_quote_citations" ON extracted_quote_citations;
CREATE POLICY "Staff can update extracted_quote_citations"
  ON extracted_quote_citations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can delete extracted_quote_citations" ON extracted_quote_citations;
CREATE POLICY "Staff can delete extracted_quote_citations"
  ON extracted_quote_citations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'staff')
    )
  );

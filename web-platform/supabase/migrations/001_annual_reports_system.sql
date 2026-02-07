-- ============================================================================
-- PICC Annual Reports System - Complete Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql
-- ============================================================================

-- ============================================================================
-- 1. ELDER QUOTES TABLE
-- Stores validated quotes from Elders for annual reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS elder_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  speaker_role TEXT,
  theme TEXT, -- culture, healing, family, country, language, community, youth
  category TEXT, -- health, family, culture, youth, economic, etc.
  is_validated BOOLEAN DEFAULT false,
  validation_date TIMESTAMPTZ,
  validated_by TEXT,
  source_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  cultural_sensitivity TEXT DEFAULT 'standard', -- standard, sensitive, restricted
  permission_level TEXT DEFAULT 'public', -- public, community, restricted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_elder_quotes_theme ON elder_quotes(theme);
CREATE INDEX IF NOT EXISTS idx_elder_quotes_category ON elder_quotes(category);
CREATE INDEX IF NOT EXISTS idx_elder_quotes_validated ON elder_quotes(is_validated);
CREATE INDEX IF NOT EXISTS idx_elder_quotes_speaker ON elder_quotes(speaker_name);

-- Enable RLS
ALTER TABLE elder_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read validated quotes" ON elder_quotes
  FOR SELECT USING (is_validated = true AND permission_level = 'public');

CREATE POLICY "Authenticated full access to quotes" ON elder_quotes
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 2. COMMUNITY FEEDBACK TABLE
-- Tracks "What You Said, What We Did" feedback loop
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_text TEXT NOT NULL,
  category TEXT NOT NULL, -- health, family, youth, culture, infrastructure, safety, services, other
  is_anonymous BOOLEAN DEFAULT true,
  submitter_name TEXT,
  submitter_contact TEXT,
  source TEXT DEFAULT 'form', -- form, meeting, survey, conversation, suggestion_box
  status TEXT DEFAULT 'received', -- received, reviewing, in_progress, completed, planned, declined
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  picc_response TEXT,
  response_date TIMESTAMPTZ,
  responded_by TEXT,
  investment_amount DECIMAL(12,2),
  outcome_summary TEXT,
  related_program TEXT, -- links to program slug
  fiscal_year TEXT, -- e.g., '2024-25'
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_category ON community_feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON community_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_fiscal_year ON community_feedback(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_feedback_program ON community_feedback(related_program);

-- Enable RLS
ALTER TABLE community_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read completed feedback" ON community_feedback
  FOR SELECT USING (status IN ('completed', 'in_progress', 'planned'));

CREATE POLICY "Public insert feedback" ON community_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated full access to feedback" ON community_feedback
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 3. ANNUAL REPORTS TABLE (if not exists)
-- Core table for generated annual reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS annual_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  fiscal_year TEXT NOT NULL, -- e.g., '2024-25'
  status TEXT DEFAULT 'draft', -- draft, in_progress, review, approved, published
  report_type TEXT DEFAULT 'annual', -- annual, quarterly, program, elder_wisdom, community_voices
  generated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  sections JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  cover_image_url TEXT,
  pdf_url TEXT,
  html_url TEXT,
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_org ON annual_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_year ON annual_reports(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_reports_status ON annual_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON annual_reports(report_type);

-- Enable RLS
ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published reports" ON annual_reports
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated full access to reports" ON annual_reports
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 4. REPORT SECTIONS TABLE
-- Individual sections within a report
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- executive_summary, statistics, stories, quotes, program_highlight, etc.
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_auto_populated BOOLEAN DEFAULT false,
  last_populated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_report ON report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_sections_type ON report_sections(section_type);

ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections follow report access" ON report_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports ar
      WHERE ar.id = report_id
      AND (ar.status = 'published' OR auth.role() = 'authenticated')
    )
  );

CREATE POLICY "Authenticated full access to sections" ON report_sections
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 5. STORY COLLECTIONS TABLE
-- For curated story exports (grants, board reports, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  purpose TEXT NOT NULL, -- grant, board, funder, community, impact, general
  introduction TEXT,
  story_ids UUID[] NOT NULL,
  include_media BOOLEAN DEFAULT true,
  include_quotes BOOLEAN DEFAULT true,
  created_by UUID,
  export_format TEXT DEFAULT 'html', -- html, pdf, docx
  exported_at TIMESTAMPTZ,
  export_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_purpose ON story_collections(purpose);

ALTER TABLE story_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated access to collections" ON story_collections
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 6. ADD MISSING COLUMNS TO STORIES TABLE
-- Ensure stories table has all required fields for report generation
-- ============================================================================

DO $$
BEGIN
  -- Add auto_include column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'auto_include') THEN
    ALTER TABLE stories ADD COLUMN auto_include BOOLEAN DEFAULT false;
  END IF;

  -- Add report_worthy column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'report_worthy') THEN
    ALTER TABLE stories ADD COLUMN report_worthy BOOLEAN DEFAULT false;
  END IF;

  -- Add elder_approval_given column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'elder_approval_given') THEN
    ALTER TABLE stories ADD COLUMN elder_approval_given BOOLEAN DEFAULT false;
  END IF;

  -- Add contains_traditional_knowledge column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'contains_traditional_knowledge') THEN
    ALTER TABLE stories ADD COLUMN contains_traditional_knowledge BOOLEAN DEFAULT false;
  END IF;

  -- Add media_count column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'media_count') THEN
    ALTER TABLE stories ADD COLUMN media_count INTEGER DEFAULT 0;
  END IF;

  -- Add engagement_score column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'engagement_score') THEN
    ALTER TABLE stories ADD COLUMN engagement_score INTEGER DEFAULT 0;
  END IF;

  -- Add fiscal_year column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'fiscal_year') THEN
    ALTER TABLE stories ADD COLUMN fiscal_year TEXT;
  END IF;
END $$;

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to get current fiscal year (July-June)
CREATE OR REPLACE FUNCTION get_current_fiscal_year()
RETURNS TEXT AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());

  IF current_month >= 7 THEN
    RETURN current_year || '-' || SUBSTRING(CAST(current_year + 1 AS TEXT) FROM 3);
  ELSE
    RETURN (current_year - 1) || '-' || SUBSTRING(CAST(current_year AS TEXT) FROM 3);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate story score for report inclusion
CREATE OR REPLACE FUNCTION calculate_story_score(story_row stories)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score from engagement
  score := COALESCE(story_row.engagement_score, 0);

  -- Boost for auto_include
  IF story_row.auto_include THEN
    score := score + 50;
  END IF;

  -- Boost for report_worthy
  IF story_row.report_worthy THEN
    score := score + 30;
  END IF;

  -- Boost for elder approval
  IF story_row.elder_approval_given THEN
    score := score + 20;
  END IF;

  -- Boost for media richness
  score := score + LEAST(COALESCE(story_row.media_count, 0) * 5, 25);

  -- Featured stories get extra boost
  IF story_row.is_featured THEN
    score := score + 40;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_elder_quotes_updated_at ON elder_quotes;
CREATE TRIGGER update_elder_quotes_updated_at
  BEFORE UPDATE ON elder_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_community_feedback_updated_at ON community_feedback;
CREATE TRIGGER update_community_feedback_updated_at
  BEFORE UPDATE ON community_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_annual_reports_updated_at ON annual_reports;
CREATE TRIGGER update_annual_reports_updated_at
  BEFORE UPDATE ON annual_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_report_sections_updated_at ON report_sections;
CREATE TRIGGER update_report_sections_updated_at
  BEFORE UPDATE ON report_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_story_collections_updated_at ON story_collections;
CREATE TRIGGER update_story_collections_updated_at
  BEFORE UPDATE ON story_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DONE! Tables created:
-- - elder_quotes
-- - community_feedback
-- - annual_reports
-- - report_sections
-- - story_collections
-- Plus: helper functions and updated_at triggers
-- ============================================================================

SELECT 'Annual Reports System database setup complete!' as status;

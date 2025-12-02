-- Living Ledger: Content Atom System
-- This enables "always-on" annual reporting where content published throughout
-- the year automatically flows into annual reports.

-- ============================================================================
-- 1. Add report-tracking fields to stories table
-- ============================================================================

-- Add columns for report integration (if they don't exist)
DO $$
BEGIN
  -- Is this story suitable for annual reports?
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'report_worthy') THEN
    ALTER TABLE stories ADD COLUMN report_worthy BOOLEAN DEFAULT false;
  END IF;

  -- Which section of the report should this story appear in?
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'report_section') THEN
    ALTER TABLE stories ADD COLUMN report_section TEXT;
  END IF;

  -- Auto-include in reports if threshold criteria met?
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'auto_include') THEN
    ALTER TABLE stories ADD COLUMN auto_include BOOLEAN DEFAULT false;
  END IF;

  -- Quality score for ranking in reports (0-100)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'quality_score') THEN
    ALTER TABLE stories ADD COLUMN quality_score INTEGER DEFAULT 50;
  END IF;

  -- Engagement metrics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'engagement_score') THEN
    ALTER TABLE stories ADD COLUMN engagement_score INTEGER DEFAULT 0;
  END IF;

  -- Fiscal quarter this story belongs to
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'fiscal_quarter') THEN
    ALTER TABLE stories ADD COLUMN fiscal_quarter INTEGER;
  END IF;

  -- Fiscal year
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'fiscal_year') THEN
    ALTER TABLE stories ADD COLUMN fiscal_year INTEGER;
  END IF;
END $$;

-- ============================================================================
-- 2. Content Releases (Content Atoms) Table
-- ============================================================================
-- Track content published throughout the year for "always-on" reporting

CREATE TABLE IF NOT EXISTS content_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),

  -- What type of content atom is this?
  release_type TEXT NOT NULL CHECK (release_type IN (
    'story',           -- Community story
    'metric',          -- Data point/KPI update
    'milestone',       -- Achievement or milestone
    'update',          -- Program update
    'event',           -- Event summary
    'media_collection', -- Photo/video collection
    'quote',           -- Standalone quote
    'testimonial'      -- Stakeholder testimonial
  )),

  -- Content details
  title TEXT NOT NULL,
  summary TEXT,
  content JSONB,        -- Flexible content structure

  -- Linked entities
  story_id UUID REFERENCES stories(id),
  media_ids UUID[],

  -- Publishing info
  published_at TIMESTAMPTZ,
  published_by UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Report placement
  fiscal_quarter INTEGER CHECK (fiscal_quarter BETWEEN 1 AND 4),
  fiscal_year INTEGER,
  report_section TEXT,
  auto_include BOOLEAN DEFAULT false,

  -- Metadata
  tags TEXT[],
  impact_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Data Snapshots Table
-- ============================================================================
-- Store historical metrics for trend analysis in reports

CREATE TABLE IF NOT EXISTS data_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),

  -- What metric is this?
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,

  -- Context
  snapshot_date DATE NOT NULL,
  fiscal_quarter INTEGER,
  fiscal_year INTEGER,

  -- Comparison data
  previous_value NUMERIC,
  change_percentage NUMERIC,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),

  -- Metadata
  source TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Community Conversations Table
-- ============================================================================
-- Track community feedback for "We Heard You" report sections

CREATE TABLE IF NOT EXISTS community_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),

  -- What type of conversation?
  conversation_type TEXT NOT NULL CHECK (conversation_type IN (
    'listening_tour',   -- Community listening session
    'survey',           -- Formal survey
    'town_hall',        -- Town hall meeting
    'focus_group',      -- Focus group discussion
    'feedback_form',    -- Online/paper feedback
    'elder_consultation' -- Elder/cultural consultation
  )),

  -- Details
  title TEXT NOT NULL,
  description TEXT,
  held_at DATE,
  location TEXT,

  -- Participation
  participant_count INTEGER,
  participant_demographics JSONB,

  -- Outcomes
  key_themes JSONB,         -- Themes that emerged
  community_priorities TEXT[], -- What community said matters
  action_items JSONB,       -- What we committed to do
  response_actions JSONB,   -- What we actually did (for follow-up)

  -- Linking
  fiscal_quarter INTEGER,
  fiscal_year INTEGER,
  related_story_ids UUID[],

  -- Metadata
  facilitator_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. Report Auto-Inclusion Rules
-- ============================================================================
-- Define rules for automatically including content in reports

CREATE TABLE IF NOT EXISTS report_inclusion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),

  -- Rule details
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Matching criteria (JSONB for flexibility)
  criteria JSONB NOT NULL,
  -- Example: {
  --   "category": ["culture", "elders"],
  --   "min_quality_score": 70,
  --   "min_engagement_score": 50,
  --   "has_media": true,
  --   "status": "published"
  -- }

  -- Output configuration
  target_section TEXT,
  max_items INTEGER,
  priority INTEGER DEFAULT 50,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_stories_report_worthy ON stories(report_worthy) WHERE report_worthy = true;
CREATE INDEX IF NOT EXISTS idx_stories_fiscal_year ON stories(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_stories_quality_score ON stories(quality_score);
CREATE INDEX IF NOT EXISTS idx_content_releases_fiscal ON content_releases(fiscal_year, fiscal_quarter);
CREATE INDEX IF NOT EXISTS idx_content_releases_type ON content_releases(release_type);
CREATE INDEX IF NOT EXISTS idx_data_snapshots_date ON data_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_community_conversations_date ON community_conversations(held_at);

-- ============================================================================
-- 7. Trigger to auto-set fiscal quarter/year
-- ============================================================================

CREATE OR REPLACE FUNCTION set_fiscal_period()
RETURNS TRIGGER AS $$
BEGIN
  -- Set fiscal year (July-June fiscal year)
  IF NEW.created_at IS NOT NULL THEN
    IF EXTRACT(MONTH FROM NEW.created_at) >= 7 THEN
      NEW.fiscal_year := EXTRACT(YEAR FROM NEW.created_at)::INTEGER + 1;
    ELSE
      NEW.fiscal_year := EXTRACT(YEAR FROM NEW.created_at)::INTEGER;
    END IF;

    -- Set fiscal quarter
    NEW.fiscal_quarter := CASE
      WHEN EXTRACT(MONTH FROM NEW.created_at) IN (7, 8, 9) THEN 1
      WHEN EXTRACT(MONTH FROM NEW.created_at) IN (10, 11, 12) THEN 2
      WHEN EXTRACT(MONTH FROM NEW.created_at) IN (1, 2, 3) THEN 3
      ELSE 4
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to stories table
DROP TRIGGER IF EXISTS stories_set_fiscal_period ON stories;
CREATE TRIGGER stories_set_fiscal_period
  BEFORE INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION set_fiscal_period();

-- Apply trigger to content_releases table
DROP TRIGGER IF EXISTS content_releases_set_fiscal_period ON content_releases;
CREATE TRIGGER content_releases_set_fiscal_period
  BEFORE INSERT ON content_releases
  FOR EACH ROW
  EXECUTE FUNCTION set_fiscal_period();

-- ============================================================================
-- 8. Seed default inclusion rules for PICC
-- ============================================================================

INSERT INTO report_inclusion_rules (organization_id, rule_name, rule_description, criteria, target_section, max_items, priority)
SELECT
  o.id,
  'High Quality Elder Stories',
  'Automatically include elder stories with high quality scores',
  '{"category": ["elders"], "min_quality_score": 80, "status": "published"}'::jsonb,
  'elder_wisdom',
  5,
  90
FROM organizations o WHERE o.short_name = 'PICC'
ON CONFLICT DO NOTHING;

INSERT INTO report_inclusion_rules (organization_id, rule_name, rule_description, criteria, target_section, max_items, priority)
SELECT
  o.id,
  'Featured Culture Stories',
  'Include cultural preservation stories in report',
  '{"category": ["culture"], "min_quality_score": 70, "status": "published"}'::jsonb,
  'cultural_highlights',
  8,
  85
FROM organizations o WHERE o.short_name = 'PICC'
ON CONFLICT DO NOTHING;

INSERT INTO report_inclusion_rules (organization_id, rule_name, rule_description, criteria, target_section, max_items, priority)
SELECT
  o.id,
  'Youth Achievements',
  'Include youth program stories and achievements',
  '{"category": ["youth"], "status": "published"}'::jsonb,
  'youth_spotlight',
  6,
  80
FROM organizations o WHERE o.short_name = 'PICC'
ON CONFLICT DO NOTHING;

INSERT INTO report_inclusion_rules (organization_id, rule_name, rule_description, criteria, target_section, max_items, priority)
SELECT
  o.id,
  'Innovation Projects',
  'Include stories about innovative programs',
  '{"category": ["innovation"], "status": "published"}'::jsonb,
  'innovation_spotlight',
  4,
  75
FROM organizations o WHERE o.short_name = 'PICC'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. View for report-ready content
-- ============================================================================

CREATE OR REPLACE VIEW report_ready_stories AS
SELECT
  s.*,
  p.full_name as storyteller_name,
  ARRAY_AGG(DISTINCT sm.file_path) FILTER (WHERE sm.file_path IS NOT NULL) as media_paths,
  ARRAY_AGG(DISTINCT sm.supabase_bucket) FILTER (WHERE sm.supabase_bucket IS NOT NULL) as media_buckets,
  COUNT(sm.id) as media_count
FROM stories s
LEFT JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN story_media sm ON s.id = sm.story_id
WHERE s.status = 'published'
  AND s.report_worthy = true
GROUP BY s.id, p.full_name
ORDER BY s.quality_score DESC, s.created_at DESC;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE content_releases IS 'Content atoms published throughout the year for always-on reporting';
COMMENT ON TABLE data_snapshots IS 'Historical metrics for trend analysis in annual reports';
COMMENT ON TABLE community_conversations IS 'Community feedback tracking for "We Heard You" sections';
COMMENT ON TABLE report_inclusion_rules IS 'Auto-inclusion criteria for report content selection';
COMMENT ON COLUMN stories.report_worthy IS 'Flag indicating story is suitable for annual reports';
COMMENT ON COLUMN stories.quality_score IS 'Quality rating 0-100 for report prioritization';

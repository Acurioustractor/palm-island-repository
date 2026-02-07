-- ============================================================================
-- CONSOLIDATED ANNUAL REPORTS SCHEMA
-- Palm Island Community Company
--
-- Merges 3 fragmented migration systems into ONE unified schema:
--   System 1: Empathy Ledger (03_organizations_and_annual_reports.sql) - BASE
--   System 2: 001_annual_reports_system.sql - elder_quotes, community_feedback, etc.
--   System 3: annual-reports/migrations/001_annual_report_tables.sql - board, financials, etc.
--
-- This migration EXTENDS the Empathy Ledger base. It does NOT recreate
-- tables that already exist (annual_reports, report_sections, stories, etc.)
-- ============================================================================

-- ============================================================================
-- PART 1: EXTEND EXISTING EMPATHY LEDGER TABLES
-- Add columns from Systems 2 and 3 that the base schema lacks
-- ============================================================================

-- 1a. annual_reports: Add fiscal_year, report_type, html_url from System 2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'annual_reports' AND column_name = 'fiscal_year') THEN
    ALTER TABLE annual_reports ADD COLUMN fiscal_year TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'annual_reports' AND column_name = 'report_type') THEN
    ALTER TABLE annual_reports ADD COLUMN report_type TEXT DEFAULT 'annual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'annual_reports' AND column_name = 'html_url') THEN
    ALTER TABLE annual_reports ADD COLUMN html_url TEXT;
  END IF;
END $$;

-- 1b. report_sections: Add content JSONB, is_auto_populated, last_populated_at, order_index from System 2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_sections' AND column_name = 'content') THEN
    ALTER TABLE report_sections ADD COLUMN content JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_sections' AND column_name = 'is_auto_populated') THEN
    ALTER TABLE report_sections ADD COLUMN is_auto_populated BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_sections' AND column_name = 'last_populated_at') THEN
    ALTER TABLE report_sections ADD COLUMN last_populated_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_sections' AND column_name = 'order_index') THEN
    ALTER TABLE report_sections ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;

-- 1c. stories: Add report-worthy columns from Systems 2 and 3
DO $$
BEGIN
  -- From System 2
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'auto_include') THEN
    ALTER TABLE stories ADD COLUMN auto_include BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'report_worthy') THEN
    ALTER TABLE stories ADD COLUMN report_worthy BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'elder_approval_given') THEN
    ALTER TABLE stories ADD COLUMN elder_approval_given BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'contains_traditional_knowledge') THEN
    ALTER TABLE stories ADD COLUMN contains_traditional_knowledge BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'media_count') THEN
    ALTER TABLE stories ADD COLUMN media_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'engagement_score') THEN
    ALTER TABLE stories ADD COLUMN engagement_score INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'fiscal_year') THEN
    ALTER TABLE stories ADD COLUMN fiscal_year TEXT;
  END IF;

  -- From System 3
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'summary') THEN
    ALTER TABLE stories ADD COLUMN summary TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'annual_report_eligible') THEN
    ALTER TABLE stories ADD COLUMN annual_report_eligible BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'annual_report_year') THEN
    ALTER TABLE stories ADD COLUMN annual_report_year INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'featured_priority') THEN
    ALTER TABLE stories ADD COLUMN featured_priority INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'report_section') THEN
    ALTER TABLE stories ADD COLUMN report_section TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'quote_text') THEN
    ALTER TABLE stories ADD COLUMN quote_text TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'quote_attribution') THEN
    ALTER TABLE stories ADD COLUMN quote_attribution TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'leadership_role') THEN
    ALTER TABLE stories ADD COLUMN leadership_role TEXT;
  END IF;
END $$;

-- Stories constraint for featured_priority
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_featured_priority_check'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_featured_priority_check
      CHECK (featured_priority BETWEEN 1 AND 5);
  END IF;
END $$;

-- Index for annual report story queries
CREATE INDEX IF NOT EXISTS idx_stories_annual_report
  ON stories(annual_report_eligible, annual_report_year, featured_priority DESC)
  WHERE annual_report_eligible = TRUE;

-- ============================================================================
-- PART 2: TABLES FROM SYSTEM 2 (elder_quotes, community_feedback, story_collections)
-- ============================================================================

-- 2a. Elder Quotes
CREATE TABLE IF NOT EXISTS elder_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  speaker_role TEXT,
  theme TEXT,
  category TEXT,
  is_validated BOOLEAN DEFAULT false,
  validation_date TIMESTAMPTZ,
  validated_by TEXT,
  source_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  cultural_sensitivity TEXT DEFAULT 'standard',
  permission_level TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elder_quotes_theme ON elder_quotes(theme);
CREATE INDEX IF NOT EXISTS idx_elder_quotes_validated ON elder_quotes(is_validated);

ALTER TABLE elder_quotes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elder_quotes' AND policyname = 'Public read validated quotes') THEN
    CREATE POLICY "Public read validated quotes" ON elder_quotes
      FOR SELECT USING (is_validated = true AND permission_level = 'public');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elder_quotes' AND policyname = 'Authenticated full access to quotes') THEN
    CREATE POLICY "Authenticated full access to quotes" ON elder_quotes
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 2b. Community Feedback
CREATE TABLE IF NOT EXISTS community_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  category TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  submitter_name TEXT,
  submitter_contact TEXT,
  source TEXT DEFAULT 'form',
  status TEXT DEFAULT 'received',
  priority TEXT DEFAULT 'medium',
  picc_response TEXT,
  response_date TIMESTAMPTZ,
  responded_by TEXT,
  investment_amount DECIMAL(12,2),
  outcome_summary TEXT,
  related_program TEXT,
  fiscal_year TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_category ON community_feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON community_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_fiscal_year ON community_feedback(fiscal_year);

ALTER TABLE community_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feedback' AND policyname = 'Public read completed feedback') THEN
    CREATE POLICY "Public read completed feedback" ON community_feedback
      FOR SELECT USING (status IN ('completed', 'in_progress', 'planned'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feedback' AND policyname = 'Public insert feedback') THEN
    CREATE POLICY "Public insert feedback" ON community_feedback
      FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feedback' AND policyname = 'Authenticated full access to feedback') THEN
    CREATE POLICY "Authenticated full access to feedback" ON community_feedback
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 2c. Story Collections
CREATE TABLE IF NOT EXISTS story_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT NOT NULL,
  introduction TEXT,
  story_ids UUID[] NOT NULL,
  include_media BOOLEAN DEFAULT true,
  include_quotes BOOLEAN DEFAULT true,
  created_by UUID,
  export_format TEXT DEFAULT 'html',
  exported_at TIMESTAMPTZ,
  export_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE story_collections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'story_collections' AND policyname = 'Authenticated access to collections') THEN
    CREATE POLICY "Authenticated access to collections" ON story_collections
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================================
-- PART 3: TABLES FROM SYSTEM 3 (board_members, governance, financials, etc.)
-- All tables get organization_id FK for multi-org support
-- ============================================================================

-- 3a. Board Members
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  photo_url TEXT,
  bio TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_board_members_org ON board_members(organization_id);

ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_members' AND policyname = 'Board members publicly readable') THEN
    CREATE POLICY "Board members publicly readable" ON board_members
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_members' AND policyname = 'Authenticated manage board members') THEN
    CREATE POLICY "Authenticated manage board members" ON board_members
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 3b. Governance Achievements
CREATE TABLE IF NOT EXISTS governance_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  achievement_text TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_fiscal_year ON governance_achievements(fiscal_year);

ALTER TABLE governance_achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'governance_achievements' AND policyname = 'Governance achievements publicly readable') THEN
    CREATE POLICY "Governance achievements publicly readable" ON governance_achievements
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'governance_achievements' AND policyname = 'Authenticated manage governance') THEN
    CREATE POLICY "Authenticated manage governance" ON governance_achievements
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 3c. Annual Financials
CREATE TABLE IF NOT EXISTS annual_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  current_assets DECIMAL(12,2) DEFAULT 0,
  non_current_assets DECIMAL(12,2) DEFAULT 0,
  current_liabilities DECIMAL(12,2) DEFAULT 0,
  non_current_liabilities DECIMAL(12,2) DEFAULT 0,
  total_income DECIMAL(12,2) DEFAULT 0,
  labour_costs DECIMAL(12,2) DEFAULT 0,
  administration_expenses DECIMAL(12,2) DEFAULT 0,
  property_energy_expenses DECIMAL(12,2) DEFAULT 0,
  motor_vehicle_expenses DECIMAL(12,2) DEFAULT 0,
  travel_training_expenses DECIMAL(12,2) DEFAULT 0,
  client_related_costs DECIMAL(12,2) DEFAULT 0,
  audited BOOLEAN DEFAULT false,
  auditor_name TEXT,
  audit_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, fiscal_year)
);

ALTER TABLE annual_financials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'annual_financials' AND policyname = 'Audited financials publicly readable') THEN
    CREATE POLICY "Audited financials publicly readable" ON annual_financials
      FOR SELECT USING (audited = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'annual_financials' AND policyname = 'Authenticated manage financials') THEN
    CREATE POLICY "Authenticated manage financials" ON annual_financials
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 3d. Staff Statistics
CREATE TABLE IF NOT EXISTS staff_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  snapshot_date DATE NOT NULL,
  total_staff INTEGER NOT NULL DEFAULT 0,
  full_time_staff INTEGER DEFAULT 0,
  part_time_staff INTEGER DEFAULT 0,
  casual_staff INTEGER DEFAULT 0,
  indigenous_staff_count INTEGER DEFAULT 0,
  palm_island_resident_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, fiscal_year, snapshot_date)
);

ALTER TABLE staff_statistics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_statistics' AND policyname = 'Staff statistics publicly readable') THEN
    CREATE POLICY "Staff statistics publicly readable" ON staff_statistics
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_statistics' AND policyname = 'Authenticated manage staff stats') THEN
    CREATE POLICY "Authenticated manage staff stats" ON staff_statistics
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 3e. Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  partner_type TEXT DEFAULT 'service',
  partnership_start_date DATE,
  partnership_end_date DATE,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  show_in_annual_report BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_org ON partners(organization_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Partners publicly readable') THEN
    CREATE POLICY "Partners publicly readable" ON partners
      FOR SELECT USING (show_in_annual_report = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Authenticated manage partners') THEN
    CREATE POLICY "Authenticated manage partners" ON partners
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 3f. Service Metrics (linked to organization_services, NOT standalone services)
CREATE TABLE IF NOT EXISTS service_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_service_id UUID REFERENCES organization_services(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  clients_served INTEGER,
  sessions_delivered INTEGER,
  events_held INTEGER,
  staff_count INTEGER,
  key_achievement TEXT,
  headline_stat_value TEXT,
  headline_stat_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_service_id, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_service_metrics_fy ON service_metrics(fiscal_year);

ALTER TABLE service_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_metrics' AND policyname = 'Service metrics publicly readable') THEN
    CREATE POLICY "Service metrics publicly readable" ON service_metrics
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_metrics' AND policyname = 'Authenticated manage service metrics') THEN
    CREATE POLICY "Authenticated manage service metrics" ON service_metrics
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================================
-- PART 4: NEW TABLES (not in any previous system)
-- ============================================================================

-- 4a. Organization Stats (dashboard stats banner)
CREATE TABLE IF NOT EXISTS organization_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  fiscal_year TEXT NOT NULL,
  staff_count INTEGER,
  service_count INTEGER,
  people_served TEXT,
  annual_budget DECIMAL(14,2),
  indigenous_staff_percentage TEXT,
  local_staff_percentage TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, fiscal_year)
);

ALTER TABLE organization_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organization_stats' AND policyname = 'Org stats publicly readable') THEN
    CREATE POLICY "Org stats publicly readable" ON organization_stats
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organization_stats' AND policyname = 'Authenticated manage org stats') THEN
    CREATE POLICY "Authenticated manage org stats" ON organization_stats
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 4b. Leadership (board + executive leaders with annual report messages)
CREATE TABLE IF NOT EXISTS leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  leadership_type TEXT NOT NULL, -- 'board' or 'executive'
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  message_title TEXT,
  message_content TEXT,
  message_excerpt TEXT,
  featured_quote TEXT,
  is_active BOOLEAN DEFAULT true,
  position_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leadership_org ON leadership(organization_id);
CREATE INDEX IF NOT EXISTS idx_leadership_active ON leadership(is_active);
CREATE INDEX IF NOT EXISTS idx_leadership_type ON leadership(leadership_type);

ALTER TABLE leadership ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leadership' AND policyname = 'Leadership publicly readable') THEN
    CREATE POLICY "Leadership publicly readable" ON leadership
      FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leadership' AND policyname = 'Authenticated manage leadership') THEN
    CREATE POLICY "Authenticated manage leadership" ON leadership
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 4c. Report Statistics (per-report key metrics for print)
CREATE TABLE IF NOT EXISTS report_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  stat_label TEXT NOT NULL,
  stat_value TEXT NOT NULL,
  stat_unit TEXT,
  stat_description TEXT,
  comparison_previous_year TEXT,
  comparison_type TEXT,
  icon_name TEXT,
  is_key_metric BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_stats_report ON report_statistics(report_id);

ALTER TABLE report_statistics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'report_statistics' AND policyname = 'Report stats follow report access') THEN
    CREATE POLICY "Report stats follow report access" ON report_statistics
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM annual_reports ar
          WHERE ar.id = report_id
          AND (ar.status = 'published' OR ar.status = 'approved')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'report_statistics' AND policyname = 'Authenticated manage report stats') THEN
    CREATE POLICY "Authenticated manage report stats" ON report_statistics
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 4d. Report Highlights (per-report featured achievements)
CREATE TABLE IF NOT EXISTS report_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  highlight_type TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  impact_achieved TEXT,
  metrics JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  display_style TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_highlights_report ON report_highlights(report_id);

ALTER TABLE report_highlights ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'report_highlights' AND policyname = 'Report highlights follow report access') THEN
    CREATE POLICY "Report highlights follow report access" ON report_highlights
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM annual_reports ar
          WHERE ar.id = report_id
          AND (ar.status = 'published' OR ar.status = 'approved')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'report_highlights' AND policyname = 'Authenticated manage report highlights') THEN
    CREATE POLICY "Authenticated manage report highlights" ON report_highlights
      FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================================
-- PART 5: VIEWS
-- ============================================================================

-- Current board members (active)
CREATE OR REPLACE VIEW current_board_members AS
SELECT *,
  (end_date IS NULL OR end_date > CURRENT_DATE) as is_current
FROM board_members
WHERE end_date IS NULL OR end_date > CURRENT_DATE
ORDER BY display_order, name;

-- Annual financials with computed totals
CREATE OR REPLACE VIEW annual_financials_complete AS
SELECT
  *,
  (current_assets + non_current_assets) as total_assets,
  (current_liabilities + non_current_liabilities) as total_liabilities,
  ((current_assets + non_current_assets) - (current_liabilities + non_current_liabilities)) as net_assets,
  (labour_costs + administration_expenses + property_energy_expenses +
   motor_vehicle_expenses + travel_training_expenses + client_related_costs) as total_expenditure,
  (total_income - (labour_costs + administration_expenses + property_energy_expenses +
   motor_vehicle_expenses + travel_training_expenses + client_related_costs)) as net_surplus_deficit
FROM annual_financials;

-- Staff statistics with computed percentages
CREATE OR REPLACE VIEW staff_statistics_complete AS
SELECT
  *,
  CASE WHEN total_staff > 0
    THEN ROUND((indigenous_staff_count::DECIMAL / total_staff * 100), 1)
    ELSE 0
  END as indigenous_staff_percent,
  CASE WHEN total_staff > 0
    THEN ROUND((palm_island_resident_count::DECIMAL / total_staff * 100), 1)
    ELSE 0
  END as palm_island_resident_percent
FROM staff_statistics
ORDER BY fiscal_year DESC;

-- Active partners
CREATE OR REPLACE VIEW active_partners AS
SELECT *
FROM partners
WHERE (partnership_end_date IS NULL OR partnership_end_date > CURRENT_DATE)
  AND show_in_annual_report = TRUE
ORDER BY display_order, name;

-- ============================================================================
-- PART 6: HELPER FUNCTION
-- ============================================================================

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

-- Story score calculation
CREATE OR REPLACE FUNCTION calculate_story_score(story_row stories)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  score := COALESCE(story_row.engagement_score, 0);
  IF story_row.auto_include THEN score := score + 50; END IF;
  IF story_row.report_worthy THEN score := score + 30; END IF;
  IF story_row.elder_approval_given THEN score := score + 20; END IF;
  score := score + LEAST(COALESCE(story_row.media_count, 0) * 5, 25);
  IF story_row.is_featured THEN score := score + 40; END IF;
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  -- Only create triggers that don't already exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_elder_quotes_updated_at') THEN
    CREATE TRIGGER update_elder_quotes_updated_at
      BEFORE UPDATE ON elder_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_community_feedback_updated_at') THEN
    CREATE TRIGGER update_community_feedback_updated_at
      BEFORE UPDATE ON community_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_board_members_updated_at') THEN
    CREATE TRIGGER update_board_members_updated_at
      BEFORE UPDATE ON board_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_partners_updated_at') THEN
    CREATE TRIGGER update_partners_updated_at
      BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leadership_updated_at') THEN
    CREATE TRIGGER update_leadership_updated_at
      BEFORE UPDATE ON leadership FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organization_stats_updated_at') THEN
    CREATE TRIGGER update_organization_stats_updated_at
      BEFORE UPDATE ON organization_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ============================================================================
-- DONE
-- Tables created/extended:
--   EXTENDED: annual_reports, report_sections, stories
--   FROM SYSTEM 2: elder_quotes, community_feedback, story_collections
--   FROM SYSTEM 3: board_members, governance_achievements, annual_financials,
--                   staff_statistics, partners, service_metrics
--   NEW: organization_stats, leadership, report_statistics, report_highlights
--   VIEWS: current_board_members, annual_financials_complete,
--          staff_statistics_complete, active_partners
--   FUNCTIONS: get_current_fiscal_year(), calculate_story_score()
-- ============================================================================

SELECT 'Consolidated annual reports migration complete!' as status;

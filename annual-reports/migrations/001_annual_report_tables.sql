-- ============================================================================
-- ANNUAL REPORT DATABASE EXTENSIONS
-- Palm Island Community Company
--
-- Run this migration to add tables needed for annual report generation
-- ============================================================================

-- ============================================================================
-- PART 1: STORIES TABLE EXTENSIONS
-- Add annual report fields to existing stories table
-- ============================================================================

-- Short summary field for story cards and previews
ALTER TABLE stories ADD COLUMN IF NOT EXISTS summary TEXT;

-- Annual report eligibility flag
ALTER TABLE stories ADD COLUMN IF NOT EXISTS annual_report_eligible BOOLEAN DEFAULT FALSE;

-- Which fiscal year this story is selected for
ALTER TABLE stories ADD COLUMN IF NOT EXISTS annual_report_year INTEGER;

-- Priority for featuring (1=low, 5=high)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 1;

-- Ensure priority stays in valid range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_featured_priority_check'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_featured_priority_check
      CHECK (featured_priority BETWEEN 1 AND 5);
  END IF;
END $$;

-- Which section of the annual report
ALTER TABLE stories ADD COLUMN IF NOT EXISTS report_section TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_report_section_check'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_report_section_check
      CHECK (report_section IN ('cover', 'leadership', 'services', 'community', 'financials', 'looking_forward', NULL));
  END IF;
END $$;

-- Quote fields (promoted from metadata)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS quote_text TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS quote_attribution TEXT;

-- Leadership role for CEO/Chair messages
ALTER TABLE stories ADD COLUMN IF NOT EXISTS leadership_role TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_leadership_role_check'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_leadership_role_check
      CHECK (leadership_role IN ('ceo', 'chair', 'director', NULL));
  END IF;
END $$;

-- Index for efficient annual report queries
CREATE INDEX IF NOT EXISTS idx_stories_annual_report
  ON stories(annual_report_eligible, annual_report_year, featured_priority DESC)
  WHERE annual_report_eligible = TRUE;

-- View for easy annual report querying
CREATE OR REPLACE VIEW annual_report_stories AS
SELECT
  s.*,
  p.full_name as storyteller_name,
  p.preferred_name as storyteller_preferred_name,
  p.community_role as storyteller_role,
  p.is_elder as storyteller_is_elder,
  array_agg(DISTINCT ssl.service_name) FILTER (WHERE ssl.service_name IS NOT NULL) as services,
  count(DISTINCT sm.id) as media_count
FROM stories s
INNER JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN service_story_links ssl ON s.id = ssl.story_id
LEFT JOIN story_media sm ON s.id = sm.story_id
WHERE s.annual_report_eligible = TRUE
  AND s.status = 'published'
GROUP BY s.id, p.id;

-- ============================================================================
-- PART 2: BOARD MEMBERS TABLE
-- Track current and historical board composition
-- ============================================================================

CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,  -- Chair, Director, Company Secretary, etc.

  -- Tenure
  start_date DATE,
  end_date DATE,  -- NULL if currently serving

  -- Display
  photo_url TEXT,
  bio TEXT,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Computed column for current status (as a view since computed columns are limited)
CREATE OR REPLACE VIEW current_board_members AS
SELECT *,
  (end_date IS NULL OR end_date > CURRENT_DATE) as is_current
FROM board_members
WHERE end_date IS NULL OR end_date > CURRENT_DATE
ORDER BY display_order, name;

-- Seed with known board members (update dates as needed)
INSERT INTO board_members (name, role, display_order) VALUES
  ('Luella Bligh', 'Chair', 1),
  ('Rhonda Phillips', 'Director', 2),
  ('Allan Palm Island', 'Director', 3),
  ('Matthew Lindsay', 'Company Secretary', 4),
  ('Harriet Hulthen', 'Director', 5),
  ('Raymond W. Palmer Snr', 'Director', 6),
  ('Cassie Lang', 'Director', 7)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 3: GOVERNANCE ACHIEVEMENTS
-- Track governance achievements by fiscal year
-- ============================================================================

CREATE TABLE IF NOT EXISTS governance_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  fiscal_year INTEGER NOT NULL,
  achievement_text TEXT NOT NULL,
  category TEXT,  -- staffing, compliance, partnership, accreditation, etc.
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample achievements (update as needed)
INSERT INTO governance_achievements (fiscal_year, achievement_text, category, display_order) VALUES
  (2025, 'PICC continues to have an average of over 80 per cent of its staff members identifying as Aboriginal, Torres Strait Islander or both.', 'staffing', 1),
  (2025, 'The proportion of staff members living on Palm Island is still above 70 per cent.', 'staffing', 2),
  (2025, 'PICC passed the Human Services Quality Framework audit with flying colours.', 'accreditation', 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 4: ANNUAL FINANCIALS
-- Store annual financial summaries for report generation
-- ============================================================================

CREATE TABLE IF NOT EXISTS annual_financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  fiscal_year INTEGER NOT NULL UNIQUE,

  -- Balance Sheet
  current_assets DECIMAL(12,2) DEFAULT 0,
  non_current_assets DECIMAL(12,2) DEFAULT 0,
  current_liabilities DECIMAL(12,2) DEFAULT 0,
  non_current_liabilities DECIMAL(12,2) DEFAULT 0,

  -- Income Statement
  total_income DECIMAL(12,2) DEFAULT 0,
  labour_costs DECIMAL(12,2) DEFAULT 0,
  administration_expenses DECIMAL(12,2) DEFAULT 0,
  property_energy_expenses DECIMAL(12,2) DEFAULT 0,
  motor_vehicle_expenses DECIMAL(12,2) DEFAULT 0,
  travel_training_expenses DECIMAL(12,2) DEFAULT 0,
  client_related_costs DECIMAL(12,2) DEFAULT 0,

  -- Audit Info
  audited BOOLEAN DEFAULT FALSE,
  auditor_name TEXT,
  audit_date DATE,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- View with computed totals
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

-- ============================================================================
-- PART 5: STAFF STATISTICS
-- Year-over-year staffing data for reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  fiscal_year INTEGER NOT NULL,
  snapshot_date DATE NOT NULL,  -- e.g., 30 June each year

  -- Headcount
  total_staff INTEGER NOT NULL DEFAULT 0,
  full_time_staff INTEGER DEFAULT 0,
  part_time_staff INTEGER DEFAULT 0,
  casual_staff INTEGER DEFAULT 0,

  -- Demographics
  indigenous_staff_count INTEGER DEFAULT 0,
  palm_island_resident_count INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(fiscal_year, snapshot_date)
);

-- View with computed percentages
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

-- ============================================================================
-- PART 6: PARTNERS TABLE
-- Track partner organisations
-- ============================================================================

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  short_name TEXT,

  -- Categorization
  partner_type TEXT DEFAULT 'service',
  -- government, health, education, funding, service, community

  -- Partnership Details
  partnership_start_date DATE,
  partnership_end_date DATE,

  -- Display
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  show_in_annual_report BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed with known partners
INSERT INTO partners (name, partner_type, display_order) VALUES
  ('BSocial Media', 'service', 1),
  ('Bwgcolman Community School', 'education', 2),
  ('CheckUp Australia', 'health', 3),
  ('Chit Chat Speech Pathology', 'health', 4),
  ('Commonwealth Department of Health and Aged Care', 'government', 5),
  ('Commonwealth Department of Social Services', 'government', 6),
  ('Fred Hollows Foundation', 'health', 7),
  ('Heart of Australia', 'health', 8),
  ('James Cook University', 'education', 9),
  ('Joyce Palmer Health Service', 'health', 10),
  ('National Indigenous Australians Agency', 'government', 11),
  ('Palm Island Aboriginal Shire Council', 'government', 12),
  ('Queensland Health', 'government', 13),
  ('TAFE Queensland', 'education', 14),
  ('Telstra', 'service', 15),
  ('Townsville Hospital and Health Service', 'health', 16),
  ('North Queensland Primary Health Network', 'health', 17)
ON CONFLICT DO NOTHING;

-- View for active partners
CREATE OR REPLACE VIEW active_partners AS
SELECT *
FROM partners
WHERE (partnership_end_date IS NULL OR partnership_end_date > CURRENT_DATE)
  AND show_in_annual_report = TRUE
ORDER BY display_order, name;

-- ============================================================================
-- PART 7: SERVICES TABLE (FIRST-CLASS)
-- Proper services reference table
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  slug TEXT UNIQUE,

  -- Categorization
  service_category TEXT,  -- health, family, youth, cultural, justice, crisis, disability, community

  -- Details
  description TEXT,
  target_audience TEXT,

  -- Display
  icon_name TEXT,
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  show_in_annual_report BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed with PICC's 16 services
INSERT INTO services (name, slug, service_category, display_order) VALUES
  ('Bwgcolman Healing Service', 'bwgcolman-healing', 'health', 1),
  ('Community Justice Group', 'community-justice', 'justice', 2),
  ('Digital Service Centre', 'digital-service', 'community', 3),
  ('Diversionary Service', 'diversionary', 'justice', 4),
  ('Early Childhood Services (CFC)', 'early-childhood', 'family', 5),
  ('Family Care Service', 'family-care', 'family', 6),
  ('Family Participation Program', 'family-participation', 'family', 7),
  ('Family Wellbeing Centre', 'family-wellbeing', 'family', 8),
  ('NDIS Service', 'ndis', 'disability', 9),
  ('Safe Haven', 'safe-haven', 'crisis', 10),
  ('Safe House', 'safe-house', 'crisis', 11),
  ('Social and Emotional Wellbeing Service', 'sewb', 'health', 12),
  ('Specialist Domestic and Family Violence Service', 'dfv', 'crisis', 13),
  ('Women''s Healing Service', 'womens-healing', 'health', 14),
  ('Women''s Service', 'womens-service', 'family', 15),
  ('Youth Service', 'youth', 'youth', 16)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PART 8: SERVICE METRICS
-- Track annual metrics per service for data cards
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,

  -- Core Metrics
  clients_served INTEGER,
  sessions_delivered INTEGER,
  events_held INTEGER,
  staff_count INTEGER,

  -- Outcomes
  key_achievement TEXT,

  -- For Data Cards in Annual Report
  headline_stat_value TEXT,  -- e.g., "1,234"
  headline_stat_label TEXT,  -- e.g., "families supported"

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(service_id, fiscal_year)
);

-- ============================================================================
-- PART 9: MEDIA ATTRIBUTION ENHANCEMENTS
-- Add proper attribution fields to story_media
-- ============================================================================

ALTER TABLE story_media ADD COLUMN IF NOT EXISTS photographer TEXT;
ALTER TABLE story_media ADD COLUMN IF NOT EXISTS credit TEXT;
ALTER TABLE story_media ADD COLUMN IF NOT EXISTS photo_date DATE;
ALTER TABLE story_media ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE story_media ADD COLUMN IF NOT EXISTS usage_rights TEXT DEFAULT 'full';
ALTER TABLE story_media ADD COLUMN IF NOT EXISTS requires_credit BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- PART 10: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for most tables (adjust as needed)
CREATE POLICY "Board members are publicly readable" ON board_members
  FOR SELECT USING (true);

CREATE POLICY "Governance achievements are publicly readable" ON governance_achievements
  FOR SELECT USING (true);

CREATE POLICY "Partners are publicly readable" ON partners
  FOR SELECT USING (show_in_annual_report = true);

CREATE POLICY "Services are publicly readable" ON services
  FOR SELECT USING (is_active = true);

-- Financial data might be restricted until audited
CREATE POLICY "Audited financials are publicly readable" ON annual_financials
  FOR SELECT USING (audited = true);

CREATE POLICY "Staff statistics are publicly readable" ON staff_statistics
  FOR SELECT USING (true);

CREATE POLICY "Service metrics are publicly readable" ON service_metrics
  FOR SELECT USING (true);

-- ============================================================================
-- DONE
-- ============================================================================

-- Verify tables created
SELECT 'Migration complete. Tables created:' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'board_members', 'governance_achievements', 'annual_financials',
    'staff_statistics', 'partners', 'services', 'service_metrics'
  )
ORDER BY table_name;

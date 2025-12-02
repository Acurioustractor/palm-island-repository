-- ============================================================================
-- STEP 3: Multi-Organization Support and Annual Report Automation
-- Extends Empathy Ledger to support any organization
-- Run this after profiles and stories tables are created
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS (Core - Any organization can use Empathy Ledger)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name TEXT NOT NULL,
  legal_name TEXT,
  short_name TEXT,
  organization_type TEXT NOT NULL,
  -- aboriginal_community, torres_strait_islander, indigenous_ngo, 
  -- government_service, healthcare, education, environmental, social_services
  
  -- Identity & Branding
  logo_url TEXT,
  primary_color TEXT, -- Hex color for branding
  secondary_color TEXT,
  tagline TEXT,
  mission_statement TEXT,
  
  -- Location
  primary_location TEXT,
  traditional_country TEXT,
  language_groups TEXT[],
  service_locations TEXT[], -- Multiple service locations
  coordinates POINT,
  
  -- Contact Information
  website TEXT,
  email TEXT,
  phone TEXT,
  postal_address TEXT,
  physical_address TEXT,
  
  -- Organizational Details
  established_date DATE,
  abn TEXT, -- Australian Business Number
  indigenous_controlled BOOLEAN DEFAULT TRUE,
  governance_model TEXT, -- board_managed, community_controlled, cooperative, etc.
  
  -- Empathy Ledger Configuration
  empathy_ledger_enabled BOOLEAN DEFAULT TRUE,
  annual_reports_enabled BOOLEAN DEFAULT TRUE,
  impact_tracking_enabled BOOLEAN DEFAULT TRUE,
  
  -- Cultural Protocols
  has_cultural_protocols BOOLEAN DEFAULT TRUE,
  elder_approval_required BOOLEAN DEFAULT FALSE,
  cultural_advisor_ids UUID[], -- References to profiles
  
  -- Settings
  default_story_access_level TEXT DEFAULT 'community',
  require_story_approval BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT organizations_type_check CHECK (
    organization_type IN (
      'aboriginal_community', 'torres_strait_islander', 'indigenous_ngo',
      'government_service', 'healthcare', 'education', 'environmental',
      'social_services', 'arts_culture', 'economic_development', 'other'
    )
  )
);

-- ============================================================================
-- ORGANIZATION SERVICES (Programs/Departments within org)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Organization Connection
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Service Details
  service_name TEXT NOT NULL,
  service_slug TEXT NOT NULL, -- URL-friendly name
  description TEXT,
  service_category TEXT NOT NULL,
  -- health, youth, family, education, culture, environment, economic, justice, housing
  
  -- Service Operations
  manager_profile_id UUID REFERENCES profiles(id),
  staff_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  
  -- Service Metrics
  clients_served_annual INTEGER,
  budget_annual DECIMAL,
  
  -- Impact Tracking
  impact_categories TEXT[], -- What types of impact this service creates
  story_count INTEGER DEFAULT 0,
  
  -- Branding
  service_color TEXT, -- For visual distinction in reports
  icon_name TEXT, -- Icon identifier for UI
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT services_category_check CHECK (
    service_category IN (
      'health', 'youth', 'family', 'education', 'culture', 
      'environment', 'economic', 'justice', 'housing', 'other'
    )
  ),
  
  UNIQUE(organization_id, service_slug)
);

-- ============================================================================
-- ORGANIZATION MEMBERSHIP (Link profiles to organizations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Connections
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Membership Details
  role TEXT NOT NULL DEFAULT 'member',
  -- admin, manager, coordinator, staff, member, contributor, elder, cultural_advisor
  
  -- Service Assignment
  service_id UUID REFERENCES organization_services(id) ON DELETE SET NULL,
  
  -- Permissions
  can_approve_stories BOOLEAN DEFAULT FALSE,
  can_manage_reports BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT FALSE,
  can_manage_members BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  join_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT members_role_check CHECK (
    role IN (
      'admin', 'manager', 'coordinator', 'staff', 'member', 
      'contributor', 'elder', 'cultural_advisor', 'board_member'
    )
  ),
  
  UNIQUE(organization_id, profile_id)
);

-- ============================================================================
-- ANNUAL REPORTS (Core report management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS annual_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Organization & Period
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_year INTEGER NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  
  -- Report Details
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT, -- Annual theme/focus
  
  -- Status & Workflow
  status TEXT DEFAULT 'planning',
  -- planning, collecting, drafting, review, approved, published, archived
  
  -- Template & Design
  template_name TEXT DEFAULT 'traditional',
  -- traditional, modern, photo_story, youth_focused, professional
  cover_image_url TEXT,
  
  -- Content Selections
  featured_story_ids UUID[], -- Manually selected featured stories
  auto_include_criteria JSONB, -- Criteria for automatic story inclusion
  exclude_story_ids UUID[], -- Stories to explicitly exclude
  
  -- Report Sections Configuration
  sections_config JSONB DEFAULT '[
    {"type": "executive_summary", "enabled": true, "order": 1},
    {"type": "leadership_message", "enabled": true, "order": 2},
    {"type": "year_overview", "enabled": true, "order": 3},
    {"type": "community_stories", "enabled": true, "order": 4},
    {"type": "service_highlights", "enabled": true, "order": 5},
    {"type": "impact_data", "enabled": true, "order": 6},
    {"type": "financial_summary", "enabled": false, "order": 7},
    {"type": "looking_forward", "enabled": true, "order": 8},
    {"type": "acknowledgments", "enabled": true, "order": 9}
  ]'::jsonb,
  
  -- Content
  executive_summary TEXT,
  leadership_message TEXT,
  leadership_message_author UUID REFERENCES profiles(id),
  year_highlights TEXT[],
  looking_forward TEXT,
  acknowledgments TEXT,
  
  -- Data & Statistics
  statistics JSONB DEFAULT '{}'::jsonb,
  -- Flexible structure for any metrics: people served, events held, outcomes, etc.
  
  -- Cultural Protocols
  elder_approval_required BOOLEAN DEFAULT TRUE,
  elder_approvals UUID[], -- Array of profile IDs who approved
  elder_approval_date TIMESTAMP,
  cultural_advisor_review BOOLEAN DEFAULT FALSE,
  cultural_notes TEXT,
  
  -- Generation & Publication
  auto_generated BOOLEAN DEFAULT FALSE,
  generation_date TIMESTAMP,
  generated_by UUID REFERENCES profiles(id),
  
  published_date TIMESTAMP,
  published_by UUID REFERENCES profiles(id),
  
  pdf_url TEXT, -- Link to generated PDF in Supabase Storage
  web_version_url TEXT, -- Link to web version
  
  -- Distribution
  distribution_list TEXT[], -- Email list
  distribution_date TIMESTAMP,
  
  -- Engagement
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT reports_status_check CHECK (
    status IN ('planning', 'collecting', 'drafting', 'review', 'approved', 'published', 'archived')
  ),
  
  UNIQUE(organization_id, report_year)
);

-- ============================================================================
-- ANNUAL REPORT STORIES (Many-to-many link between reports and stories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS annual_report_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Connections
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Story Inclusion Details
  inclusion_reason TEXT,
  -- featured, category_representative, impact_highlight, elder_wisdom, 
  -- service_success, auto_selected
  
  section_placement TEXT,
  -- Which report section this story appears in
  
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Customization for Report
  custom_title TEXT, -- Override story title for report
  custom_excerpt TEXT, -- Custom summary for report
  include_full_text BOOLEAN DEFAULT TRUE,
  
  -- Media Selection
  selected_media_ids UUID[], -- Which media items to include from story
  
  -- Metadata
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(report_id, story_id)
);

-- ============================================================================
-- REPORT SECTIONS (Custom content sections for reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,
  
  -- Section Details
  section_type TEXT NOT NULL,
  section_title TEXT NOT NULL,
  section_content TEXT,
  
  -- Organization
  display_order INTEGER DEFAULT 0,
  page_break_before BOOLEAN DEFAULT FALSE,
  
  -- Styling
  layout_style TEXT DEFAULT 'standard',
  -- standard, two_column, image_focus, data_focus, timeline
  
  background_color TEXT,
  
  -- Content Elements
  include_stories BOOLEAN DEFAULT FALSE,
  story_ids UUID[],
  
  include_media BOOLEAN DEFAULT FALSE,
  media_ids UUID[],
  
  include_data_viz BOOLEAN DEFAULT FALSE,
  data_viz_config JSONB,
  
  -- Custom HTML/Markdown
  custom_content TEXT,
  content_format TEXT DEFAULT 'markdown',
  -- markdown, html, plain_text
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- REPORT TEMPLATES (Reusable report designs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Identity
  template_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Template Type
  category TEXT DEFAULT 'general',
  -- general, indigenous_focused, youth, health, environmental, etc.
  
  -- Design Configuration
  design_config JSONB NOT NULL DEFAULT '{
    "colorScheme": "earth_tones",
    "typography": "traditional",
    "layoutStyle": "storytelling",
    "includePatterns": true,
    "patternStyle": "indigenous"
  }'::jsonb,
  
  -- Default Sections
  default_sections JSONB NOT NULL,
  
  -- Template Assets
  cover_template_url TEXT,
  header_template_url TEXT,
  footer_template_url TEXT,
  
  -- Availability
  is_public BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id), -- Org-specific template
  
  -- Usage
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- REPORT FEEDBACK (Community feedback on reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,
  
  -- Feedback Provider
  profile_id UUID REFERENCES profiles(id),
  feedback_type TEXT NOT NULL,
  -- community_member, staff, elder, cultural_advisor, external
  
  -- Feedback Content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  
  -- Specific Feedback Areas
  liked_sections TEXT[],
  improvement_areas TEXT[],
  missing_content TEXT,
  design_feedback TEXT,
  
  -- Action
  is_addressed BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- EXTEND EXISTING TABLES
-- ============================================================================

-- Add organization link to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES organizations(id);

-- Add organization link to existing stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add service link to existing stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES organization_services(id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organizations
CREATE INDEX IF NOT EXISTS organizations_type_idx ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS organizations_location_idx ON organizations(primary_location);

-- Services
CREATE INDEX IF NOT EXISTS services_org_id_idx ON organization_services(organization_id);
CREATE INDEX IF NOT EXISTS services_category_idx ON organization_services(service_category);
CREATE INDEX IF NOT EXISTS services_active_idx ON organization_services(is_active);

-- Membership
CREATE INDEX IF NOT EXISTS members_org_id_idx ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS members_profile_id_idx ON organization_members(profile_id);
CREATE INDEX IF NOT EXISTS members_role_idx ON organization_members(role);
CREATE INDEX IF NOT EXISTS members_active_idx ON organization_members(is_active);

-- Annual Reports
CREATE INDEX IF NOT EXISTS reports_org_id_idx ON annual_reports(organization_id);
CREATE INDEX IF NOT EXISTS reports_year_idx ON annual_reports(report_year);
CREATE INDEX IF NOT EXISTS reports_status_idx ON annual_reports(status);
CREATE INDEX IF NOT EXISTS reports_published_idx ON annual_reports(published_date);

-- Report Stories
CREATE INDEX IF NOT EXISTS report_stories_report_id_idx ON annual_report_stories(report_id);
CREATE INDEX IF NOT EXISTS report_stories_story_id_idx ON annual_report_stories(story_id);

-- Report Sections
CREATE INDEX IF NOT EXISTS report_sections_report_id_idx ON report_sections(report_id);
CREATE INDEX IF NOT EXISTS report_sections_order_idx ON report_sections(report_id, display_order);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_report_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_feedback ENABLE ROW LEVEL SECURITY;

-- Organizations: Public info viewable, members can see full details
CREATE POLICY "Public organizations viewable by all" ON organizations
  FOR SELECT USING (empathy_ledger_enabled = true);

CREATE POLICY "Members can view org details" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Services: Viewable by organization members
CREATE POLICY "Members can view services" ON organization_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_services.organization_id
      AND organization_members.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Annual Reports: Published reports viewable based on access level
CREATE POLICY "Published reports viewable by authenticated users" ON annual_reports
  FOR SELECT USING (
    status = 'published' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Members can view all org reports" ON annual_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = annual_reports.organization_id
      AND organization_members.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Report managers can create/edit reports" ON annual_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = annual_reports.organization_id
      AND organization_members.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
      AND organization_members.can_manage_reports = true
    )
  );

-- Report Stories: Same access as parent report
CREATE POLICY "Report stories viewable with report" ON annual_report_stories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = annual_report_stories.report_id
      AND (
        annual_reports.status = 'published'
        OR EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = annual_reports.organization_id
          AND organization_members.profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

-- Templates: Public templates viewable by all
CREATE POLICY "Public templates viewable by all" ON report_templates
  FOR SELECT USING (is_public = true);

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Update updated_at timestamp for organizations
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for services
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON organization_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for reports
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON annual_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update service story count when story linked
CREATE OR REPLACE FUNCTION update_service_story_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.service_id IS NOT NULL THEN
    UPDATE organization_services
    SET story_count = story_count + 1
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_count_on_story AFTER INSERT ON stories
  FOR EACH ROW EXECUTE FUNCTION update_service_story_count();

-- Update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE report_templates
  SET usage_count = usage_count + 1
  WHERE template_name = NEW.template_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage_on_report AFTER INSERT ON annual_reports
  FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get organization statistics
CREATE OR REPLACE FUNCTION get_organization_stats(org_uuid UUID)
RETURNS TABLE (
  total_members INTEGER,
  active_services INTEGER,
  total_stories INTEGER,
  stories_this_year INTEGER,
  total_reports INTEGER,
  published_reports INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM organization_members 
     WHERE organization_id = org_uuid AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM organization_services 
     WHERE organization_id = org_uuid AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM stories 
     WHERE organization_id = org_uuid),
    (SELECT COUNT(*)::INTEGER FROM stories 
     WHERE organization_id = org_uuid 
     AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COUNT(*)::INTEGER FROM annual_reports 
     WHERE organization_id = org_uuid),
    (SELECT COUNT(*)::INTEGER FROM annual_reports 
     WHERE organization_id = org_uuid AND status = 'published');
END;
$$ LANGUAGE plpgsql;

-- Function to get stories for annual report (auto-selection)
CREATE OR REPLACE FUNCTION get_stories_for_report(
  org_uuid UUID,
  year_value INTEGER,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  story_id UUID,
  story_title TEXT,
  category TEXT,
  impact_score INTEGER,
  relevance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as story_id,
    s.title as story_title,
    s.category,
    (s.views + s.shares * 2 + s.likes) as impact_score,
    CASE 
      WHEN s.is_featured THEN 1.0
      WHEN s.is_verified THEN 0.9
      WHEN s.contains_traditional_knowledge THEN 0.8
      ELSE 0.7
    END as relevance_score
  FROM stories s
  WHERE s.organization_id = org_uuid
    AND s.status = 'published'
    AND EXTRACT(YEAR FROM s.created_at) = year_value
  ORDER BY relevance_score DESC, impact_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Organization overview with stats
CREATE OR REPLACE VIEW organization_overview AS
SELECT 
  o.*,
  COUNT(DISTINCT om.id) as member_count,
  COUNT(DISTINCT os.id) as service_count,
  COUNT(DISTINCT s.id) as story_count,
  COUNT(DISTINCT ar.id) as report_count
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.is_active = true
LEFT JOIN organization_services os ON o.id = os.organization_id AND os.is_active = true
LEFT JOIN stories s ON o.id = s.organization_id
LEFT JOIN annual_reports ar ON o.id = ar.organization_id
GROUP BY o.id;

-- Annual report with story count
CREATE OR REPLACE VIEW annual_reports_with_stats AS
SELECT 
  ar.*,
  o.name as organization_name,
  o.logo_url as organization_logo,
  COUNT(DISTINCT ars.story_id) as story_count,
  COUNT(DISTINCT rf.id) as feedback_count,
  AVG(rf.rating) as average_rating
FROM annual_reports ar
INNER JOIN organizations o ON ar.organization_id = o.id
LEFT JOIN annual_report_stories ars ON ar.id = ars.report_id
LEFT JOIN report_feedback rf ON ar.id = rf.report_id
GROUP BY ar.id, o.name, o.logo_url;

-- ============================================================================
-- SEED DATA - Default Templates
-- ============================================================================

INSERT INTO report_templates (template_name, display_name, description, category, design_config, default_sections)
VALUES 
(
  'traditional',
  'Traditional Indigenous Design',
  'Earth tones, traditional patterns, emphasis on storytelling and cultural protocols',
  'indigenous_focused',
  '{
    "colorScheme": "earth_tones",
    "primaryColor": "#8B4513",
    "secondaryColor": "#D2691E",
    "accentColor": "#CD853F",
    "typography": {
      "headingFont": "serif",
      "bodyFont": "sans-serif"
    },
    "layoutStyle": "storytelling",
    "includePatterns": true,
    "patternStyle": "indigenous",
    "culturalElements": true
  }',
  '[
    {"type": "cover", "required": true},
    {"type": "cultural_acknowledgment", "required": true},
    {"type": "leadership_message", "required": false},
    {"type": "executive_summary", "required": false},
    {"type": "community_stories", "required": true},
    {"type": "elder_wisdom", "required": false},
    {"type": "service_highlights", "required": true},
    {"type": "impact_data", "required": true},
    {"type": "looking_forward", "required": true},
    {"type": "acknowledgments", "required": true}
  ]'
),
(
  'modern_professional',
  'Modern Professional',
  'Clean contemporary design with data visualization focus',
  'general',
  '{
    "colorScheme": "modern",
    "primaryColor": "#2C3E50",
    "secondaryColor": "#3498DB",
    "accentColor": "#E74C3C",
    "typography": {
      "headingFont": "sans-serif",
      "bodyFont": "sans-serif"
    },
    "layoutStyle": "data_driven",
    "includePatterns": false,
    "culturalElements": false
  }',
  '[
    {"type": "cover", "required": true},
    {"type": "executive_summary", "required": true},
    {"type": "data_highlights", "required": true},
    {"type": "program_outcomes", "required": true},
    {"type": "financial_summary", "required": false},
    {"type": "strategic_goals", "required": true},
    {"type": "acknowledgments", "required": true}
  ]'
),
(
  'photo_story',
  'Photo Story',
  'Image-heavy design with large galleries and minimal text overlay',
  'general',
  '{
    "colorScheme": "vibrant",
    "primaryColor": "#1A1A1A",
    "secondaryColor": "#FFFFFF",
    "accentColor": "#FFD700",
    "typography": {
      "headingFont": "sans-serif",
      "bodyFont": "sans-serif"
    },
    "layoutStyle": "image_focus",
    "includePatterns": false,
    "culturalElements": false
  }',
  '[
    {"type": "cover", "required": true},
    {"type": "photo_essay", "required": true},
    {"type": "community_moments", "required": true},
    {"type": "year_in_pictures", "required": true},
    {"type": "stories", "required": false},
    {"type": "acknowledgments", "required": true}
  ]'
);

-- ============================================================================
-- SEED DATA - Create Palm Island Community Company
-- ============================================================================

-- Insert PICC as the first organization
INSERT INTO organizations (
  name,
  legal_name,
  short_name,
  organization_type,
  tagline,
  mission_statement,
  primary_location,
  traditional_country,
  language_groups,
  website,
  email,
  phone,
  established_date,
  indigenous_controlled,
  governance_model,
  empathy_ledger_enabled,
  annual_reports_enabled,
  impact_tracking_enabled,
  has_cultural_protocols,
  elder_approval_required,
  default_story_access_level
) VALUES (
  'Palm Island Community Company',
  'Palm Island Community Company Limited',
  'PICC',
  'aboriginal_community',
  'Our Community, Our Future, Our Way',
  'Delivering culturally appropriate, community-controlled services that strengthen Palm Island families, preserve culture, and build a thriving future for all generations.',
  'Palm Island',
  'Manbarra Country',
  ARRAY['Manbarra', 'Bwgcolman'],
  'https://picc.com.au',
  'info@picc.com.au',
  '+61 7 4770 1177',
  '1999-01-01',
  TRUE,
  'community_controlled',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  'community'
)
ON CONFLICT DO NOTHING;

-- Get the PICC organization ID for service insertions
DO $$
DECLARE
  picc_org_id UUID;
BEGIN
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC';
  
  -- Insert PICC's 16 key services
  INSERT INTO organization_services (organization_id, service_name, service_slug, description, service_category, is_active, service_color, icon_name)
  VALUES
    (picc_org_id, 'Bwgcolman Healing Service', 'bwgcolman_healing', 'Comprehensive primary healthcare integrating traditional and modern medicine', 'health', TRUE, '#E74C3C', 'heart-pulse'),
    (picc_org_id, 'Family Wellbeing Centre', 'family_wellbeing', 'Family support services and wellbeing programs', 'family', TRUE, '#9B59B6', 'users'),
    (picc_org_id, 'Youth Services', 'youth_services', 'Youth development, leadership, and support programs', 'youth', TRUE, '#3498DB', 'user-group'),
    (picc_org_id, 'Early Learning Centre', 'early_learning', 'Quality early childhood education and care', 'education', TRUE, '#F39C12', 'school'),
    (picc_org_id, 'Cultural Centre', 'cultural_centre', 'Cultural preservation, language programs, and arts', 'culture', TRUE, '#1ABC9C', 'landmark'),
    (picc_org_id, 'Ranger Program', 'ranger_program', 'Land and sea country management and conservation', 'environment', TRUE, '#27AE60', 'tree'),
    (picc_org_id, 'Digital Service Centre', 'digital_services', 'Technology access, digital literacy, and online services', 'education', TRUE, '#34495E', 'laptop'),
    (picc_org_id, 'Economic Development', 'economic_development', 'Business support, employment, and economic opportunities', 'economic', TRUE, '#E67E22', 'briefcase'),
    (picc_org_id, 'Housing Services', 'housing_services', 'Housing maintenance and tenancy support', 'housing', TRUE, '#95A5A6', 'home'),
    (picc_org_id, 'Elder Support Services', 'elder_support', 'Support and care for Elders and seniors', 'family', TRUE, '#8E44AD', 'hand-holding-heart'),
    (picc_org_id, 'Community Justice', 'community_justice', 'Justice support and community safety initiatives', 'justice', TRUE, '#C0392B', 'scale-balanced'),
    (picc_org_id, 'Women''s Services', 'womens_services', 'Support and programs specifically for women', 'family', TRUE, '#E91E63', 'venus'),
    (picc_org_id, 'Men''s Programs', 'mens_programs', 'Healing and development programs for men', 'family', TRUE, '#2980B9', 'mars'),
    (picc_org_id, 'Food Security', 'food_security', 'Community gardens, nutrition, and food programs', 'health', TRUE, '#16A085', 'utensils'),
    (picc_org_id, 'Sports & Recreation', 'sports_recreation', 'Sports programs and recreational activities', 'youth', TRUE, '#F1C40F', 'futbol'),
    (picc_org_id, 'Transport Services', 'transport', 'Community transport and mobility support', 'other', TRUE, '#7F8C8D', 'van-shuttle')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE organizations IS 'Any organization using Empathy Ledger - Indigenous communities, NGOs, government services';
COMMENT ON TABLE organization_services IS 'Programs, departments, or services within an organization';
COMMENT ON TABLE organization_members IS 'Links profiles (storytellers) to organizations with roles and permissions';
COMMENT ON TABLE annual_reports IS 'Annual report management with automated generation from stories and impact data';
COMMENT ON TABLE annual_report_stories IS 'Links stories to annual reports with placement and customization options';
COMMENT ON TABLE report_sections IS 'Custom content sections within annual reports';
COMMENT ON TABLE report_templates IS 'Reusable report design templates';
COMMENT ON TABLE report_feedback IS 'Community and stakeholder feedback on published reports';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Multi-organization and annual report schema successfully deployed!';
  RAISE NOTICE '📊 Palm Island Community Company initialized with 16 services';
  RAISE NOTICE '📝 3 report templates created (traditional, modern, photo_story)';
  RAISE NOTICE '🌊 Empathy Ledger is now ready for any organization to use';
END $$;

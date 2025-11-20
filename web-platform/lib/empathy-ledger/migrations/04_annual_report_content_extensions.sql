-- ============================================================================
-- STEP 4: Annual Report Content Extensions
-- Extends annual_reports to support leadership messages, governance, cultural
-- grounding, and narrative storytelling for professional annual reports
-- ============================================================================

-- ============================================================================
-- LEADERSHIP MESSAGES (CEO, Chair, Board Members)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_leadership_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

  -- Leadership Details
  role TEXT NOT NULL,
  -- ceo, chair, board_member, elder, cultural_advisor, executive_director

  person_profile_id UUID REFERENCES profiles(id),
  person_name TEXT NOT NULL,
  person_title TEXT, -- "Chief Executive Officer", "Board Chair"
  person_bio TEXT,
  person_photo_url TEXT,

  -- Message Content
  message_title TEXT, -- "Message from the CEO"
  message_content TEXT NOT NULL, -- The actual message (supports markdown)
  message_excerpt TEXT, -- Short summary for previews

  -- Styling & Display
  display_order INTEGER DEFAULT 0,
  layout_style TEXT DEFAULT 'standard',
  -- standard, photo_left, photo_right, full_width, minimal

  featured_quote TEXT, -- Pull quote to highlight

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT leadership_role_check CHECK (
    role IN (
      'ceo', 'chair', 'board_member', 'elder',
      'cultural_advisor', 'executive_director', 'president', 'other'
    )
  )
);

-- ============================================================================
-- BOARD MEMBERS & GOVERNANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

  -- Board Member Details
  profile_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL, -- Chair, Director, Company Secretary

  -- Display Information
  photo_url TEXT,
  bio TEXT,

  -- Term Details
  term_start_date DATE,
  term_end_date DATE,
  is_current BOOLEAN DEFAULT TRUE,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- CULTURAL GROUNDING
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_cultural_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

  -- Content Type
  content_type TEXT NOT NULL,
  -- acknowledgement_of_country, welcome_to_country, cultural_protocol,
  -- language_statement, elder_blessing, cultural_artwork_description

  -- Content
  title TEXT,
  content TEXT NOT NULL,
  content_format TEXT DEFAULT 'markdown',

  -- Cultural Elements
  language TEXT, -- Traditional language name
  language_translation TEXT,

  -- Associated Media
  artwork_image_url TEXT,
  artwork_title TEXT,
  artist_name TEXT,
  artist_profile_id UUID REFERENCES profiles(id),
  artwork_description TEXT,
  artwork_copyright TEXT,

  -- Permissions & Protocols
  elder_approved BOOLEAN DEFAULT FALSE,
  elder_approver_id UUID REFERENCES profiles(id),
  cultural_sensitivity_level TEXT DEFAULT 'public',
  -- public, community_only, restricted, sacred

  requires_permission BOOLEAN DEFAULT FALSE,
  usage_restrictions TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,
  page_placement TEXT DEFAULT 'opening',
  -- opening, closing, throughout, sidebar

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT content_type_check CHECK (
    content_type IN (
      'acknowledgement_of_country', 'welcome_to_country', 'cultural_protocol',
      'language_statement', 'elder_blessing', 'cultural_artwork_description',
      'traditional_story', 'cultural_practice', 'other'
    )
  ),

  CONSTRAINT sensitivity_level_check CHECK (
    cultural_sensitivity_level IN ('public', 'community_only', 'restricted', 'sacred')
  )
);

-- ============================================================================
-- ORGANIZATIONAL HIGHLIGHTS & INITIATIVES
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

  -- Highlight Type
  highlight_type TEXT NOT NULL,
  -- major_initiative, program_launch, achievement, milestone,
  -- community_impact, partnership, innovation

  -- Content
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,

  -- Story Elements
  challenge_faced TEXT, -- The problem/challenge
  solution_approach TEXT, -- How it was addressed
  impact_achieved TEXT, -- Outcomes and results

  -- Associated Service/Program
  service_id UUID REFERENCES organization_services(id),

  -- Media
  featured_image_url TEXT,
  additional_images TEXT[], -- Array of image URLs
  video_url TEXT,

  -- Related Stories
  related_story_ids UUID[], -- Links to empathy ledger stories

  -- Metrics & Data
  metrics JSONB, -- Flexible structure for impact metrics
  -- Example: {"people_served": 250, "sessions_held": 45, "satisfaction": "92%"}

  -- Display
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  display_style TEXT DEFAULT 'standard',
  -- standard, hero, card, timeline_item, stat_focus

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT highlight_type_check CHECK (
    highlight_type IN (
      'major_initiative', 'program_launch', 'achievement', 'milestone',
      'community_impact', 'partnership', 'innovation', 'challenge_overcome',
      'service_expansion', 'cultural_event', 'other'
    )
  )
);

-- ============================================================================
-- PARTNERS & COLLABORATORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

  -- Partner Details
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL,
  -- government, ngo, corporate, community, academic, health, education, funding

  -- Display Information
  logo_url TEXT,
  website TEXT,
  description TEXT,

  -- Partnership Details
  partnership_area TEXT, -- What service/area they support
  partnership_level TEXT DEFAULT 'collaborator',
  -- major_funder, key_partner, collaborator, supporter, in_kind

  relationship_years INTEGER, -- How long we've worked together
  contribution_description TEXT,

  -- Recognition Level
  should_display_logo BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT partner_type_check CHECK (
    partner_type IN (
      'government', 'ngo', 'corporate', 'community', 'academic',
      'health', 'education', 'funding_body', 'philanthropic', 'other'
    )
  )
);

-- ============================================================================
-- KEY STATISTICS & DATA POINTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Connection
  report_id UUID NOT NULL REFERENCES annual_reports(id) ON DELETE CASCADE,

  -- Statistic Details
  category TEXT NOT NULL,
  -- service_delivery, workforce, financial, community_engagement, outcomes

  stat_label TEXT NOT NULL, -- "Total Staff Members"
  stat_value TEXT NOT NULL, -- "197" or "3x increase"
  stat_unit TEXT, -- "people", "dollars", "percent", "sessions"

  -- Context
  stat_description TEXT,
  comparison_previous_year TEXT, -- "Up from 151 in 2022/23"
  comparison_type TEXT, -- increase, decrease, stable, new

  -- Visualization
  display_format TEXT DEFAULT 'number',
  -- number, percentage, currency, chart, graph, icon

  icon_name TEXT, -- Icon to display with stat
  color TEXT, -- Hex color for visual emphasis

  -- Display
  is_key_metric BOOLEAN DEFAULT FALSE, -- Featured in summary section
  display_order INTEGER DEFAULT 0,

  -- Source & Verification
  data_source TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_date DATE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT category_check CHECK (
    category IN (
      'service_delivery', 'workforce', 'financial', 'community_engagement',
      'outcomes', 'cultural', 'environmental', 'health', 'education', 'other'
    )
  ),

  CONSTRAINT comparison_check CHECK (
    comparison_type IN ('increase', 'decrease', 'stable', 'new', 'milestone', NULL)
  )
);

-- ============================================================================
-- NARRATIVE SECTIONS (Flexible content blocks)
-- ============================================================================

-- Extend the existing report_sections table with additional fields
ALTER TABLE report_sections
ADD COLUMN IF NOT EXISTS featured_quote TEXT,
ADD COLUMN IF NOT EXISTS quote_author TEXT,
ADD COLUMN IF NOT EXISTS quote_author_title TEXT,
ADD COLUMN IF NOT EXISTS sidebar_content TEXT,
ADD COLUMN IF NOT EXISTS call_to_action TEXT,
ADD COLUMN IF NOT EXISTS cta_link TEXT;

-- ============================================================================
-- EXTEND ANNUAL_REPORTS TABLE
-- ============================================================================

-- Add new fields to annual_reports for richer content
ALTER TABLE annual_reports
ADD COLUMN IF NOT EXISTS acknowledgement_of_country TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_caption TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_credit TEXT,
ADD COLUMN IF NOT EXISTS theme_colors JSONB DEFAULT '{
  "primary": "#2C5F8D",
  "secondary": "#8B4513",
  "accent": "#E67E22"
}'::jsonb,
ADD COLUMN IF NOT EXISTS cultural_design_elements JSONB DEFAULT '{
  "patterns": true,
  "artwork": null,
  "colors": "earth_tones"
}'::jsonb,
ADD COLUMN IF NOT EXISTS narrative_theme TEXT,
-- The overarching story/theme of the year
ADD COLUMN IF NOT EXISTS vision_statement TEXT,
-- Looking forward section
ADD COLUMN IF NOT EXISTS values TEXT[];
-- Core organizational values

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS leadership_messages_report_idx ON report_leadership_messages(report_id);
CREATE INDEX IF NOT EXISTS leadership_messages_order_idx ON report_leadership_messages(report_id, display_order);

CREATE INDEX IF NOT EXISTS board_members_report_idx ON report_board_members(report_id);
CREATE INDEX IF NOT EXISTS board_members_current_idx ON report_board_members(report_id, is_current);

CREATE INDEX IF NOT EXISTS cultural_content_report_idx ON report_cultural_content(report_id);
CREATE INDEX IF NOT EXISTS cultural_content_type_idx ON report_cultural_content(content_type);

CREATE INDEX IF NOT EXISTS highlights_report_idx ON report_highlights(report_id);
CREATE INDEX IF NOT EXISTS highlights_featured_idx ON report_highlights(is_featured);
CREATE INDEX IF NOT EXISTS highlights_service_idx ON report_highlights(service_id);

CREATE INDEX IF NOT EXISTS partners_report_idx ON report_partners(report_id);
CREATE INDEX IF NOT EXISTS partners_type_idx ON report_partners(partner_type);

CREATE INDEX IF NOT EXISTS statistics_report_idx ON report_statistics(report_id);
CREATE INDEX IF NOT EXISTS statistics_category_idx ON report_statistics(category);
CREATE INDEX IF NOT EXISTS statistics_key_idx ON report_statistics(is_key_metric);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE report_leadership_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cultural_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_statistics ENABLE ROW LEVEL SECURITY;

-- Leadership Messages: Viewable with report
CREATE POLICY "Leadership messages viewable with report" ON report_leadership_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = report_leadership_messages.report_id
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

-- Board Members: Viewable with report
CREATE POLICY "Board members viewable with report" ON report_board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = report_board_members.report_id
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

-- Cultural Content: Viewable based on sensitivity level
CREATE POLICY "Cultural content viewable appropriately" ON report_cultural_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = report_cultural_content.report_id
      AND annual_reports.status = 'published'
      AND (
        report_cultural_content.cultural_sensitivity_level = 'public'
        OR (
          report_cultural_content.cultural_sensitivity_level = 'community_only'
          AND EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = annual_reports.organization_id
            AND organization_members.profile_id IN (
              SELECT id FROM profiles WHERE user_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- Highlights: Viewable with report
CREATE POLICY "Highlights viewable with report" ON report_highlights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = report_highlights.report_id
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

-- Partners: Viewable with report
CREATE POLICY "Partners viewable with report" ON report_partners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = report_partners.report_id
      AND annual_reports.status = 'published'
    )
  );

-- Statistics: Viewable with report
CREATE POLICY "Statistics viewable with report" ON report_statistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annual_reports
      WHERE annual_reports.id = report_statistics.report_id
      AND annual_reports.status = 'published'
    )
  );

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

CREATE TRIGGER update_leadership_messages_updated_at BEFORE UPDATE ON report_leadership_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_content_updated_at BEFORE UPDATE ON report_cultural_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_highlights_updated_at BEFORE UPDATE ON report_highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get complete annual report with all content
CREATE OR REPLACE FUNCTION get_complete_annual_report(report_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'report', row_to_json(ar.*),
    'organization', row_to_json(o.*),
    'leadership_messages', (
      SELECT jsonb_agg(row_to_json(lm.*) ORDER BY lm.display_order)
      FROM report_leadership_messages lm
      WHERE lm.report_id = report_uuid
    ),
    'board_members', (
      SELECT jsonb_agg(row_to_json(bm.*) ORDER BY bm.display_order)
      FROM report_board_members bm
      WHERE bm.report_id = report_uuid AND bm.is_current = true
    ),
    'cultural_content', (
      SELECT jsonb_agg(row_to_json(cc.*) ORDER BY cc.display_order)
      FROM report_cultural_content cc
      WHERE cc.report_id = report_uuid
    ),
    'highlights', (
      SELECT jsonb_agg(row_to_json(h.*) ORDER BY h.is_featured DESC, h.display_order)
      FROM report_highlights h
      WHERE h.report_id = report_uuid
    ),
    'partners', (
      SELECT jsonb_agg(row_to_json(p.*) ORDER BY p.display_order)
      FROM report_partners p
      WHERE p.report_id = report_uuid
    ),
    'statistics', (
      SELECT jsonb_agg(row_to_json(s.*) ORDER BY s.is_key_metric DESC, s.display_order)
      FROM report_statistics s
      WHERE s.report_id = report_uuid
    ),
    'stories', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'story', row_to_json(st.*),
          'storyteller', row_to_json(p.*),
          'service', row_to_json(os.*)
        )
      )
      FROM annual_report_stories ars
      JOIN stories st ON ars.story_id = st.id
      JOIN profiles p ON st.storyteller_id = p.id
      LEFT JOIN organization_services os ON st.service_id = os.id
      WHERE ars.report_id = report_uuid
      ORDER BY ars.display_order
    )
  ) INTO result
  FROM annual_reports ar
  JOIN organizations o ON ar.organization_id = o.id
  WHERE ar.id = report_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Annual Report with Content Counts
CREATE OR REPLACE VIEW annual_reports_content_summary AS
SELECT
  ar.*,
  o.name as organization_name,
  COUNT(DISTINCT lm.id) as leadership_message_count,
  COUNT(DISTINCT bm.id) as board_member_count,
  COUNT(DISTINCT cc.id) as cultural_content_count,
  COUNT(DISTINCT h.id) as highlight_count,
  COUNT(DISTINCT p.id) as partner_count,
  COUNT(DISTINCT s.id) as statistic_count,
  COUNT(DISTINCT ars.story_id) as story_count
FROM annual_reports ar
INNER JOIN organizations o ON ar.organization_id = o.id
LEFT JOIN report_leadership_messages lm ON ar.id = lm.report_id
LEFT JOIN report_board_members bm ON ar.id = bm.report_id AND bm.is_current = true
LEFT JOIN report_cultural_content cc ON ar.id = cc.report_id
LEFT JOIN report_highlights h ON ar.id = h.report_id
LEFT JOIN report_partners p ON ar.id = p.report_id
LEFT JOIN report_statistics s ON ar.id = s.report_id
LEFT JOIN annual_report_stories ars ON ar.id = ars.report_id
GROUP BY ar.id, o.name;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE report_leadership_messages IS 'Leadership messages from CEO, Chair, Board members for annual reports';
COMMENT ON TABLE report_board_members IS 'Board of Directors and governance structure for annual reports';
COMMENT ON TABLE report_cultural_content IS 'Cultural grounding content including Acknowledgement of Country, artwork, protocols';
COMMENT ON TABLE report_highlights IS 'Organizational highlights, achievements, initiatives, and program impacts';
COMMENT ON TABLE report_partners IS 'Partner organizations, funders, and collaborators to recognize';
COMMENT ON TABLE report_statistics IS 'Key statistics and data points for annual reports';

COMMENT ON FUNCTION get_complete_annual_report IS 'Returns a complete annual report with all associated content in a single JSON object';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Annual Report Content Extensions successfully deployed!';
  RAISE NOTICE '📝 New tables: leadership_messages, board_members, cultural_content, highlights, partners, statistics';
  RAISE NOTICE '🎨 Annual reports now support rich storytelling and cultural protocols';
  RAISE NOTICE '🌟 Ready to create professional, culturally grounded annual reports';
END $$;

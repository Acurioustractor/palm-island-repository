-- Living Ledger Implementation - STANDALONE VERSION
-- This version can be run independently without requiring other tables to exist first
-- Foreign keys are removed to allow independent deployment
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (Clean slate - comment out if you want to preserve data)
-- ============================================================================

DROP TABLE IF EXISTS content_engagement CASCADE;
DROP TABLE IF EXISTS reporting_roadmap CASCADE;
DROP TABLE IF EXISTS feedback_loops CASCADE;
DROP TABLE IF EXISTS community_insights CASCADE;
DROP TABLE IF EXISTS community_conversations CASCADE;
DROP TABLE IF EXISTS content_tag_assignments CASCADE;
DROP TABLE IF EXISTS content_tags CASCADE;
DROP TABLE IF EXISTS data_snapshots CASCADE;
DROP TABLE IF EXISTS content_releases CASCADE;

-- ============================================================================
-- CONTENT RELEASES (Continuous publishing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Release Details
  release_type TEXT NOT NULL,
  -- 'monthly_update', 'quarterly_thematic', 'service_spotlight',
  -- 'community_milestone', 'elder_wisdom', 'data_snapshot'

  release_title TEXT NOT NULL,
  release_slug TEXT NOT NULL UNIQUE,
  release_date DATE NOT NULL,

  -- Organization Context (FK removed for standalone deployment)
  organization_id UUID,
  service_ids UUID[], -- Multiple services can be featured

  -- Content Selection
  story_ids UUID[], -- Stories included in this release
  data_snapshot_id UUID, -- Link to data/metrics

  -- Narrative Framing
  executive_summary TEXT,
  community_context TEXT, -- What's happening in community this period
  impact_highlight TEXT,
  looking_ahead TEXT,

  -- Visual Content
  cover_image_url TEXT,
  featured_images TEXT[],

  -- Publication
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP,
  published_by UUID, -- FK to profiles removed

  -- Engagement
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  community_feedback_count INTEGER DEFAULT 0,

  -- Annual Report Integration
  include_in_annual_report BOOLEAN DEFAULT TRUE,
  annual_report_year INTEGER,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT content_releases_status_check CHECK (
    status IN ('draft', 'review', 'approved', 'published', 'archived')
  ),
  CONSTRAINT content_releases_type_check CHECK (
    release_type IN ('monthly_update', 'quarterly_thematic', 'service_spotlight',
                     'community_milestone', 'elder_wisdom', 'data_snapshot')
  )
);

-- ============================================================================
-- DATA SNAPSHOTS (Real-time metrics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  organization_id UUID, -- FK removed for standalone deployment
  snapshot_date DATE NOT NULL,
  snapshot_period TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'

  -- Service Metrics
  service_id UUID, -- FK to organization_services removed
  service_name TEXT,

  -- Flexible Metrics Structure
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  /* Example structure:
  {
    "people_served": 450,
    "sessions_delivered": 1200,
    "cultural_events": 3,
    "elder_engagement_hours": 120,
    "youth_attendance_rate": 0.85,
    "satisfaction_score": 4.2
  }
  */

  -- Narrative Context
  highlights TEXT[],
  challenges TEXT[],
  community_feedback TEXT,

  -- Visualization Config
  chart_configs JSONB DEFAULT '[]'::jsonb,

  -- Comparison
  previous_snapshot_id UUID, -- Self-reference kept
  change_summary JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID, -- FK to profiles removed
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT data_snapshots_period_check CHECK (
    snapshot_period IN ('weekly', 'monthly', 'quarterly', 'yearly')
  )
);

-- ============================================================================
-- CONTENT TAGS (Taxonomy system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  tag_name TEXT NOT NULL,
  tag_type TEXT NOT NULL,
  -- 'topic', 'stakeholder', 'format', 'theme', 'service', 'custom'

  description TEXT,
  color TEXT, -- For visual categorization (hex color)
  icon TEXT, -- Icon name for UI

  -- Parent-child relationships (self-reference)
  parent_tag_id UUID,

  organization_id UUID, -- FK removed for standalone deployment

  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT content_tags_type_check CHECK (
    tag_type IN ('topic', 'stakeholder', 'format', 'theme', 'service', 'custom')
  )
);

-- ============================================================================
-- CONTENT TAG ASSIGNMENTS (Many-to-many linking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can tag any type of content (FKs removed for standalone deployment)
  story_id UUID,
  release_id UUID,
  report_id UUID,
  snapshot_id UUID,

  tag_id UUID NOT NULL,

  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID, -- FK to profiles removed

  -- Ensure at least one content reference
  CONSTRAINT content_tag_assignments_content_check CHECK (
    (story_id IS NOT NULL)::integer +
    (release_id IS NOT NULL)::integer +
    (report_id IS NOT NULL)::integer +
    (snapshot_id IS NOT NULL)::integer = 1
  ),

  -- Internal FKs to Living Ledger tables
  CONSTRAINT content_tag_assignments_release_id_fkey
    FOREIGN KEY (release_id) REFERENCES content_releases(id) ON DELETE CASCADE,
  CONSTRAINT content_tag_assignments_snapshot_id_fkey
    FOREIGN KEY (snapshot_id) REFERENCES data_snapshots(id) ON DELETE CASCADE,
  CONSTRAINT content_tag_assignments_tag_id_fkey
    FOREIGN KEY (tag_id) REFERENCES content_tags(id) ON DELETE CASCADE
);

-- ============================================================================
-- COMMUNITY CONVERSATIONS (Structured dialogue sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session Details
  conversation_title TEXT NOT NULL,
  conversation_type TEXT NOT NULL,
  -- 'listening_tour', 'town_hall', 'focus_group', 'elder_session',
  -- 'youth_forum', 'service_feedback', 'planning_workshop'

  session_date DATE NOT NULL,
  session_start_time TIME,
  session_end_time TIME,
  location TEXT,
  location_details TEXT,

  facilitator_ids UUID[], -- References to profiles (stored as array, no FK)

  -- Organization Context
  organization_id UUID, -- FK removed for standalone deployment
  service_ids UUID[], -- Which services are discussed
  report_year INTEGER, -- Link to specific annual report

  -- Participants
  participant_count INTEGER,
  participant_demographics JSONB DEFAULT '{}'::jsonb,

  -- Questions Asked (Open-ended)
  questions_posed TEXT[],
  agenda TEXT,

  -- Conversation Capture
  recording_url TEXT, -- Audio/video with consent
  transcript_url TEXT,
  transcript_text TEXT,
  notes TEXT,

  -- Theme Analysis (Can be AI-assisted)
  themes_identified TEXT[],
  sentiment_analysis JSONB,
  key_quotes TEXT[],
  priority_issues TEXT[],

  -- Action Items
  commitments_made TEXT[],
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_actions JSONB DEFAULT '[]'::jsonb,
  follow_up_deadline DATE,

  -- Cultural Protocols
  elder_present BOOLEAN DEFAULT FALSE,
  cultural_protocols_followed BOOLEAN DEFAULT TRUE,
  cultural_advisor_approval BOOLEAN DEFAULT FALSE,
  cultural_advisor_id UUID, -- FK to profiles removed
  requires_anonymization BOOLEAN DEFAULT FALSE,

  -- Integration with Reporting
  include_in_report BOOLEAN DEFAULT TRUE,
  report_section TEXT, -- Where this feeds into annual report

  -- Status
  status TEXT DEFAULT 'planned',
  -- 'planned', 'conducted', 'transcribed', 'analyzed', 'integrated'

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID, -- FK to profiles removed
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT conversations_type_check CHECK (
    conversation_type IN ('listening_tour', 'town_hall', 'focus_group', 'elder_session',
                          'youth_forum', 'service_feedback', 'planning_workshop', 'other')
  ),
  CONSTRAINT conversations_status_check CHECK (
    status IN ('planned', 'conducted', 'transcribed', 'analyzed', 'integrated', 'archived')
  )
);

-- ============================================================================
-- COMMUNITY INSIGHTS (Extracted learnings from conversations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  conversation_id UUID, -- FK added below

  -- Insight Details
  insight_type TEXT NOT NULL,
  -- 'need_identified', 'value_statement', 'concern_raised',
  -- 'success_celebrated', 'suggestion_offered', 'priority_affirmed'

  insight_text TEXT NOT NULL,
  supporting_quotes TEXT[],

  -- Frequency & Importance
  mentioned_by_count INTEGER DEFAULT 1,
  priority_level TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'

  -- Categorization
  category TEXT,
  service_area TEXT,

  -- Response Tracking
  organization_response TEXT,
  action_taken TEXT,
  action_status TEXT DEFAULT 'pending',
  action_owner_id UUID, -- FK to profiles removed

  -- Link to Materiality Assessment
  is_material_issue BOOLEAN DEFAULT FALSE,
  materiality_category TEXT,

  -- Reporting Integration
  included_in_report BOOLEAN DEFAULT FALSE,
  report_section TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT insights_type_check CHECK (
    insight_type IN ('need_identified', 'value_statement', 'concern_raised',
                     'success_celebrated', 'suggestion_offered', 'priority_affirmed', 'other')
  ),
  CONSTRAINT insights_priority_check CHECK (
    priority_level IN ('high', 'medium', 'low')
  ),
  CONSTRAINT insights_action_status_check CHECK (
    action_status IN ('pending', 'in_progress', 'completed', 'ongoing', 'not_feasible')
  ),

  -- FK to community_conversations
  CONSTRAINT community_insights_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES community_conversations(id) ON DELETE CASCADE
);

-- ============================================================================
-- FEEDBACK LOOPS (Close the loop - "We Heard You")
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback_loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was heard
  insight_id UUID, -- FK added below
  original_feedback TEXT NOT NULL,
  feedback_date DATE NOT NULL,
  feedback_source TEXT, -- 'conversation', 'survey', 'direct', 'social_media'

  -- What was done
  response_action TEXT NOT NULL,
  action_owner_id UUID, -- FK to profiles removed
  investment_amount DECIMAL, -- Resources committed
  investment_description TEXT,

  -- Timeline
  response_date DATE,
  completion_date DATE,

  -- Results
  outcome_description TEXT,
  impact_metrics JSONB,
  community_reaction TEXT,

  -- Evidence
  evidence_urls TEXT[],
  related_story_ids UUID[],

  -- Reporting
  reported_in_year INTEGER,
  report_id UUID, -- FK to annual_reports removed
  report_section TEXT,

  -- Status
  status TEXT DEFAULT 'acknowledged',
  -- 'acknowledged', 'action_planned', 'in_progress', 'completed', 'reported_back'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT feedback_loops_status_check CHECK (
    status IN ('acknowledged', 'action_planned', 'in_progress', 'completed', 'reported_back')
  ),

  -- FK to community_insights
  CONSTRAINT feedback_loops_insight_id_fkey
    FOREIGN KEY (insight_id) REFERENCES community_insights(id) ON DELETE CASCADE
);

-- ============================================================================
-- REPORTING ROADMAP (12-month planning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reporting_roadmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  organization_id UUID, -- FK removed for standalone deployment
  report_year INTEGER NOT NULL,

  -- Phase Planning (JSON structure for flexibility)
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Tracking
  current_phase TEXT,
  phase_status JSONB DEFAULT '{}'::jsonb,

  -- Team
  pmo_lead_id UUID, -- FK to profiles removed
  team_member_ids UUID[],

  -- Key Dates
  kickoff_date DATE,
  publication_target_date DATE,

  -- Status
  overall_status TEXT DEFAULT 'planning',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ENGAGEMENT ANALYTICS (Content performance tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content Reference
  content_type TEXT NOT NULL,
  -- 'story', 'content_release', 'annual_report', 'data_dashboard', 'conversation'
  content_id UUID NOT NULL,

  -- User Journey
  session_id TEXT,
  user_profile_id UUID, -- FK to profiles removed

  -- Engagement Metrics
  event_type TEXT NOT NULL,
  -- 'view', 'scroll_depth', 'time_on_page', 'interaction',
  -- 'download', 'share', 'comment', 'feedback'

  event_data JSONB DEFAULT '{}'::jsonb,

  -- Context
  timestamp TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,

  -- Privacy
  anonymized BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Content Releases
CREATE INDEX IF NOT EXISTS idx_content_releases_org ON content_releases(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_releases_date ON content_releases(release_date);
CREATE INDEX IF NOT EXISTS idx_content_releases_status ON content_releases(status);
CREATE INDEX IF NOT EXISTS idx_content_releases_year ON content_releases(annual_report_year);
CREATE INDEX IF NOT EXISTS idx_content_releases_slug ON content_releases(release_slug);

-- Data Snapshots
CREATE INDEX IF NOT EXISTS idx_data_snapshots_org ON data_snapshots(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_snapshots_date ON data_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_data_snapshots_service ON data_snapshots(service_id);

-- Content Tags
CREATE INDEX IF NOT EXISTS idx_content_tags_type ON content_tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_content_tags_org ON content_tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_parent ON content_tags(parent_tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_assignments_story ON content_tag_assignments(story_id);
CREATE INDEX IF NOT EXISTS idx_tag_assignments_tag ON content_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_assignments_release ON content_tag_assignments(release_id);

-- Community Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_org ON community_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_year ON community_conversations(report_year);
CREATE INDEX IF NOT EXISTS idx_conversations_date ON community_conversations(session_date);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON community_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON community_conversations(conversation_type);

-- Community Insights
CREATE INDEX IF NOT EXISTS idx_insights_conversation ON community_insights(conversation_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON community_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON community_insights(priority_level);

-- Feedback Loops
CREATE INDEX IF NOT EXISTS idx_feedback_loops_insight ON feedback_loops(insight_id);
CREATE INDEX IF NOT EXISTS idx_feedback_loops_year ON feedback_loops(reported_in_year);
CREATE INDEX IF NOT EXISTS idx_feedback_loops_status ON feedback_loops(status);

-- Content Engagement
CREATE INDEX IF NOT EXISTS idx_engagement_content ON content_engagement(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON content_engagement(timestamp);
CREATE INDEX IF NOT EXISTS idx_engagement_event ON content_engagement(event_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE content_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;

-- Public read for published content
DROP POLICY IF EXISTS "Published releases viewable by everyone" ON content_releases;
CREATE POLICY "Published releases viewable by everyone" ON content_releases
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can view all releases" ON content_releases;
CREATE POLICY "Authenticated users can view all releases" ON content_releases
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage releases" ON content_releases;
CREATE POLICY "Authenticated users can manage releases" ON content_releases
  FOR ALL USING (auth.role() = 'authenticated');

-- Similar policies for other tables
DROP POLICY IF EXISTS "Authenticated users can view snapshots" ON data_snapshots;
CREATE POLICY "Authenticated users can view snapshots" ON data_snapshots
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage snapshots" ON data_snapshots;
CREATE POLICY "Authenticated users can manage snapshots" ON data_snapshots
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tags viewable by everyone" ON content_tags;
CREATE POLICY "Tags viewable by everyone" ON content_tags
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage tags" ON content_tags;
CREATE POLICY "Authenticated users can manage tags" ON content_tags
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view conversations" ON community_conversations;
CREATE POLICY "Authenticated users can view conversations" ON community_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage conversations" ON community_conversations;
CREATE POLICY "Authenticated users can manage conversations" ON community_conversations
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view insights" ON community_insights;
CREATE POLICY "Authenticated users can view insights" ON community_insights
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage insights" ON community_insights;
CREATE POLICY "Authenticated users can manage insights" ON community_insights
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view feedback" ON feedback_loops;
CREATE POLICY "Authenticated users can view feedback" ON feedback_loops
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage feedback" ON feedback_loops;
CREATE POLICY "Authenticated users can manage feedback" ON feedback_loops
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view roadmap" ON reporting_roadmap;
CREATE POLICY "Authenticated users can view roadmap" ON reporting_roadmap
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage roadmap" ON reporting_roadmap;
CREATE POLICY "Authenticated users can manage roadmap" ON reporting_roadmap
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view engagement" ON content_engagement;
CREATE POLICY "Public can view engagement" ON content_engagement
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage engagement" ON content_engagement;
CREATE POLICY "Authenticated users can manage engagement" ON content_engagement
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- TRIGGERS (create helper function if it doesn't exist)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_content_releases_updated_at ON content_releases;
CREATE TRIGGER update_content_releases_updated_at
  BEFORE UPDATE ON content_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_conversations_updated_at ON community_conversations;
CREATE TRIGGER update_community_conversations_updated_at
  BEFORE UPDATE ON community_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_insights_updated_at ON community_insights;
CREATE TRIGGER update_community_insights_updated_at
  BEFORE UPDATE ON community_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_loops_updated_at ON feedback_loops;
CREATE TRIGGER update_feedback_loops_updated_at
  BEFORE UPDATE ON feedback_loops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reporting_roadmap_updated_at ON reporting_roadmap;
CREATE TRIGGER update_reporting_roadmap_updated_at
  BEFORE UPDATE ON reporting_roadmap
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DEFAULT TAGS
-- ============================================================================

INSERT INTO content_tags (tag_name, tag_type, color, icon, description) VALUES
  -- Topics
  ('Youth Development', 'topic', '#3498DB', 'users', 'Programs and stories about young people'),
  ('Cultural Preservation', 'topic', '#1ABC9C', 'landmark', 'Traditional knowledge and practices'),
  ('Health & Healing', 'topic', '#E74C3C', 'heart-pulse', 'Health services and wellbeing'),
  ('Economic Development', 'topic', '#E67E22', 'briefcase', 'Employment and economic opportunities'),
  ('Education', 'topic', '#9B59B6', 'graduation-cap', 'Learning and skills development'),
  ('Family Services', 'topic', '#F39C12', 'home', 'Family support and child safety'),
  ('Environment', 'topic', '#27AE60', 'leaf', 'Environmental stewardship'),
  -- Stakeholders
  ('Community Members', 'stakeholder', '#27AE60', 'user-group', 'General community audience'),
  ('Elders', 'stakeholder', '#8E44AD', 'hand-holding-heart', 'Elder community members'),
  ('Government', 'stakeholder', '#34495E', 'building-columns', 'Government stakeholders'),
  ('Partners', 'stakeholder', '#2980B9', 'handshake', 'Partner organizations'),
  -- Formats
  ('Video', 'format', '#E74C3C', 'video', 'Video content'),
  ('Photo Story', 'format', '#3498DB', 'images', 'Photo-based stories'),
  ('Data', 'format', '#2980B9', 'chart-bar', 'Data and metrics'),
  ('Audio', 'format', '#9B59B6', 'microphone', 'Audio recordings'),
  -- Themes
  ('Healing', 'theme', '#E74C3C', 'heart', 'Stories of healing and recovery'),
  ('Resilience', 'theme', '#27AE60', 'shield', 'Community strength and resilience'),
  ('Innovation', 'theme', '#3498DB', 'lightbulb', 'New approaches and innovations'),
  ('Connection', 'theme', '#9B59B6', 'link', 'Community connection and belonging')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE content_releases IS 'Living Ledger continuous content releases - monthly/quarterly publications';
COMMENT ON TABLE data_snapshots IS 'Real-time metrics and service performance data';
COMMENT ON TABLE content_tags IS 'Taxonomy system for categorizing all content';
COMMENT ON TABLE community_conversations IS 'Structured community dialogue sessions for gathering feedback';
COMMENT ON TABLE community_insights IS 'Extracted insights and themes from community conversations';
COMMENT ON TABLE feedback_loops IS 'Tracking responses to community feedback - We Heard You section';
COMMENT ON TABLE reporting_roadmap IS '12-month annual report planning and milestone tracking';
COMMENT ON TABLE content_engagement IS 'Analytics for content performance and engagement';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Living Ledger STANDALONE migration completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - content_releases (continuous publishing)';
  RAISE NOTICE '  - data_snapshots (real-time metrics)';
  RAISE NOTICE '  - content_tags (taxonomy system)';
  RAISE NOTICE '  - content_tag_assignments (content tagging)';
  RAISE NOTICE '  - community_conversations (dialogue sessions)';
  RAISE NOTICE '  - community_insights (extracted learnings)';
  RAISE NOTICE '  - feedback_loops (We Heard You tracking)';
  RAISE NOTICE '  - reporting_roadmap (12-month planning)';
  RAISE NOTICE '  - content_engagement (analytics)';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Foreign keys to profiles, organizations, stories, and';
  RAISE NOTICE 'annual_reports have been removed for standalone deployment.';
  RAISE NOTICE 'Run 04_living_ledger_add_fks.sql after creating those tables.';
  RAISE NOTICE '============================================================';
END $$;

-- Living Ledger Implementation
-- Innovative Annual Report Development for Palm Island Community Company
-- Transforming from static documents to dynamic community narrative ecosystems

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

  -- Organization Context
  organization_id UUID REFERENCES organizations(id),
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
  published_by UUID REFERENCES profiles(id),

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

  organization_id UUID REFERENCES organizations(id),
  snapshot_date DATE NOT NULL,
  snapshot_period TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'

  -- Service Metrics
  service_id UUID REFERENCES organization_services(id),
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
  -- Configuration for how to visualize this data

  -- Comparison
  previous_snapshot_id UUID REFERENCES data_snapshots(id),
  change_summary JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
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
  -- 'topic' (Innovation, Sustainability, Youth, Elders, Culture)
  -- 'stakeholder' (Community, Investors, Partners, Government, Media)
  -- 'format' (Story, Video, Data, Photo, Audio)
  -- 'theme' (Healing, Education, Economic, Environmental, Cultural)

  description TEXT,
  color TEXT, -- For visual categorization (hex color)
  icon TEXT, -- Icon name for UI

  -- Parent-child relationships
  parent_tag_id UUID REFERENCES content_tags(id),

  organization_id UUID REFERENCES organizations(id),

  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT content_tags_type_check CHECK (
    tag_type IN ('topic', 'stakeholder', 'format', 'theme', 'service', 'custom')
  )
);

-- Many-to-many: Link content to tags
CREATE TABLE IF NOT EXISTS content_tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can tag any type of content
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  release_id UUID REFERENCES content_releases(id) ON DELETE CASCADE,
  report_id UUID REFERENCES annual_reports(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES data_snapshots(id) ON DELETE CASCADE,

  tag_id UUID REFERENCES content_tags(id) ON DELETE CASCADE,

  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),

  -- Ensure at least one content reference
  CONSTRAINT content_tag_assignments_content_check CHECK (
    (story_id IS NOT NULL)::integer +
    (release_id IS NOT NULL)::integer +
    (report_id IS NOT NULL)::integer +
    (snapshot_id IS NOT NULL)::integer = 1
  )
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

  facilitator_ids UUID[], -- References to profiles

  -- Organization Context
  organization_id UUID REFERENCES organizations(id),
  service_ids UUID[], -- Which services are discussed
  report_year INTEGER, -- Link to specific annual report

  -- Participants
  participant_count INTEGER,
  participant_demographics JSONB DEFAULT '{}'::jsonb,
  /* {
    "elders": 12,
    "adults": 25,
    "youth": 18,
    "gender_breakdown": {"women": 30, "men": 25},
    "community_members": 50,
    "external_stakeholders": 5
  } */

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
  cultural_advisor_id UUID REFERENCES profiles(id),
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
  created_by UUID REFERENCES profiles(id),
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

  conversation_id UUID REFERENCES community_conversations(id) ON DELETE CASCADE,

  -- Insight Details
  insight_type TEXT NOT NULL,
  -- 'need_identified', 'value_statement', 'concern_raised',
  -- 'success_celebrated', 'suggestion_offered', 'priority_affirmed'

  insight_text TEXT NOT NULL,
  supporting_quotes TEXT[],

  -- Frequency & Importance
  mentioned_by_count INTEGER DEFAULT 1, -- How many participants raised this
  priority_level TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'

  -- Categorization
  category TEXT,
  service_area TEXT,

  -- Response Tracking
  organization_response TEXT,
  action_taken TEXT,
  action_status TEXT DEFAULT 'pending',
  -- 'pending', 'in_progress', 'completed', 'ongoing', 'not_feasible'
  action_owner_id UUID REFERENCES profiles(id),

  -- Link to Materiality Assessment
  is_material_issue BOOLEAN DEFAULT FALSE,
  materiality_category TEXT,
  -- 'financial_impact', 'social_impact', 'environmental_impact', 'cultural_impact'

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
  )
);

-- ============================================================================
-- FEEDBACK LOOPS (Close the loop - "We Heard You")
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback_loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was heard
  insight_id UUID REFERENCES community_insights(id) ON DELETE CASCADE,
  original_feedback TEXT NOT NULL,
  feedback_date DATE NOT NULL,
  feedback_source TEXT, -- 'conversation', 'survey', 'direct', 'social_media'

  -- What was done
  response_action TEXT NOT NULL,
  action_owner_id UUID REFERENCES profiles(id),
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
  report_id UUID REFERENCES annual_reports(id),
  report_section TEXT,

  -- Status
  status TEXT DEFAULT 'acknowledged',
  -- 'acknowledged', 'action_planned', 'in_progress', 'completed', 'reported_back'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT feedback_loops_status_check CHECK (
    status IN ('acknowledged', 'action_planned', 'in_progress', 'completed', 'reported_back')
  )
);

-- ============================================================================
-- REPORTING ROADMAP (12-month planning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reporting_roadmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  organization_id UUID REFERENCES organizations(id),
  report_year INTEGER NOT NULL,

  -- Phase Planning (JSON structure for flexibility)
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  /* Structure:
  [
    {
      "phase": "Foundation",
      "months": [1, 2, 3],
      "activities": ["Mobilize leadership", "Define reporting ambition"],
      "milestones": ["Leadership kickoff completed"],
      "status": "in_progress"
    }
  ]
  */

  -- Tracking
  current_phase TEXT,
  phase_status JSONB DEFAULT '{}'::jsonb,

  -- Team
  pmo_lead_id UUID REFERENCES profiles(id),
  team_member_ids UUID[],

  -- Key Dates
  kickoff_date DATE,
  publication_target_date DATE,

  -- Status
  overall_status TEXT DEFAULT 'planning',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(organization_id, report_year)
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
  user_profile_id UUID REFERENCES profiles(id),

  -- Engagement Metrics
  event_type TEXT NOT NULL,
  -- 'view', 'scroll_depth', 'time_on_page', 'interaction',
  -- 'download', 'share', 'comment', 'feedback'

  event_data JSONB DEFAULT '{}'::jsonb,
  /* {
    "scroll_depth_percent": 85,
    "time_spent_seconds": 180,
    "interactions": ["clicked_chart", "filtered_data", "downloaded_csv"],
    "device_type": "mobile",
    "referrer": "social_media"
  } */

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
CREATE INDEX IF NOT EXISTS content_releases_org_idx ON content_releases(organization_id);
CREATE INDEX IF NOT EXISTS content_releases_date_idx ON content_releases(release_date);
CREATE INDEX IF NOT EXISTS content_releases_status_idx ON content_releases(status);
CREATE INDEX IF NOT EXISTS content_releases_year_idx ON content_releases(annual_report_year);
CREATE INDEX IF NOT EXISTS content_releases_slug_idx ON content_releases(release_slug);

-- Data Snapshots
CREATE INDEX IF NOT EXISTS data_snapshots_org_idx ON data_snapshots(organization_id);
CREATE INDEX IF NOT EXISTS data_snapshots_date_idx ON data_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS data_snapshots_service_idx ON data_snapshots(service_id);

-- Content Tags
CREATE INDEX IF NOT EXISTS content_tags_type_idx ON content_tags(tag_type);
CREATE INDEX IF NOT EXISTS content_tags_org_idx ON content_tags(organization_id);
CREATE INDEX IF NOT EXISTS content_tags_parent_idx ON content_tags(parent_tag_id);
CREATE INDEX IF NOT EXISTS content_tag_assignments_story_idx ON content_tag_assignments(story_id);
CREATE INDEX IF NOT EXISTS content_tag_assignments_tag_idx ON content_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS content_tag_assignments_release_idx ON content_tag_assignments(release_id);

-- Community Conversations
CREATE INDEX IF NOT EXISTS conversations_org_idx ON community_conversations(organization_id);
CREATE INDEX IF NOT EXISTS conversations_year_idx ON community_conversations(report_year);
CREATE INDEX IF NOT EXISTS conversations_date_idx ON community_conversations(session_date);
CREATE INDEX IF NOT EXISTS conversations_status_idx ON community_conversations(status);
CREATE INDEX IF NOT EXISTS conversations_type_idx ON community_conversations(conversation_type);

-- Community Insights
CREATE INDEX IF NOT EXISTS insights_conversation_idx ON community_insights(conversation_id);
CREATE INDEX IF NOT EXISTS insights_type_idx ON community_insights(insight_type);
CREATE INDEX IF NOT EXISTS insights_priority_idx ON community_insights(priority_level);

-- Feedback Loops
CREATE INDEX IF NOT EXISTS feedback_loops_insight_idx ON feedback_loops(insight_id);
CREATE INDEX IF NOT EXISTS feedback_loops_year_idx ON feedback_loops(reported_in_year);
CREATE INDEX IF NOT EXISTS feedback_loops_status_idx ON feedback_loops(status);

-- Content Engagement
CREATE INDEX IF NOT EXISTS content_engagement_content_idx ON content_engagement(content_type, content_id);
CREATE INDEX IF NOT EXISTS content_engagement_timestamp_idx ON content_engagement(timestamp);
CREATE INDEX IF NOT EXISTS content_engagement_event_idx ON content_engagement(event_type);

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
CREATE POLICY "Published releases viewable by everyone" ON content_releases
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all releases" ON content_releases
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage releases" ON content_releases
  FOR ALL USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Authenticated users can view snapshots" ON data_snapshots
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage snapshots" ON data_snapshots
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Tags viewable by everyone" ON content_tags
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can manage tags" ON content_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view conversations" ON community_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage conversations" ON community_conversations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view insights" ON community_insights
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage insights" ON community_insights
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view feedback" ON feedback_loops
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage feedback" ON feedback_loops
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_content_releases_updated_at
  BEFORE UPDATE ON content_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_conversations_updated_at
  BEFORE UPDATE ON community_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_insights_updated_at
  BEFORE UPDATE ON community_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_loops_updated_at
  BEFORE UPDATE ON feedback_loops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reporting_roadmap_updated_at
  BEFORE UPDATE ON reporting_roadmap
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate "We Heard You" section for annual report
CREATE OR REPLACE FUNCTION generate_we_heard_you_section(
  org_uuid UUID,
  year_value INTEGER
)
RETURNS TABLE (
  feedback_theme TEXT,
  what_you_said TEXT[],
  what_we_did TEXT,
  outcome TEXT,
  investment_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.insight_text as feedback_theme,
    ci.supporting_quotes as what_you_said,
    fl.response_action as what_we_did,
    fl.outcome_description as outcome,
    fl.investment_amount
  FROM community_insights ci
  INNER JOIN feedback_loops fl ON ci.id = fl.insight_id
  WHERE fl.reported_in_year = year_value
    AND ci.conversation_id IN (
      SELECT id FROM community_conversations
      WHERE organization_id = org_uuid
      AND report_year = year_value
    )
  ORDER BY ci.priority_level DESC, ci.mentioned_by_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get content engagement summary
CREATE OR REPLACE FUNCTION get_content_engagement_summary(
  content_type_param TEXT,
  content_id_param UUID
)
RETURNS TABLE (
  total_views BIGINT,
  unique_visitors BIGINT,
  avg_time_spent_seconds INTEGER,
  avg_scroll_depth_percent INTEGER,
  total_downloads BIGINT,
  total_shares BIGINT,
  engagement_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
    COUNT(DISTINCT session_id) as unique_visitors,
    AVG((event_data->>'time_spent_seconds')::INTEGER) FILTER (WHERE event_type = 'time_on_page')::INTEGER as avg_time_spent_seconds,
    AVG((event_data->>'scroll_depth_percent')::INTEGER) FILTER (WHERE event_type = 'scroll_depth')::INTEGER as avg_scroll_depth_percent,
    COUNT(*) FILTER (WHERE event_type = 'download') as total_downloads,
    COUNT(*) FILTER (WHERE event_type = 'share') as total_shares,
    (COUNT(*) FILTER (WHERE event_type IN ('interaction', 'download', 'share', 'comment'))::DECIMAL /
     NULLIF(COUNT(DISTINCT session_id), 0)) as engagement_rate
  FROM content_engagement
  WHERE content_type = content_type_param
    AND content_id = content_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to recommend stories for next release
CREATE OR REPLACE FUNCTION recommend_stories_for_release(
  org_uuid UUID,
  theme_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  story_id UUID,
  story_title TEXT,
  relevance_score DECIMAL,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    CASE
      WHEN array_length(theme_tags, 1) > 0 AND s.tags && theme_tags THEN 1.0
      WHEN s.is_featured THEN 0.9
      WHEN s.is_verified THEN 0.8
      ELSE 0.7
    END as relevance_score,
    CASE
      WHEN array_length(theme_tags, 1) > 0 AND s.tags && theme_tags THEN 'Matches release theme'
      WHEN s.is_featured THEN 'Featured story'
      WHEN s.is_verified THEN 'Verified and high-quality'
      ELSE 'Recent and relevant'
    END as reason
  FROM stories s
  WHERE s.organization_id = org_uuid
    AND s.status = 'published'
    AND s.created_at >= NOW() - INTERVAL '6 months'
  ORDER BY relevance_score DESC, s.created_at DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DEFAULT TAGS FOR PICC
-- ============================================================================

-- Insert default content tags (will be linked to PICC org on setup)
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

-- Living Ledger - Add Foreign Key Constraints
-- Run this AFTER the prerequisite tables exist:
-- - profiles (from 02_profiles.sql)
-- - organizations (from 03_organizations_and_annual_reports.sql)
-- - organization_services (from 03_organizations_and_annual_reports.sql)
-- - annual_reports (from 03_organizations_and_annual_reports.sql)
-- - stories (from your stories table migration)
-- ============================================================================

-- ============================================================================
-- CHECK PREREQUISITES
-- ============================================================================

DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check for required tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    missing_tables := array_append(missing_tables, 'profiles');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    missing_tables := array_append(missing_tables, 'organizations');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_services') THEN
    missing_tables := array_append(missing_tables, 'organization_services');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'annual_reports') THEN
    missing_tables := array_append(missing_tables, 'annual_reports');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stories') THEN
    missing_tables := array_append(missing_tables, 'stories');
  END IF;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Missing prerequisite tables: %. Some foreign keys will not be added.', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All prerequisite tables found. Adding foreign key constraints...';
  END IF;
END $$;

-- ============================================================================
-- CONTENT RELEASES - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    ALTER TABLE content_releases
      DROP CONSTRAINT IF EXISTS content_releases_organization_id_fkey;
    ALTER TABLE content_releases
      ADD CONSTRAINT content_releases_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: content_releases.organization_id -> organizations.id';
  END IF;

  -- FK to profiles (published_by)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE content_releases
      DROP CONSTRAINT IF EXISTS content_releases_published_by_fkey;
    ALTER TABLE content_releases
      ADD CONSTRAINT content_releases_published_by_fkey
      FOREIGN KEY (published_by) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: content_releases.published_by -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- DATA SNAPSHOTS - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    ALTER TABLE data_snapshots
      DROP CONSTRAINT IF EXISTS data_snapshots_organization_id_fkey;
    ALTER TABLE data_snapshots
      ADD CONSTRAINT data_snapshots_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: data_snapshots.organization_id -> organizations.id';
  END IF;

  -- FK to organization_services
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_services') THEN
    ALTER TABLE data_snapshots
      DROP CONSTRAINT IF EXISTS data_snapshots_service_id_fkey;
    ALTER TABLE data_snapshots
      ADD CONSTRAINT data_snapshots_service_id_fkey
      FOREIGN KEY (service_id) REFERENCES organization_services(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: data_snapshots.service_id -> organization_services.id';
  END IF;

  -- FK to profiles (created_by)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE data_snapshots
      DROP CONSTRAINT IF EXISTS data_snapshots_created_by_fkey;
    ALTER TABLE data_snapshots
      ADD CONSTRAINT data_snapshots_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: data_snapshots.created_by -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- CONTENT TAGS - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    ALTER TABLE content_tags
      DROP CONSTRAINT IF EXISTS content_tags_organization_id_fkey;
    ALTER TABLE content_tags
      ADD CONSTRAINT content_tags_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: content_tags.organization_id -> organizations.id';
  END IF;
END $$;

-- ============================================================================
-- CONTENT TAG ASSIGNMENTS - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to stories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stories') THEN
    ALTER TABLE content_tag_assignments
      DROP CONSTRAINT IF EXISTS content_tag_assignments_story_id_fkey;
    ALTER TABLE content_tag_assignments
      ADD CONSTRAINT content_tag_assignments_story_id_fkey
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added FK: content_tag_assignments.story_id -> stories.id';
  END IF;

  -- FK to annual_reports
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'annual_reports') THEN
    ALTER TABLE content_tag_assignments
      DROP CONSTRAINT IF EXISTS content_tag_assignments_report_id_fkey;
    ALTER TABLE content_tag_assignments
      ADD CONSTRAINT content_tag_assignments_report_id_fkey
      FOREIGN KEY (report_id) REFERENCES annual_reports(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added FK: content_tag_assignments.report_id -> annual_reports.id';
  END IF;

  -- FK to profiles (assigned_by)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE content_tag_assignments
      DROP CONSTRAINT IF EXISTS content_tag_assignments_assigned_by_fkey;
    ALTER TABLE content_tag_assignments
      ADD CONSTRAINT content_tag_assignments_assigned_by_fkey
      FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: content_tag_assignments.assigned_by -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- COMMUNITY CONVERSATIONS - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    ALTER TABLE community_conversations
      DROP CONSTRAINT IF EXISTS community_conversations_organization_id_fkey;
    ALTER TABLE community_conversations
      ADD CONSTRAINT community_conversations_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: community_conversations.organization_id -> organizations.id';
  END IF;

  -- FK to profiles (cultural_advisor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE community_conversations
      DROP CONSTRAINT IF EXISTS community_conversations_cultural_advisor_id_fkey;
    ALTER TABLE community_conversations
      ADD CONSTRAINT community_conversations_cultural_advisor_id_fkey
      FOREIGN KEY (cultural_advisor_id) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: community_conversations.cultural_advisor_id -> profiles.id';

    ALTER TABLE community_conversations
      DROP CONSTRAINT IF EXISTS community_conversations_created_by_fkey;
    ALTER TABLE community_conversations
      ADD CONSTRAINT community_conversations_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: community_conversations.created_by -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- COMMUNITY INSIGHTS - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to profiles (action_owner_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE community_insights
      DROP CONSTRAINT IF EXISTS community_insights_action_owner_id_fkey;
    ALTER TABLE community_insights
      ADD CONSTRAINT community_insights_action_owner_id_fkey
      FOREIGN KEY (action_owner_id) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: community_insights.action_owner_id -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- FEEDBACK LOOPS - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to profiles (action_owner_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE feedback_loops
      DROP CONSTRAINT IF EXISTS feedback_loops_action_owner_id_fkey;
    ALTER TABLE feedback_loops
      ADD CONSTRAINT feedback_loops_action_owner_id_fkey
      FOREIGN KEY (action_owner_id) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: feedback_loops.action_owner_id -> profiles.id';
  END IF;

  -- FK to annual_reports
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'annual_reports') THEN
    ALTER TABLE feedback_loops
      DROP CONSTRAINT IF EXISTS feedback_loops_report_id_fkey;
    ALTER TABLE feedback_loops
      ADD CONSTRAINT feedback_loops_report_id_fkey
      FOREIGN KEY (report_id) REFERENCES annual_reports(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: feedback_loops.report_id -> annual_reports.id';
  END IF;
END $$;

-- ============================================================================
-- REPORTING ROADMAP - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    ALTER TABLE reporting_roadmap
      DROP CONSTRAINT IF EXISTS reporting_roadmap_organization_id_fkey;
    ALTER TABLE reporting_roadmap
      ADD CONSTRAINT reporting_roadmap_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'reporting_roadmap_org_year_unique'
    ) THEN
      ALTER TABLE reporting_roadmap
        ADD CONSTRAINT reporting_roadmap_org_year_unique
        UNIQUE (organization_id, report_year);
    END IF;
    RAISE NOTICE 'Added FK: reporting_roadmap.organization_id -> organizations.id';
  END IF;

  -- FK to profiles (pmo_lead_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE reporting_roadmap
      DROP CONSTRAINT IF EXISTS reporting_roadmap_pmo_lead_id_fkey;
    ALTER TABLE reporting_roadmap
      ADD CONSTRAINT reporting_roadmap_pmo_lead_id_fkey
      FOREIGN KEY (pmo_lead_id) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: reporting_roadmap.pmo_lead_id -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- CONTENT ENGAGEMENT - Add FKs
-- ============================================================================

DO $$
BEGIN
  -- FK to profiles (user_profile_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE content_engagement
      DROP CONSTRAINT IF EXISTS content_engagement_user_profile_id_fkey;
    ALTER TABLE content_engagement
      ADD CONSTRAINT content_engagement_user_profile_id_fkey
      FOREIGN KEY (user_profile_id) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK: content_engagement.user_profile_id -> profiles.id';
  END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS (require other tables)
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

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Living Ledger foreign key constraints added successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Helper functions created:';
  RAISE NOTICE '  - generate_we_heard_you_section(org_uuid, year)';
  RAISE NOTICE '  - get_content_engagement_summary(content_type, content_id)';
  RAISE NOTICE '============================================================';
END $$;

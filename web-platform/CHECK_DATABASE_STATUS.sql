-- ============================================================================
-- EMPATHY LEDGER DATABASE STATUS CHECK
-- Run this in Supabase SQL Editor to see what you have
-- ============================================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  row_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 EMPATHY LEDGER DATABASE STATUS CHECK';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';

  -- Check profiles
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM profiles;
    RAISE NOTICE '✅ profiles table exists (%  rows)', row_count;
  ELSE
    RAISE NOTICE '❌ profiles table MISSING';
  END IF;

  -- Check stories
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'stories'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM stories;
    RAISE NOTICE '✅ stories table exists (% rows)', row_count;
  ELSE
    RAISE NOTICE '❌ stories table MISSING';
  END IF;

  -- Check organizations
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'organizations'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM organizations;
    RAISE NOTICE '✅ organizations table exists (% rows)', row_count;

    -- Check if PICC exists
    IF EXISTS (SELECT 1 FROM organizations WHERE id = '3c2011b9-f80d-4289-b300-0cd383cff479') THEN
      RAISE NOTICE '   ✓ PICC organization configured';
    ELSE
      RAISE NOTICE '   ⚠ PICC organization MISSING (run picc_complete_setup.sql)';
    END IF;
  ELSE
    RAISE NOTICE '❌ organizations table MISSING (run 03_organizations_and_annual_reports.sql)';
  END IF;

  -- Check organization_services
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'organization_services'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM organization_services;
    RAISE NOTICE '✅ organization_services table exists (% rows)', row_count;

    IF row_count >= 16 THEN
      RAISE NOTICE '   ✓ All 16 PICC services configured';
    ELSIF row_count > 0 THEN
      RAISE NOTICE '   ⚠ Only % services (expected 16)', row_count;
    ELSE
      RAISE NOTICE '   ⚠ No services (run picc_complete_setup.sql)';
    END IF;
  ELSE
    RAISE NOTICE '❌ organization_services table MISSING';
  END IF;

  -- Check organization_members
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'organization_members'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM organization_members;
    RAISE NOTICE '✅ organization_members table exists (% rows)', row_count;
  ELSE
    RAISE NOTICE '❌ organization_members table MISSING';
  END IF;

  -- Check projects
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'projects'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM projects;
    RAISE NOTICE '✅ projects table exists (% rows)', row_count;
  ELSE
    RAISE NOTICE '⚠ projects table NOT YET CREATED (see DEPLOY_EMPATHY_LEDGER_COMPLETE.md)';
  END IF;

  -- Check story_media
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'story_media'
  ) INTO table_exists;

  IF table_exists THEN
    SELECT COUNT(*) INTO row_count FROM story_media;
    RAISE NOTICE '✅ story_media table exists (% rows)', row_count;
  ELSE
    RAISE NOTICE '❌ story_media table MISSING';
  END IF;

  -- Check if stories have organization/service links
  RAISE NOTICE '';
  RAISE NOTICE '📊 DATA CONNECTIONS:';
  RAISE NOTICE '-------------------';

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'organization_id') THEN
    SELECT COUNT(*) INTO row_count FROM stories WHERE organization_id IS NOT NULL;
    RAISE NOTICE '✓ Stories linked to organizations: %', row_count;
  ELSE
    RAISE NOTICE '❌ stories.organization_id column MISSING';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'service_id') THEN
    SELECT COUNT(*) INTO row_count FROM stories WHERE service_id IS NOT NULL;
    RAISE NOTICE '✓ Stories linked to services: %', row_count;
  ELSE
    RAISE NOTICE '❌ stories.service_id column MISSING';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'project_id') THEN
    SELECT COUNT(*) INTO row_count FROM stories WHERE project_id IS NOT NULL;
    RAISE NOTICE '✓ Stories linked to projects: %', row_count;
  ELSE
    RAISE NOTICE '⚠ stories.project_id column NOT YET CREATED';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'See DEPLOY_EMPATHY_LEDGER_COMPLETE.md for next steps';
  RAISE NOTICE '';

END $$;

-- Also show a summary table
SELECT
  'Table Status' as check_type,
  table_name,
  CASE
    WHEN table_name IN (
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (VALUES
  ('profiles'),
  ('stories'),
  ('organizations'),
  ('organization_services'),
  ('organization_members'),
  ('projects'),
  ('story_media'),
  ('impact_indicators'),
  ('annual_reports')
) AS expected_tables(table_name)
ORDER BY table_name;

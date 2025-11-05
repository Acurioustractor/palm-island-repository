-- ============================================================================
-- VERIFICATION SCRIPT
-- Run this after all migrations to verify everything is set up correctly
-- ============================================================================

-- Check Extensions
SELECT '✅ EXTENSIONS' as check_type;
SELECT extname as extension_name FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector');

-- Check Tables
SELECT '✅ TABLES' as check_type;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN (
  'profiles',
  'stories',
  'organizations',
  'organization_services',
  'organization_members',
  'annual_reports',
  'annual_report_stories',
  'report_sections',
  'report_templates',
  'report_feedback'
) ORDER BY tablename;

-- Check PICC Organization
SELECT '✅ PICC ORGANIZATION' as check_type;
SELECT 
  id,
  name,
  short_name,
  organization_type,
  primary_location,
  empathy_ledger_enabled,
  annual_reports_enabled
FROM organizations 
WHERE short_name = 'PICC';

-- Check PICC Services (should be 16)
SELECT '✅ PICC SERVICES (should be 16)' as check_type;
SELECT 
  COUNT(*) as total_services,
  array_agg(service_name ORDER BY service_name) as service_names
FROM organization_services
WHERE organization_id = (SELECT id FROM organizations WHERE short_name = 'PICC');

-- Check Report Templates (should be 3)
SELECT '✅ REPORT TEMPLATES (should be 3)' as check_type;
SELECT 
  template_name,
  display_name,
  category,
  is_public
FROM report_templates
ORDER BY template_name;

-- Check Views
SELECT '✅ VIEWS' as check_type;
SELECT viewname FROM pg_views WHERE schemaname = 'public'
AND viewname IN (
  'active_storytellers',
  'stories_with_storyteller',
  'organization_overview',
  'annual_reports_with_stats'
) ORDER BY viewname;

-- Check Functions
SELECT '✅ FUNCTIONS' as check_type;
SELECT proname as function_name FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
AND proname IN (
  'update_updated_at_column',
  'update_storyteller_metrics',
  'get_storyteller_stats',
  'get_organization_stats',
  'get_stories_for_report',
  'update_service_story_count',
  'increment_template_usage'
) ORDER BY proname;

-- Summary
SELECT '🎉 SUMMARY' as check_type;
SELECT 
  (SELECT COUNT(*) FROM organizations) as total_organizations,
  (SELECT COUNT(*) FROM organization_services) as total_services,
  (SELECT COUNT(*) FROM report_templates) as total_templates,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM stories) as total_stories;

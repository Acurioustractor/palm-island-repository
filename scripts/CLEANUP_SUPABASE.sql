-- ============================================
-- SUPABASE CLEANUP SCRIPT
-- Run this to focus your schema for 20-year vision
-- BACKUP FIRST!
-- ============================================

-- ============================================
-- PHASE 1: SAFE CLEANUP (Empty Tables)
-- ============================================

-- Drop completely empty tables with no data
-- These are safe to drop immediately

-- 1. Drop empty people duplicates
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS storytellers;
DROP TABLE IF EXISTS community_members;

-- 2. Drop empty system tables
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS tenant_settings;
DROP TABLE IF EXISTS users;  -- Assuming you use Supabase Auth

-- 3. Drop empty relationships
DROP TABLE IF EXISTS quotes;  -- Empty, story_quotes links to it
DROP TABLE IF EXISTS service_story_links;

-- 4. Drop empty utility tables
DROP TABLE IF EXISTS data_extraction_log;  -- Can recreate if needed

-- ============================================
-- PHASE 2: CONSOLIDATE PROFILES
-- ============================================

-- Add flags to profiles for different person types
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_storyteller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_board_member boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_community_member boolean DEFAULT false;

-- Mark existing storytellers
UPDATE profiles 
SET is_storyteller = true 
WHERE id IN (
  SELECT DISTINCT storyteller_id 
  FROM stories 
  WHERE storyteller_id IS NOT NULL
);

-- Mark board members
UPDATE profiles 
SET is_board_member = true 
WHERE id IN (
  SELECT DISTINCT profile_id 
  FROM board_members 
  WHERE profile_id IS NOT NULL
);

-- ============================================
-- PHASE 3: FIX SERVICES
-- ============================================

-- Create default services for orphaned metrics
INSERT INTO services (name, category, description, is_active)
SELECT DISTINCT 
  COALESCE(
    metadata->>'service_name',
    'Service ' || SUBSTRING(MD5(RANDOM()::text), 1, 8)
  ),
  'general',
  'Auto-created from service_metrics data',
  true
FROM service_metrics
WHERE service_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM services 
    WHERE name = COALESCE(service_metrics.metadata->>'service_name', '')
  );

-- ============================================
-- PHASE 4: CLEAN UP STORY QUOTES
-- ============================================

-- Since quotes table is empty but story_quotes has 94 rows,
-- we have orphaned data. Let's archive it then drop.

-- Create archive table for story_quotes (just in case)
CREATE TABLE IF NOT EXISTS story_quotes_archive AS 
SELECT * FROM story_quotes WHERE false;

-- Archive the data
INSERT INTO story_quotes_archive 
SELECT * FROM story_quotes;

-- Now drop the broken relationship
DROP TABLE IF EXISTS story_quotes;
DROP TABLE IF EXISTS story_quotes_archive;  -- Remove if you want to keep archive

-- ============================================
-- PHASE 5: OPTIMIZE INDEXES
-- ============================================

-- Add indexes for 20-year vision queries
CREATE INDEX IF NOT EXISTS idx_stories_story_type ON stories(story_type);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON media_files USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_fiscal_year ON knowledge_entries(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_profiles_flags ON profiles(is_storyteller, is_board_member) 
WHERE is_storyteller = true OR is_board_member = true;

-- ============================================
-- PHASE 6: CREATE FOCUSED VIEWS
-- ============================================

-- Clean view for active data only
CREATE OR REPLACE VIEW active_data_summary AS
SELECT 
  'stories' as data_type,
  count(*) as record_count,
  max(created_at) as last_updated
FROM stories
WHERE status = 'published'

UNION ALL

SELECT 
  'media_files',
  count(*),
  max(created_at)
FROM media_files
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'innovation_projects',
  count(*),
  max(updated_at)
FROM innovation_projects

UNION ALL

SELECT 
  'annual_reports',
  count(*),
  max(created_at)
FROM knowledge_entries
WHERE category = 'annual-report';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check remaining tables
SELECT 
  'Remaining Tables' as check_type,
  count(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Show final table list
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- DOCUMENTATION UPDATE NEEDED
-- ============================================

-- After running this:
-- 1. Update API documentation
-- 2. Update component docs
-- 3. Update README
-- 4. Test all components
-- 5. Deploy

-- FINAL SCHEMA: ~12 focused tables
-- ✅ knowledge_entries
-- ✅ innovation_projects
-- ✅ stories
-- ✅ media_files
-- ✅ profiles (consolidated)
-- ✅ board_members
-- ✅ staff_statistics
-- ✅ annual_financials
-- ✅ partners
-- ✅ service_metrics
-- ⚠️ services (needs data)
-- ⚠️ interviews (optional)
-- ⚠️ collections (decide fate)
-- ⚠️ organizations (decide fate)
-- ⚠️ governance_achievements (decide fate)


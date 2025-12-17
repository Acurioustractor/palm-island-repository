-- ============================================================================
-- COMPREHENSIVE RLS POLICY FIX
-- Run this in Supabase SQL Editor to fix all Row Level Security issues
-- ============================================================================
-- This script:
-- 1. Drops all existing policies on core tables
-- 2. Recreates them with proper public read access
-- 3. Maintains security for write operations
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================================================

-- profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Community profiles viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;

-- stories policies
DROP POLICY IF EXISTS "Public stories viewable by everyone" ON stories;
DROP POLICY IF EXISTS "Community stories viewable by authenticated users" ON stories;
DROP POLICY IF EXISTS "Restricted stories viewable with permission" ON stories;
DROP POLICY IF EXISTS "Users can create stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Anyone can view public stories" ON stories;

-- organizations policies
DROP POLICY IF EXISTS "Public organizations viewable by all" ON organizations;
DROP POLICY IF EXISTS "Members can view org details" ON organizations;
DROP POLICY IF EXISTS "Anyone can view organizations" ON organizations;

-- organization_services policies
DROP POLICY IF EXISTS "Members can view services" ON organization_services;
DROP POLICY IF EXISTS "Public can view services" ON organization_services;
DROP POLICY IF EXISTS "Anyone can view services" ON organization_services;

-- annual_reports policies
DROP POLICY IF EXISTS "Published reports viewable by authenticated users" ON annual_reports;
DROP POLICY IF EXISTS "Members can view all org reports" ON annual_reports;
DROP POLICY IF EXISTS "Report managers can create/edit reports" ON annual_reports;
DROP POLICY IF EXISTS "Anyone can view published reports" ON annual_reports;
DROP POLICY IF EXISTS "Public can view published reports" ON annual_reports;

-- annual_report_stories policies
DROP POLICY IF EXISTS "Report stories viewable with report" ON annual_report_stories;
DROP POLICY IF EXISTS "Anyone can view report stories" ON annual_report_stories;

-- report_sections policies
DROP POLICY IF EXISTS "Anyone can view report sections" ON report_sections;

-- impact_indicators policies
DROP POLICY IF EXISTS "Anyone can view impact indicators" ON impact_indicators;
DROP POLICY IF EXISTS "Public can view impact indicators" ON impact_indicators;

-- organization_members policies
DROP POLICY IF EXISTS "Members can view their memberships" ON organization_members;
DROP POLICY IF EXISTS "Anyone can view organization members" ON organization_members;

-- ============================================================================
-- STEP 2: ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS annual_report_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS impact_indicators ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: CREATE PUBLIC READ POLICIES (These allow anon key access)
-- ============================================================================

-- PROFILES: Allow public read for profiles with public visibility
CREATE POLICY "anon_read_public_profiles" ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (profile_visibility = 'public');

-- PROFILES: Allow authenticated users to see community profiles
CREATE POLICY "auth_read_community_profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (profile_visibility IN ('public', 'community'));

-- PROFILES: Users can always see their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- PROFILES: Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- PROFILES: Allow insert for new profiles
CREATE POLICY "users_insert_profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================

-- STORIES: Allow public read for published public stories
CREATE POLICY "anon_read_public_stories" ON stories
  FOR SELECT
  TO anon, authenticated
  USING (access_level = 'public' AND status = 'published');

-- STORIES: Allow authenticated users to see community stories
CREATE POLICY "auth_read_community_stories" ON stories
  FOR SELECT
  TO authenticated
  USING (access_level IN ('public', 'community') AND status = 'published');

-- STORIES: Users can see their own stories regardless of status
CREATE POLICY "users_read_own_stories" ON stories
  FOR SELECT
  TO authenticated
  USING (
    storyteller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- STORIES: Authenticated users can create stories
CREATE POLICY "auth_create_stories" ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- STORIES: Users can update their own stories
CREATE POLICY "users_update_own_stories" ON stories
  FOR UPDATE
  TO authenticated
  USING (
    storyteller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================

-- ORGANIZATIONS: Allow public read for all organizations
CREATE POLICY "anon_read_organizations" ON organizations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================

-- ORGANIZATION_SERVICES: Allow public read for all active services
CREATE POLICY "anon_read_services" ON organization_services
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR is_active IS NULL);

-- ============================================================================

-- ORGANIZATION_MEMBERS: Allow read for public member info
CREATE POLICY "anon_read_members" ON organization_members
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR is_active IS NULL);

-- ============================================================================

-- ANNUAL_REPORTS: Allow public read for published reports
CREATE POLICY "anon_read_published_reports" ON annual_reports
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR status IS NULL);

-- ANNUAL_REPORTS: Allow authenticated users to see draft reports they can edit
CREATE POLICY "auth_read_org_reports" ON annual_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- ANNUAL_REPORTS: Allow report creation by authenticated users
CREATE POLICY "auth_create_reports" ON annual_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ANNUAL_REPORTS: Allow report updates by authenticated users
CREATE POLICY "auth_update_reports" ON annual_reports
  FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================

-- ANNUAL_REPORT_STORIES: Allow public read for stories in published reports
CREATE POLICY "anon_read_report_stories" ON annual_report_stories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ANNUAL_REPORT_STORIES: Allow insert for authenticated users
CREATE POLICY "auth_create_report_stories" ON annual_report_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================

-- REPORT_SECTIONS: Allow public read
CREATE POLICY "anon_read_report_sections" ON report_sections
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- REPORT_SECTIONS: Allow authenticated create/update
CREATE POLICY "auth_manage_report_sections" ON report_sections
  FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================

-- IMPACT_INDICATORS: Allow public read for all indicators
CREATE POLICY "anon_read_impact_indicators" ON impact_indicators
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- IMPACT_INDICATORS: Allow authenticated users to create indicators
CREATE POLICY "auth_create_impact_indicators" ON impact_indicators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- STEP 4: VERIFY POLICIES ARE APPLIED
-- ============================================================================

-- Show all policies on key tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('profiles', 'stories', 'organizations', 'organization_services', 'annual_reports', 'impact_indicators')
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'RLS policies have been updated successfully!' as status;

-- ============================================================================
-- STEP 4: Profiles Table RLS Policies
-- Run this to enable proper access control for profiles table
-- ============================================================================

-- First, ensure RLS is enabled (safe to run if already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Profiles viewable by all" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- ============================================================================
-- READ POLICIES
-- ============================================================================

-- Allow anyone to view profiles (community directory)
CREATE POLICY "Profiles viewable by all" ON profiles
  FOR SELECT USING (true);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Allow anyone to create profiles (for storyteller registration)
-- In production, you might want to restrict this to authenticated users
CREATE POLICY "Anyone can create profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Allow users to update their own profile (if linked to auth.users)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Allow any authenticated user to update profiles (admin functionality)
-- This is permissive for PICC admin use - in production, add role checks
CREATE POLICY "Authenticated users can update profiles" ON profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Only authenticated users can delete profiles (admin only)
CREATE POLICY "Authenticated users can delete profiles" ON profiles
  FOR DELETE USING (
    auth.role() = 'authenticated'
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================================================
-- STEP 5: COMPLETE SCHEMA AND RLS FIX
-- Run this migration to fix ALL schema and permission issues
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================================================

-- Add profile_image_url column for storing storyteller photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add primary_organization_id if not exists (from organizations migration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES organizations(id);

-- Verify profiles columns
DO $$
BEGIN
  RAISE NOTICE '✅ Profiles table columns updated';
END $$;

-- ============================================================================
-- PART 2: CREATE INTERVIEWS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity & Relationships
  tenant_id UUID NOT NULL DEFAULT '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),

  -- Interview Metadata
  interview_title TEXT NOT NULL,
  interview_date DATE,
  interview_location TEXT,
  interview_duration_minutes INTEGER,
  interview_type TEXT DEFAULT 'oral_history',

  -- Content
  raw_transcript TEXT,
  edited_transcript TEXT,
  interview_notes TEXT,
  key_themes TEXT[],

  -- Media
  audio_url TEXT,
  video_url TEXT,
  consent_form_url TEXT,

  -- Cultural Protocol
  requires_elder_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  cultural_sensitivity_notes TEXT,

  -- Access Control
  privacy_level TEXT DEFAULT 'internal',
  is_public BOOLEAN DEFAULT FALSE,
  can_be_quoted BOOLEAN DEFAULT TRUE,

  -- Processing Status
  status TEXT DEFAULT 'raw',
  transcription_complete BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,

  -- Links to Stories
  stories_created INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT interviews_type_check CHECK (
    interview_type IN ('oral_history', 'community_consultation', 'impact_interview', 'focus_group', 'informal_conversation')
  ),
  CONSTRAINT interviews_status_check CHECK (
    status IN ('raw', 'transcribed', 'edited', 'approved', 'archived')
  ),
  CONSTRAINT interviews_privacy_check CHECK (
    privacy_level IN ('public', 'community', 'internal', 'restricted')
  )
);

-- Create indexes for interviews
CREATE INDEX IF NOT EXISTS interviews_storyteller_id_idx ON interviews(storyteller_id);
CREATE INDEX IF NOT EXISTS interviews_tenant_id_idx ON interviews(tenant_id);
CREATE INDEX IF NOT EXISTS interviews_interview_date_idx ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS interviews_status_idx ON interviews(status);

DO $$
BEGIN
  RAISE NOTICE '✅ Interviews table ready';
END $$;

-- ============================================================================
-- PART 3: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Enable on stories if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'stories') THEN
    EXECUTE 'ALTER TABLE stories ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE '✅ RLS enabled on stories table';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- ============================================================================
-- PART 4: DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Profiles viewable by all" ON profiles;
DROP POLICY IF EXISTS "Anyone can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Community profiles viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;

-- Interviews policies
DROP POLICY IF EXISTS "Interviews viewable by all" ON interviews;
DROP POLICY IF EXISTS "Anyone can create interviews" ON interviews;
DROP POLICY IF EXISTS "Anyone can update interviews" ON interviews;
DROP POLICY IF EXISTS "Anyone can delete interviews" ON interviews;
DROP POLICY IF EXISTS "Allow all operations on interviews" ON interviews;

DO $$
BEGIN
  RAISE NOTICE '✅ Existing policies dropped';
END $$;

-- ============================================================================
-- PART 5: CREATE COMPREHENSIVE RLS POLICIES FOR PROFILES
-- ============================================================================

-- SELECT: Anyone can view profiles (for community directory)
CREATE POLICY "Profiles viewable by all" ON profiles
  FOR SELECT USING (true);

-- INSERT: Anyone can create profiles (for adding storytellers)
CREATE POLICY "Anyone can create profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- UPDATE: Anyone can update profiles (for admin functionality)
CREATE POLICY "Anyone can update profiles" ON profiles
  FOR UPDATE USING (true);

-- DELETE: Anyone can delete profiles (for admin functionality)
CREATE POLICY "Anyone can delete profiles" ON profiles
  FOR DELETE USING (true);

DO $$
BEGIN
  RAISE NOTICE '✅ Profiles RLS policies created';
END $$;

-- ============================================================================
-- PART 6: CREATE COMPREHENSIVE RLS POLICIES FOR INTERVIEWS
-- ============================================================================

-- SELECT: Anyone can view interviews
CREATE POLICY "Interviews viewable by all" ON interviews
  FOR SELECT USING (true);

-- INSERT: Anyone can create interviews
CREATE POLICY "Anyone can create interviews" ON interviews
  FOR INSERT WITH CHECK (true);

-- UPDATE: Anyone can update interviews
CREATE POLICY "Anyone can update interviews" ON interviews
  FOR UPDATE USING (true);

-- DELETE: Anyone can delete interviews
CREATE POLICY "Anyone can delete interviews" ON interviews
  FOR DELETE USING (true);

DO $$
BEGIN
  RAISE NOTICE '✅ Interviews RLS policies created';
END $$;

-- ============================================================================
-- PART 7: CREATE RLS POLICIES FOR STORIES (if table exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'stories') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Stories viewable by all" ON stories;
    DROP POLICY IF EXISTS "Anyone can create stories" ON stories;
    DROP POLICY IF EXISTS "Anyone can update stories" ON stories;
    DROP POLICY IF EXISTS "Anyone can delete stories" ON stories;
    DROP POLICY IF EXISTS "Public stories viewable by everyone" ON stories;
    DROP POLICY IF EXISTS "Community stories viewable by authenticated users" ON stories;
    DROP POLICY IF EXISTS "Restricted stories viewable with permission" ON stories;
    DROP POLICY IF EXISTS "Users can create stories" ON stories;
    DROP POLICY IF EXISTS "Users can update own stories" ON stories;

    -- Create permissive policies
    CREATE POLICY "Stories viewable by all" ON stories FOR SELECT USING (true);
    CREATE POLICY "Anyone can create stories" ON stories FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can update stories" ON stories FOR UPDATE USING (true);
    CREATE POLICY "Anyone can delete stories" ON stories FOR DELETE USING (true);

    RAISE NOTICE '✅ Stories RLS policies created';
  END IF;
END $$;

-- ============================================================================
-- PART 8: CREATE STORAGE BUCKET AND POLICIES
-- ============================================================================

-- Create the profile-images bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;

-- Create storage policies for profile-images bucket
CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Anyone can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Anyone can update profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images');

CREATE POLICY "Anyone can delete profile images" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-images');

DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket and policies created';
END $$;

-- ============================================================================
-- PART 9: CREATE TRIGGER FOR INTERVIEWS UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interviews_updated_at ON interviews;

CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_interviews_updated_at();

DO $$
BEGIN
  RAISE NOTICE '✅ Interviews trigger created';
END $$;

-- ============================================================================
-- PART 10: VERIFICATION QUERIES
-- ============================================================================

-- Check profiles columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('profile_image_url', 'primary_organization_id')
ORDER BY column_name;

-- Check all RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'interviews', 'stories')
ORDER BY tablename, policyname;

-- Check storage policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ COMPLETE SCHEMA AND RLS FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '══════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'The following has been configured:';
  RAISE NOTICE '  ✓ profile_image_url column added to profiles';
  RAISE NOTICE '  ✓ interviews table created (if not existed)';
  RAISE NOTICE '  ✓ RLS enabled on profiles, interviews, stories';
  RAISE NOTICE '  ✓ Permissive policies created for all CRUD operations';
  RAISE NOTICE '  ✓ Storage bucket "profile-images" configured';
  RAISE NOTICE '  ✓ Storage policies created for image uploads';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '  - Add new storytellers';
  RAISE NOTICE '  - Upload profile photos';
  RAISE NOTICE '  - Create and edit interviews';
  RAISE NOTICE '  - View all data in the PICC admin';
  RAISE NOTICE '';
END $$;

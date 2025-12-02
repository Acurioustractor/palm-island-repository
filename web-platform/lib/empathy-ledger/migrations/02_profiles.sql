-- ============================================================================
-- STEP 2: Create Profiles Table (Storyteller Profiles)
-- Run this after extensions are enabled
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  community_role TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  
  -- Demographics (optional, for impact tracking)
  age_range TEXT,
  gender TEXT,
  indigenous_status TEXT DEFAULT 'Aboriginal or Torres Strait Islander',
  
  -- Location
  location TEXT DEFAULT 'Palm Island',
  traditional_country TEXT,
  language_group TEXT,
  
  -- Storyteller Status
  storyteller_type TEXT NOT NULL DEFAULT 'community_member',
  is_elder BOOLEAN DEFAULT FALSE,
  is_cultural_advisor BOOLEAN DEFAULT FALSE,
  is_service_provider BOOLEAN DEFAULT FALSE,
  
  -- Bio and Background
  bio TEXT,
  expertise_areas TEXT[],
  languages_spoken TEXT[],
  
  -- Engagement Metrics
  stories_contributed INTEGER DEFAULT 0,
  last_story_date TIMESTAMP,
  engagement_score INTEGER DEFAULT 0,
  
  -- Cultural Permissions
  can_share_traditional_knowledge BOOLEAN DEFAULT FALSE,
  face_recognition_consent BOOLEAN DEFAULT FALSE,
  face_recognition_consent_date TIMESTAMP,
  photo_consent_contexts TEXT[],
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'community',
  show_in_directory BOOLEAN DEFAULT TRUE,
  allow_messages BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT profiles_storyteller_type_check CHECK (
    storyteller_type IN ('community_member', 'elder', 'youth', 'service_provider', 'cultural_advisor', 'visitor')
  ),
  CONSTRAINT profiles_visibility_check CHECK (
    profile_visibility IN ('public', 'community', 'private')
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_storyteller_type_idx ON profiles(storyteller_type);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles(location);

-- Add comment
COMMENT ON TABLE profiles IS 'Empathy Ledger storyteller profiles - community members who contribute stories';

-- Verify table creation
SELECT tablename, schemaname FROM pg_tables WHERE tablename = 'profiles';

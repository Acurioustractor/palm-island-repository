-- Migration: Community Voices and Groups Framework
-- This enables anonymous contributions and group storytelling
-- Created: 2024-11-27

-- ============================================================================
-- STEP 1: Add new columns to profiles table
-- ============================================================================

-- Add columns for group and anonymous handling
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS group_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS group_members JSONB;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_group IS 'True if this profile represents a group rather than an individual';
COMMENT ON COLUMN profiles.is_anonymous IS 'True if this is an anonymous or community voice profile';
COMMENT ON COLUMN profiles.group_type IS 'Type of group: elders, youth, women, community, etc.';
COMMENT ON COLUMN profiles.group_members IS 'JSON array of group members if known: [{"name": "...", "role": "..."}]';

-- ============================================================================
-- STEP 2: Create standard community voice and group profiles
-- ============================================================================

-- 1. COMMUNITY VOICE - Anonymous individual contributions
INSERT INTO profiles (
  id,
  full_name,
  preferred_name,
  storyteller_type,
  is_anonymous,
  bio,
  location,
  show_in_directory,
  profile_visibility
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Community Voice',
  'Community Voice',
  'community_member',
  true,
  'Anonymous thoughts, reflections, and stories from Palm Island community members. These voices represent the collective wisdom and experiences of our people, shared without individual attribution to honor privacy and encourage open sharing.',
  'Palm Island',
  true,
  'public'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_anonymous = EXCLUDED.is_anonymous,
  bio = EXCLUDED.bio;

-- 2. COUNCIL OF ELDERS - Named group of Elders
INSERT INTO profiles (
  id,
  full_name,
  preferred_name,
  storyteller_type,
  is_group,
  is_elder,
  group_type,
  bio,
  location,
  show_in_directory,
  profile_visibility
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'Council of Elders',
  'Council of Elders',
  'elder',
  true,
  true,
  'elders',
  'The Council of Elders holds and shares the collective wisdom of Palm Island. These stories and teachings come from group discussions and gatherings where Elders share knowledge, traditions, and guidance for future generations.',
  'Palm Island',
  true,
  'public'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_group = EXCLUDED.is_group,
  group_type = EXCLUDED.group_type,
  bio = EXCLUDED.bio;

-- 3. YOUTH VOICES - Young people of Palm Island
INSERT INTO profiles (
  id,
  full_name,
  preferred_name,
  storyteller_type,
  is_group,
  group_type,
  bio,
  location,
  show_in_directory,
  profile_visibility
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'Youth Voices',
  'Youth Voices',
  'youth',
  true,
  'youth',
  'Perspectives, ideas, and stories from the young people of Palm Island. These voices represent the next generation and their vision for the future of our community.',
  'Palm Island',
  true,
  'public'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_group = EXCLUDED.is_group,
  group_type = EXCLUDED.group_type,
  bio = EXCLUDED.bio;

-- 4. WOMEN'S CIRCLE - Women's collective voice
INSERT INTO profiles (
  id,
  full_name,
  preferred_name,
  storyteller_type,
  is_group,
  group_type,
  bio,
  location,
  show_in_directory,
  profile_visibility
) VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'Women''s Circle',
  'Women''s Circle',
  'community_member',
  true,
  'women',
  'Stories and perspectives from Palm Island women. The Women''s Circle brings together the voices of mothers, grandmothers, aunties, and daughters sharing their experiences and wisdom.',
  'Palm Island',
  true,
  'public'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_group = EXCLUDED.is_group,
  group_type = EXCLUDED.group_type,
  bio = EXCLUDED.bio;

-- 5. COMMUNITY GROUP - Anonymous group discussions
INSERT INTO profiles (
  id,
  full_name,
  preferred_name,
  storyteller_type,
  is_group,
  is_anonymous,
  bio,
  location,
  show_in_directory,
  profile_visibility
) VALUES (
  'c0000000-0000-0000-0000-000000000005',
  'Community Group',
  'Community Group',
  'community_member',
  true,
  true,
  'Collective voices from community gatherings, workshops, and discussions. These stories come from groups of community members sharing together, preserved without individual attribution.',
  'Palm Island',
  true,
  'public'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_group = EXCLUDED.is_group,
  is_anonymous = EXCLUDED.is_anonymous,
  bio = EXCLUDED.bio;

-- 6. MEN'S GROUP - Men's collective voice
INSERT INTO profiles (
  id,
  full_name,
  preferred_name,
  storyteller_type,
  is_group,
  group_type,
  bio,
  location,
  show_in_directory,
  profile_visibility
) VALUES (
  'c0000000-0000-0000-0000-000000000006',
  'Men''s Group',
  'Men''s Group',
  'community_member',
  true,
  'men',
  'Perspectives and stories from Palm Island men. These voices share experiences of fatherhood, cultural responsibility, and community leadership.',
  'Palm Island',
  true,
  'public'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_group = EXCLUDED.is_group,
  group_type = EXCLUDED.group_type,
  bio = EXCLUDED.bio;

-- ============================================================================
-- STEP 3: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_is_group ON profiles(is_group) WHERE is_group = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_anonymous ON profiles(is_anonymous) WHERE is_anonymous = true;
CREATE INDEX IF NOT EXISTS idx_profiles_group_type ON profiles(group_type) WHERE group_type IS NOT NULL;

-- ============================================================================
-- STEP 4: Verification queries
-- ============================================================================

-- Verify new columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_group'
  ) THEN
    RAISE EXCEPTION 'Column is_group was not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_anonymous'
  ) THEN
    RAISE EXCEPTION 'Column is_anonymous was not created';
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Display created profiles
SELECT
  full_name,
  storyteller_type,
  is_group,
  is_anonymous,
  group_type,
  'Created' as status
FROM profiles
WHERE id IN (
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000006'
)
ORDER BY full_name;

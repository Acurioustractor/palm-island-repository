-- ============================================================================
-- STEP 3: Add Missing Profile Columns
-- Adds columns that are referenced in code but missing from schema
-- ============================================================================

-- Add profile image URL
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add organization relationship
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add date of birth (optional, culturally sensitive)
-- Note: Consider using age_range instead for privacy
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS profiles_organization_id_idx ON profiles(organization_id);

-- Add comments
COMMENT ON COLUMN profiles.profile_image_url IS 'URL to profile photo in Supabase storage';
COMMENT ON COLUMN profiles.organization_id IS 'Organization the storyteller belongs to (e.g., PICC)';
COMMENT ON COLUMN profiles.date_of_birth IS 'Date of birth - consider privacy, prefer age_range';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('profile_image_url', 'organization_id', 'date_of_birth')
ORDER BY column_name;

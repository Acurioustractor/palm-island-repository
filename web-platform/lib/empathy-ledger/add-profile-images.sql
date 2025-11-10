-- ============================================================================
-- ADD PROFILE IMAGE AND MEDIA FIELDS TO PROFILES TABLE
-- ============================================================================

-- Add profile image URL field
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add social media and contact URLs
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Add interview count for quick reference
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS interviews_completed INTEGER DEFAULT 0;

-- Comment
COMMENT ON COLUMN profiles.profile_image_url IS 'URL to profile photo in profile-images storage bucket';
COMMENT ON COLUMN profiles.social_links IS 'Social media and contact links (linkedin, instagram, etc)';
COMMENT ON COLUMN profiles.interviews_completed IS 'Count of interviews this storyteller has participated in';

SELECT 'Profile fields added successfully' AS status;

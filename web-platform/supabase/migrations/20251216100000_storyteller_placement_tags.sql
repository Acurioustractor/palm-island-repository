-- Migration: Add placement tags for storytellers and improve story tagging
-- Purpose: Enable site-wide content placement control via tags

-- Add placement_tags column to profiles for controlling where storytellers appear
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS placement_tags text[] DEFAULT '{}';

-- Add interviews_completed column if it doesn't exist (used in storyteller stats)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interviews_completed integer DEFAULT 0;

-- Add index for efficient tag queries on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_placement_tags ON profiles USING GIN (placement_tags);

-- Ensure stories.tags has an index for efficient queries
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING GIN (tags);

-- Add featured_image_url to stories if not exists (for story cards)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured_image_url text;

-- Add excerpt field for story summaries
ALTER TABLE stories ADD COLUMN IF NOT EXISTS excerpt text;

-- Comment the columns for documentation
COMMENT ON COLUMN profiles.placement_tags IS 'Array of tags controlling where this storyteller appears on the site. E.g. homepage-featured, elders-page, ar:2024-25';
COMMENT ON COLUMN stories.tags IS 'Array of tags for categorization and site placement. E.g. homepage, featured, annual-report, fy:2024-25';
COMMENT ON COLUMN stories.featured_image_url IS 'URL of the primary image displayed on story cards';
COMMENT ON COLUMN stories.excerpt IS 'Short summary text shown on story cards and lists';

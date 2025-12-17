-- Migration: Add featured people linkage for stories
-- Purpose: Allow a story to reference multiple people (beyond primary storyteller),
--          so story pages can show who is featured and link to their bios.

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS featured_people uuid[] DEFAULT '{}'::uuid[];

COMMENT ON COLUMN stories.featured_people IS 'Array of profile IDs featured in the story (not necessarily the storyteller).';

CREATE INDEX IF NOT EXISTS idx_stories_featured_people
  ON stories USING GIN (featured_people);


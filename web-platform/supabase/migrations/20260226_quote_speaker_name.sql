-- Add speaker_name column to story_quotes for accurate attribution
-- Many stories have multiple speakers but only one storyteller_id
ALTER TABLE story_quotes ADD COLUMN IF NOT EXISTS speaker_name TEXT;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_story_quotes_speaker_name ON story_quotes (speaker_name) WHERE speaker_name IS NOT NULL;

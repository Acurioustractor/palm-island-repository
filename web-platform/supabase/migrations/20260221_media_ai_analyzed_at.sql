-- Add ai_analyzed_at column to track which media files have been AI-analyzed
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;

-- Partial index for quickly finding unanalyzed files
CREATE INDEX IF NOT EXISTS idx_media_files_ai_analyzed_at
  ON media_files (ai_analyzed_at)
  WHERE ai_analyzed_at IS NULL;

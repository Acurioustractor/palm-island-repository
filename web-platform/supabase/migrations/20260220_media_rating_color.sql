-- Add star rating (0-5) and color label to media_files
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS rating SMALLINT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS color_label TEXT DEFAULT NULL CHECK (color_label IN ('red','orange','yellow','green','blue','purple'));

-- Partial indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_media_files_rating ON media_files(rating) WHERE rating > 0;
CREATE INDEX IF NOT EXISTS idx_media_files_color_label ON media_files(color_label) WHERE color_label IS NOT NULL;

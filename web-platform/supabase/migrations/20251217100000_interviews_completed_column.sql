-- Add interviews_completed column to profiles table
-- This tracks how many interviews each storyteller has participated in

-- Add the column (it may already exist from the previous migration, so use IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'interviews_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN interviews_completed integer DEFAULT 0;
  END IF;
END $$;

-- Create an index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_interviews_completed ON profiles (interviews_completed);

-- Create a function to update the interview count for a storyteller
CREATE OR REPLACE FUNCTION update_storyteller_interview_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET interviews_completed = (
      SELECT COUNT(*) FROM interviews WHERE storyteller_id = NEW.storyteller_id
    )
    WHERE id = NEW.storyteller_id;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET interviews_completed = (
      SELECT COUNT(*) FROM interviews WHERE storyteller_id = OLD.storyteller_id
    )
    WHERE id = OLD.storyteller_id;
    RETURN OLD;
  END IF;

  -- Handle UPDATE (if storyteller_id changes)
  IF TG_OP = 'UPDATE' AND OLD.storyteller_id IS DISTINCT FROM NEW.storyteller_id THEN
    -- Update old storyteller's count
    IF OLD.storyteller_id IS NOT NULL THEN
      UPDATE profiles
      SET interviews_completed = (
        SELECT COUNT(*) FROM interviews WHERE storyteller_id = OLD.storyteller_id
      )
      WHERE id = OLD.storyteller_id;
    END IF;

    -- Update new storyteller's count
    IF NEW.storyteller_id IS NOT NULL THEN
      UPDATE profiles
      SET interviews_completed = (
        SELECT COUNT(*) FROM interviews WHERE storyteller_id = NEW.storyteller_id
      )
      WHERE id = NEW.storyteller_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on the interviews table
DROP TRIGGER IF EXISTS trigger_update_interview_count_insert ON interviews;
CREATE TRIGGER trigger_update_interview_count_insert
  AFTER INSERT ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_storyteller_interview_count();

DROP TRIGGER IF EXISTS trigger_update_interview_count_delete ON interviews;
CREATE TRIGGER trigger_update_interview_count_delete
  AFTER DELETE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_storyteller_interview_count();

DROP TRIGGER IF EXISTS trigger_update_interview_count_update ON interviews;
CREATE TRIGGER trigger_update_interview_count_update
  AFTER UPDATE OF storyteller_id ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_storyteller_interview_count();

-- Backfill existing interview counts for all storytellers
UPDATE profiles p
SET interviews_completed = COALESCE(
  (SELECT COUNT(*) FROM interviews i WHERE i.storyteller_id = p.id),
  0
);

-- Add comment for documentation
COMMENT ON COLUMN profiles.interviews_completed IS 'Count of interviews this storyteller has participated in. Auto-updated via trigger.';

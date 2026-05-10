-- Action item state tracking for /picc/action-items Phase 2.
--
-- meeting_notes.action_items[] stays as text[] (raw commitments captured
-- by /api/interviews/analyze). This sibling table keys per-item state by
-- (meeting_id, item_index) so existing meeting records aren't mutated and
-- new transcript runs slot in cleanly.
--
-- Lifecycle: open → in_progress → done | cancelled
-- Editors can set assignee (free text), due_date, completion_notes.

CREATE TABLE IF NOT EXISTS action_item_states (
  meeting_id        uuid       NOT NULL REFERENCES meeting_notes(id) ON DELETE CASCADE,
  item_index        integer    NOT NULL CHECK (item_index >= 0),
  status            text       NOT NULL DEFAULT 'open'
                               CHECK (status IN ('open','in_progress','done','cancelled')),
  assignee          text,
  due_date          date,
  completion_notes  text,
  completed_at      timestamptz,
  updated_by        text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (meeting_id, item_index)
);

CREATE INDEX IF NOT EXISTS action_item_states_status_idx
  ON action_item_states (status, due_date);

CREATE INDEX IF NOT EXISTS action_item_states_assignee_idx
  ON action_item_states (assignee)
  WHERE assignee IS NOT NULL;

-- updated_at auto-bump
CREATE OR REPLACE FUNCTION action_item_states_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
  END IF;
  IF NEW.status <> 'done' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS action_item_states_updated_at ON action_item_states;
CREATE TRIGGER action_item_states_updated_at
  BEFORE UPDATE ON action_item_states
  FOR EACH ROW
  EXECUTE FUNCTION action_item_states_set_updated_at();

COMMENT ON TABLE action_item_states IS
  'Phase 2 status tracking for meeting_notes.action_items[]. Keyed by (meeting_id, item_index).';

-- Project Notes table (mirrors service_notes for innovation projects)
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'update'
    CHECK (note_type IN ('conversation', 'update', 'feedback', 'meeting', 'idea', 'refinement', 'milestone')),
  content TEXT NOT NULL,
  author_name TEXT,
  tags TEXT[],
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_notes_note_type ON project_notes(note_type);
CREATE INDEX idx_project_notes_pinned ON project_notes(pinned) WHERE pinned = true;

-- RLS
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_notes_read" ON project_notes
  FOR SELECT USING (true);

CREATE POLICY "project_notes_insert" ON project_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "project_notes_update" ON project_notes
  FOR UPDATE USING (true);

CREATE POLICY "project_notes_delete" ON project_notes
  FOR DELETE USING (true);

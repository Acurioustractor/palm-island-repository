-- Service Notes / Conversations table
CREATE TABLE IF NOT EXISTS service_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('conversation','update','feedback','meeting','idea','refinement')),
  content TEXT NOT NULL,
  author_name TEXT,
  linked_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  linked_grant_id UUID REFERENCES service_grants(id) ON DELETE SET NULL,
  tags TEXT[],
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_notes_service_id ON service_notes(service_id);
CREATE INDEX IF NOT EXISTS idx_service_notes_type ON service_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_service_notes_pinned ON service_notes(pinned) WHERE pinned = true;

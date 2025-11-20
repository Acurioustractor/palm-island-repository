-- ============================================================================
-- INTERVIEWS TABLE - Raw Interview Transcripts & Media
-- Links to storytellers (profiles) and can be used to create stories
-- ============================================================================

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity & Relationships
  tenant_id UUID NOT NULL DEFAULT '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),

  -- Interview Metadata
  interview_title TEXT NOT NULL,
  interview_date DATE,
  interview_location TEXT,
  interview_duration_minutes INTEGER,
  interview_type TEXT DEFAULT 'oral_history',

  -- Content
  raw_transcript TEXT,
  edited_transcript TEXT,
  interview_notes TEXT,
  key_themes TEXT[],

  -- Media
  audio_url TEXT,
  video_url TEXT,
  consent_form_url TEXT,

  -- Cultural Protocol
  requires_elder_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  cultural_sensitivity_notes TEXT,

  -- Access Control
  privacy_level TEXT DEFAULT 'internal',
  is_public BOOLEAN DEFAULT FALSE,
  can_be_quoted BOOLEAN DEFAULT TRUE,

  -- Processing Status
  status TEXT DEFAULT 'raw',
  transcription_complete BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,

  -- Links to Stories
  stories_created INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT interviews_type_check CHECK (
    interview_type IN ('oral_history', 'community_consultation', 'impact_interview', 'focus_group', 'informal_conversation')
  ),
  CONSTRAINT interviews_status_check CHECK (
    status IN ('raw', 'transcribed', 'edited', 'approved', 'archived')
  ),
  CONSTRAINT interviews_privacy_check CHECK (
    privacy_level IN ('public', 'community', 'internal', 'restricted')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS interviews_storyteller_id_idx ON interviews(storyteller_id);
CREATE INDEX IF NOT EXISTS interviews_tenant_id_idx ON interviews(tenant_id);
CREATE INDEX IF NOT EXISTS interviews_interview_date_idx ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS interviews_status_idx ON interviews(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS interviews_updated_at ON interviews;

CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_interviews_updated_at();

-- Comments
COMMENT ON TABLE interviews IS 'Raw interview transcripts and media linked to storytellers';
COMMENT ON COLUMN interviews.raw_transcript IS 'Unedited verbatim transcript';
COMMENT ON COLUMN interviews.edited_transcript IS 'Cleaned up transcript ready for publication';
COMMENT ON COLUMN interviews.key_themes IS 'Main themes extracted from interview for searching';

-- Verify table creation
SELECT 'Interviews table created successfully' AS status;

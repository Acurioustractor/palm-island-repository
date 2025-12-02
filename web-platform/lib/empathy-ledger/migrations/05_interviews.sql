-- ============================================================================
-- Migration 05: Interviews Table
-- Creates the interviews table for storing story transcripts and recordings
-- ============================================================================

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    organization_id UUID NOT NULL,

    -- Interview metadata
    interview_title TEXT,
    interview_date DATE,
    interview_type TEXT DEFAULT 'in_person', -- in_person, phone, video, written
    interviewer_name TEXT,
    location TEXT,
    duration_minutes INTEGER,

    -- Transcript content
    raw_transcript TEXT,
    edited_transcript TEXT,

    -- Audio/Video references (stored in Supabase storage)
    audio_url TEXT,
    video_url TEXT,

    -- Processing status
    status TEXT DEFAULT 'raw' CHECK (status IN ('raw', 'transcribing', 'editing', 'reviewed', 'approved', 'archived')),
    transcription_method TEXT, -- manual, whisper, google, etc.
    transcription_confidence DECIMAL(3,2),

    -- Cultural protocols
    cultural_sensitivity_level TEXT DEFAULT 'general', -- general, community, restricted, sacred
    elder_approved BOOLEAN DEFAULT false,
    elder_approved_by UUID REFERENCES profiles(id),
    elder_approved_at TIMESTAMP WITH TIME ZONE,
    requires_permission_check BOOLEAN DEFAULT false,

    -- Story extraction
    stories_extracted INTEGER DEFAULT 0,
    themes_identified TEXT[],
    key_quotes JSONB,

    -- Quality and engagement
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Add indexes for common queries
    CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_interviews_storyteller ON interviews(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_interviews_tenant ON interviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_interviews_organization ON interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_created ON interviews(created_at);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "interviews_tenant_isolation" ON interviews
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY "interviews_public_read" ON interviews
    FOR SELECT USING (cultural_sensitivity_level = 'general' AND status = 'approved');

CREATE POLICY "interviews_authenticated_read" ON interviews
    FOR SELECT TO authenticated
    USING (cultural_sensitivity_level IN ('general', 'community') AND status IN ('approved', 'reviewed'));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_interviews_updated_at();

-- Add interviews_completed column to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'interviews_completed'
    ) THEN
        ALTER TABLE profiles ADD COLUMN interviews_completed INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to update interview count on profiles
CREATE OR REPLACE FUNCTION update_profile_interview_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles
        SET interviews_completed = COALESCE(interviews_completed, 0) + 1
        WHERE id = NEW.storyteller_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles
        SET interviews_completed = GREATEST(COALESCE(interviews_completed, 0) - 1, 0)
        WHERE id = OLD.storyteller_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_count
    AFTER INSERT OR DELETE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_interview_count();

-- Grant permissions
GRANT ALL ON interviews TO authenticated;
GRANT SELECT ON interviews TO anon;

COMMENT ON TABLE interviews IS 'Stores interview transcripts and recordings linked to storytellers';
COMMENT ON COLUMN interviews.raw_transcript IS 'Original unedited transcript from recording or manual entry';
COMMENT ON COLUMN interviews.edited_transcript IS 'Cleaned up transcript ready for story extraction';
COMMENT ON COLUMN interviews.cultural_sensitivity_level IS 'Access control: general (public), community (logged in), restricted (staff), sacred (elders only)';

-- Service team members — links profiles to services with role context
-- Enables: tagging people to services, enriching service content through conversations

CREATE TABLE IF NOT EXISTS service_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'team_member', -- team_member, manager, coordinator, volunteer, community_contact, elder_advisor
  title TEXT, -- e.g. "Youth Services Coordinator", "Community Health Worker"
  is_primary_contact BOOLEAN DEFAULT false,
  started_at DATE,
  ended_at DATE, -- NULL = still active
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, profile_id, role)
);

-- RLS
ALTER TABLE service_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read service team members"
  ON service_team_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage service team members"
  ON service_team_members FOR ALL
  USING (auth.role() = 'authenticated');

-- Also update extracted_quotes to link to profiles
-- Many quotes use short names (e.g. "Winni", "Aunty Ethel") instead of profile_id
-- Add profile_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'extracted_quotes' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE extracted_quotes ADD COLUMN profile_id UUID REFERENCES profiles(id);
  END IF;
END $$;

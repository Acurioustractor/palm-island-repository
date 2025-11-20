-- ============================================================================
-- Fix Missing Columns in Existing Tables
-- ============================================================================

-- Fix profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS storyteller_type TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Fix organizations table - add all missing columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS short_name TEXT,
ADD COLUMN IF NOT EXISTS organization_type TEXT DEFAULT 'aboriginal_community',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT,
ADD COLUMN IF NOT EXISTS secondary_color TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS mission_statement TEXT,
ADD COLUMN IF NOT EXISTS primary_location TEXT,
ADD COLUMN IF NOT EXISTS traditional_country TEXT,
ADD COLUMN IF NOT EXISTS language_groups TEXT[],
ADD COLUMN IF NOT EXISTS service_locations TEXT[],
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS postal_address TEXT,
ADD COLUMN IF NOT EXISTS physical_address TEXT,
ADD COLUMN IF NOT EXISTS established_date DATE,
ADD COLUMN IF NOT EXISTS abn TEXT,
ADD COLUMN IF NOT EXISTS indigenous_controlled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS governance_model TEXT,
ADD COLUMN IF NOT EXISTS empathy_ledger_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS annual_reports_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS impact_tracking_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS has_cultural_protocols BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS elder_approval_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cultural_advisor_ids UUID[],
ADD COLUMN IF NOT EXISTS default_story_access_level TEXT DEFAULT 'community',
ADD COLUMN IF NOT EXISTS require_story_approval BOOLEAN DEFAULT FALSE;

-- Create auth schema if it doesn't exist (for RLS policies)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a dummy auth.uid() function for local development
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
  RETURN current_setting('request.jwt.claim.sub', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE '✅ Missing columns added successfully!';
  RAISE NOTICE '📝 profiles: Added user_id, storyteller_type, location';
  RAISE NOTICE '🏢 organizations: Added 30+ missing columns';
  RAISE NOTICE '🔐 Created auth schema and uid() function for RLS';
END $$;

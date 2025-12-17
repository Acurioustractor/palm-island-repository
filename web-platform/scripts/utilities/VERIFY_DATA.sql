-- Run this in Supabase SQL Editor to verify data exists
-- This bypasses RLS policies

SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Services', COUNT(*) FROM organization_services
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Stories', COUNT(*) FROM stories
UNION ALL
SELECT 'Annual Reports', COUNT(*) FROM annual_reports
UNION ALL
SELECT 'Impact Indicators', COUNT(*) FROM impact_indicators;

-- Check if PICC org exists
SELECT id, name, short_name FROM organizations WHERE short_name = 'PICC';

-- Check stories with their access levels
SELECT id, title, status, access_level FROM stories LIMIT 10;

-- Check profiles with their visibility
SELECT id, full_name, profile_visibility, storyteller_type FROM profiles LIMIT 10;

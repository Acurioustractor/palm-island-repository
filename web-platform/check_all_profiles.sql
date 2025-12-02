-- ============================================================================
-- CHECK ALL EXISTING PROFILES IN SUPABASE
-- Let's see everyone who's already in the database
-- ============================================================================

-- Show ALL profiles currently in database
SELECT
  full_name,
  preferred_name,
  storyteller_type,
  location,
  community_role,
  primary_organization_id IS NOT NULL as has_org,
  metadata ? 'airtable_id' as has_airtable_id,
  metadata->>'airtable_id' as airtable_id
FROM profiles
ORDER BY full_name;

-- Count by organization
SELECT
  COALESCE(o.name, 'No Organization') as organization,
  COUNT(*) as profile_count
FROM profiles p
LEFT JOIN organizations o ON p.primary_organization_id = o.id
GROUP BY o.name
ORDER BY profile_count DESC;

-- Show profiles that might match Airtable names
SELECT
  full_name,
  preferred_name,
  'Might match Airtable data' as note
FROM profiles
WHERE full_name IN (
  'Jason',
  'Alfred Johnson',
  'Daniel Patrick Noble',
  'Ivy',
  'Carmelita & Colette',
  'Richard Cassidy',
  'Natalie Friday',
  'Jenni Calcraft',
  'Peggy Palm Island',
  'Jess Smit',
  'Allison Aley',
  'Paige Tanner Hill',
  'Uncle Alan Palm Island',
  'Iris',
  'Irene Nleallajar',
  'Henry Doyle',
  'Goonyun Anderson',
  'Roy Prior',
  'Ruby Sibley',
  'Uncle Frank Daniel Landers',
  'Ferdys staff',
  'Men''s Group',
  'Childcare workers',
  'Ethel and Iris Ferdies',
  'Elders Group'
)
ORDER BY full_name;

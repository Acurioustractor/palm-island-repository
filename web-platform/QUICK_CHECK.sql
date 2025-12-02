-- ============================================================================
-- QUICK PRE-MIGRATION CHECK
-- Copy-paste this into Supabase SQL Editor
-- ============================================================================

-- CHECK 1: Current profiles
SELECT
  'CURRENT PROFILES' as check_name,
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479') as picc_profiles
FROM profiles;

-- CHECK 2: The 6 existing PICC storytellers
SELECT
  'EXISTING PICC STORYTELLERS' as check_name,
  full_name,
  CASE
    WHEN metadata ? 'airtable_id' THEN '✅ Has Airtable ID'
    ELSE '❌ Missing Airtable ID'
  END as status
FROM profiles
WHERE id IN (
  '0a66bb4b-f437-4a1e-a737-4d8911e05cef',
  '13a78adf-c261-443f-90ba-cf8a57f3d301',
  'cd6c0478-e577-4070-b566-1d66ca6aa455',
  '2b139020-fa6a-4012-b1c2-4be54f516913',
  'c34e763b-a1b7-46e4-9e8e-e86301634c9e',
  '32495b83-0275-4bf3-8c3b-5a6b54ea2b6a'
)
ORDER BY full_name;

-- CHECK 3: Look for duplicate names (should be empty)
SELECT
  'DUPLICATE NAMES' as check_name,
  full_name,
  COUNT(*) as count
FROM profiles
WHERE full_name IN (
  'Uncle Alan Palm Island',
  'Roy Prior',
  'Ruby Sibley',
  'Uncle Frank Daniel Landers',
  'Goonyun Anderson',
  'Jason'
)
GROUP BY full_name
HAVING COUNT(*) > 1;

-- CHECK 4: Verify PICC organization exists
SELECT
  'PICC ORGANIZATION' as check_name,
  id,
  name,
  short_name
FROM organizations
WHERE id = '3c2011b9-f80d-4289-b300-0cd383cff479';

-- CHECK 5: Check if profile_image_url column exists
SELECT
  'PROFILE_IMAGE_URL COLUMN' as check_name,
  COUNT(*) as exists
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'profile_image_url';

-- If returns 0, the column doesn't exist and will be created by migration script

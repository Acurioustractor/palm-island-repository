-- ============================================================================
-- PRE-MIGRATION CHECKS FOR SUPABASE
-- Run this BEFORE executing migrate_airtable_storytellers.sql
-- ============================================================================

\echo ''
\echo '🔍 CHECKING CURRENT DATABASE STATE...'
\echo '================================================'
\echo ''

-- ============================================================================
-- CHECK 1: Current Profile Count
-- ============================================================================
\echo '📊 CHECK 1: Current Profile Count'
\echo '-----------------------------------'

SELECT
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479') as picc_profiles,
  COUNT(*) FILTER (WHERE metadata ? 'airtable_id') as profiles_with_airtable_id
FROM profiles;

\echo ''

-- ============================================================================
-- CHECK 2: Existing PICC Storytellers
-- ============================================================================
\echo '👥 CHECK 2: Existing PICC Storytellers (6 expected)'
\echo '-----------------------------------'

SELECT
  id,
  full_name,
  preferred_name,
  storyteller_type,
  CASE
    WHEN metadata ? 'airtable_id' THEN '✅ Has Airtable ID'
    ELSE '❌ No Airtable ID'
  END as airtable_status,
  metadata->>'airtable_id' as airtable_id
FROM profiles
WHERE id IN (
  '0a66bb4b-f437-4a1e-a737-4d8911e05cef', -- Roy Prior
  '13a78adf-c261-443f-90ba-cf8a57f3d301', -- Uncle Frank
  'cd6c0478-e577-4070-b566-1d66ca6aa455', -- Uncle Alan
  '2b139020-fa6a-4012-b1c2-4be54f516913', -- Ruby Sibley
  'c34e763b-a1b7-46e4-9e8e-e86301634c9e', -- Ferdys staff
  '32495b83-0275-4bf3-8c3b-5a6b54ea2b6a'  -- Goonyun Anderson
)
ORDER BY full_name;

\echo ''

-- ============================================================================
-- CHECK 3: Check for Name Duplicates
-- ============================================================================
\echo '🔍 CHECK 3: Potential Name Duplicates'
\echo '-----------------------------------'

SELECT
  full_name,
  COUNT(*) as count,
  array_agg(id) as profile_ids
FROM profiles
WHERE full_name IN (
  'Uncle Alan Palm Island',
  'Roy Prior',
  'Ruby Sibley',
  'Uncle Frank Daniel Landers',
  'Goonyun Anderson',
  'Jason',
  'Alfred Johnson',
  'Ivy',
  'Peggy Palm Island'
)
GROUP BY full_name
HAVING COUNT(*) > 1;

-- If no results, show success message
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE full_name IN (
      'Uncle Alan Palm Island', 'Roy Prior', 'Ruby Sibley',
      'Uncle Frank Daniel Landers', 'Goonyun Anderson'
    )
    GROUP BY full_name
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE '✅ No duplicate names found!';
  ELSE
    RAISE WARNING '⚠️  Duplicate names detected above!';
  END IF;
END $$;

\echo ''

-- ============================================================================
-- CHECK 4: Check if profile_image_url column exists
-- ============================================================================
\echo '🖼️  CHECK 4: Profile Image Column'
\echo '-----------------------------------'

SELECT
  CASE
    WHEN column_name = 'profile_image_url' THEN '✅ Column exists'
    ELSE '❌ Column missing'
  END as status
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'profile_image_url'
UNION ALL
SELECT '❌ Column does NOT exist' as status
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'profiles' AND column_name = 'profile_image_url'
);

\echo ''

-- ============================================================================
-- CHECK 5: Check Organization Exists
-- ============================================================================
\echo '🏢 CHECK 5: PICC Organization'
\echo '-----------------------------------'

SELECT
  id,
  name,
  short_name,
  CASE
    WHEN id = '3c2011b9-f80d-4289-b300-0cd383cff479' THEN '✅ Correct ID'
    ELSE '⚠️  Different ID'
  END as status
FROM organizations
WHERE name = 'Palm Island Community Company'
   OR short_name = 'PICC'
   OR id = '3c2011b9-f80d-4289-b300-0cd383cff479';

-- Check if org exists at all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM organizations
    WHERE id = '3c2011b9-f80d-4289-b000-0cd383cff479'
  ) THEN
    RAISE WARNING '⚠️  PICC organization not found with expected ID!';
  END IF;
END $$;

\echo ''

-- ============================================================================
-- CHECK 6: Sample Airtable IDs that will be added
-- ============================================================================
\echo '🆔 CHECK 6: New Airtable IDs to be Added'
\echo '-----------------------------------'

WITH new_storytellers AS (
  SELECT unnest(ARRAY[
    'recWvX38lmm9goNjC',  -- Jason
    'rece8jgHe7f45MnVD',  -- Alfred Johnson
    'recJrIHCNCoMjr9cu',  -- Daniel Patrick Noble
    'recyKePRb9W51gMjN',  -- Ivy
    'recrEfZeebU1i4L7r',  -- Carmelita & Colette
    'recWNgEdfNkzHmOCQ',  -- Richard Cassidy
    'recgbFrlp7Tg7Q5Ev',  -- Natalie Friday
    'rec9lgkbJvsAGwdC3',  -- Jenni Calcraft
    'recJmKMtbEulCnHOL',  -- Peggy Palm Island
    'rec49rwhA46eWqHy5'   -- Jess Smit (first 10)
  ]) as airtable_id
)
SELECT
  n.airtable_id,
  CASE
    WHEN p.id IS NOT NULL THEN '⚠️  Already exists in database'
    ELSE '✅ Will be added'
  END as status
FROM new_storytellers n
LEFT JOIN profiles p ON p.metadata->>'airtable_id' = n.airtable_id
ORDER BY status DESC, n.airtable_id;

\echo ''

-- ============================================================================
-- CHECK 7: Stories Count
-- ============================================================================
\echo '📖 CHECK 7: Current Stories Count'
\echo '-----------------------------------'

SELECT
  COUNT(*) as total_stories,
  COUNT(DISTINCT storyteller_id) as unique_storytellers,
  COUNT(*) FILTER (WHERE organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479') as picc_stories
FROM stories;

\echo ''

-- ============================================================================
-- CHECK 8: Check for Tenant ID
-- ============================================================================
\echo '🏷️  CHECK 8: PICC Tenant ID'
\echo '-----------------------------------'

-- Check if tenant_id column exists in stories table
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'stories' AND column_name = 'tenant_id'
    ) THEN '✅ tenant_id column exists'
    ELSE '⚠️  tenant_id column does NOT exist (OK if using older schema)'
  END as status;

\echo ''

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================
\echo ''
\echo '================================================'
\echo '📋 SUMMARY'
\echo '================================================'

DO $$
DECLARE
  profile_count INTEGER;
  picc_count INTEGER;
  airtable_count INTEGER;
  has_image_column BOOLEAN;
  org_exists BOOLEAN;
BEGIN
  -- Get counts
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'),
         COUNT(*) FILTER (WHERE metadata ? 'airtable_id')
  INTO profile_count, picc_count, airtable_count
  FROM profiles;

  -- Check column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_image_url'
  ) INTO has_image_column;

  -- Check org
  SELECT EXISTS (
    SELECT 1 FROM organizations WHERE id = '3c2011b9-f80d-4289-b300-0cd383cff479'
  ) INTO org_exists;

  RAISE NOTICE '📊 Total Profiles: %', profile_count;
  RAISE NOTICE '🏢 PICC Profiles: %', picc_count;
  RAISE NOTICE '🆔 Profiles with Airtable ID: %', airtable_count;
  RAISE NOTICE '🖼️  Profile Image Column: %', CASE WHEN has_image_column THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '🏢 PICC Organization: %', CASE WHEN org_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';

  IF has_image_column AND org_exists THEN
    RAISE NOTICE '✅ ✅ ✅ ALL CHECKS PASSED - READY TO MIGRATE! ✅ ✅ ✅';
  ELSE
    RAISE WARNING '⚠️  SOME CHECKS FAILED - Review above before migrating';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next step: Run migrate_airtable_storytellers.sql';
  RAISE NOTICE '';
END $$;

\echo '================================================'

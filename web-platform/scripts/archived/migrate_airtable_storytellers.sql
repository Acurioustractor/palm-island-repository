-- ============================================================================
-- MIGRATE 25 STORYTELLERS FROM AIRTABLE/GITHUB TO SUPABASE
-- Source: https://github.com/Acurioustractor/Great-Palm-Island-PICC
-- ============================================================================

-- Add profile_image_url column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- ============================================================================
-- INSERT ALL 25 STORYTELLERS
-- Existing PICC members (6) will be UPDATED, new ones (19) will be INSERTED
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
BEGIN
  RAISE NOTICE '📥 Starting migration of 25 storytellers from Airtable...';

  -- ========================================================================
  -- STORYTELLER 1: Jason
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Jason',
    'Jason',
    'Jason has lived on Palm Island for 49 years and speaks positively about the collapsible beds project. He appreciates the beds for their versatility, portability, and comfort, highlighting their value for outdoor use and community gatherings while also noting the significance of properly supporting elders in the community.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recWvX38lmm9goNjC',
      'project', 'Goods.',
      'consent_status', 'Consent for Commercial Use',
      'anonymity_level', 'Full Name',
      'personal_quote', 'Try it. Try it. You won''t regret it, I tell you. You won''t regret it, trust me. If I can do it, you can.',
      'tags', '["Innovation", "Comfort", "Human Connection", "Long-term Health Outcomes", "Community Support"]',
      'date_recorded', '2025-01-18'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 2: Alfred Johnson
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Alfred Johnson',
    'Alfred',
    'Alfred Johnson is a former Palm Island resident who currently lives in Everton Park (Northside) in Brisbane. He maintains strong connections to Palm Island, regularly returning for special occasions like Christmas and to play football in local tournaments such as the Christmas Cup. Alfred grew up ''back and forward'' between Palm Island, Townsville, and Brisbane.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'rece8jgHe7f45MnVD',
      'project', 'Goods.',
      'current_location', 'Brisbane',
      'consent_status', 'Consent for Commercial Use',
      'date_recorded', '2025-01-18'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 3: Daniel Patrick Noble
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Daniel Patrick Noble',
    'Daniel',
    'Daniel Patrick Noble is a visitor to Palm Island from Yarrabah, near Cairns. He has strong family connections to Palm Island through his aunt who has lived there since her high school days, and he completed Year 5 of his schooling on the island. Daniel describes Palm Island as feeling ''like home'' due to his extended family connections.',
    'Palm Island',
    'visitor',
    'public',
    jsonb_build_object(
      'airtable_id', 'recJrIHCNCoMjr9cu',
      'project', 'Goods.',
      'home_location', 'Yarrabah',
      'consent_status', 'Consent for Commercial Use',
      'date_recorded', '2025-01-18'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 4: Ivy
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Ivy',
    'Ivy',
    'Ivy is a visitor to Palm Island who is staying with her sister until after the New Year celebrations. She has grandchildren on the island and appreciates Palm Island''s natural beauty, describing it as ''a great island'' and ''beautiful.''',
    'Palm Island',
    'visitor',
    'public',
    jsonb_build_object(
      'airtable_id', 'recyKePRb9W51gMjN',
      'project', 'Goods.',
      'consent_status', 'Consent for Commercial Use',
      'date_recorded', '2025-01-18'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 5: Carmelita & Colette
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Carmelita & Colette',
    'Carmelita & Colette',
    'Carmelita and Colette are Palm Island residents who articulate the everyday challenges of living in their remote community, particularly concerning essential household items.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recrEfZeebU1i4L7r',
      'project', 'Goods.',
      'consent_status', 'Consent for Commercial Use',
      'date_recorded', '2025-01-18',
      'note', 'Dual profile - may need to be split into two separate profiles'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 6: Richard Cassidy
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Richard Cassidy',
    'Richard',
    'Richard Cassidy is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recWNgEdfNkzHmOCQ',
      'project', 'Goods.',
      'consent_status', 'Consent for Commercial Use',
      'date_recorded', '2025-01-18'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 7: Natalie Friday
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Natalie Friday',
    'Natalie',
    'Natalie Friday is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recgbFrlp7Tg7Q5Ev',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 8: Jenni Calcraft
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Jenni Calcraft',
    'Jenni',
    'Jenni Calcraft is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'rec9lgkbJvsAGwdC3',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 9: Peggy Palm Island
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Peggy Palm Island',
    'Peggy',
    'Peggy is a respected community member of Palm Island.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recJmKMtbEulCnHOL',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 10: Jess Smit
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Jess Smit',
    'Jess',
    'Jess Smit is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'rec49rwhA46eWqHy5',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 11: Allison Aley
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Allison Aley',
    'Allison',
    'Allison Aley is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recIP2zGzhEv6jWNE',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 12: Paige Tanner Hill
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Paige Tanner Hill',
    'Paige',
    'Paige Tanner Hill is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'rec8QFOTITa3THidN',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 13: Uncle Alan Palm Island (EXISTING - UPDATE ONLY)
  -- ========================================================================
  UPDATE profiles
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'airtable_id', 'recCZ7laBXDzCfXru',
      'consent_status', 'Consent for Commercial Use'
    )
  WHERE id = 'cd6c0478-e577-4070-b566-1d66ca6aa455';

  -- ========================================================================
  -- STORYTELLER 14: Iris
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Iris',
    'Iris',
    'Iris is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'rechgcd9qhgB1DIdW',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 15: Irene Nleallajar
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Irene Nleallajar',
    'Irene',
    'Irene Nleallajar is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recXb8iKd3oUoiOao',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 16: Henry Doyle
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Henry Doyle',
    'Henry',
    'Henry Doyle is a Palm Island community member.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recwQ0MRzfku6wWRN',
      'consent_status', 'Consent for Commercial Use'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 17: Goonyun Anderson (EXISTING - UPDATE ONLY)
  -- ========================================================================
  UPDATE profiles
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'airtable_id', 'rec6SR7gXq0mhR1ea',
      'consent_status', 'Consent for Commercial Use'
    )
  WHERE id = '32495b83-0275-4bf3-8c3b-5a6b54ea2b6a';

  -- ========================================================================
  -- STORYTELLER 18: Roy Prior (EXISTING - UPDATE ONLY)
  -- ========================================================================
  UPDATE profiles
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'airtable_id', 'rec8IGe1Affcw4T2V',
      'consent_status', 'Consent for Commercial Use'
    )
  WHERE id = '0a66bb4b-f437-4a1e-a737-4d8911e05cef';

  -- ========================================================================
  -- STORYTELLER 19: Ruby Sibley (EXISTING - UPDATE ONLY)
  -- ========================================================================
  UPDATE profiles
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'airtable_id', 'recOas259NMvd5U5f',
      'consent_status', 'Consent for Commercial Use'
    )
  WHERE id = '2b139020-fa6a-4012-b1c2-4be54f516913';

  -- ========================================================================
  -- STORYTELLER 20: Uncle Frank Daniel Landers (EXISTING - UPDATE ONLY)
  -- ========================================================================
  UPDATE profiles
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'airtable_id', 'recBSWEWggDSMc6nJ',
      'consent_status', 'Consent for Commercial Use'
    )
  WHERE id = '13a78adf-c261-443f-90ba-cf8a57f3d301';

  -- ========================================================================
  -- STORYTELLER 21: Ferdys staff (EXISTING - UPDATE ONLY)
  -- ========================================================================
  UPDATE profiles
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'airtable_id', 'rec1nRwGZLR07lLFr',
      'consent_status', 'Consent for Commercial Use',
      'note', 'This is a placeholder name - needs to be updated with actual staff name'
    )
  WHERE id = 'c34e763b-a1b7-46e4-9e8e-e86301634c9e';

  -- ========================================================================
  -- STORYTELLER 22: Men's Group
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Men''s Group',
    'Men''s Group',
    'Palm Island Men''s Group - collective storytelling voice.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'recbDbROocVFYU3AF',
      'consent_status', 'Consent for Commercial Use',
      'type', 'group_profile'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 23: Childcare workers
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Childcare workers',
    'Childcare Team',
    'Palm Island Childcare workers - collective storytelling voice.',
    'Palm Island',
    'service_provider',
    'public',
    jsonb_build_object(
      'airtable_id', 'recgsc3exP2G1h8sI',
      'consent_status', 'Consent for Commercial Use',
      'type', 'group_profile'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 24: Ethel and Iris Ferdies
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Ethel and Iris Ferdies',
    'Ethel and Iris',
    'Ethel and Iris Ferdies are Palm Island community members.',
    'Palm Island',
    'community_member',
    'public',
    jsonb_build_object(
      'airtable_id', 'reczeIg9TQ8cVWTdE',
      'consent_status', 'Consent for Commercial Use',
      'note', 'Dual profile - may need to be split into two separate profiles'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- STORYTELLER 25: Elders Group
  -- ========================================================================
  INSERT INTO profiles (
    id, full_name, preferred_name, bio, location, storyteller_type,
    profile_visibility, metadata, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    'Elders Group',
    'Elders Group',
    'Palm Island Elders Group - collective wisdom and storytelling voice.',
    'Palm Island',
    'elder',
    'public',
    jsonb_build_object(
      'airtable_id', 'reca309AOcJew4UFD',
      'consent_status', 'Consent for Commercial Use',
      'type', 'group_profile'
    ),
    picc_org_id
  ) ON CONFLICT DO NOTHING;

  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ 19 NEW storytellers added';
  RAISE NOTICE '✅ 6 EXISTING storytellers updated with Airtable IDs';
  RAISE NOTICE '📊 Total storytellers: 25';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NOTES:';
  RAISE NOTICE '  - Profile images NOT migrated (Airtable URLs expire)';
  RAISE NOTICE '  - Transcripts available but not yet imported';
  RAISE NOTICE '  - Some profiles are groups/collective voices';
  RAISE NOTICE '  - "Ferdys staff" still needs real name';
  RAISE NOTICE '================================================';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count all storytellers
SELECT COUNT(*) as total_storytellers FROM profiles;

-- Show storytellers with Airtable IDs
SELECT
  full_name,
  preferred_name,
  location,
  storyteller_type,
  metadata->>'airtable_id' as airtable_id
FROM profiles
WHERE metadata->>'airtable_id' IS NOT NULL
ORDER BY full_name;

-- Show new vs existing
SELECT
  CASE
    WHEN id IN (
      '0a66bb4b-f437-4a1e-a737-4d8911e05cef',
      '13a78adf-c261-443f-90ba-cf8a57f3d301',
      'cd6c0478-e577-4070-b566-1d66ca6aa455',
      '2b139020-fa6a-4012-b1c2-4be54f516913',
      'c34e763b-a1b7-46e4-9e8e-e86301634c9e',
      '32495b83-0275-4bf3-8c3b-5a6b54ea2b6a'
    ) THEN 'EXISTING (Updated)'
    ELSE 'NEW (Added)'
  END as status,
  full_name,
  storyteller_type
FROM profiles
WHERE primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
ORDER BY status DESC, full_name;

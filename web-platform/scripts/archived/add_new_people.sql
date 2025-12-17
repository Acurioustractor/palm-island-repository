-- ============================================================================
-- ADD NEW COMMUNITY MEMBERS TO PICC
-- Palm Island Community Repository
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Replace [placeholder] values with real information
-- 2. Copy the "PERSON" block for each new person you want to add
-- 3. Run this script against your Supabase database
-- 4. Verify additions with the query at the bottom
--
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  new_person_id UUID;
  service_id UUID;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Adding new community members to PICC...';
  RAISE NOTICE '========================================';

  -- ============================
  -- PERSON 1: Example Entry (Remove or customize)
  -- ============================
  INSERT INTO profiles (
    id,
    tenant_id,
    full_name,
    email,
    storyteller_type,
    community_role,
    bio,
    can_share_stories,
    consent_given,
    consent_date,
    primary_organization_id,
    is_verified
  ) VALUES (
    gen_random_uuid(),
    picc_tenant_id,
    'Example Person Name',  -- CHANGE: Full name
    NULL,                    -- CHANGE: Email (optional)
    'community_member',      -- OPTIONS: elder, youth, community_member, staff, cultural_advisor
    'Community Member',      -- CHANGE: Their role/title
    'Brief bio about this person and their connection to Palm Island community.',  -- CHANGE
    TRUE,                    -- Can share stories?
    TRUE,                    -- Consent given?
    NOW(),
    picc_org_id,
    TRUE
  ) RETURNING id INTO new_person_id;

  -- Get service ID if linking to a specific service
  SELECT id INTO service_id
  FROM organization_services
  WHERE service_slug = 'youth_services'  -- CHANGE: or other service slug
    AND organization_id = picc_org_id;

  -- Link to organization as member
  INSERT INTO organization_members (
    organization_id,
    profile_id,
    role,
    service_id,
    can_approve_stories,
    is_active
  ) VALUES (
    picc_org_id,
    new_person_id,
    'contributor',    -- OPTIONS: admin, coordinator, staff, contributor, elder, cultural_advisor
    service_id,       -- Can be NULL if not linked to specific service
    FALSE,            -- Can approve stories? (TRUE for elders/advisors)
    TRUE
  );

  RAISE NOTICE 'Added: Example Person Name';

  -- ============================
  -- PERSON 2: [Copy and customize]
  -- ============================
  -- Uncomment and customize the block below for each additional person

  /*
  INSERT INTO profiles (
    id, tenant_id, full_name, email, storyteller_type, community_role,
    bio, can_share_stories, consent_given, consent_date, primary_organization_id, is_verified
  ) VALUES (
    gen_random_uuid(),
    picc_tenant_id,
    '[Full Name]',
    NULL,
    '[storyteller_type]',
    '[Role]',
    '[Bio]',
    TRUE, TRUE, NOW(), picc_org_id, TRUE
  ) RETURNING id INTO new_person_id;

  INSERT INTO organization_members (organization_id, profile_id, role, is_active)
  VALUES (picc_org_id, new_person_id, 'contributor', TRUE);

  RAISE NOTICE 'Added: [Full Name]';
  */

  -- ============================
  -- PERSON 3: [Copy and customize]
  -- ============================
  -- Copy the block above

  RAISE NOTICE '';
  RAISE NOTICE 'Done! New members added successfully.';
  RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- VERIFICATION: Check recently added profiles
-- ============================================================================

SELECT
  p.full_name,
  p.storyteller_type,
  p.community_role,
  p.is_verified,
  p.created_at,
  om.role as org_role,
  s.service_name
FROM profiles p
LEFT JOIN organization_members om ON p.id = om.profile_id
LEFT JOIN organization_services s ON om.service_id = s.id
WHERE p.primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================================================
-- QUICK REFERENCE: Storyteller Types
-- ============================================================================
-- elder           - Community elder with approval rights
-- youth           - Young community member
-- community_member - General community member
-- staff           - PICC staff member
-- cultural_advisor - Cultural knowledge keeper

-- ============================================================================
-- QUICK REFERENCE: Service Slugs
-- ============================================================================
-- bwgcolman_healing, family_wellbeing, youth_services, early_learning
-- cultural_centre, ranger_program, digital_services, economic_development
-- housing_services, elder_support, community_justice, womens_services
-- mens_programs, food_security, sports_recreation, transport

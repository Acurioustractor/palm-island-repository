-- ============================================================================
-- PICC COMPLETE SETUP
-- Organization ID: 3c2011b9-f80d-4289-b300-0cd383cff479
-- Tenant ID: 9c4e5de2-d80a-4e0b-8a89-1bbf09485532
-- ============================================================================

-- Get the PICC organization ID
DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  
  -- Service IDs
  healing_service_id UUID;
  youth_service_id UUID;
  family_service_id UUID;
  cultural_service_id UUID;
  elder_service_id UUID;
  womens_service_id UUID;
  
  -- Profile IDs
  roy_id UUID := '0a66bb4b-f437-4a1e-a737-4d8911e05cef';
  ferdys_id UUID := 'c34e763b-a1b7-46e4-9e8e-e86301634c9e';
  goonyun_id UUID := '32495b83-0275-4bf3-8c3b-5a6b54ea2b6a';
  uncle_alan_id UUID := 'cd6c0478-e577-4070-b566-1d66ca6aa455';
  uncle_frank_id UUID := '13a78adf-c261-443f-90ba-cf8a57f3d301';
  ruby_id UUID := '2b139020-fa6a-4012-b1c2-4be54f516913';
  
BEGIN
  RAISE NOTICE '🏗️  Starting PICC Complete Setup...';
  
  -- ============================================================================
  -- STEP 1: CREATE 16 PICC SERVICES
  -- ============================================================================
  RAISE NOTICE '📋 Creating PICC Services...';
  
  INSERT INTO organization_services (id, organization_id, service_name, service_slug, description, service_category, is_active, service_color, icon_name)
  VALUES
    (gen_random_uuid(), picc_org_id, 'Bwgcolman Healing Service', 'bwgcolman_healing', 'Comprehensive primary healthcare integrating traditional and modern medicine', 'health', TRUE, '#E74C3C', 'heart-pulse'),
    (gen_random_uuid(), picc_org_id, 'Family Wellbeing Centre', 'family_wellbeing', 'Family support services and wellbeing programs', 'family', TRUE, '#9B59B6', 'users'),
    (gen_random_uuid(), picc_org_id, 'Youth Services', 'youth_services', 'Youth development, leadership, and support programs', 'youth', TRUE, '#3498DB', 'user-group'),
    (gen_random_uuid(), picc_org_id, 'Early Learning Centre', 'early_learning', 'Quality early childhood education and care', 'education', TRUE, '#F39C12', 'school'),
    (gen_random_uuid(), picc_org_id, 'Cultural Centre', 'cultural_centre', 'Cultural preservation, language programs, and arts', 'culture', TRUE, '#1ABC9C', 'landmark'),
    (gen_random_uuid(), picc_org_id, 'Ranger Program', 'ranger_program', 'Land and sea country management and conservation', 'environment', TRUE, '#27AE60', 'tree'),
    (gen_random_uuid(), picc_org_id, 'Digital Service Centre', 'digital_services', 'Technology access, digital literacy, and online services', 'education', TRUE, '#34495E', 'laptop'),
    (gen_random_uuid(), picc_org_id, 'Economic Development', 'economic_development', 'Business support, employment, and economic opportunities', 'economic', TRUE, '#E67E22', 'briefcase'),
    (gen_random_uuid(), picc_org_id, 'Housing Services', 'housing_services', 'Housing maintenance and tenancy support', 'housing', TRUE, '#95A5A6', 'home'),
    (gen_random_uuid(), picc_org_id, 'Elder Support Services', 'elder_support', 'Support and care for Elders and seniors', 'family', TRUE, '#8E44AD', 'hand-holding-heart'),
    (gen_random_uuid(), picc_org_id, 'Community Justice', 'community_justice', 'Justice support and community safety initiatives', 'justice', TRUE, '#C0392B', 'scale-balanced'),
    (gen_random_uuid(), picc_org_id, 'Women''s Services', 'womens_services', 'Support and programs specifically for women', 'family', TRUE, '#E91E63', 'venus'),
    (gen_random_uuid(), picc_org_id, 'Men''s Programs', 'mens_programs', 'Healing and development programs for men', 'family', TRUE, '#2980B9', 'mars'),
    (gen_random_uuid(), picc_org_id, 'Food Security', 'food_security', 'Community gardens, nutrition, and food programs', 'health', TRUE, '#16A085', 'utensils'),
    (gen_random_uuid(), picc_org_id, 'Sports & Recreation', 'sports_recreation', 'Sports programs and recreational activities', 'youth', TRUE, '#F1C40F', 'futbol'),
    (gen_random_uuid(), picc_org_id, 'Transport Services', 'transport', 'Community transport and mobility support', 'other', TRUE, '#7F8C8D', 'van-shuttle')
  ON CONFLICT DO NOTHING;
  
  -- Get service IDs for assignments
  SELECT id INTO healing_service_id FROM organization_services WHERE service_slug = 'bwgcolman_healing' AND organization_id = picc_org_id;
  SELECT id INTO youth_service_id FROM organization_services WHERE service_slug = 'youth_services' AND organization_id = picc_org_id;
  SELECT id INTO family_service_id FROM organization_services WHERE service_slug = 'family_wellbeing' AND organization_id = picc_org_id;
  SELECT id INTO cultural_service_id FROM organization_services WHERE service_slug = 'cultural_centre' AND organization_id = picc_org_id;
  SELECT id INTO elder_service_id FROM organization_services WHERE service_slug = 'elder_support' AND organization_id = picc_org_id;
  SELECT id INTO womens_service_id FROM organization_services WHERE service_slug = 'womens_services' AND organization_id = picc_org_id;
  
  RAISE NOTICE '✅ Created 16 services';
  
  -- ============================================================================
  -- STEP 2: LINK STORYTELLERS AS ORGANIZATION MEMBERS
  -- ============================================================================
  RAISE NOTICE '👥 Linking storytellers to PICC...';
  
  -- Roy Prior - Youth Services Coordinator
  INSERT INTO organization_members (organization_id, profile_id, role, service_id, can_approve_stories, is_active)
  VALUES (picc_org_id, roy_id, 'coordinator', youth_service_id, TRUE, TRUE)
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  -- Ferdys staff - Family Wellbeing staff member
  INSERT INTO organization_members (organization_id, profile_id, role, service_id, is_active)
  VALUES (picc_org_id, ferdys_id, 'staff', family_service_id, TRUE)
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  -- Goonyun Anderson - Cultural Centre contributor
  INSERT INTO organization_members (organization_id, profile_id, role, service_id, is_active)
  VALUES (picc_org_id, goonyun_id, 'contributor', cultural_service_id, TRUE)
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  -- Uncle Alan - Elder and Cultural Advisor
  INSERT INTO organization_members (organization_id, profile_id, role, service_id, can_approve_stories, is_active)
  VALUES (picc_org_id, uncle_alan_id, 'elder', elder_service_id, TRUE, TRUE)
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  -- Uncle Frank - Elder and Cultural Advisor
  INSERT INTO organization_members (organization_id, profile_id, role, service_id, can_approve_stories, is_active)
  VALUES (picc_org_id, uncle_frank_id, 'cultural_advisor', cultural_service_id, TRUE, TRUE)
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  -- Ruby Sibley - Women's Services contributor
  INSERT INTO organization_members (organization_id, profile_id, role, service_id, is_active)
  VALUES (picc_org_id, ruby_id, 'contributor', womens_service_id, TRUE)
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  RAISE NOTICE '✅ Linked 6 storytellers as organization members';
  
  -- ============================================================================
  -- STEP 3: CREATE SAMPLE STORIES FOR EACH SERVICE
  -- ============================================================================
  RAISE NOTICE '📖 Creating sample stories...';
  
  -- Story 1: Youth Services - Roy Prior
  INSERT INTO stories (
    tenant_id, organization_id, service_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, is_public, status, published_at
  ) VALUES (
    picc_tenant_id, picc_org_id, youth_service_id, roy_id, roy_id,
    'Building Youth Leadership on Palm Island',
    'Through PICC Youth Services, we are empowering the next generation of Palm Island leaders. Young people are learning traditional knowledge alongside modern skills, connecting with Elders, and taking on leadership roles in our community. We run programs in cultural identity, leadership development, and community service that help our youth find their path while staying connected to Country and culture.',
    'Youth Services empowers Palm Island''s next generation through leadership and cultural programs',
    'impact_story', 'youth_development', 'public', TRUE, 'published', NOW()
  );
  
  -- Story 2: Cultural Centre - Uncle Frank
  INSERT INTO stories (
    tenant_id, organization_id, service_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, is_public, status, published_at
  ) VALUES (
    picc_tenant_id, picc_org_id, cultural_service_id, uncle_frank_id, uncle_frank_id,
    'Keeping Language and Culture Strong',
    'At the PICC Cultural Centre, we are working hard to keep our Manbarra language and cultural practices alive for future generations. We hold language classes, cultural workshops, and art programs where Elders can pass down knowledge to young people. This isn''t just about preserving the past - it''s about keeping our identity strong and helping our people know who they are and where they come from.',
    'Cultural Centre preserves Manbarra language and traditions through intergenerational programs',
    'traditional_knowledge', 'culture', 'public', TRUE, 'published', NOW()
  );
  
  -- Story 3: Elder Support - Uncle Alan
  INSERT INTO stories (
    tenant_id, organization_id, service_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, is_public, status, published_at
  ) VALUES (
    picc_tenant_id, picc_org_id, elder_service_id, uncle_alan_id, uncle_alan_id,
    'Caring for Our Elders with Respect',
    'PICC Elder Support Services provides care that respects our cultural ways and values our Elders'' knowledge and experience. We support our Elders to stay in their homes and communities, maintain their independence, and continue to play their important role in teaching and guiding younger generations. This service combines practical support with cultural respect.',
    'Elder Support Services provides culturally respectful care for Palm Island seniors',
    'service_story', 'elder_care', 'public', TRUE, 'published', NOW()
  );
  
  -- Story 4: Women's Services - Ruby Sibley
  INSERT INTO stories (
    tenant_id, organization_id, service_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, is_public, status, published_at
  ) VALUES (
    picc_tenant_id, picc_org_id, womens_service_id, ruby_id, ruby_id,
    'Women''s Healing and Empowerment',
    'PICC Women''s Services creates a safe space for Palm Island women to heal, grow stronger, and support each other. We provide counseling, support groups, cultural healing programs, and practical help for women and their families. Our programs are designed by women, for women, and honor our cultural values of family and community.',
    'Women''s Services provides healing and empowerment programs for Palm Island women',
    'impact_story', 'womens_health', 'public', TRUE, 'published', NOW()
  );
  
  -- Story 5: Family Wellbeing - Ferdys
  INSERT INTO stories (
    tenant_id, organization_id, service_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, is_public, status, published_at
  ) VALUES (
    picc_tenant_id, picc_org_id, family_service_id, ferdys_id, ferdys_id,
    'Strengthening Families Through Culture',
    'The Family Wellbeing Centre supports Palm Island families to stay strong and connected. We provide parenting programs, family support, and activities that bring families together. Our approach centers on cultural values and practices that have kept our families strong for generations, combined with modern support services.',
    'Family Wellbeing Centre strengthens families through culturally-grounded support programs',
    'service_story', 'family_support', 'public', TRUE, 'published', NOW()
  );
  
  -- Story 6: Healing Service - Goonyun
  INSERT INTO stories (
    tenant_id, organization_id, service_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, is_public, status, published_at
  ) VALUES (
    picc_tenant_id, picc_org_id, healing_service_id, goonyun_id, goonyun_id,
    'Healing Body and Spirit Together',
    'Bwgcolman Healing Service brings together Western medicine and traditional healing practices to care for the whole person - body, mind, and spirit. Our health workers understand the importance of cultural healing and work with Elders and traditional healers to provide care that respects our ways while delivering quality health services.',
    'Bwgcolman Healing Service integrates traditional and Western healing approaches',
    'impact_story', 'health', 'public', TRUE, 'published', NOW()
  );
  
  RAISE NOTICE '✅ Created 6 sample stories';
  
  -- ============================================================================
  -- STEP 4: UPDATE PROFILES WITH PRIMARY ORGANIZATION
  -- ============================================================================
  RAISE NOTICE '🔗 Updating profile primary organizations...';
  
  UPDATE profiles 
  SET primary_organization_id = picc_org_id
  WHERE id IN (roy_id, ferdys_id, goonyun_id, uncle_alan_id, uncle_frank_id, ruby_id);
  
  RAISE NOTICE '✅ Updated 6 profiles';
  
  -- ============================================================================
  -- SUMMARY
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '🎉 PICC SETUP COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ 16 Services created';
  RAISE NOTICE '✅ 6 Storytellers linked as organization members';
  RAISE NOTICE '✅ 6 Sample stories created (one per service)';
  RAISE NOTICE '✅ Profiles updated with primary organization';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  - Youth Services: Roy Prior (Coordinator)';
  RAISE NOTICE '  - Family Wellbeing: Ferdys staff (Staff)';
  RAISE NOTICE '  - Cultural Centre: Goonyun Anderson, Uncle Frank (Advisors)';
  RAISE NOTICE '  - Elder Support: Uncle Alan (Elder)';
  RAISE NOTICE '  - Women''s Services: Ruby Sibley (Contributor)';
  RAISE NOTICE '  - Healing Service: Goonyun Anderson';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Add photos to stories using Supabase Storage';
  RAISE NOTICE '  2. Create 2024 Annual Report';
  RAISE NOTICE '  3. Build photo gallery component';
  RAISE NOTICE '================================================';
  
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check services created
SELECT 
  service_name, 
  service_category, 
  service_slug,
  story_count
FROM organization_services
WHERE organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
ORDER BY service_name;

-- Check organization members
SELECT 
  p.full_name,
  om.role,
  s.service_name,
  om.can_approve_stories,
  om.is_active
FROM organization_members om
JOIN profiles p ON om.profile_id = p.id
LEFT JOIN organization_services s ON om.service_id = s.id
WHERE om.organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
ORDER BY p.full_name;

-- Check stories created
SELECT 
  s.title,
  p.full_name as storyteller,
  srv.service_name,
  s.story_type,
  s.status,
  s.published_at
FROM stories s
JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN organization_services srv ON s.service_id = srv.id
WHERE s.tenant_id = '9c4e5de2-d80a-4e0b-8a89-1bbf09485532'
ORDER BY s.published_at DESC;

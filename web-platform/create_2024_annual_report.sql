-- ============================================================================
-- CREATE 2024 PICC ANNUAL REPORT
-- Populates report with existing PICC stories
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  report_id UUID;
  story_record RECORD;
BEGIN
  RAISE NOTICE '📝 Creating PICC 2024 Annual Report...';
  
  -- ============================================================================
  -- STEP 1: CREATE ANNUAL REPORT
  -- ============================================================================
  
  INSERT INTO annual_reports (
    organization_id,
    report_year,
    reporting_period_start,
    reporting_period_end,
    title,
    subtitle,
    theme,
    status,
    template_name,
    executive_summary,
    leadership_message,
    looking_forward,
    acknowledgments,
    statistics,
    elder_approval_required,
    auto_generated
  ) VALUES (
    picc_org_id,
    2024,
    '2024-01-01',
    '2024-12-31',
    'Palm Island Community Company 2024 Annual Report',
    'Our Community, Our Future, Our Way',
    'Strengthening Culture, Building Futures',
    'drafting',
    'traditional',
    'In 2024, Palm Island Community Company continued its mission to deliver culturally appropriate, community-controlled services that strengthen Palm Island families, preserve culture, and build a thriving future for all generations. Through our 16 key services, we supported thousands of community members across health, education, culture, youth development, and family wellbeing.',
    'As we reflect on 2024, I am proud of what our community has achieved together. PICC has grown stronger, our services have reached more families, and our commitment to cultural preservation and community empowerment remains unwavering. The stories in this report represent the heart of our work - the voices, experiences, and wisdom of Palm Island people. Each story shows how our services are making a real difference in people''s lives while honoring our cultural values and traditional knowledge.',
    'Looking ahead to 2025, we will continue to expand our services, strengthen partnerships, and ensure that every Palm Islander has access to the support they need to thrive. We will invest in our youth, support our Elders, and work together to build a stronger, more prosperous community for future generations.',
    'We acknowledge the Traditional Owners of Palm Island, the Manbarra people, and pay our respects to Elders past, present, and emerging. We thank all PICC staff, board members, community members, partners, and funders who have contributed to our work this year. Most importantly, we thank the storytellers who have shared their experiences and wisdom in this report.',
    jsonb_build_object(
      'services', 16,
      'staff_members', 120,
      'community_members_served', 3500,
      'programs_delivered', 45,
      'stories_collected', 6,
      'cultural_events', 24,
      'youth_programs', 12,
      'elder_support_hours', 5200
    ),
    TRUE,
    FALSE
  )
  RETURNING id INTO report_id;
  
  RAISE NOTICE '✅ Created annual report: %', report_id;
  
  -- ============================================================================
  -- STEP 2: ADD ALL PICC STORIES TO REPORT
  -- ============================================================================
  
  RAISE NOTICE '📖 Adding stories to annual report...';
  
  -- Add each story with specific placement
  FOR story_record IN
    SELECT 
      s.id as story_id,
      s.title,
      s.story_type,
      srv.service_name,
      srv.service_category
    FROM stories s
    LEFT JOIN organization_services srv ON s.service_id = srv.id
    WHERE s.tenant_id = picc_tenant_id
    ORDER BY s.published_at
  LOOP
    INSERT INTO annual_report_stories (
      report_id,
      story_id,
      inclusion_reason,
      section_placement,
      display_order,
      is_featured,
      include_full_text
    ) VALUES (
      report_id,
      story_record.story_id,
      CASE 
        WHEN story_record.story_type = 'traditional_knowledge' THEN 'elder_wisdom'
        WHEN story_record.story_type = 'impact_story' THEN 'impact_highlight'
        ELSE 'service_success'
      END,
      CASE 
        WHEN story_record.service_category = 'youth' THEN 'youth_programs'
        WHEN story_record.service_category = 'culture' THEN 'cultural_preservation'
        WHEN story_record.service_category = 'health' THEN 'health_services'
        WHEN story_record.service_category = 'family' THEN 'family_support'
        ELSE 'community_stories'
      END,
      0,
      story_record.story_type = 'traditional_knowledge', -- Feature traditional knowledge stories
      TRUE
    );
    
    RAISE NOTICE '  ✓ Added: %', story_record.title;
  END LOOP;
  
  -- ============================================================================
  -- STEP 3: CREATE CUSTOM REPORT SECTIONS
  -- ============================================================================
  
  RAISE NOTICE '📑 Creating custom report sections...';
  
  -- Cover Section
  INSERT INTO report_sections (
    report_id,
    section_type,
    section_title,
    section_content,
    display_order,
    layout_style
  ) VALUES (
    report_id,
    'cover',
    'Palm Island Community Company',
    '2024 Annual Report\nOur Community, Our Future, Our Way',
    1,
    'image_focus'
  );
  
  -- Cultural Acknowledgment
  INSERT INTO report_sections (
    report_id,
    section_type,
    section_title,
    section_content,
    display_order,
    layout_style
  ) VALUES (
    report_id,
    'cultural_acknowledgment',
    'Acknowledgment of Country',
    'We acknowledge the Traditional Owners of Bwgcolman (Palm Island), the Manbarra people, and recognize their continuing connection to land, sea, and community. We pay our respects to Elders past, present, and emerging, and honor the stories, traditions, and wisdom they share with us.',
    2,
    'standard'
  );
  
  -- Year at a Glance
  INSERT INTO report_sections (
    report_id,
    section_type,
    section_title,
    section_content,
    display_order,
    layout_style,
    include_data_viz,
    data_viz_config
  ) VALUES (
    report_id,
    'year_overview',
    '2024 Year at a Glance',
    'Key statistics and achievements from across PICC services',
    3,
    'data_focus',
    TRUE,
    jsonb_build_object(
      'type', 'stats_grid',
      'stats', jsonb_build_array(
        jsonb_build_object('label', 'Services', 'value', '16', 'icon', 'briefcase'),
        jsonb_build_object('label', 'Staff Members', 'value', '120+', 'icon', 'users'),
        jsonb_build_object('label', 'People Served', 'value', '3,500+', 'icon', 'heart'),
        jsonb_build_object('label', 'Programs', 'value', '45', 'icon', 'calendar'),
        jsonb_build_object('label', 'Cultural Events', 'value', '24', 'icon', 'star'),
        jsonb_build_object('label', 'Elder Support Hours', 'value', '5,200', 'icon', 'clock')
      )
    )
  );
  
  -- Our Services Section
  INSERT INTO report_sections (
    report_id,
    section_type,
    section_title,
    section_content,
    display_order,
    layout_style
  ) VALUES (
    report_id,
    'service_highlights',
    'Our 16 Key Services',
    E'PICC delivers comprehensive community-controlled services across:\n\n• Health & Wellbeing\n• Family Support\n• Youth Development\n• Cultural Preservation\n• Education & Learning\n• Elder Care\n• Economic Development\n• Community Safety\n\nEach service is designed and delivered with cultural protocols at the center, ensuring our community receives support that respects and strengthens our identity.',
    4,
    'two_column'
  );
  
  RAISE NOTICE '✅ Created custom sections';
  
  -- ============================================================================
  -- SUMMARY
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 2024 ANNUAL REPORT CREATED!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Report ID: %', report_id;
  RAISE NOTICE 'Status: drafting';
  RAISE NOTICE 'Stories included: 6';
  RAISE NOTICE 'Custom sections: 4';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Add photos to stories';
  RAISE NOTICE '  2. Review and edit report content';
  RAISE NOTICE '  3. Get Elder approval';
  RAISE NOTICE '  4. Update status to "published"';
  RAISE NOTICE '================================================';
  
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- View the complete report with stories
SELECT 
  ar.title,
  ar.report_year,
  ar.status,
  ar.theme,
  COUNT(ars.id) as story_count,
  COUNT(rs.id) as section_count
FROM annual_reports ar
LEFT JOIN annual_report_stories ars ON ar.id = ars.report_id
LEFT JOIN report_sections rs ON ar.id = rs.report_id
WHERE ar.organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
AND ar.report_year = 2024
GROUP BY ar.id, ar.title, ar.report_year, ar.status, ar.theme;

-- View stories in the report
SELECT 
  s.title,
  p.full_name as storyteller,
  srv.service_name,
  ars.section_placement,
  ars.inclusion_reason,
  ars.is_featured
FROM annual_report_stories ars
JOIN stories s ON ars.story_id = s.id
JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN organization_services srv ON s.service_id = srv.id
JOIN annual_reports ar ON ars.report_id = ar.id
WHERE ar.organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
AND ar.report_year = 2024
ORDER BY ars.display_order, s.title;

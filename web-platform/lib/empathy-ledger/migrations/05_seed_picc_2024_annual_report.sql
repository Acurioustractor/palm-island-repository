-- ============================================================================
-- STEP 5: Seed PICC 2024 Annual Report with Real Content
-- Based on the actual PICC 2023-24 Annual Report
-- ============================================================================

-- Get the PICC organization ID and 2024 report ID
DO $$
DECLARE
  picc_org_id UUID;
  report_2024_id UUID;
  rachel_profile_id UUID;
  luella_profile_id UUID;
BEGIN
  -- Get PICC organization
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC';

  -- Get or create 2024 annual report
  SELECT id INTO report_2024_id FROM annual_reports
  WHERE organization_id = picc_org_id AND report_year = 2024;

  IF report_2024_id IS NULL THEN
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
      narrative_theme,
      acknowledgement_of_country,
      looking_forward,
      acknowledgments,
      theme_colors,
      cultural_design_elements
    ) VALUES (
      picc_org_id,
      2024,
      '2023-07-01',
      '2024-06-30',
      '2023-2024 Annual Report',
      'Palm Island Community Company',
      'Growing Impact, Strengthening Community',
      'drafting',
      'traditional',
      'Our second decade - achievements growing almost by the day',
      'The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We recognise the continued connection of the Manbarra and Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime.',
      'As we look to the future, PICC will continue to expand its services and strengthen its commitment to Palm Islanders. The delegated authority represents a new chapter in our journey toward self-determination. We will continue to fight for Palm Islanders to have the services they deserve, working with and for the people of this beautiful community.',
      'We are grateful to our partners, funders, and collaborators who make our work possible. Special thanks to our dedicated staff, Board members, and Elders for their ongoing guidance and support.',
      '{"primary": "#2C5F8D", "secondary": "#8B4513", "accent": "#E67E22"}',
      '{"patterns": true, "artwork": "turtle", "colors": "earth_tones"}'
    ) RETURNING id INTO report_2024_id;
  END IF;

  -- ============================================================================
  -- LEADERSHIP MESSAGES
  -- ============================================================================

  -- Create dummy profiles for CEO and Chair if they don't exist
  INSERT INTO profiles (full_name, bio, metadata)
  VALUES
    ('Rachel Atkinson', 'Chief Executive Officer, Palm Island Community Company', '{"role": "CEO"}'),
    ('Luella Bligh', 'Chair of the Board, Palm Island Community Company', '{"role": "Chair"}')
  ON CONFLICT DO NOTHING
  RETURNING id INTO rachel_profile_id;

  -- Get profile IDs
  SELECT id INTO rachel_profile_id FROM profiles WHERE full_name = 'Rachel Atkinson' LIMIT 1;
  SELECT id INTO luella_profile_id FROM profiles WHERE full_name = 'Luella Bligh' LIMIT 1;

  -- Message from the CEO
  INSERT INTO report_leadership_messages (
    report_id,
    role,
    person_profile_id,
    person_name,
    person_title,
    message_title,
    message_content,
    message_excerpt,
    layout_style,
    featured_quote,
    display_order
  ) VALUES (
    report_2024_id,
    'ceo',
    rachel_profile_id,
    'Rachel Atkinson',
    'Chief Executive Officer',
    'Message from the CEO',
    E'In 2018/19 I wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." With PICC more than halfway through our second decade now, our achievements are growing almost by the day.\n\nThe pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.\n\nWe now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.\n\nOne of the changes I am most excited and proud about is the delegated authority, which represents a significant and positive shift for children in care on Palm Island. At last, the community will decide the care arrangements for children who cannot stay at home, a change for which I have been fighting for decades. You can read more about delegated authority later in this annual report.\n\nThe number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. Impressively, three-quarters of our workforce are Palm Islanders. These figures are extraordinarily high compared to other services in remote communities, highlighting our commitment to local employment and development.\n\nI continue to be enormously thankful for the strength behind me, the staff of PICC who work tirelessly to make a positive difference in the lives of so many.\n\nOne small but significant example of our impact in the community is that among our recent graduating cohort of trainees in Community Services, all of them express their desire to work for "the Company". This is hugely encouraging to hear, and this sentiment is a testament to how valued and effective PICC is perceived within the community.\n\nDespite our progress, I am acutely aware that we still have a long way to go. Palm Island continues to lag behind mainland communities in many areas of wellbeing. In our efforts to address these disparities, I still encounter racist barriers to change. However, PICC is here to stay and to fight for Palm Islanders to have the services they deserve. Everything we do is for, with, and because of the people of this beautiful community.',
    'Our achievements are growing almost by the day as we enter our second decade of service.',
    'photo_left',
    'PICC is here to stay and to fight for Palm Islanders to have the services they deserve.',
    1
  ) ON CONFLICT DO NOTHING;

  -- Message from the Chair
  INSERT INTO report_leadership_messages (
    report_id,
    role,
    person_profile_id,
    person_name,
    person_title,
    message_title,
    message_content,
    message_excerpt,
    layout_style,
    featured_quote,
    display_order
  ) VALUES (
    report_2024_id,
    'chair',
    luella_profile_id,
    'Luella Bligh',
    'Chair of the Board',
    'Message from the Chair',
    E'In my fifth year as Chair of the Board, my commitment to ensuring that PICC remains the exemplary service provider that Palm Island deserves has only grown stronger.\n\nPICC plays a crucial role in our community, offering essential services that impact the lives of many. I am deeply conscious of the responsibility I hold to the people of Palm Island, ensuring that our company is not only well-managed and sustainable but also progressing in the right direction.\n\nThe positive changes we strive for are becoming evident within the community. This is particularly noticeable among our young people, who are beginning to feel a sense of optimism about the future of Palm Island. Their hope and enthusiasm are a testament to the progress we are making.\n\nI am immensely grateful for the unwavering support of my fellow Board members. Their dedication and collaborative efforts have been instrumental in guiding PICC towards achieving our shared goals. Together, we are steering PICC towards a brighter future for Palm Island.',
    'Committed to ensuring PICC remains the exemplary service provider Palm Island deserves.',
    'photo_right',
    'Our young people are beginning to feel a sense of optimism about the future of Palm Island.',
    2
  ) ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- BOARD MEMBERS
  -- ============================================================================

  INSERT INTO report_board_members (report_id, full_name, position, is_current, display_order)
  VALUES
    (report_2024_id, 'Luella Bligh', 'Chair', TRUE, 1),
    (report_2024_id, 'Rhonda Phillips', 'Director', TRUE, 2),
    (report_2024_id, 'Allan Palm Island', 'Director', TRUE, 3),
    (report_2024_id, 'Matthew Lindsay', 'Company Secretary', TRUE, 4),
    (report_2024_id, 'Harriet Hulthen', 'Director', TRUE, 5),
    (report_2024_id, 'Raymond W. Palmer Snr', 'Director', TRUE, 6),
    (report_2024_id, 'Cassie Lang', 'Director', TRUE, 7)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- KEY STATISTICS
  -- ============================================================================

  INSERT INTO report_statistics (
    report_id,
    category,
    stat_label,
    stat_value,
    stat_unit,
    stat_description,
    comparison_previous_year,
    comparison_type,
    display_format,
    is_key_metric,
    color,
    display_order
  ) VALUES
    (report_2024_id, 'workforce', 'Total Staff Members', '197', 'people', 'Staff and trainees working for PICC', 'Up from 151 in 2022/23', 'increase', 'number', TRUE, '#3B82F6', 1),
    (report_2024_id, 'workforce', 'Staff Growth Since Last Year', '30%', 'percentage', 'Increase in workforce', 'Increased by a third', 'increase', 'percentage', TRUE, '#10B981', 2),
    (report_2024_id, 'workforce', 'Palm Islander Staff', '75%', 'percentage', 'Three-quarters of workforce are Palm Islanders', 'Extraordinarily high compared to other remote communities', 'stable', 'percentage', TRUE, '#8B4513', 3),
    (report_2024_id, 'workforce', '10-Year Staff Growth', '3x', 'multiplier', 'Three times the number of people compared to ten years ago', 'Tripled over decade', 'increase', 'number', TRUE, '#6366F1', 4),
    (report_2024_id, 'service_delivery', 'Services Offered', '16', 'services', 'Comprehensive range of community services', 'Continued expansion', 'stable', 'number', FALSE, '#EC4899', 5),
    (report_2024_id, 'health', 'Medical Clients Seen', '2,283', 'people', 'Patients at Bwgcolman Healing Service', 'Up from 2,050 in 2022/23', 'increase', 'number', FALSE, '#E74C3C', 6),
    (report_2024_id, 'health', 'Health Check (715) Completed', '779', 'checks', 'Annual health assessments', 'Up from 610 in 2022/23', 'increase', 'number', FALSE, '#E74C3C', 7),
    (report_2024_id, 'family', 'Families Supported', '2,500+', 'families', 'Through various family support programs', 'Ongoing support', 'stable', 'number', FALSE, '#9B59B6', 8)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- ORGANIZATIONAL HIGHLIGHTS
  -- ============================================================================

  INSERT INTO report_highlights (
    report_id,
    highlight_type,
    title,
    subtitle,
    description,
    challenge_faced,
    solution_approach,
    impact_achieved,
    metrics,
    is_featured,
    display_style,
    display_order
  ) VALUES
    (report_2024_id, 'major_initiative', 'Palm Island Digital Service Centre', 'Launched 2023',
     'The Centre provides sales and customer service for Telstra landline, mobile and Internet products and services for Aboriginal and Torres Strait Islander customers across Australia. The Centre can connect callers with interpreters for about fifty First Nations languages.',
     'Limited local employment opportunities and need for culturally appropriate customer service for First Nations customers.',
     'Partnership between PICC, Telstra, Palm Island Aboriginal Shire Council and Queensland Government to establish a Digital Service Centre on Palm Island.',
     'Employed twenty-one full-time workers by end of 2023/24, with capacity for thirty workers. Provides career training in technology and customer service.',
     '{"workers_employed": 21, "capacity": 30, "languages_supported": "50+", "launch_date": "June 2023"}',
     TRUE, 'hero', 1),

    (report_2024_id, 'major_initiative', 'Delegated Authority - Bwgcolman Way', 'Empowered and Resilient',
     'A major change to caring arrangements for vulnerable children is coming to Palm Island. For the first time, the community will decide the care arrangements for children who cannot stay at home. The CEO of PICC has been delegated the authority to make decisions concerning children in care under the Child Protection Act.',
     'Disproportionate number of Aboriginal and Torres Strait Islander children in out-of-home care. Community had no decision-making power.',
     'Named "Bwgcolman Way: Empowered and Resilient", this service ensures Palm Island mob lead and create change for children and families, with genuine participation from Elders and traditional owner groups.',
     'Community-led decision making for child protection. Aligns with National Agreement on Closing the Gap target to reduce Aboriginal children in out-of-home care by 45% by 2030.',
     '{"goal": "Reduce out-of-home care by 45% by 2030", "decision_maker": "PICC CEO", "community_led": true}',
     TRUE, 'card', 2),

    (report_2024_id, 'service_expansion', 'Women''s Healing Service Restructured', 'Better Support for Women',
     'PICC restructured the Women''s Healing Service to provide better services to women resident in, or at risk of being resident in, the Townsville Women''s Correctional Centre.',
     'COVID-19 restrictions hindered service delivery. Need for better prevention and re-entry support.',
     'New structure with three programs: Re-entry Program, Women on Remand Program, and Early Intervention Program. Opened office in Aitkenvale, Townsville.',
     'Strengthened prevention efforts and enhanced support before, during, and after incarceration. New community office for accessible services.',
     '{"programs": 3, "locations": 2, "focus": "prevention + re-entry"}',
     FALSE, 'standard', 3),

    (report_2024_id, 'achievement', 'Bwgcolman Healing Service Accredited', 'Excellence in Primary Healthcare',
     'In early 2024, the Bwgcolman Healing Service passed the Quality Practice Accreditation assessment by the Royal Australian College of General Practitioners.',
     NULL,
     'Assessors made special mention of outstanding cleanliness, high standards of documentation and record-keeping, and excellent professional standards and friendliness of staff.',
     'Renewed accreditation until 2027. Recognition of high-quality, culturally appropriate healthcare.',
     '{"accreditation_until": 2027, "assessment_body": "RACGP", "rating": "Outstanding"}',
     FALSE, 'card', 4)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- PARTNERS (Sample - from the PDF)
  -- ============================================================================

  INSERT INTO report_partners (
    report_id,
    partner_name,
    partner_type,
    partnership_level,
    partnership_area,
    should_display_logo,
    display_order
  ) VALUES
    (report_2024_id, 'Queensland Department of Health', 'government', 'major_funder', 'Health Services', TRUE, 1),
    (report_2024_id, 'Queensland Department of Child Safety, Seniors and Disability Services', 'government', 'major_funder', 'Child Protection', TRUE, 2),
    (report_2024_id, 'National Indigenous Australians Agency', 'government', 'major_funder', 'Community Services', TRUE, 3),
    (report_2024_id, 'Telstra', 'corporate', 'key_partner', 'Digital Service Centre', TRUE, 4),
    (report_2024_id, 'Palm Island Aboriginal Shire Council', 'government', 'key_partner', 'All Services', TRUE, 5),
    (report_2024_id, 'Townsville Hospital and Health Service', 'health', 'key_partner', 'Healthcare', TRUE, 6),
    (report_2024_id, 'Queensland Aboriginal and Islander Health Council', 'ngo', 'collaborator', 'Health Advocacy', TRUE, 7),
    (report_2024_id, 'James Cook University', 'academic', 'collaborator', 'Research & Training', TRUE, 8),
    (report_2024_id, 'TAFE Queensland', 'education', 'collaborator', 'Training & Education', TRUE, 9),
    (report_2024_id, 'Fred Hollows Foundation', 'ngo', 'supporter', 'Eye Health', TRUE, 10),
    (report_2024_id, 'Heart of Australia', 'ngo', 'supporter', 'Cardiac Care', TRUE, 11),
    (report_2024_id, 'Encompass Family and Community', 'ngo', 'collaborator', 'Family Services', FALSE, 12),
    (report_2024_id, 'Secretariat of National Aboriginal and Islander Child Care', 'ngo', 'collaborator', 'Child Protection', FALSE, 13),
    (report_2024_id, 'Institute for Urban Indigenous Health', 'ngo', 'collaborator', 'Health Programs', FALSE, 14),
    (report_2024_id, 'North Queensland Primary Health Network', 'health', 'collaborator', 'Primary Care', FALSE, 15)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ PICC 2024 Annual Report seeded with real content!';
  RAISE NOTICE '📝 Added: Leadership messages from CEO and Chair';
  RAISE NOTICE '👥 Added: 7 Board members';
  RAISE NOTICE '📊 Added: 8 Key statistics';
  RAISE NOTICE '🌟 Added: 4 Major highlights';
  RAISE NOTICE '🤝 Added: 15 Partner organizations';
  RAISE NOTICE '🎯 Report ID: %', report_2024_id;

END $$;

-- ============================================================================
-- SEED DATA: PICC 2023-24 Annual Report
--
-- Sources:
--   - data-2024.ts (static TypeScript file)
--   - annual-reports/migrations/001_annual_report_tables.sql (System 3 seeds)
--   - 002_sample_data.sql (System 2 seeds)
--
-- All inserts use ON CONFLICT DO NOTHING for idempotency.
-- Requires: 20260130_consolidated_annual_reports.sql run first.
-- Requires: PICC organization record to exist (from Empathy Ledger base).
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID;
  report_id UUID;
  svc_id UUID;
BEGIN
  -- Get PICC organization
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC' LIMIT 1;

  IF picc_org_id IS NULL THEN
    RAISE EXCEPTION 'PICC organization not found. Run Empathy Ledger base migration first.';
  END IF;

  -- ==========================================================================
  -- 1. ORGANIZATION STATS
  -- ==========================================================================
  INSERT INTO organization_stats (organization_id, fiscal_year, staff_count, service_count, people_served, annual_budget, indigenous_staff_percentage, local_staff_percentage)
  VALUES (picc_org_id, '2023-24', 197, 16, '2,283+ health clients plus thousands across all services', 23400000, '80%+', '70%+')
  ON CONFLICT (organization_id, fiscal_year) DO NOTHING;

  -- ==========================================================================
  -- 2. BOARD MEMBERS (7)
  -- ==========================================================================
  INSERT INTO board_members (organization_id, name, role, display_order) VALUES
    (picc_org_id, 'Luella Bligh', 'Chair', 1),
    (picc_org_id, 'Rhonda Phillips', 'Director', 2),
    (picc_org_id, 'Allan Palm Island', 'Director', 3),
    (picc_org_id, 'Matthew Lindsay', 'Company Secretary', 4),
    (picc_org_id, 'Harriet Hulthen', 'Director', 5),
    (picc_org_id, 'Raymond W. Palmer Snr', 'Director', 6),
    (picc_org_id, 'Cassie Lang', 'Director', 7)
  ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- 3. LEADERSHIP MESSAGES (CEO + Chair)
  -- ==========================================================================
  INSERT INTO leadership (organization_id, leadership_type, full_name, position, message_title, message_content, message_excerpt, featured_quote, is_active, position_order)
  VALUES
    (picc_org_id, 'executive', 'Rachel Atkinson', 'Chief Executive Officer', 'CEO''s Report',
     'This year, I am so proud to introduce our Annual Report, published by our own PICC Communications and Design team. 2023-24 has been a year of remarkable growth for Palm Island Community Company.

We now employ 197 staff — a 30% increase from the previous year — with over 80% identifying as Aboriginal and/or Torres Strait Islander and more than 70% living on Palm Island. This growth reflects the community''s trust in PICC and the quality of services we provide.

A landmark achievement this year was receiving Delegated Authority through our Bwgcolman Way service. PICC is now one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to hold this responsibility. Decisions about Palm Island children and families are now being made by Palm Island people — this is self-determination in action.

Our health services continue to deliver outstanding results, with the Bwgcolman Healing Service seeing 2,283 clients and completing 779 health checks. Our community services provided critical support including 6,698 placement nights through Family Care and 1,439 nights of care at our Safe House.

Our social enterprises have reached a record 44 staff. The Digital Service Centre, in partnership with Telstra, now employs 21 Palm Islanders taking calls from across Australia — proving that remote Indigenous communities can participate fully in the national economy.

I want to thank our Board, our staff, our partners, and most importantly the Palm Island community for their continued trust and engagement. Together, we are building a stronger future for Bwgcolman.',
     'Decisions about Palm Island children and families are now being made by Palm Island people — this is self-determination in action.',
     'We are building a stronger future for Bwgcolman.',
     true, 1),
    (picc_org_id, 'board', 'Luella Bligh', 'Chair of the Board', 'Chair''s Report',
     'On behalf of the Board of Directors, I am pleased to present the Palm Island Community Company Annual Report for 2023-24.

This has been an exceptional year for our organisation. The Board is proud of the growth PICC has achieved — not just in numbers, but in the depth and quality of services we deliver to our community.

The granting of Delegated Authority through the Bwgcolman Way service is a historic moment for Palm Island. For the first time, decisions about the safety and wellbeing of our children are being made here, by our people, in our community. This is what self-determination looks like in practice.

The Board has maintained strong governance throughout this period of growth, ensuring that PICC operates with transparency, accountability, and always in the best interests of the Palm Island community. We continue to meet all regulatory requirements under ORIC, ACNC, and ASIC.

I want to acknowledge our CEO Rachel Atkinson and the entire PICC leadership team for their dedication. I also want to thank my fellow Board members — Rhonda Phillips, Allan Palm Island, Matthew Lindsay, Harriet Hulthen, Raymond W. Palmer Snr, and Cassie Lang — for their service and commitment.

Most importantly, I want to thank the Palm Island community. Everything we do is for you, and because of you.',
     'For the first time, decisions about the safety and wellbeing of our children are being made here, by our people, in our community.',
     'This is what self-determination looks like in practice.',
     true, 2)
  ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- 4. GOVERNANCE ACHIEVEMENTS (from System 3 + data-2024.ts)
  -- ==========================================================================
  INSERT INTO governance_achievements (organization_id, fiscal_year, achievement_text, category, display_order) VALUES
    (picc_org_id, 2024, 'PICC continues to have an average of over 80 per cent of its staff members identifying as Aboriginal, Torres Strait Islander or both.', 'staffing', 1),
    (picc_org_id, 2024, 'The proportion of staff members living on Palm Island is still above 70 per cent.', 'staffing', 2),
    (picc_org_id, 2024, 'Staff grew 30% from 151 (June 2023) to 197 (June 2024), the largest annual increase in PICC history.', 'staffing', 3),
    (picc_org_id, 2024, 'Received Delegated Authority through Bwgcolman Way service — first of its kind in Queensland for an ATSICCO.', 'service_delivery', 4),
    (picc_org_id, 2024, 'Presented at SNAICC National Conference 2023 on the Delegated Authority model.', 'recognition', 5),
    (picc_org_id, 2024, 'Social enterprises reached record 44 staff — approximately 25% of total workforce.', 'economic', 6),
    (picc_org_id, 2024, 'Digital Service Centre expanded to 21 workers in partnership with Telstra.', 'partnership', 7),
    (picc_org_id, 2024, 'Restructured Women''s Healing Service into three dedicated streams for better support.', 'service_delivery', 8),
    (picc_org_id, 2024, 'Bwgcolman Healing Service renewed RACGP Quality Practice Accreditation.', 'accreditation', 9),
    (picc_org_id, 2024, 'Annual Report produced in-house for the first time by PICC Communications and Design team.', 'capability', 10)
  ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- 5. ANNUAL FINANCIALS (3 years from System 3 + data-2024.ts)
  -- ==========================================================================
  INSERT INTO annual_financials (organization_id, fiscal_year, current_assets, non_current_assets, current_liabilities, non_current_liabilities, total_income, labour_costs, administration_expenses, property_energy_expenses, motor_vehicle_expenses, travel_training_expenses, client_related_costs, audited, notes)
  VALUES
    -- FY2024 (2023-24)
    (picc_org_id, 2024, 8500000, 2400000, 6300000, 1100000, 23400000, 14700000, 3300000, 1200000, 700000, 1600000, 2200000, true, '2023-24 audited financial statements'),
    -- FY2023 (2022-23)
    (picc_org_id, 2023, 8100000, 2200000, 5800000, 1000000, 20200000, 12600000, 2900000, 1050000, 580000, 1400000, 1800000, true, '2022-23 audited financial statements'),
    -- FY2022 (2021-22)
    (picc_org_id, 2022, 7200000, 2000000, 5100000, 900000, 17500000, 10800000, 2500000, 950000, 520000, 1200000, 1500000, true, '2021-22 audited financial statements')
  ON CONFLICT (organization_id, fiscal_year) DO NOTHING;

  -- ==========================================================================
  -- 6. STAFF STATISTICS (5 years)
  -- ==========================================================================
  INSERT INTO staff_statistics (organization_id, fiscal_year, snapshot_date, total_staff, indigenous_staff_count, palm_island_resident_count, notes)
  VALUES
    (picc_org_id, 2024, '2024-06-30', 197, 158, 138, 'Record high. 30% growth year-on-year. Social enterprises: 44 staff.'),
    (picc_org_id, 2023, '2023-06-30', 151, 121, 106, 'Stable workforce with growth in social enterprises.'),
    (picc_org_id, 2022, '2022-06-30', 152, 122, 106, 'Steady growth following community control transition.'),
    (picc_org_id, 2021, '2021-06-30', 130, 104, 91, 'Transitioned to full community control 30 Sept 2021.'),
    (picc_org_id, 2020, '2020-06-30', 120, 96, 84, 'Operations maintained through COVID-19 pandemic.')
  ON CONFLICT (organization_id, fiscal_year, snapshot_date) DO NOTHING;

  -- ==========================================================================
  -- 7. PARTNERS (from System 3 seeds + data-2024.ts expanded list)
  -- ==========================================================================
  INSERT INTO partners (organization_id, name, partner_type, display_order, show_in_annual_report) VALUES
    (picc_org_id, 'Queensland Government Department of Child Safety', 'government', 1, true),
    (picc_org_id, 'Queensland Health', 'government', 2, true),
    (picc_org_id, 'Commonwealth Department of Health and Aged Care', 'government', 3, true),
    (picc_org_id, 'National Indigenous Australians Agency (NIAA)', 'government', 4, true),
    (picc_org_id, 'Department of Social Services', 'government', 5, true),
    (picc_org_id, 'National Disability Insurance Agency (NDIA)', 'government', 6, true),
    (picc_org_id, 'Telstra', 'corporate', 7, true),
    (picc_org_id, 'Townsville University Hospital', 'health', 8, true),
    (picc_org_id, 'James Cook University', 'education', 9, true),
    (picc_org_id, 'Mater Hospital', 'health', 10, true),
    (picc_org_id, 'Royal Flying Doctor Service', 'health', 11, true),
    (picc_org_id, 'CheckUP Queensland', 'health', 12, true),
    (picc_org_id, 'North Queensland Primary Health Network', 'health', 13, true),
    (picc_org_id, 'TAFE Queensland', 'education', 14, true),
    (picc_org_id, 'Palm Island Aboriginal Shire Council', 'government', 15, true),
    (picc_org_id, 'Bwgcolman Community School', 'education', 16, true),
    (picc_org_id, 'SNAICC', 'peak_body', 17, true),
    (picc_org_id, 'QATSICPP', 'peak_body', 18, true),
    (picc_org_id, 'Act for Kids', 'community', 19, true),
    (picc_org_id, 'Relationships Australia', 'community', 20, true),
    (picc_org_id, 'Anglicare', 'community', 21, true),
    (picc_org_id, 'Lives Lived Well', 'community', 22, true),
    (picc_org_id, 'Fred Hollows Foundation', 'health', 23, true)
  ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- 8. SERVICE METRICS (linked to organization_services)
  -- ==========================================================================

  -- Bwgcolman Healing Service
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'bwgcolman-healing' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, clients_served, sessions_delivered, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 2283, 17488, 35, 'RACGP Quality Practice Accreditation renewed', '2,283', 'clients seen')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Family Wellbeing Centre
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'family_wellbeing' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, clients_served, sessions_delivered, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 450, 1227, 18, '136 new referrals, 1,227 case plan sessions delivered', '1,227', 'case plan sessions')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Youth Services
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'youth_services' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 8, 'School holiday programs expanded', '50+', 'youth per program')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Digital Service Centre
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'digital_services' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 21, 'Expanded to 21 workers in Telstra partnership', '21', 'Palm Island workers')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Community Justice
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'community_justice' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, clients_served, sessions_delivered, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 1253, 4034, 8, '1,253 referrals processed with 4,034 participant sessions', '1,253', 'referrals')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Women's Services
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'womens_services' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, clients_served, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 1110, 12, '1,110 women accessed DFV services. Restructured into 3 dedicated streams.', '1,110', 'women supported')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Economic Development
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'economic_development' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 44, 'Social enterprises reached record 44 staff — 25% of total workforce', '44', 'social enterprise staff')
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- Elder Support Services
  SELECT id INTO svc_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'elder_support' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO service_metrics (organization_service_id, fiscal_year, staff_count, key_achievement, headline_stat_value, headline_stat_label)
    VALUES (svc_id, 2024, 6, 'Elder-led cultural healing programs expanded', null, null)
    ON CONFLICT (organization_service_id, fiscal_year) DO NOTHING;
  END IF;

  -- ==========================================================================
  -- 9. ANNUAL REPORT + REPORT STATISTICS + REPORT HIGHLIGHTS
  -- ==========================================================================

  -- Ensure the 2023-24 report exists
  SELECT id INTO report_id FROM annual_reports
  WHERE organization_id = picc_org_id AND report_year = 2024 LIMIT 1;

  IF report_id IS NULL THEN
    INSERT INTO annual_reports (
      organization_id, report_year, fiscal_year,
      reporting_period_start, reporting_period_end,
      title, subtitle, status, report_type,
      executive_summary, looking_forward, acknowledgments
    ) VALUES (
      picc_org_id, 2024, '2023-24',
      '2023-07-01', '2024-06-30',
      'Palm Island Community Company Annual Report 2023-2024',
      'Our Community, Our Future, Our Way',
      'published', 'annual',
      'The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before. We now employ three times the number of people compared to ten years ago and our turnover has quadrupled.',
      'Despite our progress, we are acutely aware that we still have a long way to go. Palm Island continues to lag behind mainland communities in many areas of wellbeing. However, PICC is here to stay and to fight for Palm Islanders to have the services they deserve.',
      'The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people.'
    )
    RETURNING id INTO report_id;
  END IF;

  -- 9a. REPORT STATISTICS (20 metrics from data-2024.ts)
  IF report_id IS NOT NULL THEN
    INSERT INTO report_statistics (report_id, category, stat_label, stat_value, stat_unit, stat_description, comparison_previous_year, comparison_type, icon_name, is_key_metric, display_order) VALUES
      (report_id, 'workforce', 'Total Staff Members', '197', 'people', 'Total staff as at June 2024 (up from 151 in June 2023)', '151', 'increase', 'Users', true, 1),
      (report_id, 'workforce', 'Staff Growth Since Last Year', '30%', 'percentage', 'Growth from 151 staff (June 2023) to 197 (June 2024)', null, null, 'TrendingUp', true, 2),
      (report_id, 'workforce', 'Aboriginal & Torres Strait Islander Staff', '80%+', 'percentage', 'Over 80% of PICC staff identify as Aboriginal and/or Torres Strait Islander', null, null, 'Heart', true, 3),
      (report_id, 'workforce', '10-Year Staff Growth', '3x', 'multiplier', 'From approximately 60 staff in 2014 to 197 in 2024', null, null, 'Rocket', false, 4),
      (report_id, 'service_delivery', 'Services Offered', '16', 'services', 'Comprehensive range of community services', null, null, null, false, 5),
      (report_id, 'health', 'Medical Clients Seen', '2,283', 'people', 'Patients at Bwgcolman Healing Service', null, null, null, false, 6),
      (report_id, 'health', 'Health Check (715) Completed', '779', 'checks', 'Annual health assessments', null, null, null, false, 7),
      (report_id, 'community_engagement', 'Families Supported', '2,500+', 'families', 'Through various family support programs', null, null, null, false, 8),
      (report_id, 'health', 'Child Health Checks', '128', 'checks', 'Child health checks completed through Bwgcolman Healing Service', null, null, 'Baby', true, 9),
      (report_id, 'health', 'Episodes of Care', '17,488', 'episodes', 'Total episodes of care delivered by primary health services', null, null, 'Activity', true, 10),
      (report_id, 'health', 'Chronic Disease Clients', '803', 'clients', 'Clients managed through chronic disease programs (GP Management Plans)', null, null, 'Stethoscope', false, 11),
      (report_id, 'financial', 'Total Income', '$23.4M', 'AUD', 'Total revenue for the 2023-2024 financial year', null, null, 'DollarSign', true, 12),
      (report_id, 'financial', 'Total Expenditure', '$23.7M', 'AUD', 'Total expenditure for the 2023-2024 financial year', null, null, 'Receipt', true, 13),
      (report_id, 'financial', 'Total Assets', '$10.9M', 'AUD', 'Total assets as at 30 June 2024 (up from $10.3M prior year)', null, null, 'Building2', false, 14),
      (report_id, 'financial', 'Net Assets', '$3.5M', 'AUD', 'Net asset position as at 30 June 2024', null, null, 'Landmark', false, 15),
      (report_id, 'service_delivery', 'Family Care Placement Nights', '6,698', 'nights', 'Total placement nights provided by Family Care service in 2023-24', null, null, 'Home', true, 16),
      (report_id, 'service_delivery', 'Safe House Nights of Care', '1,439', 'nights', 'Total nights of care at PICC Safe House', null, null, 'Shield', true, 17),
      (report_id, 'workforce', 'Social Enterprises Staff', '44', 'staff', 'Record number of staff across PICC social enterprises', null, null, 'Briefcase', true, 18),
      (report_id, 'outcomes', 'Partners & Collaborators', '40+', 'organisations', 'Government, corporate, and community partners supporting PICC programs', null, null, 'Handshake', false, 19),
      (report_id, 'outcomes', 'Digital Service Centre Workers', '21', 'workers', 'Palm Islanders employed at the Digital Service Centre in partnership with Telstra', null, null, 'Headphones', true, 20)
    ON CONFLICT DO NOTHING;

    -- 9b. REPORT HIGHLIGHTS (6 from data-2024.ts)
    INSERT INTO report_highlights (report_id, highlight_type, title, subtitle, description, impact_achieved, metrics, is_featured, display_order, display_style) VALUES
      (report_id, 'major_initiative', 'Palm Island Digital Service Centre', 'Telstra Partnership Creating Real Jobs',
       '21 Palm Islanders employed at the Digital Service Centre, taking customer service calls for Telstra from across Australia.',
       'Created 21 jobs on Palm Island with career progression pathways.',
       '{"sector": "Social Enterprise", "partner": "Telstra", "workers": 21}'::jsonb, true, 1, 'hero'),
      (report_id, 'major_initiative', 'Delegated Authority - Bwgcolman Way', 'First-of-its-kind in Queensland',
       'PICC became one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to receive Delegated Authority for child protection decisions.',
       'Child protection decisions for Palm Island children and families are now made locally by trained Aboriginal workers.',
       '{"conference": "SNAICC National Conference 2023", "achievement": "First ATSICCO in QLD with Delegated Authority"}'::jsonb, true, 2, 'hero'),
      (report_id, 'service_expansion', 'Women''s Healing Service Restructured', 'Three Dedicated Streams for Better Support',
       'The Women''s Healing Service was restructured into three dedicated streams: healing, DFV crisis response, and community education.',
       '1,110 women accessed DFV services. Clearer pathways mean women get crisis support immediately and healing support when they are ready.',
       '{"streams": 3, "women_served": 1110}'::jsonb, true, 3, 'card'),
      (report_id, 'milestone', 'Record Social Enterprise Employment', '44 Staff Across PICC Social Enterprises',
       'PICC social enterprises reached a record 44 staff members — approximately 25% of the entire PICC workforce.',
       'Demonstrated that community-owned social enterprises can create sustainable employment in a remote community.',
       '{"total_enterprise_staff": 44, "percentage_of_workforce": 25}'::jsonb, true, 4, 'card'),
      (report_id, 'achievement', 'SNAICC National Conference Presentation', 'Sharing the Palm Island Model Nationally',
       'PICC presented at the SNAICC National Conference in 2023, sharing the Bwgcolman Way Delegated Authority model.',
       'National recognition of PICC as a leader in Aboriginal community-controlled child protection.',
       '{"topic": "Delegated Authority", "conference": "SNAICC National 2023"}'::jsonb, false, 5, 'card'),
      (report_id, 'milestone', '197 Staff — 30% Growth in One Year', 'Largest Employer on Palm Island',
       'PICC grew from 151 staff (June 2023) to 197 staff (June 2024) — a 30% increase in a single year.',
       'PICC is the largest employer on Palm Island, creating meaningful careers.',
       '{"staff_2023": 151, "staff_2024": 197, "growth_percent": 30, "indigenous_percent": 80}'::jsonb, true, 6, 'stat')
    ON CONFLICT DO NOTHING;

    -- 9c. REPORT SECTIONS (16 from data-2024.ts)
    -- Clear existing sections for this report to avoid duplicates
    DELETE FROM report_sections WHERE report_id = report_id;

    INSERT INTO report_sections (report_id, section_type, section_title, section_content, display_order) VALUES
      (report_id, 'leadership_message', 'Message from the CEO',
       'This year, I am so proud to introduce our Annual Report, published by our own PICC Communications and Design team. In 2023-24, PICC has continued to grow, reflecting the community''s trust and the quality of services we provide. We now employ 197 staff — a 30% increase from the prior year — with over 80% identifying as Aboriginal and/or Torres Strait Islander, and more than 70% living on Palm Island.

Our health services have expanded significantly with the Bwgcolman Healing Service seeing 2,283 clients and completing 779 health checks. Our community services continue to provide critical support — Family Care managed 6,698 placement nights, and our Safe House provided 1,439 nights of care.

A landmark achievement this year was receiving Delegated Authority through our Bwgcolman Way service, making PICC one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to receive this responsibility. This means decisions about Palm Island children and families are now being made by Palm Island people.

Our social enterprises have reached a record 44 staff — approximately 25% of all PICC employees — demonstrating that community-owned businesses can create meaningful employment. The Digital Service Centre, in partnership with Telstra, now employs 21 Palm Islanders taking calls from across Australia.

I would also like to acknowledge our 40+ partners across government, corporate, and community sectors who make this work possible.', 1),
      (report_id, 'about_picc', 'About Palm Island Community Company',
       'Palm Island Community Company (PICC) is the largest employer on Palm Island, operating 16 services across health, community services, family support, social enterprises, and cultural programs. PICC is a not-for-profit, Aboriginal and Torres Strait Islander community-controlled organisation governed by a Board of Directors, all of whom are Aboriginal and/or Torres Strait Islander people.

PICC was established to deliver services that strengthen families, improve health outcomes, and create economic opportunities for Palm Island people. Our approach is grounded in self-determination — the belief that Palm Island people are best placed to design and deliver services for their own community.

In 2023-24, PICC employed 197 staff members, with over 80% identifying as Aboriginal and/or Torres Strait Islander. More than 70% of our workforce lives on Palm Island, ensuring that services are delivered by people who understand the community.', 2),
      (report_id, 'history', 'Our History',
       'Palm Island Community Company (PICC) has grown from a small community organisation into the largest employer on Palm Island, delivering 16 services and employing 197 staff.

Palm Island (Bwgcolman) is a community of approximately 3,800 people located 65km north-west of Townsville in the Great Barrier Reef. The Traditional Owners are the Manbarra people. Palm Island has a complex history, having been used as a government-controlled reserve from 1918 where Aboriginal people from across Queensland were forcibly relocated.', 3),
      (report_id, 'services_overview', 'Our 16 Services',
       'PICC delivers 16 services across four key areas: Health Services (Bwgcolman Healing Service — 2,283 clients, 17,488 episodes of care), Community & Family Services (Family Care — 6,698 placement nights, Safe House — 1,439 nights, Diversionary Service — 1,253 referrals, Women''s Service — 1,110 women), Social Enterprises (Digital Service Centre — 21 workers, Construction & Maintenance, Store/Retail), and Corporate (Communications & Design).', 4),
      (report_id, 'delegated_authority', 'Delegated Authority: Bwgcolman Way',
       'In 2023-24, PICC achieved a historic milestone — receiving Delegated Authority through the Bwgcolman Way service. This makes PICC one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to hold Delegated Authority for child protection decisions.

Delegated Authority means that decisions about the safety, care, and wellbeing of Palm Island children and families are now made by Palm Island people.', 5),
      (report_id, 'health_data', 'Health Service Impact',
       'The Bwgcolman Healing Service: 2,283 total clients seen, 17,488 episodes of care, 779 adult health checks (715s), 128 child health checks, 803 chronic disease clients managed.', 6),
      (report_id, 'financial_summary', 'Financial Overview',
       'Total Income: $23.4 million. Total Expenditure: $23.7 million. Total Assets: $10.9 million (up from $10.3 million). Net Assets: $3.5 million. Growth from $14M to $23.4M revenue over recent years.', 7),
      (report_id, 'staff_workforce', 'Our People',
       '197 total staff members. 80%+ identify as Aboriginal and/or Torres Strait Islander. 70%+ live on Palm Island. 30% year-on-year growth. 44 staff in social enterprises (record high). 10-year growth: approximately 3x increase.', 8),
      (report_id, 'partnerships', 'Our Partners',
       'PICC works with over 40 partners across government, corporate, academic, and community sectors including Queensland Government, Queensland Health, NIAA, Telstra, James Cook University, SNAICC, QATSICPP, and many more.', 9),
      (report_id, 'looking_forward', 'Looking Ahead',
       'Priorities for 2024-25: Expanding Delegated Authority, Social Enterprises Growth, Health Service Enhancement, Workforce Development, Infrastructure improvements, Cultural Programs strengthening.', 10),
      (report_id, 'acknowledgments', 'Acknowledgments',
       'Palm Island Community Company acknowledges the Traditional Owners of Bwgcolman (Palm Island), the Manbarra people, and pays respects to Elders past, present, and emerging. This Annual Report was designed and produced by PICC''s Communications and Design team.', 11),
      (report_id, 'corporate_governance', 'Corporate Governance',
       'PICC is governed by a Board of Directors comprising seven members, all of whom are Aboriginal and/or Torres Strait Islander people: Luella Bligh (Chair), Rhonda Phillips (Director), Allan Palm Island (Director), Matthew Lindsay (Company Secretary), Harriet Hulthen (Director), Raymond W. Palmer Snr (Director), Cassie Lang (Director). Executive Leadership: Rachel Atkinson (CEO).', 14),
      (report_id, 'service_highlight', 'Palm Islanders take calls from across Australia',
       '21 Palm Islanders are now employed at the Digital Service Centre, taking customer service calls for Telstra from across Australia. This ground-breaking partnership demonstrates that remote Indigenous communities can successfully participate in the digital economy.', 15),
      (report_id, 'service_highlight', 'New Bwgcolman Way Service brings Delegated Authority',
       'The establishment of the Bwgcolman Way service and the granting of Delegated Authority represents a watershed moment for Palm Island and for Aboriginal and Torres Strait Islander self-determination in Queensland.', 16),
      (report_id, 'service_highlight', 'The Women''s Healing Service is Giving Better Help',
       'In 2023-24, the Women''s Healing Service underwent a significant restructure into three dedicated streams: Healing, DFV Response, and Community Education. 1,110 women accessed DFV services.', 17),
      (report_id, 'health_services', 'Primary Health Services (Bwgcolman Healing Service)',
       'Total clients seen: 2,283. Health Checks (715) - Adults: 779. Health Checks - Children: 128. Chronic Disease clients (GPMPs): 803. Total episodes of care: 17,488.', 18);
  END IF;

  RAISE NOTICE 'Seed complete. PICC org: %, Report: %', picc_org_id, report_id;
END $$;

-- ==========================================================================
-- VERIFICATION
-- ==========================================================================
SELECT 'organization_stats' as tbl, count(*) FROM organization_stats
UNION ALL SELECT 'board_members', count(*) FROM board_members
UNION ALL SELECT 'leadership', count(*) FROM leadership
UNION ALL SELECT 'governance_achievements', count(*) FROM governance_achievements
UNION ALL SELECT 'annual_financials', count(*) FROM annual_financials
UNION ALL SELECT 'staff_statistics', count(*) FROM staff_statistics
UNION ALL SELECT 'partners', count(*) FROM partners
UNION ALL SELECT 'service_metrics', count(*) FROM service_metrics
UNION ALL SELECT 'report_statistics', count(*) FROM report_statistics
UNION ALL SELECT 'report_highlights', count(*) FROM report_highlights
UNION ALL SELECT 'report_sections', count(*) FROM report_sections;

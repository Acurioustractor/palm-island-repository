-- ============================================================================
-- Migration: 002_sample_seed_data.sql
-- Purpose: Insert realistic sample data for annual report system testing
-- Created: 2025-01-29
-- ============================================================================

-- ============================================================================
-- SECTION 1: Annual Financials Data
-- ============================================================================
-- Sample financial data for years 2023, 2024, 2025
-- Represents a growing Indigenous community organization with ~$10M budget
-- Labour costs maintained at ~60% of expenditure (typical for services sector)
-- Shows healthy year-over-year growth

INSERT INTO annual_financials 
  (financial_year, total_income, grant_funding, service_revenue, donations, 
   other_income, total_expenditure, labour_costs, operational_costs, capital_costs, 
   created_at, updated_at)
VALUES
  -- 2023 Financial Year
  (
    2023,
    8450000.00,      -- total_income: $8.45M
    7200000.00,      -- grant_funding: ~85% of income
    950000.00,       -- service_revenue: user fees, accommodation
    200000.00,       -- donations: community support
    100000.00,       -- other_income: interest, miscellaneous
    8200000.00,      -- total_expenditure
    4920000.00,      -- labour_costs: 60% of expenditure ($4.92M for ~80 FTE)
    2480000.00,      -- operational_costs: facilities, utilities, supplies
    800000.00,       -- capital_costs: equipment, vehicles, infrastructure
    NOW(),
    NOW()
  ),
  -- 2024 Financial Year (8% growth)
  (
    2024,
    9126000.00,      -- total_income: $9.13M (+7.98%)
    7750000.00,      -- grant_funding: increased funding
    1050000.00,      -- service_revenue: growing service uptake
    220000.00,       -- donations: steady community support
    106000.00,       -- other_income: improved investment returns
    8856000.00,      -- total_expenditure: +8%
    5313600.00,      -- labour_costs: $5.31M for additional staff
    2656800.00,      -- operational_costs: increased as programs scale
    885600.00,       -- capital_costs: new equipment, vehicle replacement
    NOW(),
    NOW()
  ),
  -- 2025 Financial Year (10% growth)
  (
    2025,
    10038600.00,     -- total_income: $10.04M (+10%)
    8450000.00,      -- grant_funding: expanded contracts
    1260000.00,      -- service_revenue: increased throughput
    240000.00,       -- donations: growing donor support
    88600.00,        -- other_income: investment income
    9741600.00,      -- total_expenditure: +10%
    5844960.00,      -- labour_costs: $5.84M for expanded workforce
    2922480.00,      -- operational_costs: supporting larger operations
    974160.00        -- capital_costs: new facility improvements
    NOW(),
    NOW()
  )
ON CONFLICT (financial_year) DO UPDATE SET
  total_income = EXCLUDED.total_income,
  grant_funding = EXCLUDED.grant_funding,
  service_revenue = EXCLUDED.service_revenue,
  donations = EXCLUDED.donations,
  other_income = EXCLUDED.other_income,
  total_expenditure = EXCLUDED.total_expenditure,
  labour_costs = EXCLUDED.labour_costs,
  operational_costs = EXCLUDED.operational_costs,
  capital_costs = EXCLUDED.capital_costs,
  updated_at = NOW();


-- ============================================================================
-- SECTION 2: Staff Statistics Data
-- ============================================================================
-- Snapshot of staffing at 30 June each financial year
-- Shows growth from 82 to 95 staff
-- Maintains ~80% Indigenous staff and ~70% Palm Island residents
-- Reflects expansion of core services

INSERT INTO staff_statistics
  (snapshot_date, total_staff, indigenous_staff_count, palm_island_residents_count, 
   created_at, updated_at)
VALUES
  -- 30 June 2023
  (
    '2023-06-30'::DATE,
    82,              -- total_staff: 82 FTE + casual
    66,              -- indigenous_staff_count: 80.5%
    57,              -- palm_island_residents: 69.5%
    NOW(),
    NOW()
  ),
  -- 30 June 2024
  (
    '2024-06-30'::DATE,
    89,              -- total_staff: 89 FTE (growth of 7 staff)
    71,              -- indigenous_staff_count: 79.8%
    63,              -- palm_island_residents: 70.8%
    NOW(),
    NOW()
  ),
  -- 30 June 2025
  (
    '2025-06-30'::DATE,
    95,              -- total_staff: 95 FTE (growth of 6 staff)
    76,              -- indigenous_staff_count: 80%
    67,              -- palm_island_residents: 70.5%
    NOW(),
    NOW()
  )
ON CONFLICT (snapshot_date) DO UPDATE SET
  total_staff = EXCLUDED.total_staff,
  indigenous_staff_count = EXCLUDED.indigenous_staff_count,
  palm_island_residents_count = EXCLUDED.palm_island_residents_count,
  updated_at = NOW();


-- ============================================================================
-- SECTION 3: Service Metrics Data (2025)
-- ============================================================================
-- Key performance indicators across major service areas
-- Includes headline statistics for annual report dashboard
-- Metrics demonstrate scale and impact of organization

INSERT INTO service_metrics
  (calendar_year, service_name, headline_stat_label, headline_stat_value, 
   additional_context, created_at, updated_at)
VALUES
  -- Counselling & Mental Health Services
  (
    2025,
    'Mental Health & Counselling',
    'counselling sessions delivered',
    '1,847',
    'Individual and group therapy sessions provided to community members',
    NOW(),
    NOW()
  ),
  -- Family Support Programs
  (
    2025,
    'Family Support',
    'families supported',
    '456',
    'Intensive case management and family support interventions',
    NOW(),
    NOW()
  ),
  -- Education & Training
  (
    2025,
    'Education & Training',
    'participants completed programs',
    '523',
    'TAFE and tertiary education pathways, vocational training completions',
    NOW(),
    NOW()
  ),
  -- Youth Services
  (
    2025,
    'Youth Services',
    'young people engaged',
    '634',
    'Youth mentoring, after-school programs, recreational activities',
    NOW(),
    NOW()
  ),
  -- Elder Support Services
  (
    2025,
    'Elder Support',
    'elder visits completed',
    '892',
    'In-home aged care support, social connection programs, health checks',
    NOW(),
    NOW()
  ),
  -- Community Health Services
  (
    2025,
    'Community Health',
    'health appointments delivered',
    '2,341',
    'Primary health care, chronic disease management, health screenings',
    NOW(),
    NOW()
  ),
  -- Housing & Accommodation
  (
    2025,
    'Housing Support',
    'accommodation places provided',
    '78',
    'Transitional and supported housing for vulnerable community members',
    NOW(),
    NOW()
  ),
  -- Aboriginal Cultural Programs
  (
    2025,
    'Cultural Programs',
    'cultural events & workshops',
    '34',
    'Language preservation, traditional knowledge, cultural celebrations',
    NOW(),
    NOW()
  )
ON CONFLICT (calendar_year, service_name) DO UPDATE SET
  headline_stat_label = EXCLUDED.headline_stat_label,
  headline_stat_value = EXCLUDED.headline_stat_value,
  additional_context = EXCLUDED.additional_context,
  updated_at = NOW();


-- ============================================================================
-- SECTION 4: Governance Achievements (2025)
-- ============================================================================
-- Key organizational milestones and achievements
-- Demonstrates progress in staffing, accreditation, and partnerships

INSERT INTO governance_achievements
  (calendar_year, achievement_category, achievement_title, achievement_description, 
   created_at, updated_at)
VALUES
  -- Staffing Achievement
  (
    2025,
    'Staffing Development',
    '100% Certified Workforce in Mental Health Services',
    'All mental health staff completed accredited trauma-informed and cultural safety training. Achieved 80% Indigenous staff representation across organization, exceeding sector targets.',
    NOW(),
    NOW()
  ),
  -- Accreditation Achievement
  (
    2025,
    'Accreditation & Compliance',
    'ISO 9001:2015 Certification',
    'Organization achieved formal ISO 9001 quality management certification, demonstrating commitment to continuous improvement and service excellence across all programs.',
    NOW(),
    NOW()
  ),
  -- Partnership Achievement
  (
    2025,
    'Strategic Partnerships',
    'Government Services Co-Location Agreement',
    'Established formal partnership with Queensland Health and QIMR Berghofer to deliver integrated health services. Co-located allied health professionals reduced barriers for community access.',
    NOW(),
    NOW()
  ),
  -- Community Leadership
  (
    2025,
    'Community Leadership',
    'Established Community Advisory Board',
    'Formalized Community Advisory Board with 15 community representatives providing governance oversight and cultural guidance. Quarterly meetings ensure accountability and cultural alignment.',
    NOW(),
    NOW()
  )
ON CONFLICT (calendar_year, achievement_title) DO UPDATE SET
  achievement_category = EXCLUDED.achievement_category,
  achievement_description = EXCLUDED.achievement_description,
  updated_at = NOW();


-- ============================================================================
-- End of Migration: 002_sample_seed_data.sql
-- ============================================================================
-- Summary of inserted data:
-- - 3 years of annual financial records (2023-2025)
-- - 3 staff snapshot records (June 2023, 2024, 2025)
-- - 8 service metrics for 2025
-- - 4 governance achievements for 2025
-- ============================================================================

-- ============================================================================
-- SEED DATA: PICC FY 2024-25 (July 2024 to June 2025)
-- Source: Annual Report PDF
-- Requires: 20260130_consolidated_annual_reports.sql
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID;
BEGIN
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC' LIMIT 1;

  IF picc_org_id IS NULL THEN
    RAISE EXCEPTION 'PICC organization not found.';
  END IF;

  -- ==========================================================================
  -- 1. ANNUAL FINANCIALS — FY2025
  -- ==========================================================================
  INSERT INTO annual_financials (
    organization_id, fiscal_year,
    current_assets, non_current_assets,
    current_liabilities, non_current_liabilities,
    total_income,
    labour_costs, administration_expenses,
    property_energy_expenses, motor_vehicle_expenses,
    travel_training_expenses, client_related_costs,
    audited, notes
  ) VALUES (
    picc_org_id, 2025,
    8858764, 2000000,
    5320523, 2000000,
    23400335,
    14282962, 5000820,
    1058084, 401112,
    1778367, 1156713,
    true,
    'FY 2024-25 audited. Income $23.4M, Expenditure $23.68M, Net Deficit -$277,723. Total Assets $10.86M, Net Assets $3.54M.'
  )
  ON CONFLICT (organization_id, fiscal_year) DO UPDATE SET
    current_assets = EXCLUDED.current_assets,
    non_current_assets = EXCLUDED.non_current_assets,
    current_liabilities = EXCLUDED.current_liabilities,
    non_current_liabilities = EXCLUDED.non_current_liabilities,
    total_income = EXCLUDED.total_income,
    labour_costs = EXCLUDED.labour_costs,
    administration_expenses = EXCLUDED.administration_expenses,
    property_energy_expenses = EXCLUDED.property_energy_expenses,
    motor_vehicle_expenses = EXCLUDED.motor_vehicle_expenses,
    travel_training_expenses = EXCLUDED.travel_training_expenses,
    client_related_costs = EXCLUDED.client_related_costs,
    audited = EXCLUDED.audited,
    notes = EXCLUDED.notes;

  -- ==========================================================================
  -- 2. STAFF STATISTICS — FY2025
  -- ==========================================================================
  INSERT INTO staff_statistics (
    organization_id, fiscal_year, snapshot_date,
    total_staff, indigenous_staff_count, palm_island_resident_count,
    notes
  ) VALUES (
    picc_org_id, 2025, '2025-06-30',
    210, 168, 147,
    'FY2024-25: 210 total staff, ~80% Indigenous, ~70% Palm Island residents.'
  )
  ON CONFLICT (organization_id, fiscal_year, snapshot_date) DO UPDATE SET
    total_staff = EXCLUDED.total_staff,
    indigenous_staff_count = EXCLUDED.indigenous_staff_count,
    palm_island_resident_count = EXCLUDED.palm_island_resident_count,
    notes = EXCLUDED.notes;

  -- ==========================================================================
  -- 3. ORGANIZATION STATS — FY2025
  -- ==========================================================================
  INSERT INTO organization_stats (
    organization_id, fiscal_year,
    staff_count, service_count, people_served,
    annual_budget, indigenous_staff_percentage, local_staff_percentage,
    notes
  ) VALUES (
    picc_org_id, '2024-25',
    210, 16, '2,500+ across all services',
    23400335, '80%+', '70%+',
    'FY2024-25 annual report data'
  )
  ON CONFLICT (organization_id, fiscal_year) DO UPDATE SET
    staff_count = EXCLUDED.staff_count,
    annual_budget = EXCLUDED.annual_budget,
    notes = EXCLUDED.notes;

  -- ==========================================================================
  -- 4. BACKFILL FY2023 staff if missing (151 staff)
  -- ==========================================================================
  INSERT INTO staff_statistics (
    organization_id, fiscal_year, snapshot_date,
    total_staff, indigenous_staff_count, palm_island_resident_count,
    notes
  ) VALUES (
    picc_org_id, 2023, '2023-06-30',
    151, 121, 106,
    'FY2022-23 backfill for 3-year trend analysis'
  )
  ON CONFLICT (organization_id, fiscal_year, snapshot_date) DO NOTHING;

  RAISE NOTICE 'FY 2024-25 seed complete for org: %', picc_org_id;
END $$;

-- Verify
SELECT fiscal_year, total_income, labour_costs,
  (current_assets + non_current_assets) as total_assets,
  (current_liabilities + non_current_liabilities) as total_liabilities
FROM annual_financials ORDER BY fiscal_year DESC;

SELECT fiscal_year, total_staff, indigenous_staff_count, palm_island_resident_count
FROM staff_statistics ORDER BY fiscal_year DESC;

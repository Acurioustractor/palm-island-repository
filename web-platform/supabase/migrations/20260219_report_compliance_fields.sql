-- Add compliance fields to annual_reports table for CATSI Act / ORIC requirements
ALTER TABLE annual_reports
  ADD COLUMN IF NOT EXISTS auditor_name text,
  ADD COLUMN IF NOT EXISTS auditor_firm text,
  ADD COLUMN IF NOT EXISTS audit_opinion text DEFAULT 'unqualified',
  ADD COLUMN IF NOT EXISTS icn_number text,
  ADD COLUMN IF NOT EXISTS members_count integer,
  ADD COLUMN IF NOT EXISTS agm_date date,
  ADD COLUMN IF NOT EXISTS board_meetings_held integer,
  ADD COLUMN IF NOT EXISTS directors_declaration text,
  ADD COLUMN IF NOT EXISTS revenue_by_funder jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prior_year_financials jsonb;

-- Add comment for documentation
COMMENT ON COLUMN annual_reports.icn_number IS 'Indigenous Corporation Number (ORIC registration)';
COMMENT ON COLUMN annual_reports.audit_opinion IS 'Auditor opinion type: unqualified, qualified, adverse, disclaimer';
COMMENT ON COLUMN annual_reports.revenue_by_funder IS 'JSON array of {funder, amount, percentage} for revenue attribution';
COMMENT ON COLUMN annual_reports.prior_year_financials IS 'JSON object with prior year total_income, total_expenditure, net_result for comparison';

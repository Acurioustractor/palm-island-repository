# Validation Examples

## Example 1: All Checks Pass ✓

### Command
```bash
python validate_data.py --year 2024
```

### Output
```
======================================================================
Database Validation for 2024 Annual Report
======================================================================

Connected to Supabase ✓

Checking Required Tables:
----------------------------------------------------------------------
  ✅  Table: profiles                                  328 records
  ✅  Table: stories                                   156 records
  ✅  Table: board_members                             15 records
  ✅  Table: partners                                  42 records

Checking Annual Report Data:
----------------------------------------------------------------------
  ✅  Annual report eligible stories (≥5)              12 eligible stories
  ✅  Financial data (current + previous year)         Years 2023, 2024 ✓
  ✅  Staff statistics (past 3 years)                  Years 2022, 2023, 2024 ✓
  ✅  Leadership messages                              5 found

Validation Results:
----------------------------------------------------------------------
  ✅  Table: profiles                                  328 records
  ✅  Table: stories                                   156 records
  ✅  Table: board_members                             15 records
  ✅  Table: partners                                  42 records
  ✅  Annual report eligible stories (≥5)              12 eligible stories
  ✅  Financial data (current + previous year)         Years 2023, 2024 ✓
  ✅  Staff statistics (past 3 years)                  Years 2022, 2023, 2024 ✓
  ✅  Leadership messages                              5 found

Status: READY ✓
All checks passed!

======================================================================
```

### Exit Code
```
0
```

### Next Steps
Proceed with report generation:
```bash
python assemble_content.py --year 2024
```

---

## Example 2: Missing Annual Report Eligible Stories

### Output
```
Checking Annual Report Data:
----------------------------------------------------------------------
  ❌  Annual report eligible stories (≥5)              Only 2 found
  ✅  Financial data (current + previous year)         Years 2023, 2024 ✓
  ✅  Staff statistics (past 3 years)                  Years 2022, 2023, 2024 ✓
  ✅  Leadership messages                              3 found

Issues Found:
----------------------------------------------------------------------
  1. Only 2 stories marked as annual_report_eligible (need ≥5)

Suggested Actions:
----------------------------------------------------------------------
  1. Mark at least 3 more stories with annual_report_eligible=true

Status: NOT READY
Found 1 issue(s)
```

### Exit Code
```
1
```

### Fix
1. In Supabase, find stories you want to feature
2. Update them: `annual_report_eligible = true`
3. Run validation again:
   ```bash
   python validate_data.py --year 2024
   ```

---

## Example 3: Missing Financial Data

### Output
```
Checking Annual Report Data:
----------------------------------------------------------------------
  ✅  Annual report eligible stories (≥5)              8 eligible stories
  ❌  Financial data (current + previous year)         Missing: {2023}
  ✅  Staff statistics (past 3 years)                  Years 2022, 2023, 2024 ✓
  ✅  Leadership messages                              4 found

Issues Found:
----------------------------------------------------------------------
  1. Missing financial data for year(s): {2023}

Suggested Actions:
----------------------------------------------------------------------
  1. Add financial records for year(s) 2023

Status: NOT READY
Found 1 issue(s)
```

### Exit Code
```
1
```

### Fix
Add financial data for 2023:
```sql
INSERT INTO financial_data (
    year, 
    total_revenue, 
    total_expenses, 
    net_income,
    created_at
) VALUES (
    2023,
    1500000,
    1200000,
    300000,
    NOW()
);
```

Then validate again.

---

## Example 4: Multiple Issues

### Output
```
Checking Required Tables:
----------------------------------------------------------------------
  ✅  Table: profiles                                  328 records
  ❌  Table: stories                                   No data
  ✅  Table: board_members                             15 records
  ✅  Table: partners                                  42 records

Checking Annual Report Data:
----------------------------------------------------------------------
  ❌  Annual report eligible stories (≥5)             Cannot query...
  ❌  Financial data (current + previous year)         Missing: {2023, 2024}
  ❌  Staff statistics (past 3 years)                  Missing: {2022, 2023, 2024}
  ❌  Leadership messages                              None found

Issues Found:
----------------------------------------------------------------------
  1. Table 'stories' exists but has no records
  2. Cannot query annual_report_eligible stories
  3. Missing financial data for year(s): {2023, 2024}
  4. Missing staff statistics for year(s): {2022, 2023, 2024}
  5. No leadership messages found

Suggested Actions:
----------------------------------------------------------------------
  1. Populate the stories table with data
  2. Ensure the 'annual_report_eligible' column exists in stories table
  3. Add financial records for year(s) 2023, 2024
  4. Add staff statistics for year(s) 2022, 2023, 2024
  5. Create at least one story with story_type='leadership_message'

Status: NOT READY
Found 5 issue(s)
```

### Exit Code
```
1
```

### Fix Priority
1. **Critical**: Populate stories table (needed for everything else)
2. **High**: Add financial data for both years
3. **High**: Add staff statistics for all 3 years
4. **Medium**: Create leadership messages

---

## Example 5: Connection Error

### Output (no Supabase connection)
```
======================================================================
Database Validation for 2024 Annual Report
======================================================================

Issues Found:
----------------------------------------------------------------------
  1. Missing Supabase credentials

Suggested Actions:
----------------------------------------------------------------------
  1. Missing Supabase credentials: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables

Status: NOT READY
Found 1 issue(s)

======================================================================
```

### Exit Code
```
1
```

### Fix
Create `.env` file in scripts directory:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Or verify existing `.env` file and credentials are correct.

---

## Example 6: Partial Data for 3-Year Statistics

### Scenario
Validating 2024, but only have 2023 and 2024 staff data (missing 2022).

### Output
```
Checking Annual Report Data:
----------------------------------------------------------------------
  ✅  Annual report eligible stories (≥5)              9 eligible stories
  ✅  Financial data (current + previous year)         Years 2023, 2024 ✓
  ❌  Staff statistics (past 3 years)                  Missing: {2022}
  ✅  Leadership messages                              2 found

Issues Found:
----------------------------------------------------------------------
  1. Missing staff statistics for year(s): {2022}

Suggested Actions:
----------------------------------------------------------------------
  1. Add staff statistics for year(s) 2022

Status: NOT READY
Found 1 issue(s)
```

### Exit Code
```
1
```

### Fix
Add 2022 staff data:
```sql
INSERT INTO staff_statistics (year, full_time_count, part_time_count)
VALUES (2022, 18, 6);
```

---

## Testing the Script

### Test Connection
```bash
python validate_data.py --year 2024
```
Look for "Connected to Supabase ✓"

### Test with Different Years
```bash
python validate_data.py --year 2023
python validate_data.py --year 2022
```

### Check Exit Code
```bash
python validate_data.py --year 2024
echo "Exit code: $?"
```
- Shows `0` if all checks pass
- Shows `1` if issues found

### Integration Test
```bash
if python validate_data.py --year 2024; then
    echo "Ready for report generation"
    python assemble_content.py --year 2024
else
    echo "Database not ready, fix issues above"
    exit 1
fi
```

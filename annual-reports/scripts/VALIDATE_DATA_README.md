# Database Validation Script

## Overview

`validate_data.py` is a comprehensive database validation tool that checks if your Supabase database is ready for annual report generation. It performs automated checks and provides clear, actionable feedback.

## Features

- **Colorful Output**: Easy-to-read status indicators (✅/❌/⚠️)
- **Comprehensive Checks**: Validates all required data for annual reports
- **Actionable Suggestions**: Specific recommendations to fix any issues
- **Exit Codes**: Proper exit codes (0 = success, 1 = issues) for automation
- **Year Flexibility**: Check any year with `--year` argument

## Requirements

```bash
pip install supabase python-dotenv
```

## Environment Setup

The script requires Supabase credentials in your `.env` file or environment:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or uses the anon key as fallback:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Usage

### Check Current Year (Default)
```bash
python validate_data.py
```

### Check Specific Year
```bash
python validate_data.py --year 2024
```

### Check Help
```bash
python validate_data.py --help
```

## What It Checks

### Required Tables
- ✅ `profiles` - Has records
- ✅ `stories` - Has records
- ✅ `board_members` - Has records
- ✅ `partners` - Has records

### Annual Report Data
1. **Annual Report Eligible Stories** (≥5 required)
   - Stories with `annual_report_eligible = true`
   - Use case: Feature stories in the report

2. **Financial Data** (current + previous year required)
   - Table: `financial_data`
   - Column: `year`
   - Example: Check for 2023 and 2024 data when validating 2024

3. **Staff Statistics** (past 3 years required)
   - Table: `staff_statistics`
   - Column: `year`
   - Example: Check for 2022, 2023, and 2024 data when validating 2024

4. **Leadership Messages** (≥1 required)
   - Stories with `story_type = 'leadership_message'`
   - Use case: Director/board chair messages

## Output Example

```
======================================================================
Database Validation for 2024 Annual Report
======================================================================

Connected to Supabase ✓

Checking Required Tables:
----------------------------------------------------------------------
  ✅  Table: profiles                                  150 records
  ✅  Table: stories                                   42 records
  ✅  Table: board_members                             12 records
  ✅  Table: partners                                  28 records

Checking Annual Report Data:
----------------------------------------------------------------------
  ✅  Annual report eligible stories (≥5)              8 eligible stories
  ❌  Financial data (current + previous year)         Missing: {2023}
  ✅  Staff statistics (past 3 years)                  Years 2022, 2023, 2024 ✓
  ✅  Leadership messages                              3 found

Validation Results:
----------------------------------------------------------------------
  ✅  Table: profiles                                  150 records
  ✅  Table: stories                                   42 records
  ✅  Table: board_members                             12 records
  ✅  Table: partners                                  28 records
  ✅  Annual report eligible stories (≥5)              8 eligible stories
  ❌  Financial data (current + previous year)         Missing: {2023}
  ✅  Staff statistics (past 3 years)                  Years 2022, 2023, 2024 ✓
  ✅  Leadership messages                              3 found

Issues Found:
----------------------------------------------------------------------
  1. Missing financial data for year(s): {2023}

Suggested Actions:
----------------------------------------------------------------------
  1. Add financial records for year(s) 2023

Status: NOT READY
Found 1 issue(s)

======================================================================
```

## Exit Codes

- **0**: All checks passed - database is ready for report generation
- **1**: Issues found - address suggestions before generating report

## Common Issues & Fixes

### Missing `annual_report_eligible` Column
**Issue**: Cannot query annual_report_eligible stories
**Fix**: 
```sql
ALTER TABLE stories ADD COLUMN annual_report_eligible BOOLEAN DEFAULT FALSE;
```

### Missing Financial Data
**Issue**: Missing financial data for year(s)
**Fix**:
```sql
INSERT INTO financial_data (year, total_revenue, total_expenses, ...)
VALUES (2023, 100000, 80000, ...);
```

### Missing Staff Statistics
**Issue**: Missing staff statistics for year(s)
**Fix**:
```sql
INSERT INTO staff_statistics (year, full_time_count, part_time_count, ...)
VALUES (2023, 15, 8, ...);
```

### Missing Board Members or Partners
**Issue**: No records in board_members or partners table
**Fix**: 
- Add board members to the database
- Add partner organizations

### Missing Leadership Messages
**Issue**: No leadership messages found
**Fix**:
```sql
INSERT INTO stories (story_type, annual_report_eligible, ...)
VALUES ('leadership_message', true, ...);
```

## Integration with CI/CD

The script can be integrated into CI/CD pipelines:

```bash
#!/bin/bash
python validate_data.py --year 2024
if [ $? -ne 0 ]; then
    echo "Database not ready for report generation"
    exit 1
fi
echo "Database ready, proceeding with report generation"
python assemble_content.py --year 2024
```

## Troubleshooting

### "Missing dependency: supabase"
```bash
pip install supabase python-dotenv
```

### "Cannot access table 'stories'"
- Check credentials in `.env` file
- Verify service role key has table access
- Check table exists in Supabase console

### "Only X stories marked as annual_report_eligible (need ≥5)"
- Mark more stories with `annual_report_eligible = true` in the database
- Or adjust the requirement in the script

## Database Schema Requirements

### stories table
```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY,
    title TEXT,
    story_type TEXT,  -- 'leadership_message', 'impact_story', etc.
    annual_report_eligible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);
```

### financial_data table
```sql
CREATE TABLE financial_data (
    id UUID PRIMARY KEY,
    year INTEGER,
    total_revenue DECIMAL,
    total_expenses DECIMAL,
    -- other financial fields
);
```

### staff_statistics table
```sql
CREATE TABLE staff_statistics (
    id UUID PRIMARY KEY,
    year INTEGER,
    full_time_count INTEGER,
    part_time_count INTEGER,
    -- other staff metrics
);
```

### board_members table
```sql
CREATE TABLE board_members (
    id UUID PRIMARY KEY,
    name TEXT,
    title TEXT,
    -- other member details
);
```

### partners table
```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    organization_name TEXT,
    partnership_type TEXT,
    -- other partner details
);
```

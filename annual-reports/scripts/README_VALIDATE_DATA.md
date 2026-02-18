# validate_data.py - Database Validation for Annual Reports

## Quick Overview

`validate_data.py` is a comprehensive database validation tool that ensures your Supabase database is ready for annual report generation. It checks for all required data, provides colorful output, and gives specific recommendations for any issues found.

**Location**: `/sessions/amazing-tender-ramanujan/mnt/Palm Island Reposistory/annual-reports/scripts/validate_data.py`

## Quick Start

```bash
# Install dependencies
pip install supabase python-dotenv

# Run validation for current year
python validate_data.py

# Run validation for specific year
python validate_data.py --year 2024

# Check exit code
python validate_data.py --year 2024
echo $?  # 0 = ready, 1 = issues found
```

## What Gets Validated

1. **Supabase Connection** - Database is accessible
2. **Required Tables** - profiles, stories, board_members, partners exist with data
3. **Annual Report Stories** - At least 5 stories marked with `annual_report_eligible=true`
4. **Financial Data** - Records exist for current year AND previous year
5. **Staff Statistics** - Records exist for past 3 years (current year -2 to current)
6. **Leadership Messages** - At least 1 story with `story_type='leadership_message'`

## Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| **validate_data.py** | Main script | You want to understand the code |
| **VALIDATE_DATA_README.md** | Complete documentation | You need detailed reference info |
| **VALIDATE_DATA_QUICK_START.md** | Getting started | You're new to the script |
| **VALIDATE_DATA_EXAMPLES.md** | Real scenarios & fixes | You're debugging specific issues |
| **VALIDATE_DATA_SUMMARY.md** | Architecture overview | You want to maintain/extend it |
| **VALIDATE_DATA_VISUAL_GUIDE.md** | Diagrams & flows | You prefer visual explanations |
| **README_VALIDATE_DATA.md** | This file | You need quick navigation |

## Common Use Cases

### 1. Pre-Report Generation Check
```bash
# Before running annual report scripts
if python validate_data.py --year 2024; then
    python assemble_content.py --year 2024
    python generate_pdf.py --year 2024
else
    echo "Fix database issues first"
    exit 1
fi
```

### 2. Regular Data Monitoring
```bash
# Add to crontab for daily checks
0 9 * * * cd /path/to/scripts && python validate_data.py --year 2024 >> validation.log
```

### 3. CI/CD Integration
```yaml
# GitHub Actions example
- name: Validate Database
  run: |
    cd annual-reports/scripts
    pip install supabase python-dotenv
    python validate_data.py --year 2024
```

### 4. Debug Specific Year
```bash
python validate_data.py --year 2023  # Check previous year
python validate_data.py --year 2025  # Check future year
```

## Setup Requirements

### Environment Variables
The script needs Supabase credentials. Set one of these:

**Option A: .env file**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Option B: System environment**
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Option C: Use existing symlink**
```bash
# Scripts directory already has: .env -> ../../web-platform/.env.local
# Just ensure web-platform/.env.local exists
```

### Database Structure
Ensure your Supabase database has these columns:

```sql
-- stories table
ALTER TABLE stories ADD COLUMN annual_report_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN story_type TEXT;

-- financial_data table (if not exists)
CREATE TABLE financial_data (
    id UUID PRIMARY KEY,
    year INTEGER NOT NULL,
    total_revenue DECIMAL,
    total_expenses DECIMAL
);

-- staff_statistics table (if not exists)
CREATE TABLE staff_statistics (
    id UUID PRIMARY KEY,
    year INTEGER NOT NULL,
    full_time_count INTEGER,
    part_time_count INTEGER
);
```

## Output Example

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

Status: READY ✓
All checks passed!

======================================================================
```

## Exit Codes

- **0**: All checks passed - database is ready for report generation
- **1**: Issues found - review suggestions and fix before proceeding

## Features

- **Color-coded output** - Easy to read at a glance
- **Specific suggestions** - Know exactly what to fix
- **Flexible year validation** - Check any year with `--year`
- **Safe operation** - Read-only queries, no data modification
- **Exit codes** - Works with scripts and CI/CD pipelines
- **Type hints** - Fully typed Python code
- **Error handling** - Graceful failure with helpful messages

## Troubleshooting

### "Missing dependency: supabase"
```bash
pip install supabase python-dotenv
```

### "Missing Supabase credentials"
1. Check .env file exists in scripts directory
2. Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
3. Run: `python validate_data.py`

### "Only X stories marked as annual_report_eligible"
1. Find stories in Supabase dashboard
2. Set `annual_report_eligible = true` for at least 5 stories
3. Re-run validation

### "Missing financial data for year(s)"
1. Insert financial records into `financial_data` table
2. Ensure `year` column is populated correctly
3. Re-run validation

### "Missing staff statistics for year(s)"
1. Insert staff statistics into `staff_statistics` table
2. Cover current year and previous 2 years
3. Re-run validation

### "No leadership messages found"
1. Create or find a story suitable for leadership message
2. Set `story_type = 'leadership_message'`
3. Re-run validation

## Integration with Annual Report Pipeline

### Typical Workflow
```
1. Update database with current year data
2. python validate_data.py --year 2024
   ↓ (if ready)
3. python assemble_content.py --year 2024
4. python generate_pdf.py --year 2024
5. Annual report ready to publish
```

### With Error Handling
```bash
#!/bin/bash
set -e

YEAR=${1:-$(date +%Y)}

echo "Validating database for $YEAR..."
python validate_data.py --year $YEAR

echo "Assembling content..."
python assemble_content.py --year $YEAR

echo "Generating PDF..."
python generate_pdf.py --year $YEAR

echo "✓ Annual report $YEAR complete!"
```

## Performance

- Typical validation time: < 2 seconds
- Works with databases of any size
- Minimal memory overhead
- Safe for frequent execution

## Security Notes

- Uses service role key when available (full permissions)
- Falls back to anon key if needed (limited permissions)
- Credentials loaded from environment, not hardcoded
- Read-only operations (no data modification)
- No sensitive data printed to console

## Need More Help?

- **Getting started?** → Read `VALIDATE_DATA_QUICK_START.md`
- **Need details?** → Read `VALIDATE_DATA_README.md`
- **Debugging an issue?** → Check `VALIDATE_DATA_EXAMPLES.md`
- **Want to extend it?** → See `VALIDATE_DATA_SUMMARY.md`
- **Prefer visuals?** → Check `VALIDATE_DATA_VISUAL_GUIDE.md`

## File Overview

```
validate_data.py (425 lines)
├─ Colors class - Terminal formatting
├─ DataValidator class - Main validation logic
│   ├─ Connection methods
│   ├─ Validation checks
│   └─ Output formatting
└─ main() function - CLI entry point

Total documentation: 1,337 lines across 5 files
```

## Key Features of DataValidator Class

- **Modular design** - Each check is independent
- **Flexible output** - Tracks checks, issues, and suggestions separately
- **Extensible** - Easy to add new validation checks
- **Type-safe** - Full type hints throughout
- **Well-documented** - Docstrings for every method

## Related Scripts

In the same directory:
- `assemble_content.py` - Gather annual report content
- `generate_pdf.py` - Create PDF from content
- `check_db.py` - Basic database info
- `check_stories.py` - Story-specific checks

## Contributing

To modify or extend the script:
1. Read `VALIDATE_DATA_SUMMARY.md` for architecture
2. Follow existing code style
3. Add type hints to new methods
4. Update docstrings
5. Test with different years
6. Add examples to `VALIDATE_DATA_EXAMPLES.md`

## License

Same as the Palm Island Repository project.

---

**Version**: 1.0  
**Created**: January 29, 2026  
**Last Updated**: January 29, 2026  
**Location**: `/sessions/amazing-tender-ramanujan/mnt/Palm Island Reposistory/annual-reports/scripts/validate_data.py`

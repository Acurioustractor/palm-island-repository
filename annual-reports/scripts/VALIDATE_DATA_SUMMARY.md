# validate_data.py - Complete Documentation Summary

## Files Created

1. **validate_data.py** (425 lines, 16KB)
   - Main validation script with full functionality

2. **VALIDATE_DATA_README.md**
   - Complete feature documentation
   - Database schema requirements
   - Troubleshooting guide
   - CI/CD integration examples

3. **VALIDATE_DATA_QUICK_START.md**
   - Quick installation and usage
   - Common issues and fixes
   - Output format explanation

4. **VALIDATE_DATA_EXAMPLES.md**
   - 6 real-world example scenarios
   - Expected output for each scenario
   - Step-by-step fixes for each issue

---

## Script Architecture

### Core Components

1. **Colors Class**
   - Terminal color formatting
   - Supports foreground and background colors
   - Bold and dimmed text options

2. **DataValidator Class**
   - Main validation logic
   - Connection management
   - Check execution
   - Result formatting

3. **Validation Methods**
   - `connect()` - Supabase connection
   - `check_table_exists()` - Table existence and data
   - `check_annual_report_stories()` - Eligible stories count
   - `check_financial_data()` - Year coverage
   - `check_staff_statistics()` - 3-year history
   - `check_leadership_messages()` - Leadership story type

4. **Output Methods**
   - `print_results()` - Formatted final report
   - Color-coded status indicators
   - Issue identification
   - Actionable suggestions

---

## Validation Checklist

### Required Tables (All must exist and have data)
- [ ] `profiles` - Organization/user profiles
- [ ] `stories` - Story records
- [ ] `board_members` - Board member information
- [ ] `partners` - Partner organizations

### Annual Report Data
- [ ] At least 5 stories with `annual_report_eligible = true`
- [ ] Financial data for current year
- [ ] Financial data for previous year
- [ ] Staff statistics for current year
- [ ] Staff statistics for year -1
- [ ] Staff statistics for year -2
- [ ] At least 1 story with `story_type = 'leadership_message'`

---

## Key Features

### 1. Colorful Output
```
✅ Green checks for passed validations
❌ Red X for failed checks
⚠️  Context in issues section
```

### 2. Detailed Feedback
- What failed
- Why it's important
- How to fix it

### 3. Flexible Year Handling
```bash
python validate_data.py                    # Current year
python validate_data.py --year 2023        # Specific year
python validate_data.py --year 2025        # Future planning
```

### 4. Safe Operation
- Read-only database access
- No data modification
- Error handling throughout

### 5. Automation-Ready
- Exit code 0 = Ready to proceed
- Exit code 1 = Issues found
- Works in scripts and CI/CD

---

## Usage Patterns

### Interactive Mode
```bash
python validate_data.py --year 2024
# Review output
# Follow suggestions to fix issues
# Re-run to verify
```

### Automated Mode
```bash
if python validate_data.py --year 2024; then
    python assemble_content.py --year 2024
else
    echo "Fix database issues first"
    exit 1
fi
```

### CI/CD Integration
```yaml
- name: Validate Database
  run: |
    cd annual-reports/scripts
    python validate_data.py --year 2024
```

---

## Database Requirements

### Column Requirements

**stories table**
```sql
ALTER TABLE stories ADD COLUMN annual_report_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN story_type TEXT;
```

**financial_data table**
```sql
CREATE TABLE IF NOT EXISTS financial_data (
    id UUID PRIMARY KEY,
    year INTEGER NOT NULL,
    total_revenue DECIMAL,
    total_expenses DECIMAL,
    net_income DECIMAL
);
```

**staff_statistics table**
```sql
CREATE TABLE IF NOT EXISTS staff_statistics (
    id UUID PRIMARY KEY,
    year INTEGER NOT NULL,
    full_time_count INTEGER,
    part_time_count INTEGER
);
```

---

## Common Workflows

### Workflow 1: Initial Setup
1. Create database tables
2. Run: `python validate_data.py --year 2024`
3. Add missing data based on suggestions
4. Repeat step 2-3 until all checks pass

### Workflow 2: Annual Report Generation
1. Update database with current year data
2. Run: `python validate_data.py --year 2024`
3. If ready: `python assemble_content.py --year 2024`
4. Generate PDF: `python generate_pdf.py --year 2024`

### Workflow 3: Data Maintenance
1. Regularly: `python validate_data.py --year $(date +%Y)`
2. Monitor for missing data
3. Update as needed
4. Keep historical data (3 years minimum)

---

## Environment Setup

### Option 1: Direct Environment Variables
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
python validate_data.py
```

### Option 2: .env File
```bash
# Create in scripts directory
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
python validate_data.py
```

### Option 3: Symlinked .env
```bash
# Already configured
# Scripts directory has: .env -> ../../web-platform/.env.local
python validate_data.py
```

---

## Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing dependency: supabase" | supabase not installed | `pip install supabase python-dotenv` |
| "Missing Supabase credentials" | No .env file | Create .env with credentials |
| "Cannot access table 'X'" | Wrong permissions | Use service role key, not anon |
| "Table 'X' exists but has no records" | Table empty | Populate with data |
| "Only X stories marked as annual_report_eligible" | Too few | Mark more stories |
| "Missing financial data for year(s)" | Missing records | Insert data for years |
| "Missing staff statistics for year(s)" | Missing records | Insert data for years |
| "No leadership messages found" | No leadership story type | Create story with this type |

---

## Performance Notes

- Queries are optimized with `.count("exact")`
- Each check queries only necessary columns
- Minimal database load
- Completes in < 5 seconds typically
- Works with large databases (1000+ records)

---

## Security Considerations

- Uses service role key (if available) for better permissions
- Falls back to anon key if service role not available
- Read-only operations (no data modification)
- Credentials loaded from environment, not hardcoded
- No sensitive data logged or displayed

---

## Maintenance & Updates

### Regular Checks
```bash
# Daily during report season
0 9 * * * cd /path/to/scripts && python validate_data.py --year 2024 >> logs/validation.log
```

### Historical Tracking
```bash
# Log results over time
python validate_data.py --year 2024 | tee -a logs/validation_$(date +%Y-%m-%d).log
```

### Version Control
Keep script in git:
```bash
git add validate_data.py VALIDATE_DATA*.md
git commit -m "Add database validation script"
```

---

## Support & Troubleshooting

### Debug Mode (Manual)
```python
# Edit script temporarily to add debug output
validator = DataValidator(2024)
print(f"Year: {validator.year}")
validator.connect()
# Check individual methods
```

### Check Logs
```bash
# If running in CI/CD
# Review job logs for full output
```

### Database Inspection
```bash
# Manual query to verify data
supabase query "SELECT COUNT(*) FROM stories WHERE annual_report_eligible = true;"
```

---

## Next Steps

1. **Setup**: Configure .env with Supabase credentials
2. **Install**: `pip install supabase python-dotenv`
3. **Test**: `python validate_data.py --year 2024`
4. **Integrate**: Add to your annual report workflow
5. **Monitor**: Run regularly during report preparation

See specific documentation files for more details:
- VALIDATE_DATA_README.md - Full documentation
- VALIDATE_DATA_QUICK_START.md - Getting started
- VALIDATE_DATA_EXAMPLES.md - Real scenarios

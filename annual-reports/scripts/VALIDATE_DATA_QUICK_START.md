# Quick Start: Database Validation

## Installation
```bash
cd /sessions/amazing-tender-ramanujan/mnt/"Palm Island Reposistory"/annual-reports/scripts
pip install supabase python-dotenv
```

## Setup Environment
Ensure `.env` file exists in the scripts directory with:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The script also checks for `.env -> ../../web-platform/.env.local` symlink.

## Run Validation

### Current Year
```bash
python validate_data.py
```

### Specific Year
```bash
python validate_data.py --year 2024
```

## Check Result

- **Exit code 0**: Ready ✓ - Proceed with report generation
- **Exit code 1**: Issues found - Follow suggested actions

## What Gets Validated

1. **Connection**: Supabase database accessible
2. **Tables Exist**: profiles, stories, board_members, partners (all must have data)
3. **Annual Report Stories**: At least 5 marked with `annual_report_eligible=true`
4. **Financial Data**: Records for current year AND previous year
5. **Staff Statistics**: Records for current year AND previous 2 years (3 years total)
6. **Leadership Messages**: At least 1 story with `story_type='leadership_message'`

## Output Format

```
✅ Check passed
❌ Check failed
⚠️  Check warning (implied by details text)

Green = Pass
Red = Fail

Each check shows:
- Name of what's being checked
- Status (✅/❌)
- Details (record count, years found, error message)
```

## Example: Missing Financial Data for 2023

**Output shows**:
```
❌  Financial data (current + previous year)         Missing: {2023}
```

**Suggested Action**:
```
Add financial records for year(s) 2023
```

**What to do**:
1. Insert financial records for year 2023 into the database
2. Run validation again
3. Proceed when all checks pass

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing dependency: supabase" | Run: `pip install supabase python-dotenv` |
| Connection fails | Check `.env` file has correct credentials |
| Table not found | Verify table exists in Supabase console |
| No eligible stories | Mark stories with `annual_report_eligible=true` |
| Missing year data | Add records for missing years to tables |

## Script Features

- **Colors**: Easy-to-read colored output
- **Clear Messages**: What's wrong and how to fix it
- **Flexible**: Check any year with `--year` argument
- **Safe**: Read-only validation, doesn't modify data
- **Automatable**: Exit codes for CI/CD integration

See `VALIDATE_DATA_README.md` for complete documentation.

# Data Validate Skill

Validate database readiness before annual report generation or data operations.

## When to Use

- Before generating an annual report
- After running data migrations or imports
- When troubleshooting missing or broken data
- As a pre-flight check for any data pipeline

## Workflow

### 1. Run Database Validation
```bash
cd annual-reports/scripts
python3 validate_data.py --year [YEAR]
```

This checks:
- Required tables exist and have data (profiles, stories, board_members, partners)
- Annual report eligible stories (need >= 5)
- Financial data for current and previous year
- Staff statistics for past 3 years
- Leadership messages exist

### 2. Interpret Results

The script outputs color-coded results. For each failure:
- Note the specific table/field that's missing
- Check if the data exists but under a different column name
- Check if a migration needs to be run

### 3. Self-Correcting Loop

If validation fails:

1. **Missing tables**: Check `supabase/migrations/` for unapplied migrations
2. **Empty tables**: Check if data exists in a different schema or needs seeding
3. **Missing stories**: Query stories table to understand what's available:
   ```sql
   SELECT count(*), annual_report_eligible, status
   FROM stories
   GROUP BY annual_report_eligible, status;
   ```
4. **Missing financials**: Check `annual_financials` table structure matches expected schema
5. **Fix the issue** using Supabase MCP tools
6. **Re-run validation** to confirm the fix

### 4. Report

Output a summary:
- Total checks passed/failed
- Data completeness percentage
- Specific gaps that need manual attention (e.g., leadership messages need human input)
- Recommended next steps

## Data Quality Checks

Beyond table existence, verify:
- Stories have `content` (not just titles)
- Stories have associated media (images)
- Financial numbers are reasonable (no negative revenue, expenses match categories)
- Board member names are properly formatted
- Partner list is current
- Staff statistics show reasonable year-over-year trends

## Integration with Report Generation

After validation passes, the report pipeline is:
```
validate_data.py → assemble_content.py → generate_pdf.py → validate_pdf.py
```

Each step should pass before proceeding to the next.

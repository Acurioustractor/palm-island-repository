# manage_data.py - Quick Reference Guide

## Installation

```bash
pip install supabase python-dotenv
```

Ensure `.env` contains:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

## Command Summary

| Command | Purpose | Required Args |
|---------|---------|---------------|
| `add-financial` | Add/update yearly financial data | `--year` |
| `add-staff` | Add/update yearly staff statistics | `--year` |
| `add-board-member` | Add a board member | `--name`, `--title` |
| `add-partner` | Add a partner organization | `--name`, `--category` |
| `add-service-metric` | Add service metrics | `--year`, `--service-id` |
| `list` | List table records | table name |
| `mark-story` | Mark story as annual report eligible | `--story-id` |

## Quick Commands

### Add Financial Data
```bash
# Interactive
python manage_data.py add-financial --year 2024 --interactive

# Command-line
python manage_data.py add-financial --year 2024 --revenue 2500000 --expenses 2000000
```

### Add Staff Statistics
```bash
# Interactive
python manage_data.py add-staff --year 2024 --interactive

# Command-line
python manage_data.py add-staff --year 2024 --total-staff 28 --full-time 20 --part-time 8
```

### Add Board Members
```bash
python manage_data.py add-board-member \
  --name "Dr. John Smith" \
  --title "Board Chair" \
  --bio "Expert in healthcare" \
  --start-date 2024-01-01
```

### Add Partners
```bash
python manage_data.py add-partner \
  --name "WHO" \
  --category "Health" \
  --website https://www.who.int \
  --contact-email contact@who.int
```

### Add Service Metrics
```bash
python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 1 \
  --beneficiaries 500 \
  --sessions 52 \
  --hours 208
```

### List Data
```bash
# All records in table
python manage_data.py list board_members

# Filter by year
python manage_data.py list annual_financials --year 2024

# Filter by service
python manage_data.py list service_metrics --year 2024 --service-id 1

# With custom limit
python manage_data.py list partners --limit 50
```

### Mark Stories
```bash
python manage_data.py mark-story --story-id 42
```

## Available Tables

- `annual_financials` - Revenue, expenses, grants, donations
- `staff_statistics` - Staff counts, volunteers, hours
- `board_members` - Board member information
- `governance_achievements` - Governance records
- `partners` - Partner organizations
- `services` - Available services catalog
- `service_metrics` - Service delivery metrics
- `stories` - Stories and narratives

## Date Format

All dates use **YYYY-MM-DD** format (ISO 8601):
- Valid: `2024-01-15`
- Invalid: `01/15/2024` or `2024-1-15`

## Interactive Mode

Add `--interactive` flag for guided prompts:
```bash
python manage_data.py add-financial --year 2024 --interactive
```

Features:
- Type validation
- Optional fields (press Enter to skip)
- Helpful prompts
- Error feedback

## Common Workflows

### Set up 2024 Annual Report Data

```bash
# 1. Financial data
python manage_data.py add-financial --year 2024 \
  --revenue 2500000 --expenses 2000000 --surplus 500000

# 2. Staff statistics
python manage_data.py add-staff --year 2024 \
  --total-staff 28 --full-time 20 --volunteers 150

# 3. Service metrics (for each service)
python manage_data.py add-service-metric --year 2024 --service-id 1 \
  --beneficiaries 850 --sessions 52

# 4. Verify
python manage_data.py list annual_financials --year 2024
python manage_data.py list staff_statistics --year 2024
```

### Add Organization Data

```bash
# Board members
python manage_data.py add-board-member --name "Jane Doe" --title "Director"
python manage_data.py add-board-member --name "John Smith" --title "Treasurer"

# Partners
python manage_data.py add-partner --name "Local Hospital" --category "Health"
python manage_data.py add-partner --name "University" --category "Education"

# View all
python manage_data.py list board_members
python manage_data.py list partners
```

### Mark Annual Report Stories

```bash
# First, list stories
python manage_data.py list stories

# Mark specific stories
python manage_data.py mark-story --story-id 42
python manage_data.py mark-story --story-id 15
```

## Tips

1. **Use `--interactive`** for complex data with many optional fields
2. **Use `--limit`** when listing large tables: `list partners --limit 200`
3. **Verify with `list`** after adding: `list annual_financials --year 2024`
4. **Check available services** before adding metrics: `list services`
5. **Use notes field** to capture context and decisions

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "SUPABASE_URL and SUPABASE_KEY required" | Check `.env` file exists with proper values |
| "Invalid input" | Check date format (YYYY-MM-DD) and number format |
| "No services found" | Services must be seeded first in database |
| "Connection error" | Verify internet connection and Supabase URL |

## Getting Help

```bash
# Main help
python manage_data.py --help

# Command-specific help
python manage_data.py add-financial --help
python manage_data.py list --help
python manage_data.py add-board-member --help
```

## Field Reference

### Financial Data
- `year` (required): Fiscal year
- `revenue`: Total income
- `expenses`: Total expenses
- `surplus`: Net surplus/deficit
- `grants`: Grant funding
- `donations`: Donor contributions
- `notes`: Optional notes

### Staff Statistics
- `year` (required): Fiscal year
- `total_staff`: Total headcount
- `full_time`: Full-time employees
- `part_time`: Part-time employees
- `volunteers`: Volunteer count
- `volunteer_hours`: Total volunteer hours
- `notes`: Optional notes

### Board Members
- `name` (required): Full name
- `title` (required): Position/role
- `bio`: Biographical information
- `start_date`: Appointment date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

### Partners
- `name` (required): Organization name
- `category` (required): Type (Health, Education, Government, etc.)
- `contact_email`: Email address
- `website`: Website URL
- `description`: Partnership description

### Service Metrics
- `year` (required): Fiscal year
- `service_id` (required): Service identifier
- `beneficiaries`: People served
- `sessions`: Activities held
- `hours`: Total hours
- `units_delivered`: Output units
- `notes`: Optional notes

## Examples by Use Case

### First-Time Setup
```bash
# Start fresh with minimal test data
python manage_data.py add-financial --year 2024 --revenue 1000000
python manage_data.py add-staff --year 2024 --total-staff 10
python manage_data.py list annual_financials --year 2024
```

### Bulk Import
```bash
# Prepare all 2024 data in one session
python manage_data.py add-financial --year 2024 --interactive
python manage_data.py add-staff --year 2024 --interactive
python manage_data.py add-service-metric --year 2024 --service-id 1 --interactive
```

### Audit and Verification
```bash
# Review all 2024 data before report generation
python manage_data.py list annual_financials --year 2024
python manage_data.py list staff_statistics --year 2024
python manage_data.py list service_metrics --year 2024
python manage_data.py list board_members
python manage_data.py list partners
```


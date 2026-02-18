# Annual Report Database Management Tool

`manage_data.py` is an interactive CLI for populating and managing the Palm Island annual report database. It provides a user-friendly interface for adding and listing data across various database tables.

## Installation

The script requires the following dependencies:

```bash
pip install supabase python-dotenv
```

These should already be included in your project dependencies. Make sure your `.env` file contains:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Quick Start

### View Help

```bash
python manage_data.py --help
python manage_data.py add-financial --help
```

### Using Interactive Mode

For most commands, you can use the `--interactive` flag for guided data entry:

```bash
python manage_data.py add-financial --year 2024 --interactive
python manage_data.py add-staff --year 2024 --interactive
```

### Using Command-Line Arguments

Provide all data via command-line arguments:

```bash
python manage_data.py add-financial --year 2024 --revenue 1000000 --expenses 800000 --surplus 200000
python manage_data.py add-staff --year 2024 --total-staff 25 --full-time 18 --part-time 7
```

## Available Commands

### add-financial
Add or update annual financial data for a specific year.

**Interactive:**
```bash
python manage_data.py add-financial --year 2024 --interactive
```

**With arguments:**
```bash
python manage_data.py add-financial \
  --year 2024 \
  --revenue 1000000 \
  --expenses 800000 \
  --surplus 200000 \
  --grants 250000 \
  --donations 100000 \
  --notes "Strong year with increased donations"
```

**Fields:**
- `--year` (required): Fiscal year (e.g., 2024)
- `--revenue`: Total revenue
- `--expenses`: Total expenses
- `--surplus`: Surplus or deficit
- `--grants`: Grants received
- `--donations`: Donations received
- `--notes`: Additional notes

### add-staff
Add or update staff statistics for a specific year.

**Interactive:**
```bash
python manage_data.py add-staff --year 2024 --interactive
```

**With arguments:**
```bash
python manage_data.py add-staff \
  --year 2024 \
  --total-staff 25 \
  --full-time 18 \
  --part-time 7 \
  --volunteers 150 \
  --volunteer-hours 5000 \
  --notes "Record number of volunteers"
```

**Fields:**
- `--year` (required): Fiscal year
- `--total-staff`: Total number of staff members
- `--full-time`: Number of full-time staff
- `--part-time`: Number of part-time staff
- `--volunteers`: Number of volunteers
- `--volunteer-hours`: Total volunteer hours
- `--notes`: Additional notes

### add-board-member
Add a new board member.

**Interactive:**
```bash
python manage_data.py add-board-member --name "Jane Smith" --title "Chair" --interactive
```

**With arguments:**
```bash
python manage_data.py add-board-member \
  --name "Jane Smith" \
  --title "Board Chair" \
  --bio "Jane has 15 years of experience in healthcare" \
  --start-date 2022-01-15 \
  --end-date 2025-01-15
```

**Fields:**
- `--name` (required): Board member's full name
- `--title` (required): Position/title
- `--bio`: Biographical information
- `--start-date`: Start date (YYYY-MM-DD)
- `--end-date`: End date (YYYY-MM-DD)

### add-partner
Add a partner organization.

**Interactive:**
```bash
python manage_data.py add-partner --name "WHO" --category "Health" --interactive
```

**With arguments:**
```bash
python manage_data.py add-partner \
  --name "World Health Organization" \
  --category "Health" \
  --contact-email contact@who.int \
  --website https://www.who.int \
  --description "International health organization partnership"
```

**Fields:**
- `--name` (required): Organization name
- `--category` (required): Partnership category (e.g., Health, Education, Government)
- `--contact-email`: Contact email address
- `--website`: Website URL
- `--description`: Description of partnership

### add-service-metric
Add service metrics for a specific year.

**Interactive:**
```bash
python manage_data.py add-service-metric --year 2024 --service-id 1 --interactive
```

**With arguments:**
```bash
python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 1 \
  --beneficiaries 500 \
  --sessions 48 \
  --hours 192 \
  --units-delivered 1000 \
  --notes "Increased reach compared to 2023"
```

**Fields:**
- `--year` (required): Fiscal year
- `--service-id` (required): ID of the service
- `--beneficiaries`: Number of people benefiting
- `--sessions`: Number of sessions held
- `--hours`: Total hours of service
- `--units-delivered`: Number of units delivered
- `--notes`: Additional notes

### list
List records from any table with optional filtering.

**List all board members:**
```bash
python manage_data.py list board_members
```

**List financial data for 2024:**
```bash
python manage_data.py list annual_financials --year 2024
```

**List service metrics for service 1 in 2024:**
```bash
python manage_data.py list service_metrics --year 2024 --service-id 1
```

**Increase results limit:**
```bash
python manage_data.py list partners --limit 200
```

**Available tables:**
- `annual_financials` - Financial data by year
- `staff_statistics` - Staff data by year
- `board_members` - Board member information
- `governance_achievements` - Governance achievements
- `partners` - Partner organizations
- `services` - Available services
- `service_metrics` - Service metrics by year
- `stories` - Stories and narratives

### mark-story
Mark a story as eligible for inclusion in the annual report.

```bash
python manage_data.py mark-story --story-id 42
```

**Fields:**
- `--story-id` (required): ID of the story to mark

## Interactive Mode Features

Interactive mode prompts provide:
- **Validation**: Input types are checked (integers, floats, dates)
- **Optional fields**: Skip by pressing Enter
- **Date validation**: Dates must be in YYYY-MM-DD format
- **Service listing**: When adding service metrics, available services are displayed
- **Helpful prompts**: Each field has context about what's expected

### Running in Fully Interactive Mode

While most commands require some command-line arguments (like `--year`), you can build a fully interactive experience:

```bash
python manage_data.py add-financial --year 2024 --interactive
# Follow the prompts for each field
```

## Database Tables Reference

### annual_financials
```json
{
  "id": "integer",
  "year": "integer",
  "revenue": "number",
  "expenses": "number",
  "surplus": "number",
  "grants": "number",
  "donations": "number",
  "notes": "text"
}
```

### staff_statistics
```json
{
  "id": "integer",
  "year": "integer",
  "total_staff": "integer",
  "full_time": "integer",
  "part_time": "integer",
  "volunteers": "integer",
  "volunteer_hours": "number",
  "notes": "text"
}
```

### board_members
```json
{
  "id": "integer",
  "name": "text",
  "title": "text",
  "bio": "text",
  "start_date": "date",
  "end_date": "date"
}
```

### partners
```json
{
  "id": "integer",
  "name": "text",
  "category": "text",
  "contact_email": "text",
  "website": "text",
  "description": "text"
}
```

### service_metrics
```json
{
  "id": "integer",
  "year": "integer",
  "service_id": "integer",
  "beneficiaries": "integer",
  "sessions": "integer",
  "hours": "number",
  "units_delivered": "integer",
  "notes": "text"
}
```

### stories
```json
{
  "id": "integer",
  "annual_report_eligible": "boolean"
}
```

## Examples

### Scenario 1: Adding 2024 Financial Data

```bash
# Interactive mode
python manage_data.py add-financial --year 2024 --interactive

# Or with arguments
python manage_data.py add-financial \
  --year 2024 \
  --revenue 2500000 \
  --expenses 2000000 \
  --surplus 500000 \
  --grants 500000 \
  --donations 250000
```

### Scenario 2: Adding Board Members

```bash
python manage_data.py add-board-member \
  --name "Dr. Michael Johnson" \
  --title "Medical Director" \
  --bio "30 years experience in tropical medicine" \
  --start-date 2020-03-01
```

### Scenario 3: Recording Service Metrics

```bash
# First, check available services
python manage_data.py list services

# Then add metrics
python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 3 \
  --beneficiaries 1200 \
  --sessions 52 \
  --hours 416 \
  --units-delivered 2400
```

### Scenario 4: Checking Data Before Annual Report

```bash
# View all 2024 financial data
python manage_data.py list annual_financials --year 2024

# View all board members
python manage_data.py list board_members

# View all partners
python manage_data.py list partners

# View staff statistics for 2024
python manage_data.py list staff_statistics --year 2024
```

## Error Handling

The script handles common errors gracefully:

- **Missing environment variables**: Displays a clear message about required .env setup
- **Invalid input types**: Prompts for valid input format (e.g., integers, dates)
- **Database errors**: Reports errors from Supabase
- **Network errors**: Handles connection issues

## Tips and Best Practices

1. **Use interactive mode for bulk data entry**: When adding multiple records, interactive mode ensures consistency
2. **Validate before marking stories**: Check that stories exist before marking them as annual report eligible
3. **Use list to verify**: Use the `list` command to verify data was added correctly
4. **Keep dates consistent**: Use YYYY-MM-DD format for all dates
5. **Add descriptive notes**: Use the `--notes` field to capture context and details

## Troubleshooting

### "SUPABASE_URL and SUPABASE_KEY environment variables are required"

Make sure your `.env` file is in the current directory or parent directory with:
```
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
```

### "No services found in database"

When adding service metrics, the database must have services already created. Check with:
```bash
python manage_data.py list services
```

### "Invalid input: <error message>"

The script validates data types. For dates, use YYYY-MM-DD format. For numbers, ensure no extra characters.

## License

Part of the Palm Island Annual Reports project.

# Populating PICC 2023-24 Annual Report Data

This guide explains how to populate the database with actual data from the PICC 2023-24 Annual Report to enable the impact dashboard and reporting features.

## Data Source

All data comes from the official **PICC 2023-24 Annual Report PDF** located at:
```
/Docs/picc-2023-24-annual-report.pdf
```

## What Gets Populated

The SQL script populates the following data:

### Organization Data
- Palm Island Community Company (PICC) with complete metadata
- ACN: 640 793 728
- Contact details, mission statement, acknowledgement of country

### Board Members & Leadership (10 profiles)
- Rachel Atkinson (CEO)
- Luella Bligh (Chair)
- Rhonda Phillips, Allan Palm Island, Matthew Lindsay, Harriet Hulthen, Raymond W. Palmer Snr, Cassie Lang (Board)
- Jeanie Sam, Dee Ann Sailor (Key Staff)

### 16 Services with Full Metadata
1. Bwgcolman Healing Service (health)
2. Community Justice Group (justice)
3. Digital Service Centre (other)
4. Diversionary Service (justice)
5. Early Childhood Services/CFC (education)
6. Family Care Service (family)
7. Family Participation Program (family)
8. Family Wellbeing Centre (family)
9. NDIS Service (other)
10. Safe Haven (youth)
11. Safe House (family)
12. Social and Emotional Wellbeing Service (health)
13. Specialist Domestic and Family Violence Service (family)
14. Women's Healing Service (family)
15. Women's Service (family)
16. Youth Service (youth)

### 2023-24 Annual Report Record
- Full executive summary and leadership messages
- Year highlights and looking forward sections
- Complete statistics JSON including:
  - Staff numbers (197 total, 80%+ Aboriginal/TSI, 70%+ Palm Island residents)
  - Financial data ($23.4M income, expenditure breakdown)
  - Balance sheet
  - Health service metrics (2,283 clients, 17,488 episodes of care)
  - Service metrics for all programs

### 7 Featured Stories
1. Digital Service Centre success story
2. Bwgcolman Way delegated authority story
3. Bwgcolman Healing Service story
4. Staff growth story (197 employees)
5. Women's Healing Service restructure story
6. SNAICC Conference presentation story
7. Safe Haven support story

### Impact Indicators
- 10 quantitative impact indicators covering staff, health, services, and finances

### 50 Additional Community Member Profiles
- Mix of elders, youth, service providers, and community members
- Random creation dates over the past year for dashboard metrics

## How to Run

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `populate_picc_2023_24_annual_report.sql`
5. Run the query

### Option 2: Supabase CLI
```bash
cd web-platform
npx supabase db push --db-url "postgresql://..."
# Or run the SQL file directly:
psql "postgresql://..." -f populate_picc_2023_24_annual_report.sql
```

### Option 3: Using the Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for bulk inserts
)

const sql = fs.readFileSync('./populate_picc_2023_24_annual_report.sql', 'utf8')
const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
```

## Verification

After running the script, you should see:
- 1 organization (PICC)
- 16 services
- 60+ profiles
- 7 stories
- 1 annual report (2023-24)
- 10+ impact indicators

The impact dashboard at `/picc/insights/impact` should now display:
- Total Stories: 7
- Total Storytellers: 60+
- Monthly growth charts
- Category breakdowns
- Storyteller type distribution

## Key Statistics from the Report

| Metric | 2023/24 | 2022/23 |
|--------|---------|---------|
| Staff Count | 197 | 151 |
| Income | $23,400,335 | $20,103,686 |
| Health Clients | 2,283 | 2,050 |
| Episodes of Care | 17,488 | 18,021 |
| 715 Health Checks | 779 | 610 |
| Family Care Placement Nights | 6,698 | 5,656 |

## Files Modified

- `populate_picc_2023_24_annual_report.sql` - Main data population script
- `app/picc/insights/impact/page.tsx` - Fixed field names (`category` not `story_category`, `access_level` not `privacy_level`)

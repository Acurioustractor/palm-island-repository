# PICC Annual Reports System - Setup Guide

## Quick Start

### 1. Run Database Migrations

Open Supabase SQL Editor:
```
https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql
```

Run these files in order:
1. `supabase/migrations/001_annual_reports_system.sql` - Creates tables
2. `supabase/migrations/002_sample_data.sql` - Adds sample data

### 2. Install Dependencies

```bash
cd web-platform
npm install
```

### 3. Seed Data (Alternative to SQL)

```bash
npm run seed:reports
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the System

| Route | Purpose |
|-------|---------|
| `/annual-report/live` | Real-time dashboard |
| `/reports` | Reports hub |
| `/reports/elder-wisdom` | Elder Wisdom Collection |
| `/reports/community-voices` | What You Said, What We Did |
| `/reports/story-collection` | Export story collections |
| `/reports/programs` | Program-specific reports |

---

## System Architecture

### Database Tables

```
elder_quotes          - Validated Elder quotes for reports
community_feedback    - Community feedback tracking
annual_reports        - Generated report metadata
report_sections       - Individual report sections
story_collections     - Curated story exports
stories               - (existing) Enhanced with report flags
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/annual-reports` | GET/POST | List/create annual reports |
| `/api/annual-reports/[id]/populate` | POST | Auto-populate report sections |
| `/api/reports/[program]/generate` | GET | Generate program-specific report |
| `/api/reports/elder-wisdom` | GET | Get Elder Wisdom collection |
| `/api/stories/export-collection` | POST | Export story collection |
| `/api/community-feedback` | GET/POST/PUT | Community feedback CRUD |

### Supported Programs

- `health-services` - Bwgcolman Healing Service
- `family-services` - Family Care Service
- `children-family-centre` - Children & Family Centre
- `delegated-authority` - Delegated Authority
- `digital-service-centre` - Digital Service Centre
- `justice-services` - Justice Services
- `crisis-services` - Crisis Services / Safe House
- `economic-development` - Economic Development

---

## Key Features

### 1. Real-Time Dashboard (`/annual-report/live`)
- Auto-refreshes every 5 minutes
- Shows live statistics from PICC Knowledge Base
- Displays recent stories and quotes
- Quick links to all report types

### 2. Elder Wisdom Collection
- Culturally appropriate protocols
- Theme categorization (culture, healing, family, country, language)
- Hull River narrative integration
- Validation tracking

### 3. Community Voices ("What You Said, What We Did")
- Feedback submission form
- Status tracking (received → completed)
- Investment tracking
- Outcome documentation

### 4. Story Collection Export
- Select stories for grant applications
- Multiple purposes (grant, board, funder, community)
- Include/exclude media and quotes
- HTML output for PDF conversion

### 5. Program Reports
- Pre-configured filters per program
- Relevant stories auto-selected
- Statistics from PICC Knowledge Base
- HTML template generation

---

## Files Created

### Pages
```
app/annual-report/live/page.tsx       - Real-time dashboard
app/reports/page.tsx                   - Reports hub
app/reports/elder-wisdom/page.tsx      - Elder Wisdom viewer
app/reports/community-voices/page.tsx  - Community feedback viewer
app/reports/story-collection/page.tsx  - Story export interface
app/reports/programs/page.tsx          - Program reports selector
```

### API Routes
```
app/api/reports/[program]/generate/route.ts  - Program report generator
app/api/reports/elder-wisdom/route.ts        - Elder Wisdom API
app/api/stories/export-collection/route.ts   - Story export API
app/api/community-feedback/route.ts          - Feedback CRUD
```

### Database
```
supabase/migrations/001_annual_reports_system.sql  - Schema
supabase/migrations/002_sample_data.sql            - Sample data
```

### Scripts
```
scripts/seed-report-data.ts  - TypeScript seeder
```

---

## Claude Code Continuation

When continuing with Claude Code, you can:

1. **Direct Supabase access** - Claude Code can query/write to Supabase directly
2. **Run the seeder** - `npm run seed:reports`
3. **Test the APIs** - `curl http://localhost:3000/api/reports/health-services/generate`
4. **Generate PDFs** - Use Playwright to convert HTML outputs to PDF

### Example Claude Code Commands

```bash
# Test the live dashboard API
curl http://localhost:3000/api/annual-reports

# Generate a program report
curl http://localhost:3000/api/reports/health-services/generate

# Get Elder Wisdom collection
curl http://localhost:3000/api/reports/elder-wisdom

# Submit community feedback
curl -X POST http://localhost:3000/api/community-feedback \
  -H "Content-Type: application/json" \
  -d '{"feedback_text": "Test feedback", "category": "health"}'
```

---

## Next Steps

1. [ ] Run database migrations in Supabase
2. [ ] Start dev server and verify routes
3. [ ] Test auto-population with existing stories
4. [ ] Configure PDF generation with Playwright
5. [ ] Set up scheduled report generation (cron/Vercel)
6. [ ] Add authentication for admin routes

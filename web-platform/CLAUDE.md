# PICC Web Platform - Claude Code Context

## Integration Priority: GHL First

When implementing communications, notifications, CRM, or contact management features, ALWAYS use GoHighLevel (GHL) as the primary platform. Do NOT build custom email/SMS infrastructure (e.g., Resend, custom SMTP, Twilio direct) unless explicitly told to. Ask before implementing any communication system that bypasses GHL.

## Scope Discipline

Only make changes the user explicitly requested. Do NOT autonomously rework, rename, or refactor adjacent code, content, labels, or UI elements unless asked. If you see something that could be improved, mention it and ask — don't just do it.

## Deployment & Testing Protocol

NEVER tell the user to test a feature until:
1. All code changes are committed and pushed
2. The deployment has been verified as live (check Vercel deployment status via `vercel ls` or `gh run list`)
3. All required environment variables are confirmed set in the deployment environment
4. The build passes locally (`npm run build`)

If any of these are incomplete, say so explicitly instead of asking the user to test.

## Verify Changes Actually Applied

After making changes (especially to scripts, cron jobs, or config), run a quick verification step to confirm the change took effect. Don't just report 'done' — show evidence it's working. For API changes, hit the endpoint. For data changes, query the result. For UI changes, confirm the build passes.

## Environment & Infrastructure Awareness

- **Primary stack**: TypeScript (Next.js), Supabase, Vercel, Stripe, GoHighLevel
- **Database migrations**: Use Supabase MCP tools (`mcp__supabase__apply_migration`, `mcp__supabase__execute_sql`), not REST API or raw psql with guessed credentials
- **Deployments**: Vercel — always verify the correct project is linked before deploying
- **Check existing infrastructure** (env vars, API keys, existing integrations) before proposing new services
- **PDF Generation**: WeasyPrint (Python) is the production system — see `annual-reports/` directory
- **Brand Guide**: `PICC-BRAND-STYLE-GUIDE.md` — always reference before UI work

---

## Project Overview

This is the Palm Island Community Company (PICC) web platform with an "always-on" annual report generation system. The system automates report creation by pulling data from Supabase and the PICC Knowledge Base.

## Supabase Connection

```
URL: https://uaxhjzqrdotoahjnxmbj.supabase.co
Project: uaxhjzqrdotoahjnxmbj
Credentials: See .env.local
```

## Key Files for Annual Reports System

### Database (Run these first)
- `supabase/migrations/001_annual_reports_system.sql` - Schema for all report tables
- `supabase/migrations/002_sample_data.sql` - Sample Elder quotes, feedback, reports

### Core Data
- `lib/picc-knowledge-base.ts` - Hardcoded PICC statistics and organizational data

### PDF Generation Pipeline (Unified)
```
annual-reports/scripts/assemble_content.py   - Pull content from Supabase → JSON
annual-reports/scripts/generate_pdf.py       - Generate PDF from JSON via WeasyPrint
annual-reports/scripts/validate_data.py      - Validate database readiness
annual-reports/scripts/validate_pdf.py       - Validate generated PDF quality
annual-reports/templates/annual-report.html  - Jinja2 template
annual-reports/templates/styles/             - Brand CSS + layout CSS
```

### API Routes
```
app/api/annual-reports/route.ts                    - Main reports CRUD
app/api/annual-reports/[id]/populate/route.ts      - Auto-populate sections
app/api/reports/[program]/generate/route.ts        - Program report generator
app/api/reports/elder-wisdom/route.ts              - Elder Wisdom collection
app/api/stories/export-collection/route.ts         - Story collection export
app/api/community-feedback/route.ts                - Feedback CRUD
```

### Pages
```
app/annual-report/live/page.tsx                    - Real-time dashboard
app/reports/page.tsx                               - Reports hub
app/reports/elder-wisdom/page.tsx                  - Elder Wisdom viewer
app/reports/community-voices/page.tsx              - Community feedback UI
app/reports/story-collection/page.tsx              - Story export interface
app/reports/programs/page.tsx                      - Program reports selector
```

### Components
```
components/story-scroll/                           - ABC-style scroll components
components/annual-reports/                         - Report-specific components
```

## Program Slugs

| Slug | Service |
|------|---------|
| `health-services` | Bwgcolman Healing Service |
| `family-services` | Family Care Service |
| `children-family-centre` | Children & Family Centre |
| `delegated-authority` | Delegated Authority |
| `digital-service-centre` | Digital Service Centre |
| `justice-services` | Justice Services |
| `crisis-services` | Crisis Services / Safe House |
| `economic-development` | Economic Development |

## Fiscal Year Convention

PICC uses July-June fiscal years (e.g., "2024-25" = July 2024 to June 2025).

## Cultural Protocols

- Elder content requires `elder_approval_given = true`
- Traditional knowledge flagged with `contains_traditional_knowledge`
- Sensitivity levels: `standard`, `sensitive`, `restricted`
- Hull River narrative is central to organizational identity

## NPM Scripts

```bash
npm run dev                 # Start development server
npm run seed:reports        # Seed report sample data
npm run reports:live        # Open live dashboard
npm run reports:hub         # Open reports hub
```

## Available Claude Code Skills

| Skill | Purpose |
|-------|---------|
| `/deploy` | Build, deploy, and verify before reporting ready |
| `/brand` | Load PICC brand constraints before UI work |
| `/data-validate` | Validate database readiness for annual reports |
| `/report` | Generate annual report PDF end-to-end |
| `/data-cleanup` | Run data enrichment/cleanup pipelines with validation |

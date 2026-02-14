# PICC Web Platform - Claude Code Context

## Integration Priority: GHL First

When implementing communications, notifications, CRM, or contact management features, ALWAYS use GoHighLevel (GHL) as the primary platform. Do NOT build custom email/SMS infrastructure (e.g., Resend, custom SMTP, Twilio direct) unless explicitly told to. Ask before implementing any communication system that bypasses GHL.

## Debugging & Bug Fixes

Before attempting surface-level fixes (CSS, UI styling, quick patches), investigate the underlying data structures and component architecture first. When a bug manifests visually, the root cause is often a data format mismatch, schema issue, or broken prop chain — not a styling problem. After 2 failed fix attempts, stop and trace the actual data flow end-to-end before trying again.

## Data & Dashboards

Never use fake, seed, or placeholder data in dashboards or pages that connect to real data sources (Xero, GHL, Supabase). Always wire to actual data first, even if incomplete. If real data is unavailable, show an explicit "No data available" state rather than fabricated numbers. Before declaring dashboard work done, query actual Supabase tables and show real data to verify.

## Code Standards

Primary language is TypeScript. Always ensure `tsc --noEmit` and `next build` pass cleanly before considering a task complete. All new files should be TypeScript (.ts/.tsx), not JavaScript.

## Database (Supabase)

Always verify column names match exactly between migration SQL, TypeScript types, and query code before running. Common issue: column name mismatches causing silent failures. Use Supabase MCP tools for migrations, not REST API or raw psql.

## Deployment

This project deploys to Vercel from the `main` branch. Always merge/push to `main` for production deployments. Never assume a `develop` or feature branch deploy will be visible on the production URL.

## Local Development

When launching local dev servers: (1) Clear `.next` cache before starting if there have been significant changes, (2) Check for port conflicts before binding, (3) Run the server in foreground mode for diagnostics — only background it once confirmed working. If the server exits or crashes, diagnose before blindly restarting.

## Directory Awareness

Always verify you're working in the correct directory and project before running commands. The main web app is at `web-platform/`. Never assume which project/site the user means — ask if ambiguous.

## Workflow & Planning

For multi-phase plans: complete and verify each phase fully (including testing with real data) before moving to the next. Do not start Phase 2 while Phase 1 has unresolved issues. If the user interrupts during planning, ask what specifically needs to change rather than restarting.

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
| `/predeploy` | Full validation checklist before pushing to production |

# PICC Web Platform - Claude Code Context

## Integration Priority: GHL First

When implementing communications, notifications, CRM, or contact management features, ALWAYS use GoHighLevel (GHL) as the primary platform. Do NOT build custom email/SMS infrastructure (e.g., Resend, custom SMTP, Twilio direct) unless explicitly told to. Ask before implementing any communication system that bypasses GHL.

## Debugging & Bug Fixes

Before attempting surface-level fixes (CSS, UI styling, quick patches), investigate the underlying data structures and component architecture first. When a bug manifests visually, the root cause is often a data format mismatch, schema issue, or broken prop chain — not a styling problem.

**Two-Strike Rule**: After 2 failed fix attempts, STOP patching. Do not attempt a third incremental fix. Instead: (1) identify the root architectural issue causing the bug to persist, (2) propose a proper fix that addresses the underlying problem, (3) explain what was wrong with the incremental approach. Only then implement the architectural fix. This prevents the token-burning spiral of 5+ patch attempts that compound wrong assumptions.

## Data & Dashboards

Never use fake, seed, or placeholder data in dashboards or pages that connect to real data sources (Xero, GHL, Supabase). Always wire to actual data first, even if incomplete. If real data is unavailable, show an explicit "No data available" state rather than fabricated numbers. Before declaring dashboard work done, query actual Supabase tables and show real data to verify.

**Real Data Only**: Never use fabricated names, placeholder quotes, or generic photos. All people, quotes, and images must come from Supabase tables (`stories`, `elder_quotes`, `extracted_quotes`, `community_visions`, `media_files`). If no real data exists for a section, show an empty/hidden state — never invent content. Elder content requires `is_validated = true` and `permission_level = 'public'`. Use `getCuratedQuotes()` from `lib/quotes/get-curated-quotes.ts` for all quote display.

## Code Standards

Primary language is TypeScript. Always ensure `tsc --noEmit` and `next build` pass cleanly before considering a task complete. All new files should be TypeScript (.ts/.tsx), not JavaScript.

## Database (Supabase)

Always verify column names match exactly between migration SQL, TypeScript types, and query code before running. Common issue: column name mismatches causing silent failures. Use Supabase MCP tools for migrations, not REST API or raw psql.

**Bulk Operation Safety**: Before any bulk import, backfill, or data migration, always run a scoped `SELECT count(*)` dry run first and confirm the scope with the user. Never run aggressive imports without confirming the exact filter criteria match the intended records. Snapshot affected rows before mutating.

**No Hardcoded Org Data**: Never hardcode organization-specific names, logos, quotes, or content into shared components or templates. All org-specific content must come from the database or config. If a component needs org-specific data, pass it as props sourced from Supabase.

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

## Agent Delegation (Opus 4.7)

Every Agent/Task call MUST include: (1) explicit task budget (tokens or steps), (2) stop criteria ("stop when X passes" — not "stop when done"), (3) fallback ("if you can't find X, return Y, don't guess"), (4) scoped file list (don't pass whole-repo context). Opus 4.7 adaptive thinking + xhigh default means fuzzy agent prompts eat budget reconstructing intent before doing real work. See `~/.claude/rules/opus-4-7-prompting.md`.

Anthropic API calls in this codebase: never set `temperature`, `top_p`, or `top_k` — Opus 4.7 returns 400. Audited 2026-04-18, all clean.

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
- **PDF Generation**: React PDF (`@react-pdf/renderer`) is the standard — see `lib/pdf/` for theme, components, templates. API: `GET /api/pdf/generate?type=annual-report|stories|services|history&audience=community|funder|supporter|board`
- **Report Builder UI**: `/picc/reports/builder` — audience-targeted on-demand annual report generation
- **Curated Voices API**: `GET /api/annual-report-data/curated-voices` — community stories, elder quotes, visions
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

## Key Directories

- PDF system: `lib/pdf/` (theme, components, templates) — API: `/api/pdf/generate`
- Legacy PDF: `annual-reports/scripts/` (WeasyPrint, deprecated)
- Migrations: `supabase/migrations/`
- Program slugs: query `SELECT slug, name FROM services`

## Fiscal Year Convention

PICC uses July-June fiscal years (e.g., "2024-25" = July 2024 to June 2025).

## Cultural Protocols

- Elder content requires `elder_approval_given = true`
- Traditional knowledge flagged with `contains_traditional_knowledge`
- Sensitivity levels: `standard`, `sensitive`, `restricted`
- Hull River narrative is central to organizational identity

## Available Claude Code Skills

| Skill | Purpose |
|-------|---------|
| `/deploy` | Build, deploy, and verify before reporting ready |
| `/brand` | Load PICC brand constraints before UI work |
| `/data-validate` | Validate database readiness for annual reports |
| `/report` | Generate annual report PDF end-to-end |
| `/data-cleanup` | Run data enrichment/cleanup pipelines with validation |
| `/predeploy` | Full validation checklist before pushing to production |
| `/preflight` | Environment health check before feature work (cache, ports, env vars, types) |

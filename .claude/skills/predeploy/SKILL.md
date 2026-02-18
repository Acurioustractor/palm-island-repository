# Pre-Deploy Validation Skill

Run a full validation checklist before pushing to production. DO NOT push until every check passes.

## When to Use

- Before any `git push` to main
- Before telling the user a feature is ready
- When the user says "predeploy", "check before deploy", "ready to ship?"
- When `/predeploy` is invoked

## Checklist

Run ALL checks below. Present results as a checklist with pass/fail. Fix failures and re-check before proceeding.

### 1. Git Status — Uncommitted Files

```bash
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform && git status --short
```

Flag any uncommitted files that are imported by the codebase. Search for imports referencing unstaged files. Do NOT push with missing files.

### 2. Branch Check — Must Be Main

```bash
git branch --show-current
```

Production deploys from `main` only. If on a feature branch, merge to main first. Never assume a feature branch deploy will be visible on production.

### 3. TypeScript Compilation

```bash
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform && npx tsc --noEmit --pretty
```

Must complete with zero errors.

### 4. Next.js Build

```bash
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform && npm run build
```

Must complete with zero errors and zero warnings that indicate runtime failures.

### 5. Environment Variables

Check for any new env vars introduced by recent changes:

```bash
# Find env var references in changed files
git diff main --name-only | xargs grep -h 'process\.env\.' 2>/dev/null | sort -u
```

Cross-reference with `.env.local` to ensure nothing is missing. Flag any vars that might not be set in Vercel.

### 6. No Hardcoded Test Values

```bash
# Check staged/changed files for localhost, test keys, or hardcoded values
git diff main -- '*.ts' '*.tsx' | grep -i 'localhost\|127\.0\.0\.1\|test_key\|sk_test\|CHANGEME' || echo "Clean"
```

### 7. Data Integrity (for dashboard/data pages)

If the changes touch dashboard or data-display pages, verify real data exists:

```bash
# Use Supabase MCP to check key tables have real data
# mcp__supabase__execute_sql "SELECT count(*) FROM [relevant_table]"
```

Confirm no fake/seed/placeholder data will be shown to users.

## Results Format

Present as:

```
## Pre-Deploy Checklist

- [x] Git status: All files committed
- [x] Branch: main
- [x] TypeScript: Zero errors
- [x] Build: Passed
- [x] Env vars: All present
- [x] No hardcoded test values
- [x] Data integrity: Real data verified

Ready to push.
```

Or if something fails:

```
## Pre-Deploy Checklist

- [x] Git status: All files committed
- [ ] Build: FAILED — missing import in DashboardCard.tsx
- ...

Fixing build error before proceeding.
```

## Rules

- NEVER push if any check fails
- Fix issues and re-run the failed check
- If a check requires user input (e.g., new env var needs Vercel config), tell them explicitly
- This skill gates deployment — do not skip steps for speed

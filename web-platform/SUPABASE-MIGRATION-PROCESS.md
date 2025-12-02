# Supabase Database Migration Process

**Official Process for Running Database Migrations - Follow This Every Time**

Based on [Supabase Official Documentation](https://supabase.com/docs/guides/deployment/database-migrations) and [CLI Reference](https://supabase.com/docs/reference/cli/supabase-db-push).

---

## ⚠️ STOP - Read This First

**DO NOT attempt to:**
- ❌ Use `supabase db execute --project-ref` (this flag doesn't exist)
- ❌ Execute SQL via curl/fetch to RPC endpoints (not supported)
- ❌ Use Supabase JavaScript client for DDL operations (doesn't work)
- ❌ Run complex bash scripts with shell escaping (causes parse errors)

**ONLY use the official Supabase CLI commands below.**

---

## Prerequisites

### 1. Ensure SUPABASE_ACCESS_TOKEN is set in .env.local

```bash
# In .env.local, you should have:
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxx
```

To get your access token:
1. Go to [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
2. Create a new token or use existing
3. Add to `.env.local`

### 2. Verify Supabase CLI is installed

```bash
npx supabase --version
```

---

## Migration Workflow: The Official 4-Step Process

### Step 1: Create Migration File

**Create a new timestamped migration file in `supabase/migrations/` directory:**

```bash
# Create migration manually with timestamp
touch "supabase/migrations/$(date +%Y%m%d%H%M%S)_your_migration_name.sql"
```

Or use Supabase CLI to generate:

```bash
npx supabase migration new your_migration_name
```

**Write your SQL in this file.** Example:
```sql
-- supabase/migrations/20250129120000_add_collections.sql
CREATE TABLE photo_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);
```

### Step 2: Link to Remote Project (One-time setup)

**Link your local project to remote Supabase:**

```bash
cd web-platform
npx supabase link --project-ref uaxhjzqrdotoahjnxmbj
```

When prompted for password, it will use `SUPABASE_DB_PASSWORD` from env or prompt you.

**Verify link:**
```bash
npx supabase projects list
```

### Step 3: Preview Migration (Dry Run)

**ALWAYS preview before applying:**

```bash
npx supabase db push --dry-run
```

This shows:
- Which migrations will be applied
- SQL that will be executed
- NO actual changes to database

### Step 4: Apply Migration

**Push migrations to remote database:**

```bash
npx supabase db push
```

What happens:
1. Creates `supabase_migrations.schema_migrations` table (first time only)
2. Checks which migrations haven't been applied yet
3. Applies pending migrations in order
4. Records each migration in history table

**Verify success:**
```bash
# Check if tables exist via REST API
curl -s "https://uaxhjzqrdotoahjnxmbj.supabase.co/rest/v1/your_table_name?limit=0" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Alternative: Direct Connection String Method

If `supabase link` doesn't work, use direct connection:

```bash
# Set database password in env
export SUPABASE_DB_PASSWORD="your_db_password"

# Push using direct connection string
npx supabase db push --db-url "postgresql://postgres.[project-ref].supabase.co:5432/postgres"
```

Get your connection string from:
[Supabase Dashboard → Project Settings → Database](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/database)

---

## Simplified One-Command Process (For Repeat Use)

**Once project is linked, all future migrations are just:**

```bash
# 1. Create migration file
npx supabase migration new your_migration_name

# 2. Write SQL in the file

# 3. Preview
npx supabase db push --dry-run

# 4. Apply
npx supabase db push
```

---

## Common Issues & Solutions

### Issue: "unknown flag: --project-ref"
**Solution:** Don't use `--project-ref`. Use `supabase link` first, then `supabase db push`.

### Issue: "Could not find the table in schema cache"
**Solution:** Table doesn't exist. Migration hasn't been applied yet. Run `supabase db push`.

### Issue: "Failed to connect to database"
**Solution:** Check:
1. `SUPABASE_ACCESS_TOKEN` is set in `.env.local`
2. Network connection is working
3. Project ref is correct: `uaxhjzqrdotoahjnxmbj`

### Issue: Shell parsing errors with curl/bash
**Solution:** Stop using curl/bash. Use `supabase db push` instead.

---

## For CI/CD Automation

**GitHub Actions Example:**

```yaml
- name: Apply database migrations
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
  run: |
    npx supabase link --project-ref uaxhjzqrdotoahjnxmbj
    npx supabase db push
```

---

## Directory Structure

```
web-platform/
├── supabase/
│   ├── migrations/
│   │   ├── 20250129120000_add_collections.sql
│   │   ├── 20250129130000_add_smart_folders.sql
│   │   └── ...
│   ├── seed.sql (optional - test data)
│   └── config.toml
├── .env.local (contains SUPABASE_ACCESS_TOKEN)
└── ...
```

---

## Best Practices

✅ **DO:**
- Always use `--dry-run` first
- Keep migrations small and focused
- Use descriptive migration names
- Test locally before pushing to production
- Version control all migration files
- Never edit existing migration files once pushed

❌ **DON'T:**
- Don't run migrations from multiple machines simultaneously
- Don't skip migrations (they run in order)
- Don't manually edit `supabase_migrations.schema_migrations` table
- Don't use `--include-all` unless you know what you're doing

---

## Quick Reference Commands

```bash
# Link project (one-time)
npx supabase link --project-ref uaxhjzqrdotoahjnxmbj

# Create new migration
npx supabase migration new <name>

# Preview migrations
npx supabase db push --dry-run

# Apply migrations
npx supabase db push

# Pull remote schema changes
npx supabase db pull

# Check migration status
npx supabase migration list
```

---

## Sources & Documentation

- [Database Migrations | Supabase Docs](https://supabase.com/docs/guides/deployment/database-migrations)
- [supabase db push | CLI Reference](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Local Development | Supabase Docs](https://supabase.com/docs/guides/local-development/overview)
- [Supabase CLI for LLMs](https://supabase.com/llms/cli.txt)
- [Managing Environments | Supabase Docs](https://supabase.com/docs/guides/deployment/managing-environments)

---

## Current Project Details

- **Project Ref:** `uaxhjzqrdotoahjnxmbj`
- **Project URL:** `https://uaxhjzqrdotoahjnxmbj.supabase.co`
- **Dashboard:** [https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj)
- **SQL Editor:** [https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new)

---

**Last Updated:** January 2025 based on Supabase CLI v1.x documentation

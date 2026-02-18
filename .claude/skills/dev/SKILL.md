# Dev Skill — Local Development Server

Start the Next.js dev server with proper cache clearing, port management, and diagnostics.

## When to Use

- When starting a development session
- When the user says "start dev", "run local", "dev server"
- Before UI work so changes are visible immediately
- When `/dev` is invoked

## Workflow

### 1. Verify Correct Directory

Always work from the web-platform directory:

```bash
ls /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform/package.json
```

If the user has multiple projects, confirm which one before proceeding.

### 2. Clear Stale Cache (if needed)

If there have been significant changes, schema updates, or the last build had errors:

```bash
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform && rm -rf .next
```

Always clear cache if:
- The user reports 404s or module-not-found errors
- There were TypeScript compilation errors in the previous session
- Schema or environment changes were made

### 3. Find a Free Port

Port 3000 is used by another app. Default to **3001**.

```bash
lsof -i :3001 -t 2>/dev/null
```

If 3001 is taken, check if it's our dev server already running:
```bash
lsof -i :3001 -P | head -5
```

If it's already our Next.js server, skip to step 5. Otherwise try 3002, 3003.

### 4. Start Dev Server

Use the Bash tool with `run_in_background: true`:

```bash
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform && npx next dev -p 3001
```

Wait 5 seconds, then verify it started:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
```

If you get `200` or `307` (redirect), it's up. If not, check output for errors.

### 5. Report Ready

Tell the user:
- Dev server running at **http://localhost:3001**
- PICC admin at **http://localhost:3001/picc/dashboard**
- Whether cache was cleared (and why)

### 6. Troubleshooting

If the server fails to start or crashes:

```bash
# Check for port conflicts
lsof -i :3001 -P

# Check for TypeScript errors that might block compilation
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform && npx tsc --noEmit --pretty 2>&1 | head -30

# Check node_modules health
ls node_modules/.package-lock.json 2>/dev/null || echo "node_modules may need reinstall"
```

Diagnose the actual error before blindly restarting. Common issues:
- **Module not found**: Clear `.next` cache and restart
- **Port in use**: Find and kill the orphan process or use next port
- **OOM/crash**: Check for infinite loops or large data in dev mode

## Rules

- ALWAYS run in background — never block the conversation waiting for the dev server
- Default port is **3001** (3000 is used by another app)
- Clear `.next` cache proactively when there's any doubt about stale state
- Don't restart the server unless it's actually down
- Diagnose crashes before restarting — don't blindly retry

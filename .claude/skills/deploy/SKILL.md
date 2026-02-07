# Deploy Skill

Build, deploy, and verify changes before reporting ready to test.

## When to Use

- After implementing a feature or fix
- When the user says "deploy this" or "ship it"
- Before telling the user to test anything

## Workflow

### 1. Pre-Flight Checks
```bash
# Type check
cd web-platform && npx tsc --noEmit

# Build
npm run build
```

If either fails, fix the errors before proceeding. Do NOT ask the user to test.

### 2. Commit Changes
- Stage only the files you changed (no `git add .`)
- Write a descriptive commit message
- Push to the current branch

### 3. Verify Deployment
```bash
# Check Vercel deployment status
gh run list --limit 3

# Or check Vercel directly
vercel ls 2>/dev/null || echo "Vercel CLI not linked"
```

Wait for deployment to complete. Check the deployment URL.

### 4. Verify Environment
- Confirm all required env vars are set in Vercel
- Check for any new env vars introduced by this change
- If new env vars needed, tell the user BEFORE asking them to test

### 5. Smoke Test
```bash
# Hit affected endpoints to verify they respond
curl -s -o /dev/null -w "%{http_code}" https://[deployment-url]/api/[endpoint]
```

### 6. Report
Only after ALL above steps pass, report to the user:
- What was changed (files list)
- Deployment URL
- What to test manually (if anything)

## Rules

- NEVER say "please test" before deployment is confirmed live
- NEVER skip the build step
- If deployment fails, investigate and fix — don't ask the user to intervene unless it's an infra issue
- If new env vars are needed, list them explicitly with example values

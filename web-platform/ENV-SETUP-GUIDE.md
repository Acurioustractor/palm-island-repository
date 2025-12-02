# Environment Setup Guide - Never Fuck With This Again

This guide ensures your environment variables are set up correctly **once and for all**.

## 🚨 TL;DR - Quick Fix

If shit's broken, run this:

```bash
npm run check-env
```

It will tell you EXACTLY what's wrong and how to fix it.

---

## ✅ One-Time Setup (Do This Once)

### Step 1: Your `.env.local` Already Exists and is Correct

**You already have the right file at:**
```
/Users/benknight/Code/Palm Island Reposistory/web-platform/.env.local
```

**IT HAS THE CORRECT VALUES. DO NOT TOUCH IT.**

### Step 2: Verify It's Working

```bash
npm run check-env
```

You should see:
```
✅ All required environment variables are set correctly!
```

If you see errors, read the output - it tells you exactly what to fix.

---

## 🔒 What's Protected

Your `.env.local` file is **automatically protected** and will NEVER be committed to git.

It's already in `.gitignore`, so you can't accidentally share your secrets.

---

## 📋 Your Supabase Configuration

**Project:** Palm Island Community Repository
**Project ID:** `uaxhjzqrdotoahjnxmbj`
**URL:** `https://uaxhjzqrdotoahjnxmbj.supabase.co`

**Dashboard:** https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj

All your keys are in `.env.local`. If you need to see them:
- Supabase Dashboard → Settings → API
- Or just look at your `.env.local` file

---

## 🛠️ npm Scripts

### `npm run check-env`
Validates all your environment variables.

**When to run:**
- When something doesn't work
- Before committing
- When you clone the repo on a new machine

### `npm run dev`
Starts the development server.

**Automatically runs `check-env` first**, so if your environment is fucked, it won't even try to start.

---

## 🔧 Troubleshooting

### "Missing Supabase environment variables"

**Problem:** `.env.local` doesn't exist or has placeholder values.

**Fix:**
```bash
# Check if file exists
ls -la .env.local

# If it doesn't exist, you lost your keys. Get them from:
# https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api
```

### "Invalid format" errors

**Problem:** You copied a key incorrectly (missing characters, extra spaces).

**Fix:**
1. Open `.env.local`
2. Go to https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api
3. Copy the EXACT keys (no spaces before/after)
4. Paste them into `.env.local`
5. Run `npm run check-env` again

### Supabase link fails

**Problem:** Wrong project ID or access token.

**Fix:**
```bash
# Make sure your .env.local has:
SUPABASE_ACCESS_TOKEN=sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b

# Then link with:
supabase link --project-ref uaxhjzqrdotoahjnxmbj
```

---

## 📦 Adding a New Team Member

When someone new joins and needs to set up:

1. **They clone the repo:**
   ```bash
   git clone <repo_url>
   cd palm-island-repository/web-platform
   ```

2. **They create their `.env.local`:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **They get the keys from you** (Slack, email, password manager, etc.)

4. **They paste the keys into `.env.local`**

5. **They verify it works:**
   ```bash
   npm run check-env
   ```

6. **Done!**

---

## 🚫 What NOT to Do

❌ **DO NOT** commit `.env.local` to git
❌ **DO NOT** share your `.env.local` in public (Slack channels, screenshots)
❌ **DO NOT** copy `.env.local.example` thinking it has real keys (it doesn't)
❌ **DO NOT** edit `.env.local.example` with real keys (that file gets committed)

---

## ✅ What to Do Instead

✅ **DO** use `npm run check-env` to validate
✅ **DO** share keys securely (password manager, encrypted message)
✅ **DO** update `.env.local.example` when you add NEW variables (with placeholder values)
✅ **DO** keep your `.env.local` backed up somewhere safe

---

## 🔑 Key Management

### Rotating Keys

If you need to rotate keys (security breach, leak, etc.):

1. Go to Supabase Dashboard → Settings → API
2. Click "Reset" on the key you want to rotate
3. Copy the new key
4. Update `.env.local` with the new key
5. Run `npm run check-env`
6. Notify all team members to update their keys

### Backup

Your `.env.local` should be backed up in:
- [ ] Password manager (1Password, Bitwarden, etc.)
- [ ] Secure note in your company's system
- [ ] Encrypted backup location

**DO NOT** rely on only having it on your laptop. If your laptop dies, you need these keys.

---

## 🎯 Final Checklist

Before you start working:

- [ ] `.env.local` exists
- [ ] `npm run check-env` shows all green ✅
- [ ] `supabase link` succeeded
- [ ] `npm run dev` starts without errors

If all of these work, **you're good to go and should never have to fuck with this again**.

---

## 🆘 Still Broken?

If `npm run check-env` still shows errors after following this guide:

1. Run: `npm run check-env` and screenshot the output
2. Check if `.env.local` exists: `ls -la .env.local`
3. Verify you're using the right project: `uaxhjzqrdotoahjnxmbj`
4. Get fresh keys from Supabase dashboard
5. If still broken, ask for help (with screenshot of error, NOT your keys)

---

**Remember:** The validation script (`npm run check-env`) is your friend. It will never lie to you. If it says something is wrong, it's wrong. Fix what it tells you to fix.

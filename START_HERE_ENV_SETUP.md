# 🚀 START HERE - Environment Setup

**Last Updated:** 2025-11-07
**Branch:** `claude/repo-review-011CUuHcsYJgU4VfdKJVrJUV`

---

## 📍 You Are Here

All environment variable management files are now in place and pushed to your branch. This guide will walk you through setting up your development environment.

---

## ✅ What Was Just Created

### 1. **web-platform/ENV_SETUP_GUIDE.md** (250+ lines)
   - **Location:** `web-platform/ENV_SETUP_GUIDE.md`
   - **Purpose:** Complete reference guide for all environment variables
   - **Contains:**
     - Quick 2-minute setup instructions
     - Where to get each API key (with direct links)
     - Security best practices
     - Troubleshooting common errors
     - Team onboarding checklist

### 2. **web-platform/scripts/check-env.js** (Verification Script)
   - **Location:** `web-platform/scripts/check-env.js`
   - **Purpose:** Automated verification of your environment setup
   - **Features:**
     - Checks all required variables
     - Security validation
     - Masks sensitive values
     - Clear error messages with fixes

### 3. **web-platform/.env.local.example** (Enhanced Template)
   - **Location:** `web-platform/.env.local.example`
   - **Purpose:** Template with comprehensive inline documentation
   - **Contains:**
     - Required variables (Supabase, Organization ID)
     - Optional AI/ML variables (OpenAI, Pinecone, Qdrant)
     - Security warnings
     - Direct links to get keys

---

## 🎯 Next Steps - Do This Now

### Step 1: Navigate to web-platform directory
```bash
cd web-platform
```

### Step 2: Create your .env.local file
```bash
cp .env.local.example .env.local
```

### Step 3: Open .env.local in VS Code
```bash
code .env.local
```

### Step 4: Fill in REQUIRED variables

You **MUST** fill in these 4 variables:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Get from: https://app.supabase.com/project/_/settings/api
   - Example: `https://xxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Get from: Same page as above (look for "anon" "public" key)
   - Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Get from: Same page (look for "service_role" key)
   - ⚠️ **IMPORTANT:** This is a SECRET - never commit it!
   - Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **NEXT_PUBLIC_PICC_ORGANIZATION_ID**
   - Already filled in with default: `3c2011b9-f80d-4289-b300-0cd383cff479`
   - Leave as-is unless you need a different organization

### Step 5: Verify everything is correct
```bash
node scripts/check-env.js
```

**Expected output:**
```
✅ ALL CHECKS PASSED!

Your environment is configured correctly.

Next steps:
  npm run dev          # Start development server
  npm run build        # Build for production
  npm run typecheck    # Check TypeScript
```

### Step 6: Start development
```bash
npm run dev
```

---

## 🔒 Security - CRITICAL INFORMATION

### What Gets Exposed to Browser (SAFE)
Variables with `NEXT_PUBLIC_` prefix are embedded in the browser bundle:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Public, safe
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Protected by Row Level Security, safe
- ✅ `NEXT_PUBLIC_PICC_ORGANIZATION_ID` - Public, safe

### What Stays on Server (SECRET)
Variables WITHOUT `NEXT_PUBLIC_` prefix stay on server only:
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` - **NEVER add NEXT_PUBLIC_ to this!**
- 🔒 `OPENAI_API_KEY` - Server-only
- 🔒 `PINECONE_API_KEY` - Server-only
- 🔒 `QDRANT_API_KEY` - Server-only

**The check-env.js script will detect if you accidentally expose a secret!**

---

## 🤖 Optional: AI/ML Services (Not Required Yet)

The dependencies are installed but integration code is not yet written.
You can configure these later when you're ready to implement semantic search:

### OpenAI (for embeddings)
- Sign up: https://platform.openai.com/
- Get API key: https://platform.openai.com/api-keys
- Cost: ~$0.0001 per 1K tokens (very affordable)

### Pinecone (vector database - Option 1)
- Sign up: https://app.pinecone.io/
- Free tier: 1 index, 100K vectors
- Easier to set up

### Qdrant (vector database - Option 2)
- Sign up: https://cloud.qdrant.io/
- Open source, can self-host
- More control

---

## 📂 File Locations (Quick Reference)

```
palm-island-repository/
├── START_HERE_ENV_SETUP.md          ← You are here!
├── WORK_COMPLETED_SUMMARY.md        ← All work done so far
└── web-platform/
    ├── .env.local.example           ← Template (COPY THIS)
    ├── .env.local                   ← Your keys go here (CREATE THIS)
    ├── ENV_SETUP_GUIDE.md           ← Detailed reference guide
    └── scripts/
        └── check-env.js             ← Verification script
```

---

## ❗ Common Issues & Fixes

### Issue: "Missing Supabase environment variables"
**Fix:** Make sure you created `.env.local` from the template:
```bash
cp .env.local.example .env.local
```

### Issue: "SECURITY ERROR: SUPABASE_SERVICE_ROLE_KEY has NEXT_PUBLIC_ prefix!"
**Fix:** Remove `NEXT_PUBLIC_` from that variable name in `.env.local`:
```bash
# ❌ WRONG
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...

# ✅ CORRECT
SUPABASE_SERVICE_ROLE_KEY=...
```

### Issue: ".env.local file not found"
**Fix:** You're probably in the wrong directory. Navigate to web-platform:
```bash
cd web-platform
ls -la | grep .env
```

### Issue: Changes not taking effect
**Fix:** Restart your dev server - Next.js reads .env files at startup:
```bash
# Stop server (Ctrl+C), then:
npm run dev
```

---

## ✅ Verification Checklist

Before you continue development, make sure:

- [ ] You're in the `web-platform` directory
- [ ] `.env.local` file exists (copied from `.env.local.example`)
- [ ] All 4 REQUIRED variables are filled in
- [ ] You ran `node scripts/check-env.js` successfully
- [ ] You got the "✅ ALL CHECKS PASSED!" message
- [ ] Dev server starts without errors (`npm run dev`)

---

## 📚 For More Help

- **Detailed Setup Guide:** `web-platform/ENV_SETUP_GUIDE.md`
- **What Work Was Done:** `WORK_COMPLETED_SUMMARY.md`
- **Style Guide:** `web-platform/STYLE_GUIDE.md`

---

## 🎯 Summary

**You need to do:**
1. `cd web-platform`
2. `cp .env.local.example .env.local`
3. Edit `.env.local` with your 4 Supabase keys
4. `node scripts/check-env.js` to verify
5. `npm run dev` to start

**That's it!** The environment variable management system will handle the rest.

---

**Questions?** See `web-platform/ENV_SETUP_GUIDE.md` for detailed documentation.

# Environment Variable Setup Guide
## Palm Island Community Repository

**The Problem:** Managing API keys across development, staging, and production is always a pain.

**The Solution:** This foolproof system that makes environment variables "locked and easily accessible."

---

## 🎯 Quick Setup (2 Minutes)

### Step 1: Copy the Template

```bash
cd web-platform
cp .env.local.example .env.local
```

### Step 2: Get Your Keys

Open `.env.local` and fill in the values below.

---

## 🔑 Required Keys (Get These First)

### 1. Supabase Keys (REQUIRED)

**Where to get them:**
1. Go to https://supabase.com/dashboard
2. Select your Palm Island project
3. Click Settings → API

**Copy these 3 values:**

```bash
# From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ SECURITY WARNING:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Safe to expose to browser (public)
- `SUPABASE_SERVICE_ROLE_KEY` → **NEVER** expose to browser (server-only)

### 2. Organization ID (REQUIRED)

```bash
# This is your PICC organization UUID
NEXT_PUBLIC_PICC_ORGANIZATION_ID=3c2011b9-f80d-4289-b300-0cd383cff479
```

**Note:** This is already set correctly. Don't change unless you have multiple organizations.

---

## 🤖 Optional AI/ML Keys (For Advanced Features)

### 3. OpenAI API Key (Optional - for embeddings & chat)

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key immediately (you won't see it again!)

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**What this enables:**
- Semantic search across stories
- Story similarity matching
- AI-powered content analysis
- Automated tagging

**Cost:** ~$0.10-$2.00 per month for typical usage

### 4. Vector Database (Optional - choose ONE)

#### Option A: Pinecone (Recommended - Easier)

**Where to get it:**
1. Go to https://app.pinecone.io
2. Create a free account
3. Create an index called `palm-island-content`
4. Copy your API key

```bash
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=palm-island-content
```

#### Option B: Qdrant (Self-hosted alternative)

```bash
QDRANT_URL=https://your-qdrant-instance.com
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=palm-island-stories
```

**What this enables:**
- Advanced semantic search
- "Find similar stories" feature
- AI-powered recommendations

### 5. Analytics (Optional)

```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 📋 Complete .env.local Template

Copy this entire block into your `.env.local` file:

```bash
#######################################################
# PALM ISLAND COMMUNITY REPOSITORY
# Environment Configuration
#######################################################

#
# 1. SUPABASE (REQUIRED)
#
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

#
# 2. ORGANIZATION (REQUIRED)
#
NEXT_PUBLIC_PICC_ORGANIZATION_ID=3c2011b9-f80d-4289-b300-0cd383cff479

#
# 3. AI/ML (OPTIONAL - Comment out if not using)
#
# OPENAI_API_KEY=
# PINECONE_API_KEY=
# PINECONE_ENVIRONMENT=us-east-1-aws
# PINECONE_INDEX=palm-island-content

#
# 4. ANALYTICS (OPTIONAL)
#
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

#
# 5. APP CONFIGURATION (OPTIONAL)
#
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# NODE_ENV=development
```

---

## 🔒 Security Best Practices

### ✅ DO:

1. **Keep .env.local private**
   ```bash
   # Already in .gitignore - but double-check:
   grep ".env.local" .gitignore
   ```

2. **Use NEXT_PUBLIC_ prefix ONLY for browser-safe values**
   - `NEXT_PUBLIC_SUPABASE_URL` ✅ (safe)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (safe - designed for browser)
   - `SUPABASE_SERVICE_ROLE_KEY` ❌ (NEVER use NEXT_PUBLIC_)

3. **Rotate keys regularly**
   - Every 90 days for production
   - Immediately if compromised

4. **Use different keys for dev/staging/production**

### ❌ DON'T:

1. **Never commit .env.local to git**
2. **Never expose service role keys to the browser**
3. **Never hardcode keys in your code**
4. **Never share keys in Slack/Email**

---

## 🚀 Deployment (Production)

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add each variable one by one:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production
```

**Pro Tip:** You can bulk import from `.env.local`:

```bash
vercel env pull .env.local
vercel env push .env.local production
```

### Other Platforms (Netlify, Railway, etc.)

Each platform has an environment variables section:
- **Netlify:** Site settings → Build & deploy → Environment
- **Railway:** Project settings → Variables
- **Render:** Dashboard → Environment

---

## 🔍 Troubleshooting

### "Missing Supabase environment variables" Error

**Problem:** `.env.local` file is missing or variables are undefined

**Solution:**
```bash
# 1. Check if file exists
ls -la .env.local

# 2. If not, copy from example
cp .env.local.example .env.local

# 3. Fill in your actual values
nano .env.local
```

### Variables Not Loading

**Problem:** Next.js not picking up env changes

**Solution:**
```bash
# Restart the dev server
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

**Note:** Next.js only reads .env files on startup!

### "Cannot read NEXT_PUBLIC_SUPABASE_URL of undefined"

**Problem:** Variable name typo or not prefixed correctly

**Solution:**
```javascript
// ❌ Wrong - missing NEXT_PUBLIC_ prefix
const url = process.env.SUPABASE_URL

// ✅ Correct
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
```

---

## 🧪 Verification Script

Create this file to test your environment setup:

**File: `web-platform/scripts/check-env.js`**

```javascript
#!/usr/bin/env node

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_PICC_ORGANIZATION_ID'
];

const optional = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'QDRANT_API_KEY'
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

// Check required
required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ MISSING: ${key}`);
    hasErrors = true;
  } else {
    const masked = value.length > 20
      ? value.slice(0, 10) + '...' + value.slice(-10)
      : value.slice(0, 5) + '...';
    console.log(`✅ ${key}: ${masked}`);
  }
});

console.log('\nOptional variables:');

// Check optional
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    const masked = value.slice(0, 5) + '...';
    console.log(`✅ ${key}: ${masked} (configured)`);
  } else {
    console.log(`⚪ ${key}: Not configured (optional)`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ ERRORS FOUND: Check .env.local file');
  process.exit(1);
} else {
  console.log('✅ ALL REQUIRED VARIABLES SET');
  console.log('\nYou can now run:');
  console.log('  npm run dev');
}
```

**Run it:**
```bash
chmod +x scripts/check-env.js
node scripts/check-env.js
```

---

## 📦 Team Onboarding

When a new developer joins:

### 1. Send them this checklist:

```markdown
# Palm Island Repository Setup Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Get Supabase keys from [Team Lead Name]
- [ ] Fill in `.env.local` with your keys
- [ ] Run `node scripts/check-env.js` to verify
- [ ] Run `npm run dev` to start
- [ ] Visit http://localhost:3000

Questions? Check `ENV_SETUP_GUIDE.md`
```

### 2. Secure key sharing methods:

**Option A: 1Password Shared Vault** (Recommended)
- Create "Palm Island Env Vars" vault
- Share with team
- Everyone pulls latest keys

**Option B: Encrypted file**
```bash
# Encrypt .env.local for sharing
openssl enc -aes-256-cbc -salt -in .env.local -out env.encrypted

# Decrypt when received
openssl enc -aes-256-cbc -d -in env.encrypted -out .env.local
```

**Option C: Supabase CLI** (Best for Supabase keys)
```bash
# Install
npm install -g supabase

# Login
supabase login

# Pull env vars
supabase link --project-ref your-project-ref
supabase env pull .env.local
```

---

## 🎯 Key Rotation Schedule

| Key Type | Rotation Frequency | Who Does It |
|----------|-------------------|-------------|
| Supabase Anon Key | Yearly or if compromised | Tech Lead |
| Supabase Service Role | 90 days | Tech Lead |
| OpenAI API Key | 90 days | Tech Lead |
| Pinecone API Key | Yearly | Tech Lead |
| Organization ID | Never (it's a UUID) | N/A |

---

## 📱 Mobile/Local Development

If developing on multiple machines:

**Machine 1 (Primary):**
```bash
# Export encrypted env file
openssl enc -aes-256-cbc -salt -in .env.local -out env.encrypted -k "YourPassword123"
```

**Machine 2 (Laptop):**
```bash
# Import encrypted env file
openssl enc -aes-256-cbc -d -in env.encrypted -out .env.local -k "YourPassword123"
```

---

## 🔧 Advanced: Multiple Environments

If you need separate dev/staging/prod:

**Create:**
- `.env.local` (development)
- `.env.staging` (staging)
- `.env.production` (production)

**Load specific env:**
```bash
# Development (default)
npm run dev

# Staging
NODE_ENV=staging npm run dev

# Production
NODE_ENV=production npm start
```

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs/guides/getting-started
- **Next.js Env Vars:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **OpenAI API:** https://platform.openai.com/docs/api-reference
- **Pinecone Docs:** https://docs.pinecone.io/

---

## ✅ Final Checklist

Before deploying:

- [ ] All required variables set in `.env.local`
- [ ] `.env.local` is in `.gitignore`
- [ ] Run `node scripts/check-env.js` - passes
- [ ] Run `npm run dev` - no errors
- [ ] Test Supabase connection works
- [ ] Production env vars set in Vercel/hosting platform
- [ ] Service role key is NOT in any NEXT_PUBLIC_ variable
- [ ] Keys are stored in team password manager

---

**Last Updated:** 2025-11-07
**Maintainer:** PICC Technology Team

Got questions? Check the troubleshooting section or ask in the team chat!

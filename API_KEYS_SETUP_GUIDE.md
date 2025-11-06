# API Keys & Services Setup Guide
## Palm Island Story Server - Complete Configuration

**Last Updated:** November 2025
**Status:** Comprehensive configuration guide for all services

---

## Overview

This guide covers all third-party services, API keys, and configuration needed for the Palm Island Story Server. Services are organized by priority and implementation phase.

---

## 🎯 Quick Setup Checklist

### ✅ Phase 1: Essential (Required for Basic Operation)

- [ ] **Supabase** - Database, Authentication, Storage ($25/month)
- [ ] **Vercel** - Hosting and Deployment ($20/month or free tier)

**Cost: $45/month | Time: 30 minutes**

### 🚀 Phase 2: AI Features (Semantic Search)

- [ ] **OpenAI** - Embeddings and AI (~$50/month)
- [ ] **pgvector** - Already in Supabase (free, included)

**Additional Cost: ~$50/month | Time: 1 hour**

### 📊 Phase 3: Optional Enhancements

- [ ] **Plausible Analytics** - Privacy-friendly analytics ($9/month or free self-hosted)
- [ ] **Sentry** - Error tracking (free tier: 5000 errors/month)
- [ ] **Resend** - Email service (free tier: 100 emails/day)

**Additional Cost: $0-$9/month | Time: 30 minutes**

### 🔮 Phase 4: Advanced Features (Future)

- [ ] **Anthropic Claude** - Alternative AI (pay-as-you-go)
- [ ] **Mapbox** - Maps and geolocation (free tier: 50k loads/month)
- [ ] **Qdrant/Pinecone** - Vector database (Note: Currently using Supabase pgvector instead)

**Additional Cost: Variable | Time: As needed**

---

## 📋 Detailed Service Setup

---

## 1. Supabase (REQUIRED) ⭐

**Purpose:** Database, Authentication, File Storage
**Cost:** $25/month (Pro) or $0/month (Free tier for testing)
**Priority:** IMMEDIATE

### Sign Up & Setup

1. **Create Account**
   ```
   Go to: https://supabase.com
   Click "Start your project"
   Sign up with GitHub or email
   ```

2. **Create Project**
   ```
   Project Name: palm-island-story-server
   Database Password: [SAVE THIS SECURELY]
   Region: Choose closest to Australia (e.g., Sydney)
   Plan: Start with Free, upgrade to Pro when ready
   ```

3. **Get API Keys**
   ```
   Navigate to: Settings > API
   You need 3 values:

   ✅ Project URL: https://xxxxxxxxxxxxx.supabase.co
   ✅ anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ✅ service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Set Up Database**
   ```
   Go to: SQL Editor

   Run these migrations in order:
   1. database-migrations/001_empathy_ledger_base.sql
   2. database-migrations/002_enhanced_profiles.sql
   3. database-migrations/003_document_system.sql
   4. database-migrations/004_ai_features.sql
   ```

5. **Configure Storage**
   ```
   Go to: Storage
   Create buckets:
   - documents (public)
   - profile-images (public)
   - media (public)
   - story-media (public)

   Set up RLS policies for each bucket
   ```

6. **Enable Extensions**
   ```sql
   -- Run in SQL Editor
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS uuid-ossp;
   ```

### Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### Testing

```bash
# Test connection
curl "https://xxxxxxxxxxxxx.supabase.co/rest/v1/" \
  -H "apikey: YOUR_ANON_KEY"

# Or use the test script
npm run test:supabase
```

---

## 2. Vercel (REQUIRED) ⭐

**Purpose:** Web Hosting, Serverless Functions, CDN
**Cost:** $20/month (Pro) or $0/month (Hobby - limited)
**Priority:** IMMEDIATE

### Sign Up & Deploy

1. **Create Account**
   ```
   Go to: https://vercel.com
   Sign up with GitHub
   ```

2. **Import Repository**
   ```
   Click "Add New..." > "Project"
   Select your GitHub repository: palm-island-repository
   Root Directory: web-platform
   Framework Preset: Next.js (auto-detected)
   ```

3. **Configure Environment Variables**
   ```
   In project settings:
   Settings > Environment Variables > Add

   Copy all variables from your .env.local
   OR
   Import .env.production file (easier!)
   ```

4. **Deploy**
   ```
   Click "Deploy"
   Wait 2-3 minutes for build
   Your site will be live at: https://your-project.vercel.app
   ```

5. **Custom Domain** (Optional)
   ```
   Settings > Domains
   Add: palmisland.org.au
   Follow DNS configuration instructions
   ```

### Environment Variables for Vercel

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...

# Site Config
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
NEXT_PUBLIC_SITE_NAME=Palm Island Story Server
NEXT_PUBLIC_DEFAULT_ORG_SLUG=picc

# Feature Flags
NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS=true
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=true

# Add AI keys when ready (Phase 2)
```

---

## 3. OpenAI (AI Features) 🤖

**Purpose:** Embeddings for Semantic Search, AI Text Generation
**Cost:** ~$50/month (depends on usage)
**Priority:** PHASE 2 (When implementing AI features)

### Sign Up & Setup

1. **Create Account**
   ```
   Go to: https://platform.openai.com
   Sign up with email or Google
   ```

2. **Add Payment Method**
   ```
   Settings > Billing
   Add credit card
   Set up usage limits (recommended: $100/month)
   ```

3. **Create API Key**
   ```
   API Keys > Create new secret key
   Name: palm-island-production
   Copy the key (starts with sk-proj-...)
   ⚠️ SAVE IT NOW - you can't see it again!
   ```

4. **Set Usage Limits** (Recommended)
   ```
   Settings > Billing > Usage limits
   Hard limit: $100/month
   Email notification: $50/month
   ```

### Environment Variables

Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Cost Optimization

```bash
# Use the cheaper embedding model
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # $0.00002 per 1K tokens

# For chat/generation (when needed)
OPENAI_MODEL=gpt-4o-mini  # Much cheaper than gpt-4
```

### Estimated Costs

```
Semantic Search (Phase 1):
- Initial embedding generation (1000 stories): ~$0.01
- Ongoing searches: ~$0.01/month
- Total: ~$1-5/month

Theme Extraction (Phase 2):
- Initial theme extraction: ~$10 one-time
- Ongoing: ~$2-5/month

Research Assistant Chat (Phase 4):
- High usage: ~$30-50/month
- Medium usage: ~$10-20/month
- Low usage: ~$5-10/month
```

### Testing

```bash
# Test API connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test embedding generation
npm run test:openai
```

---

## 4. Plausible Analytics (OPTIONAL) 📊

**Purpose:** Privacy-friendly website analytics
**Cost:** $9/month or Free (self-hosted)
**Priority:** NICE TO HAVE

### Option A: Cloud (Easiest)

1. **Sign Up**
   ```
   Go to: https://plausible.io
   Sign up for cloud version
   ```

2. **Add Website**
   ```
   Add domain: palmisland.org.au
   Copy the domain name for config
   ```

3. **Configure**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=palmisland.org.au
   ```

4. **Add Script** (Optional - can use automatic)
   ```html
   <!-- Already configured in app layout -->
   ```

### Option B: Self-Hosted (Free)

```bash
# Use Docker
docker run -d \
  -e DATABASE_URL=postgres://... \
  -p 8000:8000 \
  plausible/analytics:latest
```

### Testing

```
Visit: https://plausible.io/palmisland.org.au
Check if pageviews are being recorded
```

---

## 5. Sentry (Error Tracking) 🐛

**Purpose:** Error monitoring and performance tracking
**Cost:** Free tier (5,000 errors/month) or $26/month
**Priority:** RECOMMENDED

### Setup

1. **Create Account**
   ```
   Go to: https://sentry.io
   Sign up with GitHub
   ```

2. **Create Project**
   ```
   Platform: Next.js
   Project Name: palm-island-story-server
   Alert Frequency: On every new issue
   ```

3. **Get DSN**
   ```
   Settings > Projects > palm-island-story-server > Client Keys (DSN)
   Copy the DSN
   ```

4. **Configure**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

5. **Install SDK**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

### Testing

```javascript
// Trigger a test error
Sentry.captureException(new Error("Test error"));
```

---

## 6. Resend (Email Service) 📧

**Purpose:** Transactional emails (magic links, notifications)
**Cost:** Free (100 emails/day) or $20/month (unlimited)
**Priority:** OPTIONAL

### Setup

1. **Create Account**
   ```
   Go to: https://resend.com
   Sign up with email
   ```

2. **Verify Domain**
   ```
   Add domain: palmisland.org.au
   Add DNS records (provided by Resend)
   Wait for verification (~5 minutes)
   ```

3. **Create API Key**
   ```
   API Keys > Create API Key
   Name: palm-island-production
   Permission: Sending access
   Copy key (starts with re_...)
   ```

4. **Configure**
   ```bash
   # Add to .env.local
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Testing

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Palm Island <noreply@palmisland.org.au>',
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test email</p>'
});
```

---

## 7. Anthropic Claude (FUTURE) 🔮

**Purpose:** Alternative AI for text generation
**Cost:** Pay-as-you-go (~$15/1M tokens input, $75/1M output)
**Priority:** PHASE 4 (Optional alternative to OpenAI)

### Setup (When Needed)

1. **Create Account**
   ```
   Go to: https://console.anthropic.com
   Sign up with email
   ```

2. **Add Payment**
   ```
   Settings > Billing
   Add payment method
   ```

3. **Create API Key**
   ```
   API Keys > Create Key
   Name: palm-island
   Copy key (starts with sk-ant-...)
   ```

4. **Configure**
   ```bash
   # Add to .env.local
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
   ```

---

## 8. Mapbox (Maps) 🗺️

**Purpose:** Geographic visualization, location features
**Cost:** Free (50,000 loads/month)
**Priority:** PHASE 4 (Future feature)

### Setup (When Needed)

1. **Create Account**
   ```
   Go to: https://www.mapbox.com
   Sign up for free account
   ```

2. **Create Access Token**
   ```
   Account > Access Tokens
   Create a token
   Scopes: Default (public)
   Copy token (starts with pk....)
   ```

3. **Configure**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic...
   ```

---

## 🔐 Security Best Practices

### 1. Environment Variables

```bash
# ✅ GOOD: Keep in .env.local (gitignored)
OPENAI_API_KEY=sk-proj-xxxxx

# ❌ BAD: Never commit to Git
# ❌ BAD: Never hardcode in source files
const apiKey = "sk-proj-xxxxx"  // DON'T DO THIS!
```

### 2. Public vs Private Keys

```bash
# PUBLIC (can be exposed in browser) - prefix with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# PRIVATE (server-side only) - NO prefix
OPENAI_API_KEY=sk-proj-xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
RESEND_API_KEY=re_xxxxx
```

### 3. Key Rotation

```
Rotate API keys every 90 days:
- OpenAI: Create new key, update env, delete old key
- Supabase: Same process in Supabase dashboard
- Other services: Follow same pattern
```

### 4. Access Control

```
Limit API key permissions:
- Supabase: Use service_role only in server functions
- OpenAI: Set usage limits
- Resend: Domain-verified sending only
```

---

## 📝 Complete .env.local Template

```bash
# ============================================================================
# PALM ISLAND STORY SERVER - ENVIRONMENT VARIABLES
# ============================================================================
# Copy this template to .env.local and fill in your actual values
# Last Updated: November 2025

# ============================================================================
# 1. SUPABASE (REQUIRED) ⭐
# ============================================================================
# Get from: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# ============================================================================
# 2. SITE CONFIGURATION (REQUIRED) ⭐
# ============================================================================

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Palm Island Story Server
NEXT_PUBLIC_DEFAULT_ORG_SLUG=picc

# ============================================================================
# 3. OPENAI (PHASE 2 - AI Features) 🤖
# ============================================================================
# Get from: https://platform.openai.com/api-keys
# Leave blank until implementing AI features

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model Configuration (Optional - defaults work well)
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# ============================================================================
# 4. FEATURE FLAGS
# ============================================================================

# Core Features
NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS=true

# AI Features (Enable when OpenAI key is configured)
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=false
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=false

# Future Features
NEXT_PUBLIC_ENABLE_FACE_RECOGNITION=false

# ============================================================================
# 5. ANALYTICS (OPTIONAL) 📊
# ============================================================================
# Get from: https://plausible.io (if using cloud version)

# NEXT_PUBLIC_PLAUSIBLE_DOMAIN=palmisland.org.au

# ============================================================================
# 6. ERROR TRACKING (OPTIONAL) 🐛
# ============================================================================
# Get from: https://sentry.io

# NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# ============================================================================
# 7. EMAIL SERVICE (OPTIONAL) 📧
# ============================================================================
# Get from: https://resend.com

# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# 8. ADVANCED AI (FUTURE) 🔮
# ============================================================================
# Get from: https://console.anthropic.com

# ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# 9. MAPS (FUTURE) 🗺️
# ============================================================================
# Get from: https://www.mapbox.com

# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic...

# ============================================================================
# 10. VECTOR DATABASE (FUTURE - Not needed currently)
# ============================================================================
# Currently using Supabase pgvector (included)
# Only needed if switching to external vector DB

# Option A: Qdrant
# QDRANT_URL=https://xxxxx.qdrant.io
# QDRANT_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Option B: Pinecone
# PINECONE_API_KEY=xxxxxxxxxxxxxxxxxxxxx
# PINECONE_ENVIRONMENT=us-west1-gcp-free
# PINECONE_INDEX_NAME=palm-island-stories

# ============================================================================
# 11. DEVELOPMENT OPTIONS
# ============================================================================

# Skip environment validation (not recommended)
# SKIP_ENV_VALIDATION=false

# Skip type checking in builds (faster but riskier)
# SKIP_TYPE_CHECK=false

# ============================================================================
# END OF CONFIGURATION
# ============================================================================
```

---

## 💰 Cost Summary

### Minimum Setup (Phase 1)
```
Supabase Free:       $0/month
Vercel Hobby:        $0/month
─────────────────────────────
Total:               $0/month ✅
```

### Production Ready (Phase 1)
```
Supabase Pro:        $25/month
Vercel Pro:          $20/month
Domain:              $1.25/month
─────────────────────────────
Total:               $46.25/month
Annual:              $555/year
```

### With AI Features (Phase 2)
```
Supabase Pro:        $25/month
Vercel Pro:          $20/month
OpenAI:              $50/month (estimated)
Plausible:           $9/month
Domain:              $1.25/month
─────────────────────────────
Total:               $105.25/month
Annual:              $1,263/year
```

### Full Featured (All Phases)
```
Supabase Pro:        $25/month
Vercel Pro:          $20/month
OpenAI:              $50/month
Anthropic:           $20/month (estimated)
Plausible:           $9/month
Resend Pro:          $20/month
Domain:              $1.25/month
─────────────────────────────
Total:               $145.25/month
Annual:              $1,743/year
```

---

## ✅ Setup Verification Checklist

### Phase 1 (Essential)
- [ ] Supabase project created
- [ ] Database migrations run successfully
- [ ] Storage buckets configured
- [ ] Can login to application
- [ ] Can create a story
- [ ] Can upload images
- [ ] Vercel deployment successful
- [ ] Custom domain configured (optional)

### Phase 2 (AI Features)
- [ ] OpenAI API key configured
- [ ] Embeddings generation working
- [ ] Semantic search returns results
- [ ] Search performance acceptable (<3s)
- [ ] AI costs within budget

### Phase 3 (Optional Services)
- [ ] Analytics showing data
- [ ] Error tracking capturing errors
- [ ] Emails sending successfully

---

## 🆘 Troubleshooting

### "Supabase connection failed"
```bash
# Check if URL and keys are correct
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

### "OpenAI API error"
```bash
# Verify API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check usage limits
# Go to: https://platform.openai.com/usage
```

### "Build fails on Vercel"
```
Common issues:
1. Missing environment variables → Add in Vercel dashboard
2. Type errors → Run `npm run typecheck` locally first
3. Build timeout → Upgrade to Pro plan or optimize build
```

### "Environment variables not working"
```bash
# Make sure file is named correctly
ls -la .env.local

# Restart dev server after changing .env
npm run dev

# Check if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Env Variables**: https://nextjs.org/docs/basic-features/environment-variables
- **pgvector Guide**: https://github.com/pgvector/pgvector

---

## 🔄 Maintenance Schedule

### Weekly
- Check error logs in Sentry
- Review API usage costs
- Monitor application performance

### Monthly
- Review and optimize API costs
- Check for security updates
- Rotate development API keys
- Review analytics data

### Quarterly
- Rotate production API keys
- Review and update dependencies
- Audit access permissions
- Backup database

---

**Questions?** Check the main documentation or create an issue in the repository.

**Ready to deploy?** Follow the steps in order and check off items as you complete them!

# API Keys Quick Checklist
## Palm Island Story Server

**Purpose:** Quick reference for tracking which API keys you need and have configured.

---

## ✅ Essential Services (Phase 1)

### 1. Supabase ⭐ REQUIRED
- [ ] Account created at https://supabase.com
- [ ] Project created: `palm-island-story-server`
- [ ] **NEXT_PUBLIC_SUPABASE_URL** obtained
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** obtained
- [ ] **SUPABASE_SERVICE_ROLE_KEY** obtained
- [ ] **DATABASE_URL** obtained
- [ ] Added to `.env.local`
- [ ] Database migrations run
- [ ] Storage buckets created (documents, profile-images, media, story-media)
- [ ] pgvector extension enabled

**Cost:** $25/month (Pro) or $0 (Free tier)

### 2. Vercel ⭐ REQUIRED
- [ ] Account created at https://vercel.com
- [ ] Repository connected
- [ ] Environment variables uploaded
- [ ] First deployment successful
- [ ] Custom domain configured (optional)

**Cost:** $20/month (Pro) or $0 (Hobby)

---

## 🤖 AI Services (Phase 2)

### 3. OpenAI
- [ ] Account created at https://platform.openai.com
- [ ] Payment method added
- [ ] Usage limits set ($100/month recommended)
- [ ] **OPENAI_API_KEY** obtained
- [ ] Added to `.env.local`
- [ ] Feature flag `NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH` set to `true`
- [ ] Tested embedding generation
- [ ] Semantic search working

**Cost:** ~$50/month (depends on usage)

---

## 📊 Optional Services (Phase 3)

### 4. Plausible Analytics
- [ ] Account created at https://plausible.io
- [ ] Domain added: palmisland.org.au
- [ ] **NEXT_PUBLIC_PLAUSIBLE_DOMAIN** set
- [ ] Added to `.env.local`
- [ ] Analytics showing data

**Cost:** $9/month or $0 (self-hosted)

### 5. Sentry (Error Tracking)
- [ ] Account created at https://sentry.io
- [ ] Next.js project created
- [ ] **NEXT_PUBLIC_SENTRY_DSN** obtained
- [ ] Added to `.env.local`
- [ ] Test error captured

**Cost:** $0 (free tier: 5,000 errors/month)

### 6. Resend (Email Service)
- [ ] Account created at https://resend.com
- [ ] Domain verified: palmisland.org.au
- [ ] **RESEND_API_KEY** obtained
- [ ] Added to `.env.local`
- [ ] Test email sent

**Cost:** $0 (free: 100 emails/day) or $20/month

---

## 🔮 Future Services (Phase 4)

### 7. Anthropic Claude
- [ ] Account created at https://console.anthropic.com
- [ ] Payment method added
- [ ] **ANTHROPIC_API_KEY** obtained
- [ ] Added to `.env.local`

**Cost:** Pay-as-you-go (~$15/1M input tokens)

### 8. Mapbox
- [ ] Account created at https://www.mapbox.com
- [ ] Access token created
- [ ] **NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN** obtained
- [ ] Added to `.env.local`

**Cost:** $0 (free: 50,000 loads/month)

---

## 📋 Environment Variables Status

Copy this to track your progress:

```bash
# Phase 1 (Essential)
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ DATABASE_URL
✅ NEXT_PUBLIC_SITE_URL
✅ NEXT_PUBLIC_SITE_NAME
✅ NEXT_PUBLIC_DEFAULT_ORG_SLUG

# Phase 2 (AI)
⬜ OPENAI_API_KEY
⬜ NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH

# Phase 3 (Optional)
⬜ NEXT_PUBLIC_PLAUSIBLE_DOMAIN
⬜ NEXT_PUBLIC_SENTRY_DSN
⬜ RESEND_API_KEY

# Phase 4 (Future)
⬜ ANTHROPIC_API_KEY
⬜ NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

---

## 💰 Cost Summary

### Current Configuration
```
Supabase:     $___/month
Vercel:       $___/month
OpenAI:       $___/month
Other:        $___/month
─────────────────────────
Total:        $___/month
```

### Budget Options

**Free Tier (Testing):**
```
Supabase Free:   $0
Vercel Hobby:    $0
────────────────────
Total:           $0/month ✅
```

**Production (No AI):**
```
Supabase Pro:    $25
Vercel Pro:      $20
────────────────────
Total:           $45/month
```

**Production (With AI):**
```
Supabase Pro:    $25
Vercel Pro:      $20
OpenAI:          $50
────────────────────
Total:           $95/month
```

---

## 🔐 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never committed real keys to Git
- [ ] All service_role keys used only server-side
- [ ] Public keys properly prefixed with `NEXT_PUBLIC_`
- [ ] Usage limits set on paid APIs
- [ ] Key rotation schedule planned (every 90 days)
- [ ] Backups configured
- [ ] Team members have appropriate access levels

---

## 🧪 Testing Checklist

### Phase 1 (Essential)
- [ ] Can connect to Supabase
- [ ] Can create user account
- [ ] Can login
- [ ] Can upload image
- [ ] Can create story
- [ ] Can view stories
- [ ] Vercel deployment works
- [ ] Custom domain works (if configured)

### Phase 2 (AI)
- [ ] OpenAI connection works
- [ ] Can generate embeddings
- [ ] Semantic search returns results
- [ ] Search results are relevant
- [ ] Response time < 3 seconds
- [ ] AI costs within budget

### Phase 3 (Optional)
- [ ] Analytics tracking pageviews
- [ ] Errors captured in Sentry
- [ ] Emails sending successfully

---

## 📞 Support Links

| Service | Dashboard | Documentation | Support |
|---------|-----------|---------------|---------|
| Supabase | [Dashboard](https://supabase.com/dashboard) | [Docs](https://supabase.com/docs) | [Discord](https://discord.supabase.com) |
| OpenAI | [Platform](https://platform.openai.com) | [Docs](https://platform.openai.com/docs) | [Help](https://help.openai.com) |
| Vercel | [Dashboard](https://vercel.com/dashboard) | [Docs](https://vercel.com/docs) | [Support](https://vercel.com/support) |
| Plausible | [Dashboard](https://plausible.io) | [Docs](https://plausible.io/docs) | [Contact](https://plausible.io/contact) |
| Sentry | [Dashboard](https://sentry.io) | [Docs](https://docs.sentry.io) | [Support](https://sentry.io/support) |
| Resend | [Dashboard](https://resend.com/overview) | [Docs](https://resend.com/docs) | [Support](https://resend.com/support) |

---

## 📝 Notes

Use this space to track specific details about your setup:

```
Supabase Project ID: _________________
Vercel Project URL: _________________
OpenAI Organization: _________________
Custom Domain: _________________

Last Key Rotation: _________________
Next Key Rotation Due: _________________

Special Configuration:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Quick Start Commands

```bash
# 1. Copy environment template
cp web-platform/.env.example web-platform/.env.local

# 2. Edit with your keys
nano web-platform/.env.local

# 3. Test locally
cd web-platform
npm install
npm run dev

# 4. Open browser
open http://localhost:3000

# 5. Test Supabase connection
npm run test:supabase

# 6. Test OpenAI connection (if configured)
npm run test:openai

# 7. Deploy to Vercel
vercel --prod
```

---

## ✅ Final Check Before Launch

- [ ] All Phase 1 services configured
- [ ] All tests passing
- [ ] Security checklist completed
- [ ] Backup plan in place
- [ ] Team trained on platform
- [ ] Documentation reviewed
- [ ] Monitoring setup (analytics, errors)
- [ ] Budget confirmed and approved
- [ ] Go-live date set
- [ ] Communication plan ready

---

**Last Updated:** _______________
**Updated By:** _______________
**Next Review:** _______________

---

See **API_KEYS_SETUP_GUIDE.md** for detailed setup instructions for each service.

# Hosting & Deployment Guide
## Palm Island Platform - Production Ready

**Date:** November 5, 2025

---

## Quick Deploy (10 Minutes)

### Prerequisites
- [ ] GitHub account
- [ ] Supabase account (create at supabase.com)
- [ ] Vercel account (sign up with GitHub)

### Step 1: Deploy to Vercel

```bash
# Option A: One-Click Deploy (Easiest)
# 1. Click "Deploy to Vercel" button (coming soon in README)

# Option B: CLI Deploy
npm install -g vercel
cd web-platform
vercel login
vercel
# Follow prompts
```

### Step 2: Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

### Step 3: Redeploy

```bash
vercel --prod
```

**Done! Your site is live! 🎉**

---

## Detailed Deployment Options

### Option 1: Vercel (Recommended for MVP)

**Pros:**
- Automatic deployments from Git
- Global CDN
- Serverless functions
- Free hobby plan available
- Easy SSL certificates

**Cons:**
- Less control than self-hosting
- Vendor lock-in

**Cost:**
- Hobby: Free (good for testing)
- Pro: $20/month (recommended for production)

**Setup:**

1. **Connect GitHub Repository**
   ```
   1. Go to vercel.com
   2. Click "New Project"
   3. Import from GitHub
   4. Select palm-island-repository
   5. Root Directory: web-platform
   6. Framework: Next.js (auto-detected)
   ```

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```

3. **Environment Variables**
   Add all variables from `.env.example`

4. **Deploy**
   - Push to `main` branch = automatic deploy
   - Other branches = preview deployments

**Custom Domain:**
```
1. Go to Project Settings → Domains
2. Add domain: palmisland.org.au
3. Configure DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21

   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
```

---

### Option 2: Cloudflare Pages (Alternative)

**Pros:**
- Generous free tier
- Excellent global CDN
- DDoS protection included
- Good performance

**Setup:**
```bash
# 1. Connect GitHub repo at pages.cloudflare.com
# 2. Build settings:
Build command: npm run build
Build output directory: .next
Root directory: web-platform

# 3. Add environment variables
# 4. Deploy
```

---

### Option 3: Netlify (Alternative)

**Setup:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd web-platform
netlify init
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 4: Self-Hosted (On-Country Server)

**For true data sovereignty - see ON-COUNTRY-SERVER-ARCHITECTURE.md**

Quick version:

```bash
# On your Ubuntu server
git clone https://github.com/yourusername/palm-island-repository.git
cd palm-island-repository/web-platform

# Install dependencies
npm install

# Build
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "palm-island" -- start
pm2 save
pm2 startup

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/palmisland
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name palmisland.org.au;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Database Hosting (Supabase)

### Setup Supabase Project

```bash
# 1. Create account at supabase.com
# 2. Create new project
   Name: palm-island-production
   Database Password: [secure password]
   Region: Sydney (closest to Palm Island)
   Plan: Pro ($25/month recommended)

# 3. Deploy schema
supabase login
supabase link --project-ref your-ref
supabase db push

# 4. Load seed data
psql $DATABASE_URL -f supabase/migrations/seed.sql

# 5. Configure Row Level Security policies
# (Already in migrations)
```

### Supabase Configuration

**Enable Extensions:**
```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Storage Buckets:**
```
1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - story-images (private)
   - profile-photos (private)
   - public-assets (public)

3. Set up policies (see PRODUCTION-DEVELOPMENT-PLAN.md)
```

---

## CDN & Performance

### Cloudflare (Free Tier)

```bash
# 1. Add site to Cloudflare
# 2. Update nameservers at your domain registrar
# 3. Configure settings:

Auto Minify: On (HTML, CSS, JS)
Brotli: On
HTTP/3: On
TLS: Full (strict)

# 4. Page Rules (free tier allows 3):
Rule 1: *palmisland.org.au/images/*
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

Rule 2: *palmisland.org.au/api/*
  - Cache Level: Bypass

Rule 3: *palmisland.org.au/*
  - Cache Level: Standard
  - Browser Cache TTL: 4 hours
```

---

## Monitoring & Analytics

### 1. Vercel Analytics (Built-in)

**Enable:**
```typescript
// web-platform/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Plausible Analytics (Privacy-friendly)

**Add to layout:**
```typescript
// web-platform/app/layout.tsx
export default function RootLayout() {
  return (
    <html>
      <head>
        <script
          defer
          data-domain="palmisland.org.au"
          src="https://plausible.io/js/script.js"
        />
      </head>
    </html>
  )
}
```

**Cost:** $9/month or self-host for free

### 3. Error Tracking with Sentry

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

**Configure:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
})
```

---

## CI/CD Pipeline

### GitHub Actions (Automated Testing)

Create `.github/workflows/test.yml`:

```yaml
name: Test & Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: web-platform/package-lock.json

      - name: Install dependencies
        working-directory: ./web-platform
        run: npm ci

      - name: Run linter
        working-directory: ./web-platform
        run: npm run lint

      - name: Run type check
        working-directory: ./web-platform
        run: npm run typecheck

      - name: Build
        working-directory: ./web-platform
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## Pre-Launch Checklist

### Technical
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Seed data loaded
- [ ] All pages load without errors
- [ ] Forms submit successfully
- [ ] Images load correctly
- [ ] Mobile responsive
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured
- [ ] Analytics tracking works
- [ ] Error tracking configured

### Performance
- [ ] Lighthouse score >90
- [ ] Page load time <3s
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN active

### Security
- [ ] Environment variables not in code
- [ ] API keys secure
- [ ] Row Level Security enabled
- [ ] CORS configured correctly
- [ ] Security headers set
- [ ] SQL injection prevention
- [ ] XSS protection

### SEO
- [ ] Meta tags set
- [ ] Open Graph tags
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Favicon added

---

## Launch Day

### Timeline

**T-24 hours:**
- [ ] Final smoke test
- [ ] Notify stakeholders
- [ ] Prepare support channels

**T-1 hour:**
- [ ] Verify all systems
- [ ] Enable DNS
- [ ] Monitor logs

**T+0 (Launch):**
- [ ] Announce on social media
- [ ] Send email to community
- [ ] Monitor closely

**T+24 hours:**
- [ ] Review analytics
- [ ] Check error logs
- [ ] Gather initial feedback

---

## Post-Launch Maintenance

### Daily (First Week)
```bash
# Check error logs
vercel logs

# Check analytics
# Visit Vercel Dashboard

# Monitor uptime
# Visit uptime monitor
```

### Weekly
- Review analytics
- Check performance metrics
- Update content as needed
- Respond to feedback

### Monthly
- Security updates
- Dependency updates
- Backup verification
- Performance optimization

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs

# Common issues:
1. Missing environment variables
   - Add to Vercel dashboard

2. TypeScript errors
   - Run: npm run typecheck
   - Fix errors locally first

3. Dependency issues
   - Delete node_modules
   - Run: npm install
```

### Site Not Loading

```
1. Check DNS propagation
   - Tool: whatsmydns.net

2. Check SSL certificate
   - Should auto-provision in 24h

3. Check deployment status
   - Vercel dashboard → Deployments
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Supabase status
# Visit status.supabase.com
```

---

## Rollback Plan

### Vercel Rollback

```
1. Go to Vercel Dashboard
2. Click Deployments
3. Find last good deployment
4. Click "..." → Promote to Production
```

### Database Rollback

```bash
# Restore from backup
supabase db pull

# If using self-hosted
psql $DATABASE_URL < backup-YYYY-MM-DD.sql
```

---

## Cost Summary

### Minimum (MVP)
```
Vercel Hobby:     $0/month
Supabase Free:    $0/month
Cloudflare Free:  $0/month
Domain:           $15/year
──────────────────────────
Total:            $1.25/month
```

### Recommended (Production)
```
Vercel Pro:       $20/month
Supabase Pro:     $25/month
Cloudflare Pro:   $20/month (optional)
Plausible:        $9/month
Sentry:           $0 (free tier)
Domain:           $15/year
──────────────────────────
Total:            $75/month
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Cloudflare Docs:** https://developers.cloudflare.com

---

## Next Steps

1. **Today:** Deploy to Vercel
2. **This Week:** Configure custom domain
3. **This Month:** Set up monitoring
4. **Ongoing:** Optimize and improve

**Ready to deploy!** 🚀

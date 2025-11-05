# 🚀 Deploy to Vercel (FREE Tier)

**Total time**: 10-15 minutes
**Cost**: $0

This platform is built to run entirely on free tiers. Follow this guide to deploy your Palm Island Story Server to Vercel and go live!

---

## ✅ Prerequisites

- [x] Supabase project set up (`uaxhjzqrdotoahjnxmbj`)
- [x] 26 storytellers in database
- [x] 16 PICC services configured
- [x] Environment variables ready (from `web-platform/.env.local`)
- [x] Code committed to GitHub

---

## 🎯 Step 1: Install Vercel CLI (Optional)

You can deploy via web interface OR command line.

### Via Command Line (Recommended):
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

### Via Web Interface:
Go to [vercel.com](https://vercel.com) and sign up/login with GitHub.

---

## 🚀 Step 2: Deploy Your Project

### Option A: Command Line (Fastest)

```bash
# Navigate to web-platform directory
cd /home/user/palm-island-repository/web-platform

# Run Vercel deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - What's your project's name? palm-island-story-server
# - In which directory is your code? ./
# - Want to override settings? No

# This deploys to preview URL
```

### Option B: Web Interface (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repo: `palm-island-repository`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web-platform`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click "Deploy"

---

## 🔐 Step 3: Add Environment Variables

Vercel needs your Supabase credentials to connect to the database.

### Via Web Interface:

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uaxhjzqrdotoahjnxmbj.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5c...` | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5c...` | Supabase Dashboard → Settings → API → service_role key |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.uaxhjzqrdotoahjnxmbj...` | Supabase Dashboard → Settings → Database → Connection String |

4. Save all variables
5. Redeploy (automatic or manual)

### Via Command Line:

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste value and select environment (production, preview, development)

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste value

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste value

vercel env add DATABASE_URL
# Paste value

# Redeploy with environment variables
vercel --prod
```

---

## 🎉 Step 4: Verify Deployment

Once deployed, Vercel gives you a URL like:
```
https://palm-island-story-server.vercel.app
```

### Check these pages:

1. **Homepage**: `https://yourproject.vercel.app`
   - Should show: "26 storytellers", "16 PICC services"

2. **Storytellers Directory**: `/storytellers`
   - Should display all 26 storytellers from your Supabase

3. **Individual Profile**: `/storytellers/[id]`
   - Click any storyteller
   - Should show their full profile

### Test Supabase Connection:

Open browser console on your site:
```javascript
// Should see data loading from Supabase
console.log('Fetched storytellers:', storytellers.length)
```

---

## 🆓 Free Tier Limits

### **Vercel Free Tier:**
- ✅ **Unlimited** deployments
- ✅ **100GB** bandwidth per month (~10,000 visitors)
- ✅ **100GB-hours** serverless function execution
- ✅ **1000** image optimizations per month
- ✅ **Automatic HTTPS** + CDN
- ✅ **Preview deployments** for every git push

**Translation**: Vercel free tier can handle your entire Palm Island community with room to spare!

### **Supabase Free Tier (reminder):**
- ✅ **500MB** database
- ✅ **1GB** file storage
- ✅ **2GB** bandwidth per month
- ✅ **50,000** monthly active users

---

## 🔄 Continuous Deployment

Every time you push to GitHub, Vercel automatically:
1. Detects the change
2. Builds your app
3. Deploys to preview URL
4. Comments on your PR with preview link

To deploy to production:
```bash
# Push to main branch (or your production branch)
git push origin main

# Or deploy manually
vercel --prod
```

---

## 🌐 Add Custom Domain (Optional - Costs Money)

If you want `palmisland.org.au` instead of `palm-island-story-server.vercel.app`:

1. Buy domain (~$15-30/year)
2. In Vercel dashboard: **Settings** → **Domains**
3. Add custom domain
4. Update DNS records (Vercel provides instructions)

**But for testing, the Vercel subdomain works perfectly!**

---

## 🐛 Troubleshooting

### Issue: "Environment variables not defined"
**Solution**: Make sure all 4 environment variables are added in Vercel dashboard, then redeploy.

### Issue: "Failed to fetch storytellers"
**Solution**:
1. Check Supabase is running: Visit `https://uaxhjzqrdotoahjnxmbj.supabase.co`
2. Verify Row Level Security allows public reads on `profiles` table
3. Check browser console for specific error

### Issue: "Build failed"
**Solution**: Check Vercel build logs. Usually missing dependencies or TypeScript errors.

### Issue: "504 Gateway Timeout"
**Solution**: Functions are taking too long. Optimize queries or add pagination.

---

## 📊 What You'll Have (For FREE!)

After deployment:

✅ **Live website** accessible worldwide
✅ **Automatic HTTPS** (secure connection)
✅ **CDN delivery** (fast loading globally)
✅ **26 storyteller profiles** from real database
✅ **16 PICC services** documented
✅ **Mobile-optimized** interface
✅ **Indigenous data sovereignty** (data stays in Supabase)
✅ **Auto-deploys** on every git push
✅ **Preview URLs** for testing changes

**Total Monthly Cost**: $0

---

## 🎯 Next Steps After Deployment

Once your site is live and tested:

1. **Share with community** for feedback
2. **Test on mobile devices** (phones are primary device)
3. **Add authentication** (email magic links - still FREE!)
4. **Import stories** from transcripts
5. **Add upload forms** (photos, voice, text)
6. **Generate annual reports** (all automatic!)

Then, ONLY when you need them:
- SMS magic links ($25-50/month)
- Voice transcription ($0.006/minute)
- Advanced AI features (~$50/month)

---

## 💪 Success Checklist

- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] Homepage loads with real stats
- [ ] Storytellers directory shows 26 profiles
- [ ] Individual profiles load correctly
- [ ] Mobile responsive
- [ ] Supabase connected
- [ ] Site accessible via HTTPS

---

## 🆘 Need Help?

**Vercel Documentation**: https://vercel.com/docs
**Supabase Documentation**: https://supabase.com/docs
**Next.js Documentation**: https://nextjs.org/docs

---

**🎉 Congratulations!** You've deployed a world-class Indigenous storytelling platform for $0/month!

Now test it with your community, gather feedback, and add features as needed. You're proving that technology can serve Indigenous data sovereignty without breaking the bank! 🚀

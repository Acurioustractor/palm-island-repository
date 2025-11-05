# 🚀 Deploy to Vercel - Quick Guide

## Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api
2. Copy these two keys:
   - **`anon` `public`** key (starts with `eyJh...`)
   - **`service_role` `secret`** key (starts with `eyJh...`)

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import: `Acurioustractor/palm-island-repository`

5. **Configure Project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `web-platform` ⚠️ IMPORTANT!
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

6. **Set Production Branch:**
   - Branch: `claude/work-through-011CUpDx6WTgAHt3sFKLDZMA`

7. **Add Environment Variables:**
   Click "Environment Variables" and copy-paste these (one at a time):

   ```
   NEXT_PUBLIC_SUPABASE_URL
   https://uaxhjzqrdotoahjnxmbj.supabase.co
   ```

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   [Paste your anon key from Step 1]
   ```

   ```
   SUPABASE_SERVICE_ROLE_KEY
   [Paste your service_role key from Step 1]
   ```

   ```
   NEXT_PUBLIC_SITE_NAME
   Palm Island Story Server
   ```

   ```
   NEXT_PUBLIC_DEFAULT_ORG_SLUG
   picc
   ```

   ```
   NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS
   true
   ```

   ```
   NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH
   false
   ```

   ```
   NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION
   false
   ```

   ```
   NEXT_PUBLIC_ENABLE_FACE_RECOGNITION
   false
   ```

8. Click **"Deploy"** 🚀

---

### Option B: Via Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from web-platform directory
cd web-platform
vercel --prod

# Follow prompts and set environment variables when asked
```

---

## Step 3: After Deployment

Once deployed, Vercel will give you a URL like:
```
https://palm-island-repository-xyz.vercel.app
```

### Update NEXT_PUBLIC_SITE_URL

1. Go back to Vercel dashboard
2. Go to: **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_SITE_URL` (or add it)
4. Set it to your actual Vercel URL
5. Click **"Redeploy"** to apply changes

---

## Step 4: Verify Supabase Storage Buckets

Make sure these buckets exist in Supabase:

1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets
2. Create these buckets if they don't exist:
   - `documents` (for PDFs, Word docs)
   - `profile-images` (for user photos)
   - `media` (for story media)

**Set bucket policies to public** (so uploaded images can be viewed):
- Click bucket → Configuration → Make public

---

## Step 5: Access Your App

- **Homepage**: https://your-app.vercel.app
- **Admin Dashboard**: https://your-app.vercel.app/admin
- **Add Person**: https://your-app.vercel.app/admin/add-person
- **Manage Profiles**: https://your-app.vercel.app/admin/manage-profiles
- **Import Repos**: https://your-app.vercel.app/admin/import-repos
- **Upload Documents**: https://your-app.vercel.app/admin/upload-documents

---

## Troubleshooting

### Build Fails
- Make sure **Root Directory** is set to `web-platform`
- Make sure you're deploying branch: `claude/work-through-011CUpDx6WTgAHt3sFKLDZMA`
- Check that all environment variables are set correctly

### Images Not Loading
- Check Supabase Storage buckets exist
- Make sure buckets are set to **public**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Authentication Errors
- Double-check your Supabase keys
- Make sure you copied the full keys (they're very long!)
- Verify keys are from the correct project: `uaxhjzqrdotoahjnxmbj`

---

## Need Help?

Check Vercel deployment logs:
1. Go to Vercel dashboard
2. Click on your deployment
3. Click "View Function Logs" or "Build Logs"

---

**All set!** 🎉 Your Palm Island Story Server is now live!

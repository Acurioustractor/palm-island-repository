# 🚀 Quick Deploy to Vercel

## Step 1: Get Your Supabase Keys

Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api

You need TWO keys:
1. **anon** key (starts with `eyJh...`) - labeled "anon public"
2. **service_role** key (starts with `eyJh...`) - labeled "service_role secret"

Copy both keys - you'll need them in the next step!

---

## Step 2: Edit the Environment File

Open the file: **`UPLOAD-THIS-TO-VERCEL.txt`** (in the web-platform folder)

Replace these two lines with your actual keys from Step 1:

**BEFORE:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_YOUR_SERVICE_ROLE_KEY
```

**AFTER:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here...
```

⚠️ **Make sure to paste the FULL keys - they're very long!**

Save the file after editing.

---

## Step 3: Deploy to Vercel

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your repository: `Acurioustractor/palm-island-repository`

5. **IMPORTANT - Configure These Settings:**
   - ✅ **Root Directory**: `web-platform` (click Edit and enter this!)
   - ✅ **Framework**: Next.js (should auto-detect)
   - ✅ **Branch**: `claude/work-through-011CUpDx6WTgAHt3sFKLDZMA`

6. **Upload Environment Variables:**
   - Scroll to "Environment Variables" section
   - Look for **"Import .env"** or **"Bulk Import"** button
   - Click it and upload your edited `UPLOAD-THIS-TO-VERCEL.txt` file
   - Vercel will parse all the variables automatically!

7. Click **"Deploy"** 🚀

---

## Step 4: Wait for Build (2-3 minutes)

Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to a live URL

You'll get a URL like: `https://palm-island-repository-xyz.vercel.app`

---

## Step 5: Update Site URL (Optional but Recommended)

After deployment:
1. Copy your new Vercel URL
2. Go to: **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_SITE_URL`
4. Update it to your actual Vercel URL
5. Click **"Redeploy"**

---

## ✅ You're Live!

Access your new features:
- **Homepage**: https://your-app.vercel.app
- **Admin Dashboard**: https://your-app.vercel.app/admin
- **Add Person**: https://your-app.vercel.app/admin/add-person
- **Manage Profiles**: https://your-app.vercel.app/admin/manage-profiles
- **Import Repos**: https://your-app.vercel.app/admin/import-repos
- **Upload Documents**: https://your-app.vercel.app/admin/upload-documents

---

## 🆘 Troubleshooting

### Build Fails
- ✅ Check that **Root Directory** is set to `web-platform`
- ✅ Verify you're using branch: `claude/work-through-011CUpDx6WTgAHt3sFKLDZMA`
- ✅ Make sure all environment variables were imported

### Can't Find the File
The file **`UPLOAD-THIS-TO-VERCEL.txt`** is in:
```
palm-island-repository/web-platform/UPLOAD-THIS-TO-VERCEL.txt
```

### Images Don't Load After Deployment
Make sure these Supabase Storage buckets exist:
1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets
2. Create if missing: `documents`, `profile-images`, `media`
3. Set them to **public** (click bucket → Configuration → Make public)

---

**That's it! Your Palm Island Story Server is now live!** 🎉

# 📤 Upload Environment Variables to Vercel

## Quick Upload Method

Vercel allows you to upload a `.env` file directly! Here's how:

### Step 1: Prepare the File

1. Open the file: `web-platform/.env.production`
2. Replace these two values with your Supabase keys:
   - `REPLACE_WITH_YOUR_ANON_KEY` → Get from Supabase
   - `REPLACE_WITH_YOUR_SERVICE_ROLE_KEY` → Get from Supabase

**Where to get Supabase keys:**
- Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api
- Copy the **`anon`** key (labeled "anon public")
- Copy the **`service_role`** key (labeled "service_role secret")

### Step 2: Download the File

After editing `.env.production`, save it to your computer.

### Step 3: Upload to Vercel

1. Go to Vercel: https://vercel.com
2. Select your project (after importing the repository)
3. Go to: **Settings** → **Environment Variables**
4. Look for **"Import"** or **"Upload"** button
5. Select your edited `.env.production` file
6. Vercel will automatically parse and add all variables!

### Step 4: Deploy

Click **"Deploy"** and Vercel will use these environment variables.

---

## ✅ What's in the .env.production file:

```
NEXT_PUBLIC_SUPABASE_URL=https://uaxhjzqrdotoahjnxmbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR KEY HERE]
SUPABASE_SERVICE_ROLE_KEY=[YOUR KEY HERE]
NEXT_PUBLIC_SITE_NAME=Palm Island Story Server
NEXT_PUBLIC_DEFAULT_ORG_SLUG=picc
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS=true
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=false
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=false
NEXT_PUBLIC_ENABLE_FACE_RECOGNITION=false
```

---

## ⚠️ Important Notes:

1. **NEVER commit** the file with real keys to GitHub
2. The `.env.production` file in the repo has placeholders - you need to replace them
3. After deployment, update `NEXT_PUBLIC_SITE_URL` with your actual Vercel URL
4. Make sure Supabase Storage buckets exist: `documents`, `profile-images`, `media`

---

That's it! Much easier than entering variables one by one! 🎉

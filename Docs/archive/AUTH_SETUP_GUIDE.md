# Authentication Setup Guide

Complete guide to setting up authentication for the Palm Island Community Platform.

## Overview

The platform uses **Supabase Auth** with the following features:
- Email/password authentication
- Email verification
- Password reset via email
- Role-based access control (admin, staff, storyteller, viewer)
- Session management with cookies

## Quick Start

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing one)
3. Note your project credentials:
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Key: Found in Settings > API
   - Service Role Key: Found in Settings > API (keep secret!)

### 2. Configure Environment Variables

Create `.env.local` in the web-platform folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Supabase Auth Settings

In Supabase Dashboard > Authentication > URL Configuration:

1. **Site URL**: Set to your production URL (e.g., `https://yoursite.com`)
2. **Redirect URLs**: Add all allowed redirect URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/confirm
   https://yoursite.com/auth/callback
   https://yoursite.com/auth/confirm
   ```

### 4. Enable Email Provider

In Supabase Dashboard > Authentication > Providers:

1. Click on **Email**
2. Enable the provider
3. Configure settings:
   - **Confirm email**: ON (recommended for production)
   - **Secure email change**: ON
   - **Secure password change**: ON

### 5. Customize Email Templates (Optional)

In Supabase Dashboard > Authentication > Email Templates:

Customize the following templates:
- **Confirm signup**: Email verification link
- **Reset password**: Password reset link
- **Magic link**: Passwordless login (if used)

Example subject lines:
- Confirm: "Verify your Palm Island Community account"
- Reset: "Reset your Palm Island Community password"

### 6. Run Database Migration

In Supabase Dashboard > SQL Editor, run:

```sql
-- Run the auth profiles setup migration
-- File: web-platform/migrations/005_auth_profiles_setup.sql
```

This creates:
- Profile columns for auth (user_id, role, etc.)
- Row Level Security policies
- Trigger to create profile on signup

### 7. Create Your Admin Account

1. Start the dev server:
   ```bash
   cd web-platform
   npm run dev
   ```

2. Go to `http://localhost:3000/signup`

3. Create your account

4. Check your email and click the verification link

5. In Supabase SQL Editor, make yourself admin:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

6. Sign in at `http://localhost:3000/login`

## Auth Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Signup    │────>│   Verify    │────>│  Dashboard  │
│   /signup   │     │   Email     │     │  /picc/*    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │  /auth/     │
                    │  callback   │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────>│  Dashboard  │     │   Logout    │
│   /login    │     │  /picc/*    │────>│     /       │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Forgot    │────>│  Reset      │────>│  Dashboard  │
│   Password  │     │  Password   │     │  /picc/*    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/login` | Sign in | No |
| `/signup` | Create account | No |
| `/forgot-password` | Request password reset | No |
| `/reset-password` | Set new password | Recovery token |
| `/auth/callback` | Handle auth redirects | N/A |
| `/auth/confirm` | Email verification | N/A |
| `/picc/*` | Admin dashboard | Yes |

## Role-Based Access

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all features |
| `staff` | Create/edit content, manage storytellers |
| `storyteller` | Submit stories, manage own profile |
| `viewer` | View public content only |

## Using Auth in Components

### Client Components

```tsx
'use client'
import { useAuth } from '@/components/providers/AuthProvider'

function MyComponent() {
  const { user, profile, isAuthenticated, isAdmin, signOut } = useAuth()

  if (!isAuthenticated) {
    return <p>Please sign in</p>
  }

  return (
    <div>
      <p>Welcome, {profile?.full_name}</p>
      {isAdmin && <AdminPanel />}
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Server Components

```tsx
import { getServerUser, getServerProfile, isAdmin } from '@/lib/supabase/server'

async function MyServerComponent() {
  const user = await getServerUser()
  const profile = await getServerProfile()
  const admin = await isAdmin()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <p>Welcome, {profile?.full_name}</p>
      {admin && <AdminPanel />}
    </div>
  )
}
```

### Protected API Routes

```tsx
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createRouteHandlerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... your logic
}
```

## Troubleshooting

### "Invalid login credentials"
- Check email/password are correct
- Verify email has been confirmed
- Check Supabase logs for details

### "Email not confirmed"
- Check spam folder for verification email
- Resend verification from login page
- In dev, disable email confirmation in Supabase settings

### Redirect loop on login
- Clear browser cookies
- Check NEXT_PUBLIC_APP_URL matches your actual URL
- Verify redirect URLs in Supabase settings

### Session not persisting
- Check cookies are enabled in browser
- Verify middleware.ts is correctly configured
- Check for CORS issues if using custom domain

## Production Checklist

- [ ] Set production Site URL in Supabase
- [ ] Add production redirect URLs
- [ ] Enable email confirmation
- [ ] Use custom SMTP for reliable email delivery
- [ ] Set up rate limiting
- [ ] Enable MFA for admin accounts (optional)
- [ ] Review and tighten RLS policies
- [ ] Set up monitoring/alerts for auth failures

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth Callback Route Handler
 *
 * This handles OAuth callbacks, email verification, and password recovery links.
 * Supabase redirects users here after they click email links.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // Get the auth code from URL
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/picc/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth/email link errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  // If we have a code, exchange it for a session
  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Handle password recovery type
    if (type === 'recovery') {
      // Redirect to password reset page
      return NextResponse.redirect(`${origin}/reset-password`)
    }

    // Handle email verification - check if this is a new signup
    if (data.user?.email_confirmed_at) {
      // Email is confirmed, redirect to dashboard or the 'next' param
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Default redirect after successful auth
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Handle hash fragment (for implicit flow - less common)
  // The hash fragment is handled client-side, so redirect to a page that can handle it
  const hashParams = request.url.includes('#')
  if (hashParams) {
    return NextResponse.redirect(`${origin}/auth/confirm`)
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}

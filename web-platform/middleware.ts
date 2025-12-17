import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const AUTH_DISABLED =
  process.env.NODE_ENV !== 'production' &&
  (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true' || process.env.DISABLE_AUTH === 'true')

const isLocalDevHost = (request: NextRequest) => {
  if (process.env.NODE_ENV === 'production') return false
  const hostname = request.nextUrl.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/picc/admin',
  '/picc/content-studio',
  '/picc/projects',
  '/picc/services',
  '/picc/storytellers',
  '/picc/media/upload',
  '/picc/media/import',
  '/picc/reports',
  '/picc/settings',
  '/picc/team',
  '/picc/permissions',
  '/picc/dashboard',
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']

// Routes that need special auth handling (like password reset)
const RECOVERY_ROUTES = ['/reset-password', '/auth/callback', '/auth/confirm']

// Public routes that don't need any session handling
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/stories',
  '/community',
  '/impact',
  '/share-voice',
  '/subscribe',
  '/wiki',
  '/annual-reports',
  '/picc/knowledge',
  '/picc/media/gallery',
  '/picc/media/collections',
]

// Routes that can skip session handling entirely (improves performance)
const SKIP_SESSION_ROUTES = [
  '/wiki',
  '/stories',
  '/about',
  '/community',
  '/impact',
  '/share-voice',
  '/subscribe',
  '/annual-reports',
  '/elders',
  '/storytellers',
  '/immersive-stories',
  '/publications',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Local/dev escape hatch: allow using the PICC backend without auth.
  // 1) explicit env flag, or 2) always allow localhost in dev (to avoid edge env quirks).
  if (AUTH_DISABLED || isLocalDevHost(request)) {
    // Avoid ever landing on the login page in dev when auth is disabled.
    if (pathname === '/login' || pathname.startsWith('/login/')) {
      return NextResponse.redirect(new URL('/picc/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Skip session handling for public content routes - just pass through
  const shouldSkipSession = SKIP_SESSION_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (shouldSkipSession) {
    return NextResponse.next()
  }

  // Update session and get user
  const { response, user } = await updateSession(request)

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is auth route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/picc/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

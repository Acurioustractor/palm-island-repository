import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/picc/admin',
  '/picc/content-studio',
  '/picc/projects',
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

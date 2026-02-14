import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(newCookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            cookiesToSet.push(...newCookiesToSet)
          },
        } as any,
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const response = NextResponse.json(
      { ok: true, user: { id: data.user?.id ?? null, email: data.user?.email ?? null } },
      { status: 200 }
    )

    // If supabase/ssr called setAll, use those cookies
    if (cookiesToSet.length > 0) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          path: options?.path || '/',
          sameSite: options?.sameSite || 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      })
    } else if (data.session) {
      // Fallback: manually set the session cookies that supabase/ssr expects
      const cookieName = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`
      const cookieValue = JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.session.expires_in,
        expires_in: data.session.expires_in,
        token_type: 'bearer',
      })

      // Supabase SSR splits large cookies into chunks
      const maxChunkSize = 3180
      const chunks = []
      for (let i = 0; i < cookieValue.length; i += maxChunkSize) {
        chunks.push(cookieValue.slice(i, i + maxChunkSize))
      }

      if (chunks.length === 1) {
        response.cookies.set(cookieName, chunks[0], {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.session.expires_in,
        })
      } else {
        chunks.forEach((chunk, index) => {
          response.cookies.set(`${cookieName}.${index}`, chunk, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: data.session.expires_in,
          })
        })
      }
    }

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Login failed' },
      { status: 500 }
    )
  }
}

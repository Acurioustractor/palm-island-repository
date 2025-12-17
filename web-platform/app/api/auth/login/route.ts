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

    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Login failed' },
      { status: 500 }
    )
  }
}

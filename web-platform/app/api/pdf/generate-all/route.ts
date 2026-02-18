import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const maxDuration = 120

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              try { cookieStore.set(name, value, options) } catch { /* read-only in RSC */ }
            })
          },
        } as any,
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch { return false }
}

const AUDIENCES = ['community', 'funder', 'supporter', 'board', 'government'] as const

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { year?: string }
  const year = body.year || '2024-25'

  const variants: { audience: string; url: string; filename: string }[] = []

  // Full (no audience) variant first
  variants.push({
    audience: 'full',
    url: `/api/pdf/generate?type=annual-report&year=${year}`,
    filename: `PICC-Annual-Report-${year}-Full.pdf`,
  })

  // One variant per audience
  for (const audience of AUDIENCES) {
    variants.push({
      audience,
      url: `/api/pdf/generate?type=annual-report&year=${year}&audience=${audience}`,
      filename: `PICC-Annual-Report-${year}-${audience}.pdf`,
    })
  }

  return NextResponse.json({ variants, year })
}

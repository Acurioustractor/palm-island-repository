import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

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
              try { cookieStore.set(name, value, options) } catch {}
            })
          },
        } as any,
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch { return false }
}

// GET: list activity logs for a service, optionally filtered by date range
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id
    if (!serviceId) return NextResponse.json({ error: 'Service id required' }, { status: 400 })

    const url = new URL(request.url)
    const from = url.searchParams.get('from') // YYYY-MM-DD
    const to = url.searchParams.get('to')     // YYYY-MM-DD
    const periodType = url.searchParams.get('period_type') || 'monthly'

    const supabase = getServerClient()
    let query = supabase
      .from('service_activity_logs')
      .select('*')
      .eq('service_id', serviceId)
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(50)

    if (from) query = query.gte('period_start', from)
    if (to) query = query.lte('period_start', to)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ logs: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

// POST: add a new activity log entry
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceId = params.id
    if (!serviceId) return NextResponse.json({ error: 'Service id required' }, { status: 400 })

    const body = await request.json().catch(() => ({})) as {
      period_start?: string
      period_end?: string
      period_type?: string
      clients_served?: number
      sessions_delivered?: number
      events_held?: number
      staff_active?: number
      notes?: string
      entered_by?: string
    }

    if (!body.period_start) return NextResponse.json({ error: 'period_start required' }, { status: 400 })

    // Default period_end to end of month if not provided
    const periodEnd = body.period_end || (() => {
      const d = new Date(body.period_start!)
      d.setMonth(d.getMonth() + 1)
      d.setDate(0) // last day of original month
      return d.toISOString().split('T')[0]
    })()

    const supabase = getServerClient()
    const { data, error } = await (supabase as any)
      .from('service_activity_logs')
      .upsert(
        {
          service_id: serviceId,
          period_start: body.period_start,
          period_end: periodEnd,
          period_type: body.period_type || 'monthly',
          clients_served: body.clients_served ?? null,
          sessions_delivered: body.sessions_delivered ?? null,
          events_held: body.events_held ?? null,
          staff_active: body.staff_active ?? null,
          notes: body.notes || null,
          entered_by: body.entered_by || null,
        },
        { onConflict: 'service_id,period_start,period_type' }
      )
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, log: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

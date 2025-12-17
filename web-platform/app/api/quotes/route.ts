import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createServerSupabase } from '@/lib/supabase/client'
import { cleanupQuoteText, isLikelyJunkQuote } from '@/lib/transcripts/quotable'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')
}

async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key: string) {
            return cookieStore.get(key)?.value
          },
          set(key: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set(key, value, options)
            } catch {}
          },
          remove(key: string, options: CookieOptions) {
            try {
              cookieStore.delete(key)
            } catch {}
          },
        },
      }
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

async function ensureAccess(request: NextRequest) {
  if (isDev(request)) return true
  return !!(await getUserIdFromCookies())
}

function parseBooleanParam(value: string | null) {
  if (!value) return null
  const v = value.toLowerCase().trim()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return null
}

export async function GET(request: NextRequest) {
  try {
    const ok = await ensureAccess(request)
    if (!ok) return NextResponse.json({ error: 'Authentication required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const theme = (searchParams.get('theme') || '').trim()
    const sentiment = (searchParams.get('sentiment') || '').trim()
    const impactArea = (searchParams.get('impact_area') || '').trim()
    const profileId = (searchParams.get('profile_id') || '').trim()
    const validated = parseBooleanParam(searchParams.get('validated'))
    const suggested = parseBooleanParam(searchParams.get('suggested_for_report'))
    const includeJunk = parseBooleanParam(searchParams.get('include_junk')) === true

    const limit = Math.max(1, Math.min(60, Number(searchParams.get('limit') || 24)))
    const offset = Math.max(0, Number(searchParams.get('offset') || 0))

    const supabase = createServerSupabase() as any

    let query = supabase
      .from('extracted_quotes')
      .select(
        `
        id, quote_text, attribution, context, theme, sentiment, impact_area,
        is_validated, suggested_for_report, photo_url, profile_id, created_at,
        profile:profiles(id, full_name, preferred_name, profile_image_url, is_elder, storyteller_type)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (theme) query = query.eq('theme', theme)
    if (sentiment) query = query.eq('sentiment', sentiment)
    if (impactArea) query = query.eq('impact_area', impactArea)
    if (profileId) query = query.eq('profile_id', profileId)
    if (validated !== null) query = query.eq('is_validated', validated)
    if (suggested !== null) query = query.eq('suggested_for_report', suggested)

    if (q) {
      const like = `%${q}%`
      query = query.or(`quote_text.ilike.${like},attribution.ilike.${like},context.ilike.${like}`)
    }

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const normalized = (data || []).map((row: any) => {
      const quoteText = cleanupQuoteText(row?.quote_text || '')
      return { ...row, quote_text: quoteText }
    })

    const filtered = includeJunk ? normalized : normalized.filter((row: any) => !isLikelyJunkQuote(row.quote_text))

    return NextResponse.json({
      quotes: filtered,
      count: typeof count === 'number' ? count : null,
      nextOffset: offset + limit,
      hasMore: (data || []).length === limit,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load quotes' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ok = await ensureAccess(request)
    if (!ok) return NextResponse.json({ error: 'Authentication required' }, { status: 403 })

    const body = await request.json().catch(() => ({} as any))
    const id = String(body?.id || '').trim()
    const updates = body?.updates || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const allowed: Record<string, any> = {}
    const fields = [
      'quote_text',
      'attribution',
      'context',
      'theme',
      'sentiment',
      'impact_area',
      'is_validated',
      'suggested_for_report',
      'photo_url',
      'profile_id',
      'validated_at',
    ]
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(updates, f)) allowed[f] = updates[f]
    }

    if (typeof allowed.quote_text === 'string') {
      allowed.quote_text = cleanupQuoteText(allowed.quote_text)
    }

    const supabase = createServerSupabase() as any
    const { data, error } = await supabase
      .from('extracted_quotes')
      .update(allowed)
      .eq('id', id)
      .select(
        `
        id, quote_text, attribution, context, theme, sentiment, impact_area,
        is_validated, suggested_for_report, photo_url, profile_id, created_at,
        profile:profiles(id, full_name, preferred_name, profile_image_url, is_elder, storyteller_type)
      `
      )
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, quote: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update quote' }, { status: 500 })
  }
}


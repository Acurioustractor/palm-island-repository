import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getThemeBySlug } from '@/lib/themes/theme-definitions'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Standard page template for new reports
const STANDARD_PAGE_TEMPLATE = [
  { page_number: 1, page_type: 'cover', content_config: {} },
  { page_number: 2, page_type: 'acknowledgement', content_config: {} },
  { page_number: 3, page_type: 'messages', content_config: {} },
  { page_number: 4, page_type: 'year_in_numbers', content_config: {} },
  { page_number: 5, page_type: 'highlights', content_config: {} },
  { page_number: 6, page_type: 'story_spread', content_config: { story_index: 0 } },
  { page_number: 7, page_type: 'story_spread', content_config: { story_index: 1 } },
  { page_number: 8, page_type: 'governance', content_config: {} },
  { page_number: 9, page_type: 'services', content_config: {} },
  { page_number: 10, page_type: 'service_spotlight', content_config: {} },
  { page_number: 11, page_type: 'staff_report', content_config: {} },
  { page_number: 12, page_type: 'innovation', content_config: {} },
  { page_number: 13, page_type: 'photo_gallery', content_config: {} },
  { page_number: 14, page_type: 'financials', content_config: {} },
  { page_number: 15, page_type: 'expenditure', content_config: {} },
  { page_number: 16, page_type: 'partners', content_config: {} },
  { page_number: 17, page_type: 'back_cover', content_config: {} },
]

const ELDER_PAGE_TEMPLATE = [
  { page_number: 1, page_type: 'cover', content_config: { variant: 'elder' } },
  { page_number: 2, page_type: 'acknowledgement', content_config: {} },
  { page_number: 3, page_type: 'elder_group', content_config: {} },
  { page_number: 4, page_type: 'trip_overview', content_config: {} },
  { page_number: 5, page_type: 'trip_timeline', content_config: {} },
  { page_number: 6, page_type: 'elder_portrait', content_config: { elder_index: 0 } },
  { page_number: 7, page_type: 'elder_portrait', content_config: { elder_index: 1 } },
  { page_number: 8, page_type: 'elder_portrait', content_config: { elder_index: 2 } },
  { page_number: 9, page_type: 'elder_quotes', content_config: {} },
  { page_number: 10, page_type: 'photo_gallery', content_config: { tag: 'project:elders-trips' } },
  { page_number: 11, page_type: 'story_spread', content_config: { story_slug: 'walking-hull-river' } },
  { page_number: 12, page_type: 'back_cover', content_config: {} },
]

type PageTemplate = { page_number: number; page_type: string; content_config: Record<string, any> }[];

const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  standard: STANDARD_PAGE_TEMPLATE,
  elder: ELDER_PAGE_TEMPLATE,
}

/**
 * Resolve a page template by edition key.
 * Supports themed editions via `theme-{slug}` keys.
 */
function resolveTemplate(edition: string): PageTemplate {
  // Check static templates first
  if (PAGE_TEMPLATES[edition]) return PAGE_TEMPLATES[edition]

  // Check for themed edition (theme-{slug})
  if (edition.startsWith('theme-')) {
    const themeSlug = edition.replace('theme-', '')
    const theme = getThemeBySlug(themeSlug)
    if (theme) return theme.pdfPageTypes
  }

  return STANDARD_PAGE_TEMPLATE
}

// GET: Fetch page plan for a report edition
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('report_id')
    const edition = searchParams.get('edition') || 'standard'

    if (!reportId) {
      return NextResponse.json({ error: 'report_id required' }, { status: 400 })
    }

    const { data: pages, error } = await supabase
      .from('report_page_assignments')
      .select('*')
      .eq('report_id', reportId)
      .eq('edition', edition)
      .order('page_number')

    if (error) throw error

    // If no pages exist, return the template for this edition type
    if (!pages || pages.length === 0) {
      const template = resolveTemplate(edition)
      return NextResponse.json({
        pages: template.map(p => ({
          ...p,
          report_id: reportId,
          edition,
          id: null,
        })),
        is_template: true,
      })
    }

    return NextResponse.json({ pages, is_template: false })
  } catch (error) {
    console.error('Page plan GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT: Save full page plan (replaces all pages for an edition)
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { report_id, edition, pages } = body

    if (!report_id || !edition || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'report_id, edition, and pages[] required' },
        { status: 400 }
      )
    }

    // Delete existing pages for this edition
    await supabase
      .from('report_page_assignments')
      .delete()
      .eq('report_id', report_id)
      .eq('edition', edition)

    // Insert new pages
    const rows = pages.map((p: any, i: number) => ({
      report_id,
      edition,
      page_number: p.page_number ?? i + 1,
      page_type: p.page_type,
      content_config: p.content_config || {},
    }))

    const { data, error } = await supabase
      .from('report_page_assignments')
      .insert(rows)
      .select()

    if (error) throw error

    // Update edition page count
    await supabase
      .from('report_editions')
      .update({ page_count: rows.length, updated_at: new Date().toISOString() })
      .eq('report_id', report_id)
      .eq('edition_key', edition)

    return NextResponse.json({ pages: data })
  } catch (error) {
    console.error('Page plan PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

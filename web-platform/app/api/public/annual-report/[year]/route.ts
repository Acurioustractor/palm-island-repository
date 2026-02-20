import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

export async function GET(request: NextRequest, { params }: { params: { year: string } }) {
  try {
    const year = Number(params.year)
    if (!Number.isFinite(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const supabase = getServerClient()

    let reportQuery = supabase
      .from('annual_reports')
      .select('*')
      .eq('report_year', year)
      .order('updated_at', { ascending: false })
      .limit(1)

    // In production, only return published reports via this public API.
    if (!isDev(request)) {
      reportQuery = reportQuery.eq('status', 'published')
    }

    const { data: reportRows, error: reportError } = await reportQuery
    if (reportError) return NextResponse.json({ error: reportError.message }, { status: 500 })

    const report = reportRows?.[0]
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    const reportId = report.id as string

    const [
      servicesResult,
      projectsResult,
      sectionsResult,
      linkedStoriesResult,
      quotesResult,
      imagesResult,
    ] = await Promise.all([
      supabase
        .from('organization_services')
        .select('id, name, description, service_category, icon_name, service_color')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(200),
      supabase
        .from('projects')
        .select('id, name, description, project_type, status, hero_image_url, tagline')
        .eq('is_public', true)
        .neq('status', 'archived')
        .in('project_type', ['innovation', 'infrastructure', 'cultural', 'research', 'other'])
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('report_sections')
        .select('id, section_type, section_title, section_content, display_order')
        .eq('report_id', reportId)
        .order('display_order', { ascending: true }),
      supabase
        .from('annual_report_stories')
        .select(
          `
          display_order,
          is_featured,
          stories (
            id,
            title,
            content,
            category,
            story_type,
            location,
            storyteller_id,
            profiles(full_name, profile_image_url, storyteller_type)
          )
        `
        )
        .eq('report_id', reportId)
        .order('display_order', { ascending: true }),
      supabase
        .from('extracted_quotes')
        .select('id, quote_text, attribution, impact_area, theme, photo_url, display_order')
        .eq('used_in_report_id', reportId)
        .order('display_order', { ascending: true }),
      supabase
        .from('media_files')
        .select('id, public_url, title, caption, alt_text, tags, metadata, is_featured, file_type, usage_context, story_id')
        .eq('is_public', true)
        .is('deleted_at', null)
        .limit(300)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

    const sections = sectionsResult.data || []
    const linkedStories = (linkedStoriesResult.data || []).map((r: any) => r.stories).filter(Boolean)
    const quotes = quotesResult.data || []

    // For images/videos: prefer annual-report media tagged for this fiscal year, otherwise fall back to story images.
    const computedFiscalYear = `${year - 1}-${String(year).slice(-2)}`
    const normalizeFiscalYear = (fy: string) => {
      if (!fy) return ''
      if (/^\d{4}-\d{2}$/.test(fy)) return fy
      if (/^\d{4}-\d{4}$/.test(fy)) {
        const [start, end] = fy.split('-')
        return `${start}-${end.slice(-2)}`
      }
      return fy
    }

    const reportFiscalYear = normalizeFiscalYear(String(report?.metadata?.fiscal_year || computedFiscalYear))
    const fyTag = `fy:${reportFiscalYear}`
    const allMedia = (imagesResult.data || []) as any[]

    // Filter for annual report media (tagged with annual-report AND fiscal year)
    const annualReportMedia = allMedia
      .filter((m) => Array.isArray(m.tags) && m.tags.includes('annual-report'))
      .filter((m) => {
        const tags = Array.isArray(m.tags) ? m.tags : []
        if (tags.includes(fyTag)) return true
        const metaFY = normalizeFiscalYear(String(m.metadata?.fiscal_year || ''))
        return metaFY === reportFiscalYear
      })

    // Organize media by section (using report-section:xxx tags)
    const getMediaBySection = (sectionId: string) =>
      annualReportMedia.filter((m) =>
        Array.isArray(m.tags) && m.tags.includes(`report-section:${sectionId}`)
      )

    // Fallback: query the broader media library using the new tag taxonomy
    const getMediaByTags = (requiredTags: string[], opts?: { featured?: boolean; limit?: number }) =>
      allMedia
        .filter((m) => {
          const tags = Array.isArray(m.tags) ? m.tags : []
          return requiredTags.every((t) => tags.includes(t))
        })
        .filter((m) => (opts?.featured ? m.is_featured : true))
        .slice(0, opts?.limit || 50)

    const heroBySection = getMediaBySection('hero')
    const ceoBySection = getMediaBySection('ceo')
    const chairBySection = getMediaBySection('chair')
    const galleryBySection = getMediaBySection('gallery')
    const storiesBySection = getMediaBySection('stories')
    const projectsBySection = getMediaBySection('projects')
    const videoThumbBySection = getMediaBySection('video_thumb')

    // Fetch leadership portraits from leadership table as reliable fallback
    const { data: leadershipRows } = await supabase
      .from('leadership')
      .select('full_name, position, photo_url, leadership_type')
      .eq('is_active', true)
      .order('position_order')
    const ceoLeadership = leadershipRows?.find((r) => r.leadership_type === 'executive')
    const chairLeadership = leadershipRows?.find((r) => r.position === 'Chair of the Board')

    const mediaBySections = {
      hero: heroBySection.length > 0
        ? heroBySection
        : getMediaByTags(['section:cover'], { limit: 3 }),
      ceo: ceoBySection.length > 0
        ? ceoBySection
        : ceoLeadership?.photo_url
          ? [{ public_url: ceoLeadership.photo_url, alt_text: ceoLeadership.full_name, tags: ['role:ceo'] }]
          : getMediaByTags(['person:rachel-atkinson', 'role:ceo'], { limit: 2 }),
      chair: chairBySection.length > 0
        ? chairBySection
        : chairLeadership?.photo_url
          ? [{ public_url: chairLeadership.photo_url, alt_text: chairLeadership.full_name, tags: ['role:chair'] }]
          : getMediaByTags(['person:luella-bligh', 'role:chair'], { limit: 2 }),
      gallery: galleryBySection.length > 0
        ? galleryBySection
        : allMedia
            .filter((m) => m.is_featured && m.file_type !== 'video' && !m.deleted_at)
            .slice(0, 30),
      stories: storiesBySection,
      projects: projectsBySection,
      video_thumb: videoThumbBySection,
    }

    // Also provide board and elder photos for the page to use
    const boardPhotos = getMediaByTags(['board'])
    const elderPhotos = getMediaByTags(['content:elders'], { featured: true, limit: 10 })

    const storyIds = linkedStories.map((s: any) => s.id).filter(Boolean)
    const storyMedia = allMedia
      .filter((m) => m.file_type === 'image')
      .filter((m) => m.story_id && storyIds.includes(m.story_id))

    return NextResponse.json({
      report,
      services: servicesResult.data || [],
      projects: projectsResult.data || [],
      sections,
      stories: linkedStories,
      quotes,
      reportMedia: annualReportMedia,
      mediaBySections,
      storyMedia,
      boardPhotos,
      elderPhotos,
      computedFiscalYear: reportFiscalYear,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load annual report' }, { status: 500 })
  }
}

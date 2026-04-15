/**
 * Unified PDF Generation API
 *
 * GET /api/pdf/generate?type=annual-report&year=2024-25
 * GET /api/pdf/generate?type=stories
 * GET /api/pdf/generate?type=services
 * GET /api/pdf/generate?type=history
 * GET /api/pdf/generate?type=brand-guide
 * GET /api/pdf/generate?type=focus-report&focus=service&id=<slug>
 * GET /api/pdf/generate?type=focus-report&focus=project&id=<slug>
 * GET /api/pdf/generate?type=focus-report&focus=theme&id=<tag>
 * GET /api/pdf/generate?type=evidence-package&grantId=<uuid>
 *
 * Returns a PDF blob with Content-Disposition: attachment.
 */

import { NextRequest, NextResponse } from 'next/server'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 300

async function generateAnnualReport(year?: string, audience?: string) {
  const [{ renderToBuffer }, { default: AnnualReportPDF }, { getReportData }, { registerFonts }] =
    await Promise.all([
      import('@react-pdf/renderer'),
      import('@/lib/pdf/templates/AnnualReportPDF'),
      import('@/lib/annual-report/fetch-report-data'),
      import('@/lib/pdf/register-fonts'),
    ])

  await registerFonts()

  const validAudiences = ['community', 'funder', 'board', 'supporter', 'government']
  const audienceProp = audience && validAudiences.includes(audience) ? audience as any : null

  const data = await getReportData(year || '2024-25')
  const buffer = await renderToBuffer(
    React.createElement(AnnualReportPDF, { data, audience: audienceProp }) as any
  )
  const reportYear = year || '2024-25'
  const audienceSuffix = audienceProp ? `-${audienceProp}` : ''
  return {
    buffer,
    filename: `PICC-Annual-Report-${reportYear}${audienceSuffix}.pdf`,
  }
}

async function generateStories() {
  const [{ renderToBuffer }, { default: StoriesPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/templates/StoriesPDF'),
  ])

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: stories } = await supabase
    .from('stories')
    .select(
      'id, title, body, featured_image, storyteller_name, storyteller_role, quote, category, services'
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50)

  const buffer = await renderToBuffer(
    React.createElement(StoriesPDF, { stories: stories || [] }) as any
  )
  return { buffer, filename: 'PICC-Our-Stories.pdf' }
}

async function generateServices() {
  const [{ renderToBuffer }, { default: ServicesPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/templates/ServicesPDF'),
  ])

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, description, service_category, staff_count, clients_served_annual')
    .eq('is_active', true)
    .order('name')

  const buffer = await renderToBuffer(
    React.createElement(ServicesPDF, { services: services || [] }) as any
  )
  return { buffer, filename: 'PICC-Our-Services.pdf' }
}

async function generateHistory() {
  const [{ renderToBuffer }, { default: HistoryPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/templates/HistoryPDF'),
  ])

  // Fetch history data from the public API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/public/history`)
  if (!res.ok) {
    throw new Error('Failed to fetch history data')
  }
  const historyData = await res.json()

  const buffer = await renderToBuffer(
    React.createElement(HistoryPDF, {
      eras: historyData.eras || [],
      summary: historyData.summary || { totalYears: 17, latestStaff: null, latestBudget: null, latestServices: null },
    }) as any
  )
  return { buffer, filename: 'PICC-Our-History.pdf' }
}

async function generateBrandGuide() {
  const [{ renderToBuffer }, { default: BrandGuidePDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/templates/BrandGuidePDF'),
  ])

  const buffer = await renderToBuffer(
    React.createElement(BrandGuidePDF) as any
  )
  return { buffer, filename: 'PICC-Brand-Guide.pdf' }
}

async function generateEvidencePackage(grantId: string) {
  const [{ renderToBuffer }, { default: EvidencePackagePDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/templates/EvidencePackagePDF'),
  ])

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: grant } = await supabase
    .from('service_grants')
    .select('id, grant_name, funder_name, fiscal_year')
    .eq('id', grantId)
    .single()

  if (!grant) throw new Error(`Grant not found: ${grantId}`)

  const { data: outcomes } = await supabase
    .from('grant_outcomes')
    .select('*, evidence_links(*)')
    .eq('grant_id', grantId)
    .order('created_at', { ascending: true })

  const packageData = {
    grantName: grant.grant_name,
    funderName: grant.funder_name || '',
    fiscalYear: grant.fiscal_year || '2024-25',
    outcomes: (outcomes || []).map((o: any) => ({
      outcome_name: o.outcome_name,
      outcome_description: o.outcome_description,
      target_metric: o.target_metric,
      target_value: o.target_value,
      actual_value: o.actual_value,
      status: o.status,
      evidence: (o.evidence_links || []).map((e: any) => ({
        evidence_type: e.evidence_type,
        evidence_title: e.evidence_title || 'Untitled',
        relevance_score: e.relevance_score || 0.5,
        notes: e.notes,
      })),
    })),
  }

  const buffer = await renderToBuffer(
    React.createElement(EvidencePackagePDF, { data: packageData }) as any
  )
  const safeName = grant.grant_name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')
  return { buffer, filename: `PICC-Evidence-Package-${safeName}.pdf` }
}

async function generateFocusReport(focusType: string, id: string) {
  const [{ renderToBuffer }, { default: FocusReportPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/templates/FocusReportPDF'),
  ])

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let focus: { type: 'service' | 'project' | 'theme'; id: string; name: string }
  let description = ''
  let stats: { label: string; value: string }[] = []
  let coverPhoto: string | null = null

  if (focusType === 'service') {
    const { data: svc } = await supabase
      .from('organization_services')
      .select('id, name, slug, description, service_category, staff_count, clients_served_annual, cover_image_url')
      .eq('slug', id)
      .single()

    if (!svc) throw new Error(`Service not found: ${id}`)
    focus = { type: 'service', id: svc.slug, name: svc.name }
    description = svc.description || `${svc.name} — a PICC community service.`
    coverPhoto = svc.cover_image_url || null
    if (svc.staff_count) stats.push({ label: 'Staff', value: String(svc.staff_count) })
    if (svc.clients_served_annual) stats.push({ label: 'Clients Served (Annual)', value: String(svc.clients_served_annual) })
    if (svc.service_category) stats.push({ label: 'Category', value: svc.service_category })
  } else if (focusType === 'project') {
    const { data: proj } = await supabase
      .from('projects')
      .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
      .eq('slug', id)
      .single()

    if (!proj) throw new Error(`Project not found: ${id}`)
    focus = { type: 'project', id: proj.slug, name: proj.name }
    description = proj.description || proj.tagline || `${proj.name} — a PICC innovation project.`
    coverPhoto = proj.hero_image_url || null
    if (proj.status) stats.push({ label: 'Status', value: proj.status })
    if (proj.target_beneficiaries) stats.push({ label: 'Target Beneficiaries', value: String(proj.target_beneficiaries) })
    if (proj.actual_beneficiaries) stats.push({ label: 'Actual Beneficiaries', value: String(proj.actual_beneficiaries) })
    if (proj.budget_total) stats.push({ label: 'Budget', value: `$${(proj.budget_total / 1000).toFixed(0)}K` })
  } else {
    // theme — search by tag across stories
    focus = { type: 'theme', id, name: id.charAt(0).toUpperCase() + id.slice(1) }
    description = `Stories and content related to the "${focus.name}" theme across PICC programs.`
  }

  // Fetch related stories
  let storiesQuery = supabase
    .from('stories')
    .select('id, title, body, featured_image, storyteller_name, storyteller_role, quote')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  if (focusType === 'service') {
    storiesQuery = storiesQuery.contains('services', [id])
  } else if (focusType === 'theme') {
    storiesQuery = storiesQuery.contains('tags', [id])
  }

  const { data: stories } = await storiesQuery
  const storyList = (stories || []).map(s => ({
    ...s,
    featured_image: s.featured_image || null,
    storyteller_name: s.storyteller_name || null,
    storyteller_role: s.storyteller_role || null,
    quote: s.quote || null,
  }))

  // Fetch related photos from media
  const { data: media } = await supabase
    .from('media_files')
    .select('public_url')
    .contains('tags', [id])
    .eq('file_type', 'image')
    .eq('is_public', true)
    .limit(6)

  const photos = (media || []).map(m => m.public_url).filter(Boolean)

  // Fetch notes if project
  let notes: { id: string; content: string; note_type: string | null; created_at: string }[] = []
  if (focusType === 'project') {
    const { data: proj } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', id)
      .single()

    if (proj) {
      const { data: projectNotes } = await supabase
        .from('project_notes')
        .select('id, content, note_type, created_at')
        .eq('project_id', proj.id)
        .order('created_at', { ascending: false })
        .limit(10)
      notes = projectNotes || []
    }
  }

  const buffer = await renderToBuffer(
    React.createElement(FocusReportPDF, {
      focus,
      coverPhoto,
      data: {
        description,
        stats,
        stories: storyList,
        photos,
        notes: focusType === 'project' ? notes : undefined,
      },
    }) as any
  )

  const safeName = focus.name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')
  return { buffer, filename: `PICC-${safeName}-Report.pdf` }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const year = searchParams.get('year') || undefined
  const audienceParam = searchParams.get('audience') || undefined
  const focusParam = searchParams.get('focus') || undefined
  const idParam = searchParams.get('id') || undefined

  if (!type) {
    return NextResponse.json(
      { error: 'Missing ?type= parameter. Options: annual-report, stories, services, history, brand-guide, focus-report' },
      { status: 400 }
    )
  }

  try {
    let result: { buffer: Buffer | NodeJS.ArrayBufferView; filename: string }

    switch (type) {
      case 'annual-report':
        result = await generateAnnualReport(year, audienceParam)
        break
      case 'stories':
        result = await generateStories()
        break
      case 'services':
        result = await generateServices()
        break
      case 'history':
        result = await generateHistory()
        break
      case 'brand-guide':
        result = await generateBrandGuide()
        break
      case 'focus-report':
        if (!focusParam || !idParam) {
          return NextResponse.json(
            { error: 'focus-report requires ?focus=service|project|theme and ?id=<slug>' },
            { status: 400 }
          )
        }
        result = await generateFocusReport(focusParam, idParam)
        break
      case 'evidence-package': {
        const grantId = searchParams.get('grantId')
        if (!grantId) {
          return NextResponse.json(
            { error: 'evidence-package requires ?grantId=<uuid>' },
            { status: 400 }
          )
        }
        result = await generateEvidencePackage(grantId)
        break
      }
      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}. Options: annual-report, stories, services, history, brand-guide, focus-report` },
          { status: 400 }
        )
    }

    return new NextResponse(result.buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error(`PDF generation failed for type=${type}:`, error)
    return NextResponse.json(
      { error: error?.message || 'PDF generation failed' },
      { status: 500 }
    )
  }
}

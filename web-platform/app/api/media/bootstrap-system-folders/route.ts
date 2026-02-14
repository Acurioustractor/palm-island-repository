import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getFiscalYearOptions(count = 8) {
  const now = new Date()
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return Array.from({ length: count }).map((_, i) => {
    const fyStart = start - i
    const fyEnd = fyStart + 1
    return `${fyStart}-${String(fyEnd).slice(-2)}`
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!isDev(request)) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 })
    }

    const supabase = getServerClient()
    const body = (await request.json().catch(() => ({}))) as { years?: string[] }

    const [servicesResult, projectsResult] = await Promise.all([
      supabase
        .from('organization_services')
        .select('name, slug, service_category')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(300),
      supabase
        .from('projects')
        .select('name, slug, project_type')
        .order('featured', { ascending: false })
        .order('name', { ascending: true })
        .limit(300),
    ])

    if (servicesResult.error) throw servicesResult.error
    if (projectsResult.error) throw projectsResult.error

    const years = Array.isArray(body.years) && body.years.length > 0 ? body.years : getFiscalYearOptions(10)

    const serviceFolders = (servicesResult.data || []).map((s: any) => {
      const serviceName = s.name
      const serviceSlug = s.slug
      const category = String(s.service_category || '').toLowerCase()
      const icon =
        category === 'health' ? 'Heart' :
        category === 'culture' ? 'Star' :
        category === 'youth' || category === 'family' ? 'Users' :
        category === 'housing' ? 'Folder' :
        'Folder'
      const color =
        category === 'health' ? 'green' :
        category === 'culture' ? 'purple' :
        category === 'youth' ? 'blue' :
        category === 'family' ? 'pink' :
        'amber'

      return {
        name: `Service: ${serviceName}`,
        slug: `service-${slugify(serviceSlug || serviceName)}`,
        description: `All media tagged to the ${serviceName} service.`,
        icon,
        color,
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: `service:${serviceSlug}` }],
        },
      }
    })

    const projectFolders = (projectsResult.data || []).map((p: any) => ({
      name: `Project: ${p.name}`,
      slug: `project-${slugify(p.slug || p.name)}`,
      description: `All media tagged to the ${p.name} innovation project.`,
      icon: 'Folder',
      color: 'amber',
      is_system: true,
      query_rules: {
        filters: [{ field: 'tags', operator: 'contains', value: `project:${p.slug}` }],
      },
    }))

    const yearFolders = years.map((fy) => ({
      name: `FY ${fy}`,
      slug: `fy-${slugify(fy)}`,
      description: `All media tagged for fiscal year ${fy}.`,
      icon: 'Calendar',
      color: 'blue',
      is_system: true,
      query_rules: {
        filters: [{ field: 'tags', operator: 'contains', value: `fy:${fy}` }],
      },
    }))

    const annualReportYearFolders = years.map((fy) => ({
      name: `Annual Report FY ${fy}`,
      slug: `annual-report-${slugify(fy)}`,
      description: `Annual report media for ${fy} (tagged annual-report + fiscal year).`,
      icon: 'FileText',
      color: 'purple',
      is_system: true,
      query_rules: {
        filters: [
          { field: 'tags', operator: 'contains', value: 'annual-report' },
          { field: 'tags', operator: 'contains', value: `fy:${fy}` },
        ],
      },
    }))

    // Event / collection folders — where the real photos live
    const eventFolders = [
      {
        name: 'Spring Festival 2025',
        slug: 'event-spring-festival-2025',
        description: 'Photos from the PICC Spring Festival 2025, including photobooth shots.',
        icon: 'Star',
        color: 'amber',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'event:spring-festival-2025' }],
        },
      },
      {
        name: 'Photo Shoot Oct 2025',
        slug: 'event-photo-shoot-oct-2025',
        description: 'Professional photography session — staff, services, and community portraits.',
        icon: 'Star',
        color: 'amber',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'event:photo-shoot-oct-2025' }],
        },
      },
      {
        name: 'Community Visit Jun 2025',
        slug: 'event-community-visit-jun-2025',
        description: 'On-country community visit photos from June 2025.',
        icon: 'Users',
        color: 'green',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'event:community-visit-jun-2025' }],
        },
      },
      {
        name: 'Daycare Opening 2025',
        slug: 'event-daycare-opening-2025',
        description: 'Photos from the new daycare centre opening ceremony.',
        icon: 'Heart',
        color: 'pink',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'event:daycare-opening-2025' }],
        },
      },
      {
        name: 'Elders Conference',
        slug: 'event-elders-conference',
        description: 'Photos from Elder gatherings and conferences.',
        icon: 'Users',
        color: 'purple',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'event:elders-conference' }],
        },
      },
      {
        name: 'PICC Website Photos',
        slug: 'source-picc-website',
        description: 'Photos sourced from the original PICC website — staff, services, and community.',
        icon: 'Folder',
        color: 'blue',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'source:picc-website' }],
        },
      },
      {
        name: 'Profile Photos',
        slug: 'profile-photos',
        description: 'Staff and storyteller profile photos.',
        icon: 'Users',
        color: 'green',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'profile-image' }],
        },
      },
      {
        name: 'Needs Review (Junk)',
        slug: 'audit-junk',
        description: 'Small PDF extracts and page renders flagged for cleanup. Safe to archive or delete.',
        icon: 'AlertCircle',
        color: 'red',
        is_system: true,
        query_rules: {
          filters: [{ field: 'tags', operator: 'contains', value: 'audit:junk' }],
        },
      },
      {
        name: 'PDF Archives (Usable)',
        slug: 'pdf-useful',
        description: 'Larger images extracted from annual report PDFs — real photos worth keeping.',
        icon: 'FileText',
        color: 'purple',
        is_system: true,
        query_rules: {
          filters: [
            { field: 'tags', operator: 'contains', value: 'pdf-extract' },
            { field: 'tags', operator: 'not_contains', value: 'audit:junk' },
          ],
        },
      },
    ]

    const folders = [...eventFolders, ...serviceFolders, ...projectFolders, ...yearFolders, ...annualReportYearFolders]

    // Ensure icons exist in UI mapping; fall back gracefully.
    const safeFolders = folders.map((f) => ({
      ...f,
      icon: ['Users', 'Heart', 'Star', 'AlertCircle', 'Calendar', 'Folder', 'FileText'].includes(f.icon)
        ? f.icon
        : 'Folder',
    }))

    const { error } = await (supabase as any)
      .from('smart_folders')
      .upsert(safeFolders, { onConflict: 'slug' })

    if (error) throw error

    return NextResponse.json({ ok: true, createdOrUpdated: safeFolders.length })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to bootstrap folders' }, { status: 500 })
  }
}

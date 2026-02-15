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

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')
    if (!slug) {
      return NextResponse.json({ error: 'slug parameter required' }, { status: 400 })
    }

    const supabase = getServerClient()

    // Load the folder
    const { data: folders, error: folderError } = await supabase
      .from('smart_folders')
      .select('*')
      .eq('slug', slug)
      .limit(1)

    if (folderError) throw folderError
    if (!folders || folders.length === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    const folder = folders[0]
    const rules = folder.query_rules

    if (!rules?.filters) {
      return NextResponse.json({ folder, media: [] })
    }

    // Build Supabase query from rules
    let query = supabase
      .from('media_files')
      .select('id, filename, public_url, file_type, title, tags, width, height, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply tag filters server-side where possible
    for (const filter of rules.filters) {
      if (filter.field === 'tags' && filter.operator === 'contains') {
        query = query.contains('tags', [filter.value])
      }
    }

    // Paginate to get all matching media
    const allMedia: any[] = []
    let offset = 0
    const PAGE_SIZE = 1000
    while (true) {
      const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1)
      if (error) throw error
      if (!data || data.length === 0) break
      allMedia.push(...data)
      if (data.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    // Apply remaining filters client-side (not_contains, contains_any, quality, date)
    const filtered = allMedia.filter(media => {
      return rules.filters.every((filter: any) => {
        const tags = media.tags || []
        switch (filter.field) {
          case 'tags':
            if (filter.operator === 'contains') return true // already filtered server-side
            if (filter.operator === 'not_contains') return !tags.includes(filter.value)
            if (filter.operator === 'contains_any') return filter.value.some((t: string) => tags.includes(t))
            if (filter.operator === 'empty') return tags.length === 0
            return false
          case 'created_at':
            if (filter.operator === '>=' && filter.value === 'start_of_month') {
              const now = new Date()
              const som = new Date(now.getFullYear(), now.getMonth(), 1)
              return new Date(media.created_at) >= som
            }
            return false
          default:
            return false
        }
      })
    })

    return NextResponse.json({ folder, media: filtered })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load folder media' }, { status: 500 })
  }
}

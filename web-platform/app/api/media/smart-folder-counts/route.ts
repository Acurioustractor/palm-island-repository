import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const supabase = getServerClient()

    // Load all smart folders
    const { data: folders, error: foldersError } = await supabase
      .from('smart_folders')
      .select('slug, query_rules')
      .order('name')

    if (foldersError) throw foldersError

    // Load ALL media (paginated) — need tags for filtering, public_url for thumbnails
    const allMedia: { id: string; tags: string[] | null; public_url: string; file_type: string; created_at: string }[] = []
    let offset = 0
    const PAGE_SIZE = 1000
    while (true) {
      const { data, error } = await supabase
        .from('media_files')
        .select('id, tags, public_url, file_type, created_at')
        .is('deleted_at', null)
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) throw error
      if (!data || data.length === 0) break
      allMedia.push(...data)
      if (data.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    // Calculate counts and pick a thumbnail for each folder
    const counts: Record<string, number> = {}
    const thumbnails: Record<string, string> = {}

    const matchesRules = (media: typeof allMedia[0], filters: any[]) => {
      return filters.every((filter: any) => {
        const tags = media.tags || []
        switch (filter.field) {
          case 'tags':
            if (filter.operator === 'contains') return tags.includes(filter.value)
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
    }

    for (const folder of folders || []) {
      const rules = folder.query_rules
      if (!rules?.filters) {
        counts[folder.slug] = 0
        continue
      }

      const matching = allMedia.filter(m => matchesRules(m, rules.filters))
      counts[folder.slug] = matching.length

      // Pick first image as thumbnail
      const firstImage = matching.find(m => m.file_type === 'image' && m.public_url)
      if (firstImage) {
        thumbnails[folder.slug] = firstImage.public_url
      }
    }

    return NextResponse.json({ counts, thumbnails, totalMedia: allMedia.length })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to calculate counts' }, { status: 500 })
  }
}

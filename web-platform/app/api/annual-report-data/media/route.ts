import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const fyTag = searchParams.get('fy_tag') // e.g. "fy:2024-25"

    if (!fyTag) {
      return NextResponse.json({ error: 'fy_tag required (e.g. fy:2024-25)' }, { status: 400 })
    }

    // Get media tagged with the FY tag (e.g. fy:2024-25)
    // Photos may or may not also have the "annual-report" tag
    const { data: media, error } = await supabase
      .from('media_files')
      .select('id, filename, public_url, mime_type, tags, alt_text, width, height, created_at')
      .contains('tags', [fyTag])
      .order('created_at', { ascending: false })

    if (error) throw error

    // Compute section stats from tags
    const sections = ['hero', 'ceo', 'chair', 'gallery', 'services', 'board']
    const sectionCounts: Record<string, number> = {}
    sections.forEach(s => { sectionCounts[s] = 0 })

    ;(media || []).forEach((m: any) => {
      const tags: string[] = m.tags || []
      sections.forEach(s => {
        if (tags.includes(`section:${s}`)) {
          sectionCounts[s]++
        }
      })
    })

    return NextResponse.json({
      media: media || [],
      total: (media || []).length,
      section_counts: sectionCounts,
      gaps: sections.filter(s => sectionCounts[s] === 0),
    })
  } catch (error: any) {
    console.error('Media GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { media_id, action, tag } = body

    if (!media_id || !action || !tag) {
      return NextResponse.json({ error: 'media_id, action, and tag required' }, { status: 400 })
    }

    // Get current tags
    const { data: file, error: fetchError } = await supabase
      .from('media_files')
      .select('tags')
      .eq('id', media_id)
      .single()

    if (fetchError) throw fetchError

    let tags: string[] = file.tags || []

    if (action === 'add') {
      if (!tags.includes(tag)) {
        tags = [...tags, tag]
      }
    } else if (action === 'remove') {
      tags = tags.filter(t => t !== tag)
    } else {
      return NextResponse.json({ error: 'action must be "add" or "remove"' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('media_files')
      .update({ tags })
      .eq('id', media_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ media: data })
  } catch (error: any) {
    console.error('Media POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

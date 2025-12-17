import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function extractMissingColumnFromMessage(message: string) {
  return (
    message.match(/Could not find the '([^']+)' column/i)?.[1] ||
    message.match(/column \"([^\"]+)\" of relation \"stories\" does not exist/i)?.[1] ||
    null
  )
}

async function insertWithSchemaFallback(supabase: any, row: Record<string, any>) {
  let payload = { ...row }
  let lastError: any = null

  for (let i = 0; i < 8; i++) {
    const res = await supabase.from('stories').insert(payload).select().single()
    if (!res?.error) return res

    lastError = res.error
    const missing = extractMissingColumnFromMessage(String(res.error?.message || ''))
    if (!missing) break
    delete payload[missing]
  }

  return { data: null, error: lastError }
}

async function updateWithSchemaFallback(supabase: any, id: string, row: Record<string, any>) {
  let payload = { ...row }
  let lastError: any = null

  for (let i = 0; i < 8; i++) {
    const res = await supabase.from('stories').update(payload).eq('id', id).select().single()
    if (!res?.error) return res

    lastError = res.error
    const missing = extractMissingColumnFromMessage(String(res.error?.message || ''))
    if (!missing) break
    delete payload[missing]
  }

  return { data: null, error: lastError }
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (id) {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Story fetch by id error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data: data ? [data] : [], count: data ? 1 : 0 })
    }

    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        created_at,
        category,
        status,
        access_level,
        storyteller_id,
        report_worthy,
        auto_include,
        quality_score,
        engagement_score,
        report_section,
        story_type,
        location,
        tags,
        profiles:storyteller_id (
          id,
          full_name,
          preferred_name,
          storyteller_type,
          is_elder
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Stories query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten the profiles relation
    const stories = (data || []).map((story: any) => ({
      ...story,
      storyteller_name: story.profiles?.full_name || story.profiles?.preferred_name || null,
      storyteller_type: story.profiles?.storyteller_type || null,
      is_elder: story.profiles?.is_elder || false,
    }))

    return NextResponse.json({ data: stories, count: stories.length })
  } catch (error: any) {
    console.error('Stories API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json()

    const excerpt = (body.excerpt ?? body.summary ?? '') as string
    const storyData = {
      storyteller_id: body.storyteller_id,
      title: body.title,
      content: body.content,
      excerpt,
      summary: excerpt,
      featured_image_url: body.featured_image_url || null,
      category: body.category || 'community',
      story_type: body.story_type || 'community_story',
      status: body.status || 'draft',
      access_level: body.access_level || 'public',
      location: body.location || 'Palm Island',
      tags: body.tags || [],
      featured_people: Array.isArray(body.featured_people) ? body.featured_people : [],
      metadata: body.metadata || {},
      collected_by: body.collected_by || null,
      organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
    }

    const { data, error } = await insertWithSchemaFallback(supabase, storyData)

    if (error) {
      console.error('Story insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update storyteller's story count
    if (data && body.storyteller_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stories_contributed')
        .eq('id', body.storyteller_id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ stories_contributed: (profile.stories_contributed || 0) + 1 })
          .eq('id', body.storyteller_id)
      }
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Stories POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
    }

    const excerpt = updateData.excerpt ?? updateData.summary
    const payload: any = {
      storyteller_id: updateData.storyteller_id,
      title: updateData.title,
      content: updateData.content,
      excerpt,
      summary: excerpt,
      featured_image_url: updateData.featured_image_url,
      category: updateData.category,
      story_type: updateData.story_type,
      status: updateData.status,
      access_level: updateData.access_level,
      location: updateData.location,
      tags: updateData.tags,
      featured_people: Array.isArray(updateData.featured_people) ? updateData.featured_people : undefined,
      metadata: updateData.metadata,
      story_date: updateData.story_date,
      is_featured: updateData.is_featured,
      is_public: updateData.is_public,
      contains_traditional_knowledge: updateData.contains_traditional_knowledge,
      cultural_sensitivity_level: updateData.cultural_sensitivity_level,
      elder_approval_required: updateData.elder_approval_required,
      elder_approval_given: updateData.elder_approval_given,
      people_affected: updateData.people_affected,
      views: updateData.views,
      shares: updateData.shares,
    }

    // Drop undefined keys so JSON doesn't omit-but we avoid overwriting with null unintentionally.
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const { data, error } = await updateWithSchemaFallback(supabase, String(id), payload)

    if (error) {
      console.error('Story update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Stories PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
    }

    // Get storyteller_id before deleting
    const { data: story } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Story delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Decrement storyteller's story count
    if (story?.storyteller_id) {
      await supabase
        .from('profiles')
        .select('stories_contributed')
        .eq('id', story.storyteller_id)
        .single()
        .then(({ data: profile }) => {
          if (profile && profile.stories_contributed > 0) {
            supabase
              .from('profiles')
              .update({ stories_contributed: profile.stories_contributed - 1 })
              .eq('id', story.storyteller_id)
          }
        })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Stories DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

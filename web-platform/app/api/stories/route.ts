import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

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

    const storyData = {
      storyteller_id: body.storyteller_id,
      title: body.title,
      content: body.content,
      category: body.category || 'community',
      story_type: body.story_type || 'community_story',
      status: body.status || 'draft',
      access_level: body.access_level || 'public',
      location: body.location || 'Palm Island',
      tags: body.tags || [],
      collected_by: body.collected_by || null,
      organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
    }

    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single()

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

    const { data, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

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

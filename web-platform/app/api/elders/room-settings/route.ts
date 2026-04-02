import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

/**
 * GET /api/elders/room-settings
 * Fetch elder_room_settings for an elder.
 * Query param: elder_id (required)
 */
export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { searchParams } = new URL(req.url)
  const elderId = searchParams.get('elder_id')

  if (!elderId) {
    return NextResponse.json({ error: 'elder_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('elder_room_settings')
    .select('*')
    .eq('elder_id', elderId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}

/**
 * PATCH /api/elders/room-settings
 * Update elder_room_settings. Upserts on elder_id.
 */
export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabase()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    elder_id,
    display_name_override,
    welcome_message,
    featured_quote_ids,
    featured_story_ids,
    hidden_content_ids,
    sharing_preferences,
    theme_preference,
  } = body as {
    elder_id?: string
    display_name_override?: string | null
    welcome_message?: string | null
    featured_quote_ids?: string[]
    featured_story_ids?: string[]
    hidden_content_ids?: string[]
    sharing_preferences?: Record<string, unknown>
    theme_preference?: string
  }

  if (!elder_id) {
    return NextResponse.json({ error: 'elder_id is required' }, { status: 400 })
  }

  // Build the update payload — only include fields that were provided
  const updates: Record<string, unknown> = { elder_id, updated_at: new Date().toISOString() }
  if (display_name_override !== undefined) updates.display_name_override = display_name_override
  if (welcome_message !== undefined) updates.welcome_message = welcome_message
  if (featured_quote_ids !== undefined) updates.featured_quote_ids = featured_quote_ids
  if (featured_story_ids !== undefined) updates.featured_story_ids = featured_story_ids
  if (hidden_content_ids !== undefined) updates.hidden_content_ids = hidden_content_ids
  if (sharing_preferences !== undefined) updates.sharing_preferences = sharing_preferences
  if (theme_preference !== undefined) updates.theme_preference = theme_preference

  const { data, error } = await supabase
    .from('elder_room_settings')
    .upsert(updates, { onConflict: 'elder_id' })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}

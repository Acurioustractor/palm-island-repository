import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@/lib/supabase/server'

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

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev) {
      const supabaseAuth = await createRouteHandlerClient()
      const { data: { user } } = await supabaseAuth.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json().catch(() => ({}))
    const { mediaId, serviceSlug } = body as { mediaId?: string; serviceSlug?: string }

    if (!mediaId || !serviceSlug) {
      return NextResponse.json({ error: 'mediaId and serviceSlug required' }, { status: 400 })
    }

    const serviceTag = `service:${serviceSlug}`
    const supabase = getServerClient()

    // 1. Find all media with this service tag that also have 'hero' tag
    const { data: currentHeroes, error: fetchError } = await supabase
      .from('media_files')
      .select('id, tags')
      .contains('tags', [serviceTag, 'hero'])

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // 2. Remove 'hero' tag from current heroes
    for (const hero of (currentHeroes || [])) {
      if (hero.id === mediaId) continue // Skip if it's the same item
      const updatedTags = (hero.tags as string[]).filter((t: string) => t !== 'hero')
      const { error: removeError } = await supabase
        .from('media_files')
        .update({ tags: updatedTags })
        .eq('id', hero.id)

      if (removeError) {
        return NextResponse.json({ error: removeError.message }, { status: 500 })
      }
    }

    // 2b. Unfeatured any existing page_context cover for this service
    await supabase
      .from('media_files')
      .update({ is_featured: false })
      .eq('page_context', 'home')
      .eq('page_section', `service-${serviceSlug}`)
      .eq('is_featured', true)

    // 3. Ensure the target media has both the service tag and 'hero' tag,
    //    AND set page_context/page_section so SmartImage picks it up
    const { data: targetMedia, error: targetError } = await supabase
      .from('media_files')
      .select('id, tags')
      .eq('id', mediaId)
      .single()

    if (targetError || !targetMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const currentTags = Array.isArray(targetMedia.tags) ? targetMedia.tags : []
    const newTags = [...currentTags]
    if (!newTags.includes(serviceTag)) newTags.push(serviceTag)
    if (!newTags.includes('hero')) newTags.push('hero')

    const { error: updateError } = await supabase
      .from('media_files')
      .update({
        tags: newTags,
        page_context: 'home',
        page_section: `service-${serviceSlug}`,
        is_featured: true,
        display_order: 0,
      })
      .eq('id', mediaId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      mediaId,
      serviceSlug,
      previousHeroes: (currentHeroes || []).filter(h => h.id !== mediaId).length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to set cover photo' }, { status: 500 })
  }
}

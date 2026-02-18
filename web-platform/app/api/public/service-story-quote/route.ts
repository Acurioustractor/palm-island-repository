import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ quote: null })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ quote: null })
    }

    // Try to find a story tagged with this service
    const { data: stories } = await supabase
      .from('stories')
      .select('title, summary, storyteller_name, metadata')
      .eq('status', 'published')
      .eq('access_level', 'public')
      .contains('tags', [`service:${slug}`])
      .limit(5)

    if (stories && stories.length > 0) {
      // Pick one with a good quote - prefer ones with key_quotes in metadata
      for (const story of stories) {
        const keyQuotes = (story.metadata as any)?.key_quotes
        if (Array.isArray(keyQuotes) && keyQuotes.length > 0) {
          return NextResponse.json({
            quote: {
              text: keyQuotes[0],
              author: story.storyteller_name || 'Community Member',
            },
          })
        }
      }

      // Fall back to summary of first story
      const story = stories[0]
      if (story.summary) {
        const text = story.summary.length > 150
          ? story.summary.slice(0, 147) + '...'
          : story.summary
        return NextResponse.json({
          quote: {
            text,
            author: story.storyteller_name || 'Community Member',
          },
        })
      }
    }

    return NextResponse.json({ quote: null })
  } catch (error) {
    console.error('Service story quote error:', error)
    return NextResponse.json({ quote: null })
  }
}

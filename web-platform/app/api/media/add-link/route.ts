import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, description, tags, service_slug } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Basic URL validation
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'URL must be http or https' }, { status: 400 })
    }

    // Detect platform and extract thumbnail
    const hostname = parsed.hostname.replace('www.', '')
    let platform = 'other'
    let thumbnailUrl: string | null = null
    let videoId: string | null = null

    if (hostname === 'youtube.com' || hostname === 'youtu.be') {
      platform = 'youtube'
      if (hostname === 'youtu.be') {
        videoId = parsed.pathname.slice(1)
      } else {
        videoId = parsed.searchParams.get('v')
      }
      if (videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      }
    } else if (hostname === 'vimeo.com') {
      platform = 'vimeo'
      const pathMatch = parsed.pathname.match(/^\/(\d+)/)
      if (pathMatch) {
        videoId = pathMatch[1]
      }
    } else if (hostname === 'fb.watch' || hostname === 'facebook.com') {
      platform = 'facebook'
    }

    // Build tags array
    const mediaTags: string[] = ['video-link', `platform:${platform}`]
    if (service_slug) {
      mediaTags.push(`service:${service_slug}`, 'service-photo', 'palm-island')
    }
    if (Array.isArray(tags)) {
      tags.filter((t: string) => typeof t === 'string' && t.trim()).forEach((t: string) => mediaTags.push(t.trim()))
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const mediaData = {
      filename: `video-link-${Date.now()}`,
      original_filename: title || url,
      file_path: `video-links/${platform}/${Date.now()}`,
      bucket_name: 'story-media',
      public_url: url,
      file_type: 'video',
      mime_type: 'video/external',
      file_size: 0,
      title: title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} video`,
      description: description || null,
      tags: mediaTags,
      metadata: {
        external_video: {
          platform,
          video_id: videoId,
          thumbnail_url: thumbnailUrl,
          original_url: url,
        },
        upload_source: 'video-link',
        ...(service_slug ? { service_slug } : {}),
      },
      tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
    }

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/media_files`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(mediaData),
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text()
      console.error('Database insert error:', insertResponse.status, errorText)
      return NextResponse.json({ error: `Database error: ${errorText}` }, { status: 500 })
    }

    const [mediaFile] = await insertResponse.json()

    return NextResponse.json({
      success: true,
      file: mediaFile,
      message: 'Video link added successfully',
    })
  } catch (err: any) {
    console.error('Server error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

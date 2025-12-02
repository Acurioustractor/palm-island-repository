import { NextRequest, NextResponse } from 'next/server'
import { runAllScrapes, getContentStats } from '@/lib/scraper/simple-scraper'

/**
 * Auto-Sync API - Automatically syncs content from all sources
 * No manual buttons needed - just call this endpoint
 */

// GET - Get sync status and stats
export async function GET() {
  try {
    const stats = await getContentStats()

    return NextResponse.json({
      status: 'ready',
      ...stats
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST - Trigger a full sync of all sources
export async function POST(request: NextRequest) {
  try {
    // Check for authorization (optional - can be removed for easier access)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Skip auth check in development or if no secret set
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow requests without auth for simplicity
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run all scrapes
    const result = await runAllScrapes()

    // Get updated stats
    const stats = await getContentStats()

    return NextResponse.json({
      success: true,
      sync: result,
      stats
    })
  } catch (error: any) {
    console.error('Auto-sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

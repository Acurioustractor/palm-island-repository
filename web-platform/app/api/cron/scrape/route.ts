import { NextRequest, NextResponse } from 'next/server'
import { runScheduledScrapes, getSourcesDueForScraping } from '@/lib/scraper'

/**
 * Cron endpoint for scheduled web scraping
 *
 * This endpoint is called by Vercel Cron to run scheduled scrape jobs.
 * Schedule: Monthly on the 1st at midnight UTC
 *
 * Security: Requires CRON_SECRET authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get sources due for scraping
    const sourcesDue = await getSourcesDueForScraping()

    if (sourcesDue.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sources due for scraping',
        sourcesChecked: 0
      })
    }

    // Run all scheduled scrapes
    const result = await runScheduledScrapes({
      useFirecrawl: true,
      maxPages: 50,
      checkDuplicates: true,
      generateEmbeddings: false // Enable when pgvector is ready
    })

    return NextResponse.json({
      success: true,
      ...result,
      sourcesDue: sourcesDue.map(s => s.name)
    })
  } catch (error: any) {
    console.error('Cron scrape error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}

// POST - Manual trigger for scraping (useful for testing)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret or admin auth
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { forceAll = false, sourceIds = [] } = body

    // If forceAll, scrape all active sources
    // Otherwise, only scrape sources in sourceIds or those due
    const result = await runScheduledScrapes({
      useFirecrawl: true,
      maxPages: body.maxPages || 50,
      checkDuplicates: true,
      generateEmbeddings: false
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Manual scrape error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}

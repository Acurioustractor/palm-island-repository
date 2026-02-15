import { NextRequest, NextResponse } from 'next/server'
import { getThemeBySlug } from '@/lib/themes/theme-definitions'
import { getThemePagePlan, getThemeEditionKey } from '@/lib/themes/theme-page-plan'

/**
 * POST /api/thematic-reports/generate-pdf
 * Generates a themed PDF report.
 *
 * For now, returns the page plan configuration that can be used
 * with the existing Playwright PDF export pipeline.
 * Full Playwright integration requires the server to have Chromium installed.
 */
export async function POST(request: NextRequest) {
  try {
    const { themeSlug } = await request.json()

    if (!themeSlug) {
      return NextResponse.json({ error: 'themeSlug is required' }, { status: 400 })
    }

    const theme = getThemeBySlug(themeSlug)
    if (!theme) {
      return NextResponse.json({ error: `Theme "${themeSlug}" not found` }, { status: 404 })
    }

    const pagePlan = getThemePagePlan(theme)
    const editionKey = getThemeEditionKey(themeSlug)

    // Build the print URL for Playwright-based PDF generation
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const printUrl = `${baseUrl}/thematic-reports/${themeSlug}?print=1`

    // Return the page plan and print URL for client-side or server-side PDF generation
    return NextResponse.json({
      theme: {
        slug: theme.slug,
        title: theme.title,
        category: theme.category,
      },
      editionKey,
      pagePlan,
      printUrl,
      message: `Page plan generated for "${theme.title}". Use the printUrl with Playwright or browser print (Ctrl+P) to generate the PDF.`,
    })
  } catch (err) {
    console.error('Error generating themed PDF:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF configuration' },
      { status: 500 }
    )
  }
}

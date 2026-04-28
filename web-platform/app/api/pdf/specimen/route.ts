/**
 * Specimen PDF render endpoint
 *
 * GET /api/pdf/specimen
 *
 * Renders the Children & Families specimen room — 4 pages — as a focused
 * proof of the Saltwater Almanac grammar. If this reads as one room, the
 * grammar scales to all 24 pages of the FY24-25 annual report.
 *
 * Returns a PDF blob with Content-Disposition: attachment.
 */
import { NextRequest, NextResponse } from 'next/server'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seedParam = searchParams.get('seed')
    const seed = seedParam ? parseInt(seedParam, 10) : 28

    const [{ renderToBuffer }, { default: SpecimenPDF }, { registerFonts }] =
      await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/templates/SpecimenPDF'),
        import('@/lib/pdf/register-fonts'),
      ])

    await registerFonts()

    const buffer = await renderToBuffer(
      React.createElement(SpecimenPDF, { seed }) as any,
    )

    const filename = `PICC-Specimen-Children-Families-seed${seed}.pdf`

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const stack = err instanceof Error ? err.stack : undefined
    return NextResponse.json(
      { error: 'specimen_render_failed', message, stack },
      { status: 500 },
    )
  }
}

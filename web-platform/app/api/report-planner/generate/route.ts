/**
 * Generate PDF from planner configuration
 *
 * POST /api/report-planner/generate
 * Body: { fiscalYear, audience, config }
 *
 * Converts planner config → ReportData → AnnualReportPDF → PDF buffer
 */

import { NextRequest, NextResponse } from 'next/server'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fiscalYear, audience, config } = body

    if (!fiscalYear || !config) {
      return NextResponse.json(
        { error: 'Missing fiscalYear or config' },
        { status: 400 }
      )
    }

    // Dynamic imports to keep bundle size down
    const [
      { renderToBuffer },
      { default: AnnualReportPDF },
      { getReportData },
      { applyPlannerOverrides },
    ] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/lib/pdf/templates/AnnualReportPDF'),
      import('@/lib/annual-report/fetch-report-data'),
      import('@/lib/annual-report/planner-to-report-data'),
    ])

    // 1. Fetch base report data from Supabase
    const baseData = await getReportData(fiscalYear)

    // 2. Apply planner overrides
    const plannerConfig = {
      fiscalYear,
      audience: audience || null,
      pages: config,
    }
    const mergedData = applyPlannerOverrides(baseData, plannerConfig)

    // 3. Render PDF
    const validAudiences = ['community', 'funder', 'board', 'supporter', 'government']
    const audienceProp = audience && validAudiences.includes(audience) ? audience : null

    const buffer = await renderToBuffer(
      React.createElement(AnnualReportPDF, {
        data: mergedData,
        audience: audienceProp,
      }) as any
    )

    const audienceSuffix = audienceProp ? `-${audienceProp}` : ''
    const filename = `PICC-Annual-Report-${fiscalYear}${audienceSuffix}-planner.pdf`

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: unknown) {
    console.error('Planner PDF generation failed:', error)
    const message = error instanceof Error ? error.message : 'PDF generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

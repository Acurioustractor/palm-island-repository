import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'

export const runtime = 'nodejs'

// Professional print CSS for web-mode PDF generation
const PROFESSIONAL_PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 15mm 12mm 20mm 12mm;
}

@page :first {
  margin: 0;
}

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
    animation: none !important;
    transition: none !important;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10pt;
    line-height: 1.5;
  }

  /* Hide non-print elements */
  nav,
  .print\\:hidden,
  [data-print-hide],
  button:not([data-print-show]),
  .animate-pulse,
  .animate-spin,
  video,
  iframe,
  .mapboxgl-map,
  .navigation,
  .floating-nav,
  .share-button,
  .fixed {
    display: none !important;
  }

  /* Page breaks */
  section,
  [data-section] {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  h1, h2, h3, h4 {
    break-after: avoid;
    page-break-after: avoid;
  }

  /* Card styling for print */
  .rounded-xl,
  .rounded-2xl,
  .rounded-3xl {
    border-radius: 4px !important;
  }

  /* Ensure backgrounds print */
  .bg-gradient-to-r,
  .bg-gradient-to-br,
  .bg-gradient-to-b {
    background: linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%) !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Stats grid */
  .grid {
    display: grid !important;
  }

  /* Image handling */
  img {
    max-width: 100% !important;
    height: auto !important;
    break-inside: avoid;
  }

  /* Quote styling */
  blockquote,
  .quote {
    border-left: 3px solid #d4a574;
    padding-left: 1em;
    font-style: italic;
  }

  /* Links */
  a {
    color: #1e3a5f !important;
    text-decoration: none !important;
  }

  /* Footer on each page */
  .pdf-footer {
    position: fixed;
    bottom: 5mm;
    left: 12mm;
    right: 12mm;
    font-size: 8pt;
    color: #6b7280;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    padding-top: 2mm;
  }
}
`

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function requireToken(request: NextRequest) {
  const token = process.env.ANNUAL_REPORT_EXPORT_TOKEN
  if (!token) return

  const headerToken = request.headers.get('x-annual-report-export-token')
  const url = new URL(request.url)
  const queryToken = url.searchParams.get('token')

  if (headerToken !== token && queryToken !== token) {
    throw new Error('Unauthorized')
  }
}

function getOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedProto && forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return new URL(request.url).origin
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function resolveReportId(supabase: any, input: string) {
  const raw = String(input || '').trim()
  if (!raw) return { error: 'Report ID required' }

  if (isUuid(raw)) return { id: raw }

  const isYear = /^\d{4}$/.test(raw)
  if (raw === 'latest' || raw === 'demo' || isYear) {
    let query = supabase.from('annual_reports').select('id, report_year, title, pdf_url')
    if (isYear) query = query.eq('report_year', Number(raw))
    query = query.order('updated_at', { ascending: false }).order('report_year', { ascending: false }).limit(1)

    const { data, error } = await query
    if (error) return { error: error.message }
    const report = (data || [])[0]
    if (!report?.id) return { error: 'Report not found' }
    return { id: report.id as string }
  }

  return { error: 'Invalid report id (expected UUID or year). Use /api/annual-reports/latest/export-pdf.' }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireToken(request)

    const supabase = getSupabase()
    const resolved = await resolveReportId(supabase, params.id)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 })
    }
    const reportId = resolved.id

    const { data: report, error: reportError } = await supabase
      .from('annual_reports')
      .select('id, report_year, title, pdf_url')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: reportError?.message || 'Report not found' }, { status: 404 })
    }

    const origin = getOrigin(request)
    const url = new URL(`${origin}/annual-report/${report.report_year}`)
    url.searchParams.set('print', '1')

    // Lazy import to avoid loading Playwright on every request when not needed.
    const { chromium } = await import('@playwright/test')
    let browser: any
    try {
      browser = await chromium.launch()
    } catch (e: any) {
      const msg = String(e?.message || e)
      if (msg.includes("Executable doesn't exist") || msg.includes('playwright install')) {
        // Try a system Chrome as fallback (helps local dev without downloading Playwright browsers).
        const candidates = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
          '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
          '/Applications/Arc.app/Contents/MacOS/Arc',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ]
        const executablePath = candidates.find((p) => fs.existsSync(p))
        if (executablePath) {
          browser = await chromium.launch({ executablePath, headless: true })
        } else {
          return NextResponse.json(
            {
              error:
                "PDF export needs a Chromium browser. Run `cd web-platform && npx playwright install chromium` (one-time download), then retry.",
            },
            { status: 500 }
          )
        }
      } else {
        throw e
      }
    }
    const page = await browser.newPage()

    // Navigate with longer timeout for dynamic content
    await page.goto(url.toString(), { waitUntil: 'networkidle', timeout: 60000 })

    // Scroll through page to trigger lazy loading
    await page.evaluate(async () => {
      const scrollHeight = document.body.scrollHeight
      const viewportHeight = window.innerHeight
      for (let i = 0; i < scrollHeight; i += viewportHeight) {
        window.scrollTo(0, i)
        await new Promise(r => setTimeout(r, 100))
      }
      window.scrollTo(0, 0)
    })

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000)

    await page.emulateMedia({ media: 'print' })
    await page.addStyleTag({
      content: PROFESSIONAL_PRINT_CSS,
    })

    // Wait for fonts and images
    await page.evaluate(async () => {
      try {
        // @ts-ignore
        await document.fonts?.ready
      } catch {}

      // Wait for all images to load
      const imgs = Array.from(document.images || [])
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalHeight > 0) return Promise.resolve()
          return new Promise((resolve) => {
            const timeout = setTimeout(resolve, 5000) // 5s timeout per image
            img.onload = () => { clearTimeout(timeout); resolve(null) }
            img.onerror = () => { clearTimeout(timeout); resolve(null) }
          })
        })
      )

      // Small delay after images
      await new Promise(r => setTimeout(r, 500))
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '15mm', right: '12mm', bottom: '20mm', left: '12mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; color: #6b7280; text-align: center; padding: 0 12mm;">
          <span>Palm Island Community Company - Annual Report ${report.report_year}</span>
          <span style="float: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    })

    await page.close()
    await browser.close()

    // Optional upload to Supabase Storage (requires bucket + permissions)
    const { searchParams } = new URL(request.url)
    const shouldUpload = searchParams.get('upload') === '1'

    if (shouldUpload) {
      const bucket = process.env.ANNUAL_REPORTS_BUCKET || 'documents'
      const filePath = `annual-reports/annual-report-${report.report_year}.pdf`

      const upload = await supabase.storage
        .from(bucket)
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        } as any)

      if (!upload.error) {
        const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath)
        if (publicUrl?.publicUrl) {
          await supabase
            .from('annual_reports')
            .update({ pdf_url: publicUrl.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', reportId)
        }
      }
    }

    const filename = `${(report.title || 'annual-report').replace(/[^a-z0-9-_]+/gi, '-')}.pdf`

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${filename}"`,
        'cache-control': 'no-store'
      }
    })
  } catch (error: any) {
    const msg = error?.message || String(error)
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

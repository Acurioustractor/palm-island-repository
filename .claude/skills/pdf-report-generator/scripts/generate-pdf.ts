#!/usr/bin/env npx tsx
/**
 * PICC Annual Report PDF Generator
 *
 * Generates professional PDFs from annual report data using Playwright.
 * Can be run standalone or imported by the API route.
 *
 * Usage:
 *   npx tsx generate-pdf.ts --year 2024
 *   npx tsx generate-pdf.ts --year 2024 --output ./reports/annual-2024.pdf
 */

import fs from 'node:fs'
import path from 'node:path'

// Lucide icon SVGs for embedding in PDF
const ICONS = {
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  stethoscope: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  baby: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>`,
  briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,
  graduationCap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  scale: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
}

interface ReportData {
  title: string
  subtitle?: string
  year: number
  reportingPeriod: string
  heroImage?: string
  logoUrl?: string
  executiveSummary: string
  stats: Array<{ icon: string; value: string | number; label: string }>
  ceo: {
    name: string
    role: string
    message: string
    signature: string
    photoUrl?: string
  }
  chair?: {
    name: string
    role: string
    message: string
    signature: string
    photoUrl?: string
  }
  highlights: string[]
  featuredQuote?: {
    text: string
    author: string
    role: string
    photoUrl?: string
  }
  services: Array<{
    name: string
    description: string
    icon: string
    color: string
  }>
  stories: Array<{
    title: string
    excerpt: string
    category: string
    imageUrl?: string
    author?: { name: string; photoUrl?: string }
  }>
  projects: Array<{
    title: string
    description: string
    status: string
    statusClass: string
    imageUrl?: string
  }>
  financials?: {
    total: string
    breakdown: Array<{
      label: string
      value: string
      color: string
      dashArray: string
      dashOffset: string
    }>
  }
  quotes: Array<{
    text: string
    author: string
    role: string
    photoUrl?: string
  }>
  gallery: Array<{
    url: string
    caption?: string
  }>
  leadership?: {
    board: Array<{ name: string; role: string; photoUrl?: string }>
    executive: Array<{ name: string; role: string; photoUrl?: string }>
  }
  acknowledgments?: string
}

/**
 * Simple template engine - replaces {{variable}} and handles basic conditionals
 */
function renderTemplate(template: string, data: ReportData): string {
  let html = template

  // Replace simple variables
  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = (data as any)[key]
    return value !== undefined ? String(value) : ''
  })

  // Replace nested variables like {{ceo.name}}
  html = html.replace(/\{\{(\w+)\.(\w+)\}\}/g, (_, obj, key) => {
    const parent = (data as any)[obj]
    if (parent && parent[key] !== undefined) {
      return String(parent[key])
    }
    return ''
  })

  // Replace icon references with SVG
  html = html.replace(/\{\{\{icon\}\}\}/g, (match) => {
    // This is simplified - in real implementation, use data context
    return ICONS.users
  })

  // Handle {{#each}} blocks (simplified)
  html = html.replace(
    /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, arrayName, content) => {
      const array = (data as any)[arrayName]
      if (!Array.isArray(array)) return ''

      return array
        .map((item, index) => {
          let itemHtml = content
          // Replace item properties
          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            itemHtml = itemHtml.replace(regex, String(value ?? ''))

            // Handle triple braces for raw HTML (like icons)
            const rawRegex = new RegExp(`\\{\\{\\{${key}\\}\\}\\}`, 'g')
            itemHtml = itemHtml.replace(rawRegex, String(value ?? ''))
          }
          // Replace @index
          itemHtml = itemHtml.replace(/\{\{@index\}\}/g, String(index + 1))
          return itemHtml
        })
        .join('\n')
    }
  )

  // Handle nested {{#each}} like {{#each leadership.board}}
  html = html.replace(
    /\{\{#each (\w+)\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, obj, arrayName, content) => {
      const parent = (data as any)[obj]
      const array = parent?.[arrayName]
      if (!Array.isArray(array)) return ''

      return array
        .map((item, index) => {
          let itemHtml = content
          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            itemHtml = itemHtml.replace(regex, String(value ?? ''))
          }
          itemHtml = itemHtml.replace(/\{\{@index\}\}/g, String(index + 1))
          return itemHtml
        })
        .join('\n')
    }
  )

  // Handle {{#if}} conditionals (simplified)
  html = html.replace(
    /\{\{#if (\w+(?:\.\w+)?(?:\.length)?)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, condition, content) => {
      const parts = condition.replace('.length', '').split('.')
      let value: any = data
      for (const part of parts) {
        value = value?.[part]
      }

      if (condition.endsWith('.length')) {
        return Array.isArray(value) && value.length > 0 ? content : ''
      }

      return value ? content : ''
    }
  )

  return html
}

/**
 * Get icon SVG by name
 */
function getIconSvg(iconName: string): string {
  const normalizedName = iconName.toLowerCase().replace(/[-_\s]/g, '')
  return (ICONS as any)[normalizedName] || ICONS.building
}

/**
 * Generate PDF from report data
 */
export async function generatePdf(
  data: ReportData,
  options: {
    outputPath?: string
    templatePath?: string
  } = {}
): Promise<Buffer> {
  const skillDir = path.resolve(__dirname, '..')
  const templatePath =
    options.templatePath ||
    path.join(skillDir, 'templates', 'annual-report.html')
  const stylePath = path.join(skillDir, 'styles', 'print.css')

  // Read template
  let template = fs.readFileSync(templatePath, 'utf-8')

  // Inline the CSS
  const css = fs.readFileSync(stylePath, 'utf-8')
  template = template.replace(
    '<link rel="stylesheet" href="../styles/print.css">',
    `<style>${css}</style>`
  )

  // Add icon SVGs to services and stats
  data.services = data.services.map((s) => ({
    ...s,
    icon: getIconSvg(s.icon),
  }))

  data.stats = data.stats.map((s) => ({
    ...s,
    icon: getIconSvg(s.icon),
  }))

  // Render template with data
  const html = renderTemplate(template, data)

  // Generate PDF with Playwright
  const { chromium } = await import('@playwright/test')

  let browser
  try {
    browser = await chromium.launch()
  } catch (e: any) {
    // Fallback to system Chrome
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ]
    const executablePath = candidates.find((p) => fs.existsSync(p))
    if (!executablePath) {
      throw new Error(
        'No browser found. Run: npx playwright install chromium'
      )
    }
    browser = await chromium.launch({ executablePath, headless: true })
  }

  const page = await browser.newPage()

  // Set content and wait for resources
  await page.setContent(html, { waitUntil: 'networkidle' })

  // Wait for fonts and images
  await page.evaluate(async () => {
    await document.fonts?.ready
    const imgs = Array.from(document.images)
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null)
            img.onload = () => resolve(null)
            img.onerror = () => resolve(null)
          })
      )
    )
  })

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
    },
    preferCSSPageSize: true,
  })

  await browser.close()

  // Save if output path specified
  if (options.outputPath) {
    fs.writeFileSync(options.outputPath, pdfBuffer)
    console.log(`PDF saved to: ${options.outputPath}`)
  }

  return Buffer.from(pdfBuffer)
}

/**
 * Fetch report data from database (for standalone usage)
 */
async function fetchReportData(year: number): Promise<ReportData> {
  // This would normally fetch from Supabase
  // For now, return sample data structure
  return {
    title: `Annual Report ${year - 1}-${String(year).slice(-2)}`,
    subtitle: 'Building Stronger Communities Together',
    year,
    reportingPeriod: `July 1, ${year - 1} - June 30, ${year}`,
    heroImage: '',
    logoUrl: '',
    executiveSummary:
      'This year marked significant progress in our mission to support and empower the Palm Island community...',
    stats: [
      { icon: 'users', value: '197', label: 'Staff Members' },
      { icon: 'stethoscope', value: '2,283', label: 'Health Clients' },
      { icon: 'baby', value: '1,187', label: 'Children Supported' },
      { icon: 'heart', value: '17,488', label: 'Episodes of Care' },
    ],
    ceo: {
      name: 'Rachel Atkinson',
      role: 'Chief Executive Officer',
      message:
        'It is my pleasure to present this annual report highlighting our achievements and continued commitment to the Palm Island community...',
      signature: 'Rachel',
    },
    highlights: [
      'Expanded health services to reach 2,283 community members',
      '30% increase in staffing to 197 dedicated team members',
      'Launched innovative digital platforms for community engagement',
      'Strengthened partnerships with government and community organizations',
    ],
    services: [
      {
        name: 'Health Services',
        description: 'Comprehensive primary healthcare',
        icon: 'stethoscope',
        color: '#ef4444',
      },
      {
        name: 'Child Safety',
        description: 'Protecting our youngest members',
        icon: 'shield',
        color: '#10b981',
      },
      {
        name: 'Youth Programs',
        description: 'Empowering the next generation',
        icon: 'graduationCap',
        color: '#3b82f6',
      },
    ],
    stories: [],
    projects: [],
    quotes: [],
    gallery: [],
    acknowledgments:
      'We acknowledge the Traditional Owners of Palm Island and pay respect to Elders past, present, and emerging.',
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2)
  const yearIndex = args.indexOf('--year')
  const outputIndex = args.indexOf('--output')

  const year = yearIndex >= 0 ? parseInt(args[yearIndex + 1]) : new Date().getFullYear()
  const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : `./annual-report-${year}.pdf`

  console.log(`Generating PDF for year: ${year}`)

  try {
    const data = await fetchReportData(year)
    await generatePdf(data, { outputPath })
    console.log('Done!')
  } catch (error) {
    console.error('Error generating PDF:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { ReportData, getIconSvg, ICONS }

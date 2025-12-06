/**
 * Annual Reports API Endpoint
 *
 * Returns all annual report data with images, stats, and metadata
 * for the interactive timeline view.
 */

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

/**
 * Normalize fiscal year format to YY-YY (e.g., "2009-10" or "2020-21")
 * Handles both "2009-2010" and "2009-10" formats
 */
function normalizeFiscalYear(fiscalYear: string): string {
  if (!fiscalYear) return 'unknown'

  // Already in short format (e.g., "2009-10")
  if (/^\d{4}-\d{2}$/.test(fiscalYear)) {
    return fiscalYear
  }

  // Long format (e.g., "2009-2010") - convert to short
  if (/^\d{4}-\d{4}$/.test(fiscalYear)) {
    const [startYear, endYear] = fiscalYear.split('-')
    return `${startYear}-${endYear.slice(-2)}`
  }

  // Already has 4-digit second year (e.g., "2011-2012")
  if (/^\d{4}-\d{4}$/.test(fiscalYear)) {
    const [startYear, endYear] = fiscalYear.split('-')
    return `${startYear}-${endYear.slice(-2)}`
  }

  return fiscalYear
}

// Fiscal year metadata (can be enriched from knowledge entries later)
const FISCAL_YEAR_INFO: Record<string, { era: string; color: string; theme: string }> = {
  '2009-10': { era: 'foundation', color: 'amber', theme: 'Establishment & Early Growth' },
  '2010-11': { era: 'foundation', color: 'amber', theme: 'Building Foundations' },
  '2011-12': { era: 'foundation', color: 'amber', theme: 'Community Programs Expansion' },
  '2012-13': { era: 'growth', color: 'purple', theme: 'Service Delivery Growth' },
  '2013-14': { era: 'growth', color: 'purple', theme: 'Organizational Development' },
  '2014-15': { era: 'growth', color: 'purple', theme: 'Strengthening Services' },
  '2015-16': { era: 'growth', color: 'purple', theme: 'Community Engagement' },
  '2016-17': { era: 'growth', color: 'purple', theme: 'Program Diversification' },
  '2017-18': { era: 'growth', color: 'purple', theme: 'Building Capacity' },
  '2018-19': { era: 'growth', color: 'purple', theme: 'Strategic Planning' },
  '2019-20': { era: 'transition', color: 'green', theme: 'Transition to Community Control' },
  '2020-21': { era: 'transition', color: 'green', theme: 'Navigating Change' },
  '2021-22': { era: 'community-controlled', color: 'blue', theme: 'Community Controlled Era Begins' },
  '2022-23': { era: 'community-controlled', color: 'blue', theme: 'Self-Determination' },
  '2023-24': { era: 'community-controlled', color: 'blue', theme: 'Community Led Future' },
}

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get all annual report knowledge entries
    // Note: Annual reports are stored as entry_type='document' with slug pattern 'picc-annual-report-*-full-pdf'
    const { data: knowledgeEntries, error: knowledgeError } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('entry_type', 'document')
      .ilike('slug', 'picc-annual-report-%-full-pdf')
      .order('fiscal_year', { ascending: true })

    if (knowledgeError) {
      console.error('Error fetching knowledge entries:', knowledgeError)
      return NextResponse.json({ error: 'Failed to fetch annual reports' }, { status: 500 })
    }

    // Get image counts by year
    const { data: images, error: imagesError } = await supabase
      .from('media_files')
      .select('id, filename, file_path, public_url, bucket_name, metadata, tags, title, alt_text')
      .contains('tags', ['annual-report'])
      .is('deleted_at', null)

    if (imagesError) {
      console.error('Error fetching images:', imagesError)
    }

    // Group images by normalized fiscal year
    const imagesByYear: Record<string, any[]> = {}
    images?.forEach((img) => {
      const rawFiscalYear = img.metadata?.fiscal_year
      if (rawFiscalYear) {
        const fiscalYear = normalizeFiscalYear(rawFiscalYear)
        if (!imagesByYear[fiscalYear]) imagesByYear[fiscalYear] = []
        imagesByYear[fiscalYear].push(img)
      }
    })

    // Build timeline data
    const timeline = knowledgeEntries?.map((entry) => {
      const rawFiscalYear = entry.fiscal_year || 'unknown'
      const fiscalYear = normalizeFiscalYear(rawFiscalYear)
      const yearInfo = FISCAL_YEAR_INFO[fiscalYear] || { era: 'unknown', color: 'gray', theme: '' }
      const yearImages = imagesByYear[fiscalYear] || []

      return {
        id: entry.id,
        fiscalYear,
        slug: entry.slug,
        title: entry.title,
        subtitle: entry.subtitle,
        summary: entry.summary,
        category: entry.category,

        // Timeline metadata
        era: yearInfo.era,
        color: yearInfo.color,
        theme: yearInfo.theme,

        // Images
        imageCount: yearImages.length,
        heroImages: yearImages.slice(0, 3), // First 3 images for card

        // PDF
        pdfPath: entry.structured_data?.pdf_path || `/documents/annual-reports/picc-annual-report-${fiscalYear}.pdf`,
        pdfSize: entry.structured_data?.pdf_size,

        // Content
        keywords: entry.keywords || [],
        hasEmbedding: !!entry.embedding,

        // Timestamps
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      }
    }) || []

    // Calculate era summaries
    const eras = {
      foundation: {
        name: 'Foundation Era',
        years: '2009-2012',
        color: 'amber',
        count: timeline.filter(t => t.era === 'foundation').length,
        description: 'Establishment and early growth of PICC'
      },
      growth: {
        name: 'Growth Era',
        years: '2013-2021',
        color: 'purple',
        count: timeline.filter(t => t.era === 'growth').length,
        description: 'Expansion of services and organizational development'
      },
      transition: {
        name: 'Transition Era',
        years: '2019-2021',
        color: 'green',
        count: timeline.filter(t => t.era === 'transition').length,
        description: 'Transition to community control'
      },
      'community-controlled': {
        name: 'Community Controlled Era',
        years: '2021-Present',
        color: 'blue',
        count: timeline.filter(t => t.era === 'community-controlled').length,
        description: 'Self-determination and community-led governance'
      }
    }

    // Overall stats
    const stats = {
      totalReports: timeline.length,
      totalImages: images?.length || 0,
      yearsSpanned: timeline.length > 0 ? `${timeline[0].fiscalYear} - ${timeline[timeline.length - 1].fiscalYear}` : '',
      eras: Object.keys(eras).length
    }

    return NextResponse.json({
      timeline,
      eras,
      stats,
      success: true
    })

  } catch (error) {
    console.error('Annual reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

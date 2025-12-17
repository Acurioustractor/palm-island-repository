import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PICC_KNOWLEDGE_BASE, generateExecutiveSummary } from '@/lib/picc-knowledge-base'

function toFiscalYearLabel(reportYear: number): string {
  const start = reportYear - 1
  return `${start}-${reportYear.toString().slice(-2)}`
}

function safeLower(value: unknown): string {
  return String(value || '').toLowerCase()
}

function pickTopUnique<T>(
  items: T[],
  keyFn: (item: T) => string,
  limit: number
): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    const key = keyFn(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
    if (out.length >= limit) break
  }
  return out
}

function uniqStrings(values: unknown) {
  const out: string[] = []
  if (!Array.isArray(values)) return out
  for (const v of values) {
    if (typeof v !== 'string') continue
    const s = v.trim()
    if (!s) continue
    if (!out.includes(s)) out.push(s)
  }
  return out
}

function mergeTags(existing: unknown, add: string[]) {
  const current = uniqStrings(existing)
  const next = [...current]
  for (const t of add) {
    if (!next.includes(t)) next.push(t)
  }
  return next
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { id } = params
    const body = await request.json().catch(() => ({} as any))
    const storyLimit = Math.max(6, Math.min(40, Number(body.storyLimit) || 18))
    const includeQuotes = body.includeQuotes !== false
    const includeMedia = body.includeMedia !== false
    const publish = body.publish === true

    if (!id) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    // Check if report exists
    const { data: report, error: reportError } = await supabase
      .from('annual_reports')
      .select('id, title, report_year, reporting_period_start, reporting_period_end')
      .eq('id', id)
      .single()

    if (reportError) {
      console.error('Report query error:', reportError)
      return NextResponse.json({ error: `Report not found: ${reportError.message}` }, { status: 404 })
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const reportYear = Number(report.report_year)
    const fiscalYear = toFiscalYearLabel(reportYear)
    const periodStart = String(report.reporting_period_start)
    const periodEnd = String(report.reporting_period_end)

    // Get published stories count
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('created_at', periodStart)
      .lte('created_at', `${periodEnd}T23:59:59.999Z`)

    // Get unique storytellers
    const { data: storytellerData } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('status', 'published')
      .gte('created_at', periodStart)
      .lte('created_at', `${periodEnd}T23:59:59.999Z`)
      .not('storyteller_id', 'is', null)

    const uniqueStorytellers = new Set(storytellerData?.map(s => s.storyteller_id) || []).size

    // Get stories by category
    const { data: categoryCounts } = await supabase
      .from('stories')
      .select('category')
      .eq('status', 'published')
      .gte('created_at', periodStart)
      .lte('created_at', `${periodEnd}T23:59:59.999Z`)

    const categoryMap: Record<string, number> = {}
    categoryCounts?.forEach((s: any) => {
      const cat = s.category || 'general'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })

    // Build comprehensive statistics from knowledge base
    const kb = PICC_KNOWLEDGE_BASE
    const statistics = {
      // Story statistics from database
      total_stories: totalStories || 0,
      unique_storytellers: uniqueStorytellers,
      stories_by_category: categoryMap,

      // Common report rollup fields (used by public report UI)
      total_staff: kb.statistics.staff.total_2024,
      staff_growth: parseInt(String(kb.statistics.staff.growth_rate || '').replace(/[^0-9]/g, ''), 10) || null,
      local_employment_rate: parseInt(String(kb.statistics.staff.palm_island_residents_percentage || '').replace(/[^0-9]/g, ''), 10) || null,
      total_revenue: kb.statistics.financial.income,
      health_clients: kb.statistics.health_service.total_clients,
      episodes_of_care: kb.statistics.health_service.episodes_of_care,
      children_supported: kb.statistics.service_metrics.safe_haven_children_supported,
      services_delivered: kb.statistics.service_metrics.total_services,

      // Staff statistics from knowledge base
      staff: kb.statistics.staff,

      // Financial statistics
      financial: kb.statistics.financial,

      // Balance sheet
      balance_sheet: kb.statistics.balance_sheet,

      // Health service statistics
      health_service: kb.statistics.health_service,

      // Service metrics
      service_metrics: kb.statistics.service_metrics,

      // Community demographics
      demographics: kb.statistics.community_demographics
    }

    // Build comprehensive metadata
    const metadata = {
      organization: kb.organization,
      board_members: kb.leadership.board_members,
      ceo: kb.leadership.ceo,
      services: kb.services.map(s => ({ name: s.name, category: s.category })),
      key_programs: kb.key_programs,
      accreditations: kb.accreditations,
      partnerships: kb.partnerships,
      conferences: kb.conferences,
      recent_news: kb.recent_news,
      history: {
        traditional_owners: kb.history.traditional_owners,
        bwgcolman_meaning: kb.history.bwgcolman_meaning,
        hull_river_connection: kb.history.hull_river_connection,
        key_dates: kb.history.key_dates
      },
      cultural_context: kb.cultural_context,
      fiscal_year: fiscalYear,
      report_year: reportYear,
      reporting_period_start: periodStart,
      reporting_period_end: periodEnd,
      generated_at: new Date().toISOString(),
      source: 'Auto-generated from Living Ledger + media library',
      populated_via: 'Annual Report Generator'
    }

    // Generate comprehensive year highlights
    const year_highlights = [
      `Staff increased 30% to ${kb.statistics.staff.total_2024} employees - ${kb.statistics.staff.palm_island_residents_percentage} are Palm Islanders`,
      'Implemented Delegated Authority - community now decides care arrangements for children',
      'Launched First 1,000 Days program for maternal and child health',
      `Delivered health services to ${kb.statistics.health_service.total_clients.toLocaleString()} clients with ${kb.statistics.health_service.episodes_of_care.toLocaleString()} episodes of care`,
      `Supported ${kb.statistics.service_metrics.safe_haven_children_supported.toLocaleString()} children through Safe Haven service`,
      `Revenue of $${(kb.statistics.financial.income / 1000000).toFixed(1)} million supporting ${kb.statistics.service_metrics.total_services} services`,
      'Renewed RACGP Quality Practice Accreditation (next 2027)',
      'Presented at SNAICC Conference in Darwin - Children & Family Centre storyline',
      'Digital Service Centre supporting 50 languages through Telstra partnership',
      `Family Care provided ${kb.statistics.service_metrics.family_care_placement_nights.toLocaleString()} placement nights`
    ]

    // Update report with comprehensive data
    const { error: updateError } = await supabase
      .from('annual_reports')
      .update({
        executive_summary: generateExecutiveSummary(),
        year_highlights,
        statistics,
        metadata,
        status: publish ? 'published' : 'drafting',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update report error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Clear existing story links
    await supabase
      .from('annual_report_stories')
      .delete()
      .eq('report_id', id)

    // Get candidate stories for this reporting period
    const { data: candidates, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        category,
        quality_score,
        total_score,
        views,
        shares,
        likes,
        is_featured,
        is_verified,
        contains_traditional_knowledge,
        elder_approval_given,
        created_at,
        auto_include,
        report_worthy,
        storyteller_id,
        tags
      `)
      .eq('status', 'published')
      .gte('created_at', periodStart)
      .lte('created_at', `${periodEnd}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(250)

    if (storiesError) {
      console.error('Stories query error:', storiesError)
    }

    const storyIds = (candidates || []).map((s: any) => s.id).filter(Boolean)
    const mediaByStoryId = new Map<string, { count: number; heroUrl?: string }>()

    if (includeMedia && storyIds.length > 0) {
      const { data: storyMedia } = await supabase
        .from('media_files')
        .select('story_id, public_url, is_featured, usage_context, deleted_at, is_public, file_type')
        .in('story_id', storyIds)
        .eq('is_public', true)
        .eq('file_type', 'image')
        .is('deleted_at', null)

      for (const row of storyMedia || []) {
        const sid = row.story_id as string | null
        if (!sid) continue
        const current = mediaByStoryId.get(sid) || { count: 0 }
        current.count += 1
        const usage = safeLower((row as any).usage_context)
        const isFeatured = (row as any).is_featured === true
        if (!current.heroUrl && (isFeatured || usage === 'story_hero')) {
          current.heroUrl = (row as any).public_url || undefined
        }
        mediaByStoryId.set(sid, current)
      }
    }

    const keywordBoosts = [
      'photo studio',
      'elders',
      'elder',
      'storm',
      'recovery',
      'innovation',
      'digital service centre',
      'delegated authority',
      'bwgcolman',
      'leaders trip',
      'trip',
    ]

    const scored = (candidates || []).map((story: any) => {
      const titleLower = safeLower(story.title)
      const contentLower = safeLower(story.content)
      const tagsLower = Array.isArray(story.tags) ? story.tags.map((t: any) => safeLower(t)).join(' ') : ''

      const media = mediaByStoryId.get(story.id) || { count: 0 }
      const engagement = (Number(story.views) || 0) + (Number(story.shares) || 0) * 2 + (Number(story.likes) || 0)
      const base = Number(story.total_score) || Number(story.quality_score) || 0

      let score = base
      if (story.auto_include) score += 1000
      if (story.report_worthy) score += 350
      if (story.is_featured) score += 120
      if (story.is_verified) score += 60

      // Encourage culturally safe content (avoid automatically elevating restricted knowledge)
      if (story.contains_traditional_knowledge && !story.elder_approval_given) score -= 200

      // Engagement + media richness
      score += Math.min(250, engagement / 5)
      score += Math.min(240, media.count * 30)
      if (media.heroUrl) score += 40

      // Boost key initiatives we want represented
      for (const kw of keywordBoosts) {
        if (titleLower.includes(kw) || tagsLower.includes(kw) || contentLower.includes(kw)) {
          score += 120
          break
        }
      }

      return { story, score }
    }).sort((a, b) => b.score - a.score)

    // Ensure category diversity (don’t let one category dominate)
    const preferredCategories = [
      'innovation',
      'economic_development',
      'culture',
      'youth',
      'health',
      'family',
      'environment',
      'justice',
      'housing',
      'community',
    ]

    const byCategory = new Map<string, Array<{ story: any; score: number }>>()
    for (const item of scored) {
      const cat = safeLower(item.story.category || 'general')
      const list = byCategory.get(cat) || []
      list.push(item)
      byCategory.set(cat, list)
    }

    const picked: Array<{ story: any; score: number }> = []
    for (const cat of preferredCategories) {
      const list = byCategory.get(cat)
      if (list && list.length > 0) picked.push(list[0])
    }

    const remaining = scored.filter(s => !picked.find(p => p.story.id === s.story.id))
    const combined = pickTopUnique([...picked, ...remaining], (x) => x.story.id, storyLimit)

    // Limit per category to keep variety
    const selectedCategoryCounts: Record<string, number> = {}
    const finalStories: any[] = []
    for (const item of combined) {
      const cat = safeLower(item.story.category || 'general')
      selectedCategoryCounts[cat] = (selectedCategoryCounts[cat] || 0) + 1
      if (selectedCategoryCounts[cat] > 3) continue
      finalStories.push(item.story)
      if (finalStories.length >= storyLimit) break
    }

    if (finalStories.length > 0) {
      const storyLinks = finalStories.map((story: any, index: number) => ({
        report_id: id,
        story_id: story.id,
        display_order: index + 1,
        is_featured: index < 5,
        inclusion_reason: story.auto_include ? 'auto_include' :
                         story.report_worthy ? 'report_worthy' : 'selected',
        section_placement: 'community_stories'
      }))

      const { error: linkError } = await supabase
        .from('annual_report_stories')
        .insert(storyLinks)

      if (linkError) {
        console.error('Link stories error:', linkError)
      }
    }

    // Optionally auto-assign a few validated quotes to the report (if the table exists)
    if (includeQuotes) {
      try {
        const { data: existingAssigned, error: assignedError } = await supabase
          .from('extracted_quotes')
          .select('id')
          .eq('used_in_report_id', id)
          .limit(1)

        // If the table doesn't exist or isn't accessible, skip quietly.
        if (assignedError) {
          console.warn('Skipping quote assignment:', assignedError.message)
        } else if (!existingAssigned || existingAssigned.length === 0) {
          const { data: availableQuotes, error: availableError } = await supabase
            .from('extracted_quotes')
            .select('id')
            .eq('is_validated', true)
            .eq('suggested_for_report', true)
            .is('used_in_report_id', null)
            .order('created_at', { ascending: false })
            .limit(6)

          if (availableError) {
            console.warn('Skipping quote assignment:', availableError.message)
          } else if (availableQuotes && availableQuotes.length > 0) {
            for (let i = 0; i < availableQuotes.length; i++) {
              await supabase
                .from('extracted_quotes')
                .update({ used_in_report_id: id, display_order: i + 1 })
                .eq('id', availableQuotes[i].id)
            }
          }
        }
      } catch (e: any) {
        console.warn('Skipping quote assignment:', e?.message || String(e))
      }
    }

    // Clear existing sections
    await supabase
      .from('report_sections')
      .delete()
      .eq('report_id', id)

    // Create comprehensive report sections
    const sections = [
      {
        report_id: id,
        section_type: 'leadership_message',
        section_title: 'Message from the CEO',
        section_content: `It is my pleasure to present the 2023-24 Annual Report for Palm Island Community Company.

The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.

We now employ ${kb.statistics.staff.total_2024} people - three times the number compared to ten years ago - and our turnover has quadrupled to $${(kb.statistics.financial.income / 1000000).toFixed(1)} million. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.

Impressively, ${kb.statistics.staff.palm_island_residents_percentage} of our workforce are Palm Islanders - figures that are extraordinarily high compared to other services in remote communities.

A significant shift for children in care on Palm Island has occurred this year, with the community now deciding the care arrangements for children who cannot stay at home. This implementation of Delegated Authority is a change that has been fought for over decades.

I want to thank our Board, led by Chair Luella Bligh, our dedicated staff, our partners, and most importantly, our community members who trust us to serve them.

Together, we continue building a brighter future for Palm Island.

${kb.organization.tagline}

Rachel Atkinson
Chief Executive Officer`,
        display_order: 1
      },
      {
        report_id: id,
        section_type: 'leadership_message',
        section_title: 'Message from the Chair',
        section_content: `As Chair of the Palm Island Community Company Board, I am proud to share this year’s report with our community.

PICC exists to serve Palm Island — to deliver strong services, create meaningful local jobs, and keep decision-making in community hands. This year we have continued to strengthen governance, grow our workforce, and support families through some of the most important work on the island.

I want to thank our Elders, our community members who share their stories, and the dedicated staff who show up every day with care and commitment. I also acknowledge our Board members for their steady leadership and accountability.

Together, we will keep building a future where Palm Islanders lead, culture is protected, and our young people can thrive.

— Luella Bligh
Board Chair`,
        display_order: 2
      },
      {
        report_id: id,
        section_type: 'about_picc',
        section_title: 'About Palm Island Community Company',
        section_content: `**Who We Are**
PICC is a not-for-profit company dedicated to making Palm Island a safer, stronger and more prosperous place to live. Through a bold and original model of service delivery to remote Aboriginal and Torres Strait Islander communities, we deliver human services, build community capacity and stimulate economic development.

**Community Control**
On 30 September 2021, PICC transitioned to full community control - registering a new company with only Palm Islanders as members. All services, workforce and assets were transferred to this community-controlled entity.

Palm Island Mayor Mislam Sam called this transition "a hard-won achievement for the Palm Island community," stating that the community and elders have worked for decades for self-determination.

**Our People - The Bwgcolman**
Palm Island is home to the Bwgcolman people - meaning "many tribes" - representing 42 language groups brought together on this island since 1918. The Manbarra people are the traditional owners of this land.

**Our Board**
${kb.leadership.board_members.map(m => `- ${m.name} (${m.role})`).join('\n')}`,
        display_order: 3
      },
      {
        report_id: id,
        section_type: 'history',
        section_title: 'Our History',
        section_content: `**The Hull River Connection**
Palm Island's history is deeply connected to Hull River. In 1914, Hull River Aboriginal Settlement was established at present-day Mission Beach on Djiru people's land. By 1916, nearly 500 people lived there.

Tragedy struck in 1917 when malaria killed around 200 residents. Then on 10 March 1918, a devastating cyclone (Category 5, winds 240-288 km/h) destroyed Hull River Settlement.

In June 1918, survivors were transferred to Palm Island, joining people from across Queensland - from Brisbane to Cloncurry - who had been removed to this reserve. Between 1918 and 1972, 3,950 documented removals occurred.

**From Many, One People**
These 42 language groups came together as the Bwgcolman - "many tribes" - creating a unique community identity while maintaining connections to their diverse origins.

**Key Milestones**
${kb.history.key_dates.map(d => `- ${d.year}: ${d.event}`).join('\n')}

**Recognition**
Palm Island was mentioned in the Bringing Them Home Report (1997) as an institution that housed children removed from their families, part of the Stolen Generations.`,
        display_order: 4
      },
      {
        report_id: id,
        section_type: 'services_overview',
        section_title: `Our ${kb.statistics.service_metrics.total_services} Services`,
        section_content: `PICC delivers ${kb.statistics.service_metrics.total_services} services across health, family support, justice, crisis intervention, disability, and economic development:

**Health Services**
- Bwgcolman Healing Service - Culturally appropriate medical and healing
- Medical Services - Primary healthcare, GP, maternal & child health
- Social and Emotional Wellbeing - Mental health support
- Integrated Team Care - Chronic disease management
- First 1,000 Days Program - Intensive support for families (launched April 2024)

**Family & Children Services**
- Children and Family Centre - Support for Palm Island's young population
- Family Care Service (${kb.statistics.service_metrics.family_care_placement_nights.toLocaleString()} placement nights)
- Family Wellbeing Centre
- Family Participation Program
- Women's Healing Service (Palm Island & Townsville offices)

**Crisis & Safety Services**
- Safe House (${kb.statistics.service_metrics.safe_house_placement_nights.toLocaleString()} placement nights)
- Safe Haven (${kb.statistics.service_metrics.safe_haven_children_supported.toLocaleString()} children supported)
- Specialist Domestic and Family Violence Service

**Justice Services**
- Community Justice Group
- Diversionary Service

**Disability Services**
- NDIS Connector Service - Remote Community Connector

**Economic Development**
- Social Enterprises (${kb.statistics.staff.social_enterprises_staff} staff)
- Telstra Digital Service Centre (${kb.key_programs.digital_service_centre.languages_supported} languages, ${kb.key_programs.digital_service_centre.staff} staff)`,
        display_order: 5
      },
      {
        report_id: id,
        section_type: 'delegated_authority',
        section_title: 'Delegated Authority: Bwgcolman Way',
        section_content: `**A Decades-Long Achievement**
This year marked a significant milestone in our journey toward self-determination. Under the Child Protection Act 1999 (Sections 148BA and 148BB(3)), Palm Island Community Company has received delegated authority.

**What This Means**
The community now decides the care arrangements for children who cannot stay at home. This transfer of decision-making power from government to community is what we have advocated for over decades.

**Our Vision**
"${kb.key_programs.delegated_authority.vision}"

**Program Name: ${kb.key_programs.delegated_authority.name}**

This is part of Queensland's broader "Reclaiming Our Storyline" blueprint, co-developed with QATSICPP and launched in April 2023, with $107.8 million committed over four years.`,
        display_order: 6
      },
      {
        report_id: id,
        section_type: 'health_data',
        section_title: 'Health Service Impact',
        section_content: `**2023-24 Health Service Statistics**

**Client Reach**
- Total Clients: ${kb.statistics.health_service.total_clients.toLocaleString()}
- Aboriginal & Torres Strait Islander Clients: ${kb.statistics.health_service.aboriginal_tsi_clients.toLocaleString()}
- Non-Aboriginal Clients: ${kb.statistics.health_service.non_aboriginal_clients}

**Episodes of Care**
- Total Episodes: ${kb.statistics.health_service.episodes_of_care.toLocaleString()}
- Aboriginal & Torres Strait Islander Episodes: ${kb.statistics.health_service.aboriginal_tsi_episodes.toLocaleString()}

**Preventive Health**
- Aboriginal Health Checks (715): ${kb.statistics.health_service.health_checks_715}
- Child Health Checks: ${kb.statistics.health_service.child_health_checks}

**Chronic Disease Management**
- GP Management Plans: ${kb.statistics.health_service.gp_management_plans}
- Team Care Arrangements: ${kb.statistics.health_service.team_care_arrangements}

**Accreditation**
- RACGP Quality Practice Accreditation renewed 2024 (next 2027)
- Human Services Quality Framework accredited (full audit 2025)`,
        display_order: 7
      },
      {
        report_id: id,
        section_type: 'financial_summary',
        section_title: 'Financial Overview',
        section_content: `**2023-24 Financial Summary**

**Revenue & Expenditure**
- Total Income: $${(kb.statistics.financial.income / 1000000).toFixed(2)} million
- Total Expenditure: $${(kb.statistics.financial.total_expenditure / 1000000).toFixed(2)} million
- Net Result: $${(kb.statistics.financial.net_result / 1000).toFixed(0)}K

**Expenditure Breakdown**
- Labour Costs: $${(kb.statistics.financial.breakdown.labour_costs.amount / 1000000).toFixed(2)}M (${kb.statistics.financial.breakdown.labour_costs.percentage}%)
- Administration: $${(kb.statistics.financial.breakdown.admin_expenses.amount / 1000000).toFixed(2)}M (${kb.statistics.financial.breakdown.admin_expenses.percentage}%)
- Travel & Training: $${(kb.statistics.financial.breakdown.travel_training.amount / 1000000).toFixed(2)}M (${kb.statistics.financial.breakdown.travel_training.percentage}%)
- Client Costs: $${(kb.statistics.financial.breakdown.client_costs.amount / 1000000).toFixed(2)}M (${kb.statistics.financial.breakdown.client_costs.percentage}%)
- Property & Energy: $${(kb.statistics.financial.breakdown.property_energy.amount / 1000000).toFixed(2)}M (${kb.statistics.financial.breakdown.property_energy.percentage}%)
- Motor Vehicles: $${(kb.statistics.financial.breakdown.motor_vehicle.amount / 1000).toFixed(0)}K (${kb.statistics.financial.breakdown.motor_vehicle.percentage}%)

**Balance Sheet**
- Total Assets: $${(kb.statistics.balance_sheet.total_assets / 1000000).toFixed(2)} million
- Total Liabilities: $${(kb.statistics.balance_sheet.total_liabilities / 1000000).toFixed(2)} million
- Net Assets/Equity: $${(kb.statistics.balance_sheet.net_assets / 1000000).toFixed(2)} million

**10-Year Growth**
- Staff: 3x increase
- Turnover: Quadrupled`,
        display_order: 8
      },
      {
        report_id: id,
        section_type: 'staff_workforce',
        section_title: 'Our People',
        section_content: `**Workforce Growth**

| Year | Total Staff |
|------|-------------|
| 2022 | ${kb.statistics.staff.total_2022} |
| 2023 | ${kb.statistics.staff.total_2023} |
| 2024 | ${kb.statistics.staff.total_2024} |

**Growth Rate: ${kb.statistics.staff.growth_rate}** (2023-2024)

**Local Employment**
- ${kb.statistics.staff.palm_island_residents_percentage} of staff are Palm Island residents
- ${kb.statistics.staff.aboriginal_tsi_percentage} are Aboriginal or Torres Strait Islander
- These figures are extraordinarily high compared to other remote community services

**By Area**
- Social Enterprises: ${kb.statistics.staff.social_enterprises_staff} staff
- Digital Service Centre: ${kb.key_programs.digital_service_centre.staff} staff

**Training Pathway**
Through our Telstra Digital Service Centre partnership:
- ${kb.key_programs.digital_service_centre.training_pathway}
- Supporting ${kb.key_programs.digital_service_centre.languages_supported} languages`,
        display_order: 9
      },
      {
        report_id: id,
        section_type: 'partnerships',
        section_title: 'Our Partners',
        section_content: `PICC works with a range of government, corporate, and community partners:

**Government Partners**
- Queensland Government
- NIAA (National Indigenous Australians Agency)
- Queensland Health
- Northern Queensland Primary Health Network

**Corporate Partners**
- Telstra (Digital Service Centre)
- Advance Queensland

**Peak Bodies**
- QATSICPP (Queensland Aboriginal and Torres Strait Islander Child Protection Peak)

**Strategic Initiatives**
- Deadly Innovation Strategy
- State of Queensland Digital Economy Strategy

**Conferences & Recognition**
- SNAICC Conference 2023 (Darwin)
  - "The Storyline of the Palm Island Children and Family Centre"
  - "Proud Bwgcolman Youth"`,
        display_order: 10
      },
      {
        report_id: id,
        section_type: 'looking_forward',
        section_title: 'Looking Ahead',
        section_content: `As we look to the future, PICC remains committed to:

**Expanding Delegated Authority**
Building on our milestone achievement, we will continue to develop community-controlled child protection services under the Bwgcolman Way framework.

**First 1,000 Days**
Scaling our new maternal and child health program to support more families during these critical early years.

**Digital Innovation**
Expanding our Digital Service Centre and supporting more community members into employment through the Telstra partnership.

**Workforce Development**
Continuing to train and employ Palm Islanders, maintaining our extraordinary local employment rates.

**Service Excellence**
Maintaining our accreditations and expanding our health and family services to meet community needs.

**Self-Determination**
Every service we provide, every program we run, and every advocacy effort we make is in service of our vision: Palm Islanders determining their own futures.

${kb.organization.tagline}`,
        display_order: 11
      },
      {
        report_id: id,
        section_type: 'acknowledgments',
        section_title: 'Acknowledgments',
        section_content: `**Traditional Owners**
We acknowledge the Manbarra people as the traditional owners of Palm Island and pay our respects to Elders past, present and emerging.

**Our Community**
We thank all Palm Islanders who trust PICC to serve them, and the many community members who shared their stories through our Empathy Ledger project.

**Our Funders**
We acknowledge the support of:
${kb.partnerships.map(p => `- ${p}`).join('\n')}

**Our Staff**
Thank you to our ${kb.statistics.staff.total_2024} dedicated staff members - ${kb.statistics.staff.palm_island_residents_percentage} of whom are Palm Islanders - for your tireless work serving community.

**Our Board**
${kb.leadership.board_members.map(m => `- ${m.name}, ${m.role}`).join('\n')}

**In Memory**
We remember all those who came before us, including the survivors of Hull River who established this community in 1918.

---
*Palm Island Community Company*
*ACN ${kb.organization.acn}*
*${kb.organization.website}*`,
        display_order: 12
      }
    ]

    const { error: sectionsError } = await supabase
      .from('report_sections')
      .insert(sections)

    if (sectionsError) {
      console.error('Create sections error:', sectionsError)
    }

    // Auto-tag a curated set of media so the public report immediately has photos/video.
    if (includeMedia && finalStories.length > 0) {
      const reportTags = ['annual-report', `fy:${fiscalYear}`]
      const selectedStoryIds = finalStories.map((s: any) => s.id).filter(Boolean)

      try {
        const { data: mediaRows } = await supabase
          .from('media_files')
          .select('id, story_id, public_url, file_type, usage_context, is_featured, tags, page_context, page_section, context_metadata, deleted_at, is_public')
          .in('story_id', selectedStoryIds)
          .eq('is_public', true)
          .is('deleted_at', null)
          .limit(250)

        const rows = (mediaRows || []) as any[]
        const images = rows.filter((r) => !r.file_type || r.file_type === 'image')
        const videos = rows.filter((r) => r.file_type === 'video')

        const usage = (r: any) => safeLower(r.usage_context)

        const heroImage =
          images.find((r) => r.is_featured === true || usage(r) === 'story_hero' || usage(r) === 'hero') || images[0]
        const heroVideo = videos.find((r) => r.is_featured === true || usage(r) === 'hero') || videos[0]

        const updates: any[] = []

        // Tag a broader set of images for the report galleries.
        const gallery = pickTopUnique(images, (r) => String(r.id), 40)
        for (const r of gallery) {
          updates.push({
            id: r.id,
            tags: mergeTags(r.tags, reportTags),
            context_metadata: { ...(r.context_metadata || {}), report_year: reportYear, fiscal_year: fiscalYear },
          })
        }

        // Set the featured hero image/video for the annual report context (used by /annual-report/live and can be reused).
        if (heroImage?.id) {
          // Clear existing featured hero image for this report year (best-effort).
          await supabase
            .from('media_files')
            .update({ is_featured: false })
            .eq('page_context', 'annual-report')
            .eq('page_section', 'hero')
            .eq('file_type', 'image')
            .contains('context_metadata', { report_year: reportYear })

          updates.push({
            id: heroImage.id,
            tags: mergeTags(heroImage.tags, reportTags),
            page_context: 'annual-report',
            page_section: 'hero',
            file_type: 'image',
            is_featured: true,
            context_metadata: { ...(heroImage.context_metadata || {}), report_year: reportYear, fiscal_year: fiscalYear },
          })
        }

        if (heroVideo?.id) {
          await supabase
            .from('media_files')
            .update({ is_featured: false })
            .eq('page_context', 'annual-report')
            .eq('page_section', 'hero')
            .eq('file_type', 'video')
            .contains('context_metadata', { report_year: reportYear })

          updates.push({
            id: heroVideo.id,
            tags: mergeTags(heroVideo.tags, reportTags),
            page_context: 'annual-report',
            page_section: 'hero',
            file_type: 'video',
            is_featured: true,
            context_metadata: { ...(heroVideo.context_metadata || {}), report_year: reportYear, fiscal_year: fiscalYear },
          })
        }

        if (updates.length > 0) {
          const { error: upsertError } = await (supabase as any).from('media_files').upsert(updates, { onConflict: 'id' })
          if (upsertError) console.warn('Auto-tag media failed:', upsertError.message)
        }
      } catch (e: any) {
        console.warn('Auto-tag media skipped:', e?.message || e)
      }
    }

    // Return success with comprehensive stats
    return NextResponse.json({
      success: true,
      populated: {
        statistics: {
          stories: totalStories,
          storytellers: uniqueStorytellers,
          staff: kb.statistics.staff.total_2024,
          income: kb.statistics.financial.income,
          health_clients: kb.statistics.health_service.total_clients,
          services: kb.statistics.service_metrics.total_services
        },
        stories_linked: finalStories.length,
        sections_created: sections.length
      }
    })

  } catch (error: any) {
    console.error('Populate report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

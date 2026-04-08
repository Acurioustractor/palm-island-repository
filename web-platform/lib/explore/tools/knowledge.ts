import { z } from 'zod'
import { defineTool, getSupabase, resolveMediaUrl } from './_shared'
import { buildKnowledgeGraph } from '@/lib/ai/knowledge-graph'
import { checkCompleteness, type CompletenessReport, type ServiceCompleteness } from '@/lib/content-readiness/check-completeness'

// ─── Schema definitions ──────────────────────────────────────────────────────

const exploreKnowledgeGraphSchema = z.object({
  centeredOn: z.string().optional().describe('Center the graph on this entity (e.g. "health", "elders")'),
  types: z.array(z.string()).optional().describe('Node types to include: story, person, place, concept, knowledge'),
  depth: z.number().min(1).max(3).default(2).describe('How many connections deep to explore'),
})

type ExploreKnowledgeGraphInput = z.infer<typeof exploreKnowledgeGraphSchema>

const getInnovationProjectsSchema = z.object({
  projectSlug: z.string().optional().describe('Project slug to get details for a specific project'),
  status: z.string().optional().describe('Filter by status: active, in_progress, planning, completed'),
})

type GetInnovationProjectsInput = z.infer<typeof getInnovationProjectsSchema>

const suggestDataEnrichmentSchema = z.object({
  serviceSlug: z.string().optional().describe('Limit suggestions to a specific service by slug'),
})

type SuggestDataEnrichmentInput = z.infer<typeof suggestDataEnrichmentSchema>

const getBoardAndLeadershipSchema = z.object({
  includeMessages: z.boolean().default(false).describe('Include leadership messages (CEO/Chair messages for annual report)'),
})

type GetBoardAndLeadershipInput = z.infer<typeof getBoardAndLeadershipSchema>

// ─── Helper functions ────────────────────────────────────────────────────────

function generateServiceQuestions(service: ServiceCompleteness): string[] {
  const questions: string[] = []
  const { checks, name } = service

  if (!checks.hasDescription) {
    questions.push(`Can you provide a description for ${name}?`)
  }
  if (!checks.hasCoverPhoto) {
    questions.push(`Do you have a cover photo for ${name}?`)
  }
  if (!checks.hasCurrentYearMetrics) {
    questions.push(`How many clients did ${name} serve this financial year?`)
    questions.push(`How many sessions or events did ${name} deliver this quarter?`)
  }
  if (!checks.hasStories) {
    questions.push(`What was a key achievement or success story for ${name} recently?`)
  }
  if (!checks.hasNotes) {
    questions.push(`Are there any recent updates or notes for ${name}?`)
  }
  if (!checks.hasGrantInfo) {
    questions.push(`What funding or grants support ${name}?`)
  }
  if (!checks.hasGpsCoords) {
    questions.push(`Where is ${name} located? We need GPS coordinates for the map.`)
  }

  return questions
}

function generateReportQuestions(section: { section: string; status: string; details: string }): string[] {
  if (section.status === 'green') return []

  const map: Record<string, string[]> = {
    'CEO Message': ['Can you provide the CEO message or leadership summary for the annual report?'],
    'Chair Message': ['Is there a Chair message or acknowledgement of country for the report?'],
    'Financial Data': ['Have the financials for the current fiscal year been entered?'],
    'Community Voices': ['Are there community quotes or testimonials to include in the report?'],
    'Gallery Photos': ['Can you tag more photos with "annual-report" for the gallery section? We need at least 5.'],
    'Elder Quotes': ['Are there Elder quotes available for the annual report?'],
    'Board Photos': ['Do you have photos of board members tagged with "board-member"? We need at least 3.'],
  }

  return map[section.section] || [`The "${section.section}" section needs attention: ${section.details}`]
}

// ─── exploreKnowledgeGraph ───────────────────────────────────────────────────

export const exploreKnowledgeGraph = defineTool({
  description: 'Explore the knowledge graph showing connections between stories, people, places, and concepts.',
  parameters: exploreKnowledgeGraphSchema,
  execute: async (input: ExploreKnowledgeGraphInput) => {
    const { centeredOn, types, depth } = input
    const graph = await buildKnowledgeGraph({
      limit: 50,
      types: types as string[] | undefined,
    })

    if (centeredOn) {
      const centerNode = graph.nodes.find(n =>
        n.label.toLowerCase().includes(centeredOn.toLowerCase()) ||
        n.id.toLowerCase().includes(centeredOn.toLowerCase())
      )

      if (centerNode) {
        const included = new Set<string>([centerNode.id])
        let current = [centerNode.id]

        for (let d = 0; d < depth; d++) {
          const next: string[] = []
          for (const edge of graph.edges) {
            if (current.includes(edge.source) && !included.has(edge.target)) {
              included.add(edge.target)
              next.push(edge.target)
            }
            if (current.includes(edge.target) && !included.has(edge.source)) {
              included.add(edge.source)
              next.push(edge.source)
            }
          }
          current = next
        }

        const nodes = graph.nodes.filter(n => included.has(n.id))
        const edges = graph.edges.filter(e => included.has(e.source) && included.has(e.target))

        return {
          nodes,
          edges,
          centeredOn: centerNode.label,
          stats: { totalNodes: nodes.length, totalEdges: edges.length },
        }
      }
    }

    return {
      nodes: graph.nodes.slice(0, 30),
      edges: graph.edges.filter(e =>
        graph.nodes.slice(0, 30).some(n => n.id === e.source) &&
        graph.nodes.slice(0, 30).some(n => n.id === e.target)
      ),
      centeredOn: null,
      stats: graph.metadata,
    }
  },
})

// ─── getInnovationProjects ──────────────────────────────────────────────────

export const getInnovationProjects = defineTool({
  description: 'Get information about PICC innovation projects. Projects include: The Centre & The Station (Townsville hub), Elders Cultural Trips, Photo Studio, Healthy Meals, On-Country Server, Movember, Recycling/Goods, Annual Report. Use this for ANY question about PICC projects, initiatives, or "what is [project name]?".',
  parameters: getInnovationProjectsSchema,
  execute: async (input: GetInnovationProjectsInput) => {
    let { projectSlug, status } = input
    const supabase = getSupabase()

    // Fuzzy slug matching — try exact slug first, then search by name
    if (projectSlug) {
      const { data: exact } = await supabase
        .from('projects')
        .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
        .eq('slug', projectSlug)
        .limit(1)

      if (!exact || exact.length === 0) {
        // Try fuzzy: convert slug to name search
        const nameSearch = projectSlug.replace(/[-_]/g, ' ')
        const { data: fuzzy } = await supabase
          .from('projects')
          .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
          .or(`name.ilike.%${nameSearch}%,slug.ilike.%${projectSlug}%,description.ilike.%${nameSearch}%`)
          .limit(1)

        if (fuzzy && fuzzy.length > 0) {
          projectSlug = fuzzy[0].slug
        }
      }
    }

    let query = supabase
      .from('projects')
      .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
      .order('name')

    if (projectSlug) {
      query = query.eq('slug', projectSlug)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: projects, error } = await query.limit(10)

    if (error) {
      console.error('getInnovationProjects error:', error)
      return { projects: [], total: 0 }
    }

    if (!projects || projects.length === 0) {
      return { projects: [], total: 0, message: 'No innovation projects found.' }
    }

    // For single project, also fetch notes, stories, and media
    if (projectSlug && projects.length === 1) {
      const proj = projects[0]
      const projectTag = `project:${proj.slug}`
      const [notesResult, storiesResult, photosResult, videosResult] = await Promise.all([
        supabase
          .from('project_notes')
          .select('id, content, note_type, author_name, created_at')
          .eq('project_id', proj.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('stories')
          .select('id, title, excerpt, category')
          .eq('status', 'published')
          .or(`title.ilike.%${proj.name}%,content.ilike.%${proj.name}%`)
          .limit(3),
        supabase
          .from('media_files')
          .select('id, public_url, file_path, bucket_name, title, alt_text, file_type')
          .contains('tags', [projectTag])
          .eq('file_type', 'image')
          .is('deleted_at', null)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(8),
        supabase
          .from('media_files')
          .select('id, public_url, file_path, bucket_name, title, alt_text, file_type')
          .contains('tags', [projectTag])
          .eq('file_type', 'video')
          .is('deleted_at', null)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(6),
      ])

      const photos = (photosResult.data || [])
        .map((m: any) => ({ url: resolveMediaUrl(m), alt: m.alt_text || m.title || proj.name }))
        .filter((p: any) => p.url !== null)

      const videos = (videosResult.data || [])
        .map((m: any) => ({ url: resolveMediaUrl(m), title: m.title }))
        .filter((v: any) => v.url !== null)

      return {
        project: {
          name: proj.name,
          slug: proj.slug,
          description: proj.description,
          tagline: proj.tagline,
          status: proj.status,
          heroImage: proj.hero_image_url,
          targetBeneficiaries: proj.target_beneficiaries,
          actualBeneficiaries: proj.actual_beneficiaries,
          budget: proj.budget_total ? `$${(proj.budget_total / 1000).toFixed(0)}K` : null,
        },
        notes: notesResult.data || [],
        relatedStories: storiesResult.data || [],
        photos,
        videos,
        total: 1,
      }
    }

    return {
      projects: projects.map(p => ({
        name: p.name,
        slug: p.slug,
        tagline: p.tagline || p.description?.substring(0, 100),
        status: p.status,
        heroImage: p.hero_image_url,
      })),
      total: projects.length,
    }
  },
})

// ─── suggestDataEnrichment ──────────────────────────────────────────────────

export const suggestDataEnrichment = defineTool({
  description: 'Suggest specific questions to fill data gaps for services and annual report sections. Returns plain-language questions grouped by service or report section.',
  parameters: suggestDataEnrichmentSchema,
  execute: async (input: SuggestDataEnrichmentInput) => {
    const { serviceSlug } = input

    try {
      const report = await checkCompleteness()

      const serviceGroups: { service: string; slug: string; status: string; questions: string[] }[] = []
      const filteredServices = serviceSlug
        ? report.services.filter((s) => s.slug === serviceSlug)
        : report.services

      for (const svc of filteredServices) {
        if (svc.status === 'green') continue
        const questions = generateServiceQuestions(svc)
        if (questions.length > 0) {
          serviceGroups.push({
            service: svc.name,
            slug: svc.slug,
            status: svc.status,
            questions,
          })
        }
      }

      const reportGaps: { section: string; status: string; questions: string[] }[] = []
      for (const sec of report.reportSections) {
        if (sec.status === 'green') continue
        const questions = generateReportQuestions(sec)
        if (questions.length > 0) {
          reportGaps.push({
            section: sec.section,
            status: sec.status,
            questions,
          })
        }
      }

      return {
        serviceGaps: serviceGroups,
        reportGaps: serviceSlug ? [] : reportGaps,
        totalQuestions: serviceGroups.reduce((sum, g) => sum + g.questions.length, 0) +
          reportGaps.reduce((sum, g) => sum + g.questions.length, 0),
        overallScore: report.overallScore,
      }
    } catch (err) {
      console.error('suggestDataEnrichment error:', err)
      return { error: 'Failed to generate enrichment suggestions.' }
    }
  },
})

// ─── getBoardAndLeadership ──────────────────────────────────────────────────

export const getBoardAndLeadership = defineTool({
  description: 'Get PICC board members and leadership team — names, roles, bios, and optionally their leadership messages.',
  parameters: getBoardAndLeadershipSchema,
  execute: async (input: GetBoardAndLeadershipInput) => {
    const { includeMessages } = input
    const supabase = getSupabase()

    const boardSelect = 'name, role, bio, photo_url, start_date, end_date, display_order'
    const { data: board } = await supabase
      .from('board_members')
      .select(boardSelect)
      .order('display_order', { ascending: true })

    const leadershipSelect = includeMessages
      ? 'full_name, position, bio, photo_url, leadership_type, message_title, message_content, featured_quote'
      : 'full_name, position, bio, photo_url, leadership_type, featured_quote'
    const { data: leaders } = await supabase
      .from('leadership')
      .select(leadershipSelect)
      .eq('is_active', true)
      .order('position_order', { ascending: true })

    return {
      board: board || [],
      leadership: leaders || [],
      boardCount: board?.length || 0,
      leadershipCount: leaders?.length || 0,
    }
  },
})

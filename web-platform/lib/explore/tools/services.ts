import { z } from 'zod'
import { defineTool, getSupabase, resolveMediaUrl } from './_shared'

// ─── Schema definitions ──────────────────────────────────────────────────────

const getServiceInfoSchema = z.object({
  serviceSlug: z.string().optional().describe('Service URL slug (e.g. "health-services")'),
  serviceName: z.string().optional().describe('Service name to search for'),
})

type GetServiceInfoInput = z.infer<typeof getServiceInfoSchema>

const getServiceMetricsSchema = z.object({
  serviceSlug: z.string().optional().describe('Service slug to get metrics for'),
  fiscalYear: z.string().optional().describe('Fiscal year (e.g. "2024-25"). Defaults to latest.'),
  includeActivity: z.boolean().default(true).describe('Include monthly activity log data'),
})

type GetServiceMetricsInput = z.infer<typeof getServiceMetricsSchema>

const submitServiceUpdateSchema = z.object({
  serviceSlug: z.string().describe('Service slug to update'),
  content: z.string().min(10).describe('The update or note content'),
  noteType: z.enum(['update', 'achievement', 'challenge', 'feedback']).default('update')
    .describe('Type of note'),
  authorName: z.string().optional().describe('Who provided this information'),
})

type SubmitServiceUpdateInput = z.infer<typeof submitServiceUpdateSchema>

// ─── getServiceInfo ──────────────────────────────────────────────────────────

export const getServiceInfo = defineTool({
  description: 'Get detailed information about a PICC service, including metrics and achievements.',
  parameters: getServiceInfoSchema,
  execute: async (input: GetServiceInfoInput) => {
    const { serviceSlug, serviceName } = input
    const supabase = getSupabase()

    // Try slug first, then name search, then fuzzy slug match
    let service: any = null

    if (serviceSlug) {
      const { data } = await supabase
        .from('organization_services')
        .select('id, name, slug, description, service_category, is_active')
        .eq('is_active', true)
        .eq('slug', serviceSlug)
        .limit(1)
      service = data?.[0]
    }

    // Fallback: search by name (handles both serviceName and serviceSlug as text)
    if (!service) {
      const searchText = serviceName || serviceSlug?.replace(/[-_]/g, ' ') || ''
      if (searchText) {
        const { data } = await supabase
          .from('organization_services')
          .select('id, name, slug, description, service_category, is_active')
          .eq('is_active', true)
          .ilike('name', `%${searchText}%`)
          .limit(1)
        service = data?.[0]
      }
    }
    if (!service) {
      // Return all active services as suggestions
      const { data: allServices } = await supabase
        .from('organization_services')
        .select('name, slug, description, service_category')
        .eq('is_active', true)
        .order('name')
      return {
        found: false,
        service: null,
        metrics: null,
        achievements: [],
        suggestions: (allServices || []).map((s: any) => ({
          name: s.name,
          slug: s.slug,
          description: s.description,
          category: s.service_category,
        })),
      }
    }

    const serviceTag = `service:${service.slug}`
    const [metricsResult, achievementsResult, photosResult] = await Promise.all([
      supabase
        .from('service_metrics')
        .select('fiscal_year, clients_served, sessions_delivered, events_held, staff_count, key_achievement, headline_stat_value, headline_stat_label')
        .eq('organization_service_id', service.id)
        .order('fiscal_year', { ascending: false })
        .limit(3),
      supabase
        .from('governance_achievements')
        .select('achievement_text, category, fiscal_year')
        .eq('category', service.service_category || service.slug)
        .order('fiscal_year', { ascending: false })
        .limit(5),
      supabase
        .from('media_files')
        .select('id, public_url, file_path, bucket_name, title, alt_text')
        .contains('tags', [serviceTag])
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
        .limit(5),
    ])

    return {
      found: true,
      service: {
        name: service.name,
        slug: service.slug,
        description: service.description,
        category: service.service_category,
      },
      metrics: metricsResult.data?.[0] || null,
      recentMetrics: metricsResult.data || [],
      achievements: achievementsResult.data || [],
      photos: (photosResult.data || [])
        .map((p: any) => ({ url: resolveMediaUrl(p), alt: p.alt_text || p.title || service.name }))
        .filter((p: any) => p.url !== null),
    }
  },
})

// ─── getServiceMetrics ──────────────────────────────────────────────────────

export const getServiceMetrics = defineTool({
  description: 'Get service metrics and activity trends — annual metrics plus monthly activity logs for trend analysis.',
  parameters: getServiceMetricsSchema,
  execute: async (input: GetServiceMetricsInput) => {
    const { serviceSlug, fiscalYear, includeActivity } = input
    const supabase = getSupabase()

    // Find service
    let serviceId: string | null = null
    let serviceName: string | null = null
    if (serviceSlug) {
      const { data } = await supabase
        .from('organization_services')
        .select('id, name')
        .eq('slug', serviceSlug)
        .single()
      serviceId = data?.id || null
      serviceName = data?.name || null
    }

    // Annual metrics
    let metricsQuery = supabase
      .from('service_metrics')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .limit(5)
    if (serviceId) metricsQuery = metricsQuery.eq('organization_service_id', serviceId)
    if (fiscalYear) metricsQuery = metricsQuery.eq('fiscal_year', fiscalYear)
    const { data: metrics } = await metricsQuery

    // Monthly activity logs
    let activityLogs: any[] = []
    if (includeActivity && serviceId) {
      const { data } = await supabase
        .from('service_activity_logs')
        .select('*')
        .eq('service_id', serviceId)
        .order('period_start', { ascending: false })
        .limit(12)
      activityLogs = data || []
    }

    return {
      service: serviceName,
      annualMetrics: metrics || [],
      activityLogs,
      trends: activityLogs.length > 1 ? {
        totalClients: activityLogs.reduce((sum: number, l: any) => sum + (l.clients_served || 0), 0),
        totalSessions: activityLogs.reduce((sum: number, l: any) => sum + (l.sessions_delivered || 0), 0),
        monthsCovered: activityLogs.length,
      } : null,
    }
  },
})

// ─── submitServiceUpdate ────────────────────────────────────────────────────

export const submitServiceUpdate = defineTool({
  description: 'Record a service update or note captured from conversation. Saves to service_notes table.',
  parameters: submitServiceUpdateSchema,
  execute: async (input: SubmitServiceUpdateInput) => {
    const { serviceSlug, content, noteType, authorName } = input
    const supabase = getSupabase()

    // Find service
    const { data: service } = await supabase
      .from('organization_services')
      .select('id, name')
      .eq('slug', serviceSlug)
      .single()

    if (!service) return { success: false, error: `Service "${serviceSlug}" not found` }

    const { data, error } = await supabase
      .from('service_notes')
      .insert({
        service_id: service.id,
        content,
        note_type: noteType,
        author_name: authorName || 'Chat Assistant',
        source: 'chat',
      })
      .select('id, created_at')
      .single()

    if (error) return { success: false, error: error.message }

    return {
      success: true,
      id: data.id,
      service: service.name,
      noteType,
      message: `Update saved for ${service.name}. It will be visible in the service admin page.`,
    }
  },
})

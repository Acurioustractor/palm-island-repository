import { z } from 'zod'
import { defineTool, getSupabase } from './_shared'

// ─── Schema definitions ──────────────────────────────────────────────────────

const submitMeetingNoteSchema = z.object({
  title: z.string().describe('Meeting title or subject'),
  summary: z.string().min(20).describe('Meeting summary or key points'),
  attendees: z.array(z.string()).optional().describe('List of attendee names'),
  meetingDate: z.string().optional().describe('Meeting date (YYYY-MM-DD). Defaults to today.'),
  actionItems: z.array(z.string()).optional().describe('Action items from the meeting'),
})

type SubmitMeetingNoteInput = z.infer<typeof submitMeetingNoteSchema>

const getGrantsAndPartnershipsSchema = z.object({
  serviceSlug: z.string().optional().describe('Filter grants/partners by service slug'),
})

type GetGrantsAndPartnershipsInput = z.infer<typeof getGrantsAndPartnershipsSchema>

const getJobOpportunitiesSchema = z.object({
  category: z.string().optional().describe('Filter by category: health, community_services, administration, trades, hospitality, retail, digital, education, cultural, construction'),
  employmentType: z.string().optional().describe('Filter by type: full_time, part_time, casual, contract, traineeship, apprenticeship'),
  location: z.string().optional().describe('Filter by location: Palm Island, Townsville, Remote'),
  includeTraining: z.boolean().optional().describe('Only include jobs that include training'),
  status: z.string().optional().describe('Filter by status: open, coming_soon, ongoing (default shows open and ongoing)'),
  limit: z.number().min(1).max(20).default(10).describe('Number of opportunities to return'),
})

type GetJobOpportunitiesInput = z.infer<typeof getJobOpportunitiesSchema>

// ─── submitMeetingNote ──────────────────────────────────────────────────────

export const submitMeetingNote = defineTool({
  description: 'Record a meeting summary captured from conversation. Saves to meeting_notes table.',
  parameters: submitMeetingNoteSchema,
  execute: async (input: SubmitMeetingNoteInput) => {
    const { title, summary, attendees, meetingDate, actionItems } = input
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('meeting_notes')
      .insert({
        title,
        summary,
        attendees: attendees || [],
        meeting_date: meetingDate || new Date().toISOString().split('T')[0],
        action_items: actionItems || [],
        source: 'chat',
      })
      .select('id, created_at')
      .single()

    if (error) return { success: false, error: error.message }

    return {
      success: true,
      id: data.id,
      message: `Meeting note "${title}" saved successfully.`,
    }
  },
})

// ─── getGrantsAndPartnerships ───────────────────────────────────────────────

export const getGrantsAndPartnerships = defineTool({
  description: 'Get grant funding information and partnership details for PICC services. Includes grant deadlines, outcomes, and partner-service relationships.',
  parameters: getGrantsAndPartnershipsSchema,
  execute: async (input: GetGrantsAndPartnershipsInput) => {
    const { serviceSlug } = input
    const supabase = getSupabase()

    // Get partners (already in RAG but no direct tool)
    const { data: partners } = await supabase
      .from('partners')
      .select('name, partner_type, description, logo_url, website_url, is_active')
      .eq('is_active', true)
      .order('name')

    // Service grants
    let grantsQuery = supabase
      .from('service_grants')
      .select('*')
      .limit(30)

    if (serviceSlug) {
      const { data: svc } = await supabase
        .from('organization_services')
        .select('id')
        .eq('slug', serviceSlug)
        .single()
      if (svc) grantsQuery = grantsQuery.eq('service_id', svc.id)
    }

    const { data: grants } = await grantsQuery

    // Grant deadlines
    const { data: deadlines } = await supabase
      .from('grant_deadlines')
      .select('*')
      .gte('deadline_date', new Date().toISOString().split('T')[0])
      .order('deadline_date', { ascending: true })
      .limit(10)

    return {
      partners: partners || [],
      grants: grants || [],
      upcomingDeadlines: deadlines || [],
      partnerCount: partners?.length || 0,
    }
  },
})

// ─── getJobOpportunities ─────────────────────────────────────────────────────

export const getJobOpportunities = defineTool({
  description: 'Get job opportunities, training programs, and employment pathways at PICC. Includes positions at Digital Service Centre (Telstra partnership), social enterprises, and upcoming opportunities at The Station. Answers questions like "Are there any jobs?", "What training is available?", "How do I get a job on Palm Island?"',
  parameters: getJobOpportunitiesSchema,
  execute: async (input: GetJobOpportunitiesInput) => {
    const { category, employmentType, location, includeTraining, status, limit } = input
    const supabase = getSupabase()

    // Canonical PICC org has slug='picc' (legacy seed row also has short_name='PICC' but slug=NULL)
    const { data: piccOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'picc')
      .limit(1)

    if (!piccOrg || piccOrg.length === 0) {
      return { opportunities: [], total: 0, message: 'Organization not found' }
    }

    let query = supabase
      .from('job_opportunities')
      .select('*')
      .eq('organization_id', piccOrg[0].id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Default to showing open and ongoing positions
    if (!status) {
      query = query.in('status', ['open', 'ongoing'])
    } else if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (employmentType) {
      query = query.eq('employment_type', employmentType)
    }

    if (location) {
      query = query.eq('location', location)
    }

    if (includeTraining) {
      query = query.eq('includes_training', true)
    }

    const { data: opportunities, error } = await query

    if (error) {
      console.error('getJobOpportunities error:', error)
      return { opportunities: [], total: 0, error: 'Failed to fetch job opportunities' }
    }

    // Format for display
    const formatted = (opportunities || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      employmentType: job.employment_type,
      category: job.category,
      location: job.location,
      isRemote: job.is_remote,
      includesTraining: job.includes_training,
      trainingDetails: job.training_details,
      qualificationObtained: job.qualification_obtained,
      status: job.status,
      closingDate: job.closing_date,
      startDate: job.start_date,
      requirements: job.requirements || [],
      experienceLevel: job.experience_level,
      contactEmail: job.contact_email,
      contactPhone: job.contact_phone,
      applicationLink: job.application_link,
    }))

    // Get counts by category for summary
    const { data: allJobs } = await supabase
      .from('job_opportunities')
      .select('category, status')
      .eq('organization_id', piccOrg[0].id)
      .in('status', ['open', 'ongoing'])

    const categoryCounts: Record<string, number> = {}
    const typeCounts: Record<string, number> = {}
    ;(allJobs || []).forEach((job: any) => {
      if (job.category) {
        categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1
      }
      // Count training opportunities
    })

    return {
      opportunities: formatted,
      total: formatted.length,
      summary: {
        totalOpen: (allJobs || []).length,
        trainingAvailable: (allJobs || []).filter((j: any) => j.status === 'open' || j.status === 'ongoing').length,
        categories: categoryCounts,
      },
      contact: {
        email: 'admin@picc.com.au',
        phone: '(07) 4770 1177',
        website: 'https://picc.com.au/careers',
      },
    }
  },
})

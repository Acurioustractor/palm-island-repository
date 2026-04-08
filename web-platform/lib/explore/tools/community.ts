import { z } from 'zod'
import { defineTool, getSupabase } from './_shared'

// ─── Schema definitions ──────────────────────────────────────────────────────

const submitCommunityVisionSchema = z.object({
  vision: z.string().min(10).describe('The vision or aspiration text'),
  category: z.enum(['services', 'culture', 'youth', 'economic', 'environment', 'governance', 'other'])
    .describe('Category of the vision'),
  authorName: z.string().optional().describe('Name of the person sharing (if not anonymous)'),
  isAnonymous: z.boolean().default(true).describe('Whether the submission is anonymous'),
})

type SubmitCommunityVisionInput = z.infer<typeof submitCommunityVisionSchema>

const getCommunityVisionsSchema = z.object({
  category: z.string().optional().describe('Filter by category: youth, health, culture, economic, governance, environment'),
  limit: z.number().min(1).max(20).default(10).describe('Number of visions to return'),
})

type GetCommunityVisionsInput = z.infer<typeof getCommunityVisionsSchema>

const escalateToHumanSchema = z.object({
  reason: z.string().describe('Why escalation is needed (e.g. "crisis support", "complex query", "user requested")'),
  category: z.enum(['crisis', 'service_inquiry', 'complaint', 'general', 'unresolved']).default('general')
    .describe('Category of escalation'),
  userMessage: z.string().optional().describe('The user message or question to pass along'),
})

type EscalateToHumanInput = z.infer<typeof escalateToHumanSchema>

const collectContactDetailsSchema = z.object({
  reason: z.string().describe('Why the person wants to leave details (e.g. "wants to donate", "partnership interest", "volunteer")'),
  interest: z.string().optional().describe('What they are interested in (e.g. "recycling program partnership", "donation")'),
})

type CollectContactDetailsInput = z.infer<typeof collectContactDetailsSchema>

// ─── submitCommunityVision ───────────────────────────────────────────────────

export const submitCommunityVision = defineTool({
  description: 'Record a community member\'s vision or aspiration for PICC\'s future (20th anniversary).',
  parameters: submitCommunityVisionSchema,
  execute: async (input: SubmitCommunityVisionInput) => {
    const { vision, category, authorName, isAnonymous } = input
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('community_visions')
      .insert({
        vision_text: vision,
        category,
        author_name: isAnonymous ? null : authorName,
        is_anonymous: isAnonymous,
        source: 'explore-chat',
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('submitCommunityVision error:', error)
      return { success: false, error: 'Failed to save vision. Please try again.' }
    }

    const { count } = await supabase
      .from('community_visions')
      .select('*', { count: 'exact', head: true })

    return {
      success: true,
      id: data.id,
      category,
      totalVisions: count || 0,
      message: 'Your vision has been recorded and will be reviewed by the PICC team.',
    }
  },
})

// ─── getCommunityVisions ────────────────────────────────────────────────────

export const getCommunityVisions = defineTool({
  description: 'Get community visions and aspirations for PICC\'s future and next 20 years. Shows what community members, Elders, and staff envision for Palm Island.',
  parameters: getCommunityVisionsSchema,
  execute: async (input: GetCommunityVisionsInput) => {
    const { category, limit } = input
    const supabase = getSupabase()

    let query = supabase
      .from('community_visions')
      .select('id, vision_text, category, author_name, is_anonymous, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: visions, error } = await query

    if (error) {
      console.error('getCommunityVisions error:', error)
      return { visions: [], total: 0 }
    }

    // Also get future-themed elder quotes
    const { data: elderQuotes } = await supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme')
      .or('text.ilike.%future%,text.ilike.%next%,theme.ilike.%future%,theme.ilike.%vision%')
      .limit(5)

    return {
      visions: (visions || []).map((v: any) => ({
        text: v.vision_text,
        category: v.category,
        author: v.is_anonymous ? 'Community member' : (v.author_name || 'Community member'),
        date: v.created_at,
      })),
      elderVoices: (elderQuotes || []).map((q: any) => ({
        text: q.text,
        speaker: q.speaker_name,
        role: q.speaker_role,
        theme: q.theme,
      })),
      total: visions?.length || 0,
    }
  },
})

// ─── escalateToHuman ──────────────────────────────────────────────────────────

export const escalateToHuman = defineTool({
  description: 'Connect the user to a real person at PICC. Use for crisis situations (DV, child safety, mental health), when the user explicitly asks to speak with someone, or when you cannot resolve their question after multiple attempts.',
  parameters: escalateToHumanSchema,
  execute: async (input: EscalateToHumanInput) => {
    const { reason, category, userMessage } = input

    const isCrisis = category === 'crisis'

    return {
      escalated: true,
      category,
      reason,
      userMessage,
      contacts: {
        phone: '(07) 4770 1177',
        email: 'admin@picc.com.au',
        address: 'Palm Island Community Company, Palm Island QLD 4816',
        hours: 'Monday to Friday, 8:30am - 4:30pm',
      },
      crisisContacts: isCrisis ? {
        emergencyServices: '000',
        dvConnect: '1800 811 811',
        '1800RESPECT': '1800 737 732',
        kidsHelpline: '1800 551 800',
        lifeline: '13 11 14',
        mentalHealthLine: '1300 642 255',
      } : null,
      message: isCrisis
        ? 'If you or someone you know is in immediate danger, please call 000. For crisis support, the contacts below are available 24/7.'
        : 'I can pass your question along to the PICC team, or you can reach them directly using the contact details below.',
    }
  },
})

// ─── collectContactDetails ───────────────────────────────────────────────────

export const collectContactDetails = defineTool({
  description: 'Offer the user a form to leave their contact details so PICC can follow up. Use when someone wants to donate, partner, volunteer, leave their details, get involved, or otherwise connect with PICC. Do NOT tell them you cannot collect details — use this tool instead.',
  parameters: collectContactDetailsSchema,
  execute: async (input: CollectContactDetailsInput) => {
    return {
      collectContact: true,
      reason: input.reason,
      interest: input.interest,
      message: 'Great — you can leave your details below and someone from PICC will be in touch.',
    }
  },
})

/**
 * AI Story Prompts Service
 *
 * Helps community members tell their stories through guided prompts
 * and AI-assisted interview questions.
 */

import Anthropic from '@anthropic-ai/sdk'
import { aiCache, CACHE_TTL } from './cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export interface StoryPrompt {
  id: string
  question: string
  helpText: string
  type: 'open' | 'feeling' | 'detail' | 'reflection'
  order: number
}

export interface StoryTemplate {
  id: string
  name: string
  description: string
  category: string
  prompts: StoryPrompt[]
  culturalGuidance?: string
}

export interface GeneratedPrompts {
  prompts: StoryPrompt[]
  culturalConsiderations: string[]
  suggestedTitle?: string
}

// Pre-defined story templates for common story types
export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'personal-journey',
    name: 'Personal Journey',
    description: 'Share a significant experience or journey in your life',
    category: 'community',
    prompts: [
      {
        id: 'pj-1',
        question: 'What experience or journey would you like to share?',
        helpText: 'Start with a brief overview of what happened',
        type: 'open',
        order: 1
      },
      {
        id: 'pj-2',
        question: 'When and where did this take place?',
        helpText: 'Share the time period and location - it helps bring the story to life',
        type: 'detail',
        order: 2
      },
      {
        id: 'pj-3',
        question: 'Who else was involved or important to this story?',
        helpText: 'Family, friends, community members, Elders...',
        type: 'detail',
        order: 3
      },
      {
        id: 'pj-4',
        question: 'How did this experience make you feel?',
        helpText: 'Share the emotions - joy, challenge, pride, learning...',
        type: 'feeling',
        order: 4
      },
      {
        id: 'pj-5',
        question: 'What did you learn or take away from this experience?',
        helpText: 'What wisdom would you share with others?',
        type: 'reflection',
        order: 5
      }
    ],
    culturalGuidance: 'Consider whether there are any cultural protocols around sharing this story. Some stories may need Elder approval before being shared publicly.'
  },
  {
    id: 'health-story',
    name: 'Health & Wellbeing Journey',
    description: 'Share your experience with health services or wellbeing',
    category: 'health',
    prompts: [
      {
        id: 'hs-1',
        question: 'What health or wellbeing experience would you like to share?',
        helpText: 'This could be about you, your family, or community health',
        type: 'open',
        order: 1
      },
      {
        id: 'hs-2',
        question: 'What services or support helped you?',
        helpText: 'Health clinics, programs, community support, traditional healing...',
        type: 'detail',
        order: 2
      },
      {
        id: 'hs-3',
        question: 'What challenges did you face along the way?',
        helpText: 'Be honest about the difficulties - it helps others know they\'re not alone',
        type: 'feeling',
        order: 3
      },
      {
        id: 'hs-4',
        question: 'How are things now compared to before?',
        helpText: 'Share the changes or progress you\'ve seen',
        type: 'reflection',
        order: 4
      },
      {
        id: 'hs-5',
        question: 'What advice would you give to others in a similar situation?',
        helpText: 'Your wisdom could help someone else on their journey',
        type: 'reflection',
        order: 5
      }
    ]
  },
  {
    id: 'cultural-memory',
    name: 'Cultural Memory',
    description: 'Preserve cultural knowledge, traditions, or memories',
    category: 'culture',
    prompts: [
      {
        id: 'cm-1',
        question: 'What cultural knowledge or tradition would you like to share?',
        helpText: 'This could be a practice, story, language, art form, or place of significance',
        type: 'open',
        order: 1
      },
      {
        id: 'cm-2',
        question: 'How did you learn about this? Who taught you?',
        helpText: 'Honor those who passed on this knowledge to you',
        type: 'detail',
        order: 2
      },
      {
        id: 'cm-3',
        question: 'Why is this important to you and the community?',
        helpText: 'Help others understand the significance',
        type: 'feeling',
        order: 3
      },
      {
        id: 'cm-4',
        question: 'How is this practiced or remembered today?',
        helpText: 'Is it still practiced? How has it changed?',
        type: 'detail',
        order: 4
      },
      {
        id: 'cm-5',
        question: 'What do you hope future generations will understand about this?',
        helpText: 'Your words will help preserve this for the future',
        type: 'reflection',
        order: 5
      }
    ],
    culturalGuidance: 'Some cultural knowledge may have restrictions on who can share it or who can hear it. Please consult with Elders if you\'re unsure about sharing certain information.'
  },
  {
    id: 'elder-wisdom',
    name: 'Elder Wisdom',
    description: 'Record wisdom and memories from Elders',
    category: 'elder_care',
    prompts: [
      {
        id: 'ew-1',
        question: 'What life experience or wisdom would you like to share with younger generations?',
        helpText: 'Think about what you wish you had known when you were young',
        type: 'open',
        order: 1
      },
      {
        id: 'ew-2',
        question: 'What was life like on Palm Island when you were growing up?',
        helpText: 'Share memories of places, people, and daily life',
        type: 'detail',
        order: 2
      },
      {
        id: 'ew-3',
        question: 'What changes have you seen over your lifetime?',
        helpText: 'The good changes and the challenges',
        type: 'reflection',
        order: 3
      },
      {
        id: 'ew-4',
        question: 'Who were the important people in your life and what did they teach you?',
        helpText: 'Honor those who shaped who you are',
        type: 'feeling',
        order: 4
      },
      {
        id: 'ew-5',
        question: 'What message do you have for the young people of Palm Island today?',
        helpText: 'Your words carry weight and wisdom',
        type: 'reflection',
        order: 5
      }
    ],
    culturalGuidance: 'Elder stories are precious. Consider recording audio or video along with text to preserve the voice and presence of the Elder.'
  },
  {
    id: 'youth-voice',
    name: 'Youth Voice',
    description: 'Young people sharing their perspectives and dreams',
    category: 'youth',
    prompts: [
      {
        id: 'yv-1',
        question: 'What\'s something you\'re proud of or excited about?',
        helpText: 'An achievement, a passion, something you\'re working on...',
        type: 'open',
        order: 1
      },
      {
        id: 'yv-2',
        question: 'What does being from Palm Island mean to you?',
        helpText: 'Your connection to country, community, and culture',
        type: 'feeling',
        order: 2
      },
      {
        id: 'yv-3',
        question: 'What challenges do you face and how do you deal with them?',
        helpText: 'Your experiences can help other young people',
        type: 'reflection',
        order: 3
      },
      {
        id: 'yv-4',
        question: 'What are your dreams for the future?',
        helpText: 'For yourself, your family, your community...',
        type: 'open',
        order: 4
      },
      {
        id: 'yv-5',
        question: 'What do you want older generations to understand about young people today?',
        helpText: 'Bridge the gap - share your perspective',
        type: 'reflection',
        order: 5
      }
    ]
  }
]

/**
 * Get a story template by ID
 */
export function getStoryTemplate(templateId: string): StoryTemplate | undefined {
  return STORY_TEMPLATES.find(t => t.id === templateId)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): StoryTemplate[] {
  return STORY_TEMPLATES.filter(t => t.category === category)
}

/**
 * Generate custom follow-up prompts based on user's previous answers
 */
export async function generateFollowUpPrompts(
  answers: Record<string, string>,
  templateId: string,
  options: {
    count?: number
    focusArea?: string
  } = {}
): Promise<StoryPrompt[]> {
  const { count = 3, focusArea } = options

  // Check cache
  const answerHash = Object.values(answers).join('').substring(0, 200)
  const cacheKey = [answerHash, templateId, count, focusArea || '']
  const cached = aiCache.get<StoryPrompt[]>('followUpPrompts', cacheKey)
  if (cached) {
    return cached
  }

  try {
    const template = getStoryTemplate(templateId)
    const context = template
      ? `Story type: ${template.name}. Category: ${template.category}.`
      : ''

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 600,
      system: `You are helping an Indigenous community member from Palm Island share their story.
Based on their answers so far, generate thoughtful follow-up questions to help them tell a richer story.

Guidelines:
- Be culturally sensitive and respectful
- Ask open-ended questions that encourage reflection
- Help draw out emotions, details, and wisdom
- Don't ask about anything that might be culturally sensitive without guidance
- Keep questions conversational and warm

Respond with JSON only:
{
  "prompts": [
    {"question": "...", "helpText": "...", "type": "open|feeling|detail|reflection"}
  ]
}`,
      messages: [{
        role: 'user',
        content: `${context}

Previous answers:
${Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}

${focusArea ? `Focus on: ${focusArea}` : ''}

Generate ${count} follow-up questions.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const prompts: StoryPrompt[] = (parsed.prompts || []).map((p: any, i: number) => ({
      id: `followup-${Date.now()}-${i}`,
      question: p.question,
      helpText: p.helpText || '',
      type: p.type || 'open',
      order: i + 1
    }))

    // Cache for 1 hour
    aiCache.set('followUpPrompts', cacheKey, prompts, CACHE_TTL.LONG)

    return prompts
  } catch (error) {
    console.error('Error generating follow-up prompts:', error)
    return []
  }
}

/**
 * Generate a story draft from collected answers
 */
export async function generateStoryDraft(
  answers: Record<string, string>,
  options: {
    title?: string
    style?: 'first-person' | 'narrative' | 'conversational'
    includeQuotes?: boolean
  } = {}
): Promise<{
  title: string
  content: string
  summary: string
  suggestedCategory: string
  keywords: string[]
}> {
  const { style = 'first-person', includeQuotes = true } = options

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: `You are helping craft a story for the Palm Island Community knowledge base.
Transform the interview answers into a cohesive, authentic story.

Guidelines:
- Preserve the storyteller's voice and words as much as possible
- ${style === 'first-person' ? 'Write in first person from the storyteller\'s perspective' : ''}
- ${includeQuotes ? 'Include direct quotes where powerful' : 'Paraphrase into flowing narrative'}
- Respect cultural context and sensitivity
- Create a compelling but accurate story
- Never fabricate details not in the answers

Respond with JSON:
{
  "title": "A compelling title",
  "content": "The full story text...",
  "summary": "2-3 sentence summary",
  "suggestedCategory": "health|culture|community|youth|elder_care|history",
  "keywords": ["keyword1", "keyword2", ...]
}`,
      messages: [{
        role: 'user',
        content: `${options.title ? `Suggested title: ${options.title}\n\n` : ''}Interview answers:

${Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}

Create a ${style} story from these answers.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON in response')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating story draft:', error)

    // Fallback: simple concatenation
    const content = Object.entries(answers)
      .map(([q, a]) => `${q}\n\n${a}`)
      .join('\n\n---\n\n')

    return {
      title: options.title || 'My Story',
      content,
      summary: content.substring(0, 200) + '...',
      suggestedCategory: 'community',
      keywords: []
    }
  }
}

/**
 * Get cultural guidance for a story topic
 */
export async function getCulturalGuidance(
  topic: string,
  storyType: string
): Promise<{
  guidance: string[]
  approvalNeeded: boolean
  suggestedConsultation: string[]
}> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 400,
      system: `You are a cultural advisor helping ensure stories from Palm Island are shared appropriately.
Provide guidance on cultural protocols without being overly restrictive.

Respond with JSON:
{
  "guidance": ["Guidance point 1", "Guidance point 2"],
  "approvalNeeded": true/false,
  "suggestedConsultation": ["Elder", "Traditional Owner", etc.]
}`,
      messages: [{
        role: 'user',
        content: `Story topic: ${topic}\nStory type: ${storyType}\n\nWhat cultural considerations should the storyteller be aware of?`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Error getting cultural guidance:', error)
  }

  // Default guidance
  return {
    guidance: [
      'Consider whether this story involves sacred or restricted knowledge',
      'Some stories may need Elder approval before public sharing',
      'Be mindful of identifying information about others without consent'
    ],
    approvalNeeded: false,
    suggestedConsultation: []
  }
}

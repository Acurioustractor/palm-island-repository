/**
 * Message Intent Classifier
 *
 * Primary: keyword-based classification (fast, free, reliable).
 * Fallback: AI classification via Claude Haiku for ambiguous messages.
 * MiniMax M2.5 is NOT used here — its <think> tags consume all output tokens
 * before producing JSON, making it unreliable for structured classification.
 */

import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'

export type MessageIntent = 'story' | 'question' | 'feedback' | 'need' | 'vision' | 'greeting' | 'unknown'

export interface ClassificationResult {
  intent: MessageIntent
  category: string
  confidence: number
}

/**
 * Classify a community message by intent.
 * Uses keyword patterns first, falls back to Claude Haiku for ambiguous messages.
 */
export async function classifyMessage(messageText: string): Promise<ClassificationResult> {
  const text = messageText.trim()
  const lower = text.toLowerCase()

  // 1. Greetings (short messages)
  if (/^(hi|hello|hey|thanks|thank you|cheers|g'day|yo|sup|howdy|good\s*(morning|afternoon|evening))\b/i.test(text) && text.split(/\s+/).length <= 5) {
    return { intent: 'greeting', category: 'greeting', confidence: 0.95 }
  }

  // 2. Questions (interrogative patterns)
  if (/\?$/.test(text) || /^(what|where|when|who|how|can|do|does|is|are|which|could|would|will)\b/i.test(text)) {
    const category = detectCategory(lower)
    return { intent: 'question', category, confidence: 0.85 }
  }

  // 3. Needs (explicit help requests)
  if (/\b(i need|i'm looking for|can you help|help me|looking for help|need help|need support|need assistance|struggling with|where can i get)\b/i.test(lower)) {
    const category = detectCategory(lower)
    return { intent: 'need', category, confidence: 0.85 }
  }

  // 4. Feedback (opinion about services)
  if (/\b(too (long|slow|short|expensive|far)|wait time|should be|could be better|needs? (to be|improvement)|not good|disappointed|complaint|impressed|excellent service|great service|terrible|awful|love the|hate the)\b/i.test(lower)) {
    const category = detectCategory(lower)
    return { intent: 'feedback', category, confidence: 0.80 }
  }

  // 5. Vision (future-oriented aspirations)
  if (/\b(i wish|i hope|would be great if|we should|in the future|one day|dream of|imagine if|wouldn't it be|next 20 years|aspir)\b/i.test(lower)) {
    const category = detectCategory(lower)
    return { intent: 'vision', category, confidence: 0.80 }
  }

  // 6. Story (personal experience sharing)
  if (/\b(i went|i visited|i attended|today i|yesterday i|last week|this morning|i felt|made me feel|my experience|i was at|i saw|happened to me|i remember when)\b/i.test(lower)) {
    const category = detectCategory(lower)
    return { intent: 'story', category, confidence: 0.80 }
  }

  // 7. If no keyword match, try Claude Haiku (if available) for ambiguous messages
  const aiResult = await classifyWithAI(text)
  if (aiResult) return aiResult

  // 8. Final fallback: use heuristics on message length/structure
  if (text.length > 80) {
    // Long messages are likely stories or feedback
    const category = detectCategory(lower)
    return { intent: 'story', category, confidence: 0.50 }
  }

  return { intent: 'unknown', category: 'unclassified', confidence: 0.30 }
}

/** Detect topic category from message content */
function detectCategory(lower: string): string {
  if (/\b(health|clinic|doctor|medical|healing|nurse)\b/.test(lower)) return 'health'
  if (/\b(youth|young|kids|children|teenager|after.school)\b/.test(lower)) return 'youth'
  if (/\b(family|child|parent|mother|father|baby)\b/.test(lower)) return 'family'
  if (/\b(housing|home|accommodation|rent|shelter)\b/.test(lower)) return 'housing'
  if (/\b(justice|court|legal|police|law)\b/.test(lower)) return 'justice'
  if (/\b(crisis|safe house|emergency|danger|violence)\b/.test(lower)) return 'crisis'
  if (/\b(digital|internet|computer|phone|wifi|telstra)\b/.test(lower)) return 'digital'
  if (/\b(elder|culture|tradition|ceremony|language)\b/.test(lower)) return 'culture'
  if (/\b(sport|recreation|game|football|basketball)\b/.test(lower)) return 'sport'
  if (/\b(food|meal|nutrition|cook|eat)\b/.test(lower)) return 'food'
  if (/\b(job|employment|work|career|training)\b/.test(lower)) return 'employment'
  return 'general'
}

/** AI-based classification via Claude Haiku (optional, for ambiguous messages) */
async function classifyWithAI(messageText: string): Promise<ClassificationResult | null> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return null

  try {
    const provider = createAnthropic({ apiKey: anthropicKey })
    const model = provider('claude-haiku-4-5-20251001')

    const { text } = await generateText({
      model,
      system: `Classify this community message into ONE intent: story, question, feedback, need, vision, greeting, or unknown.
Output ONLY JSON: {"intent":"...","category":"...","confidence":0.0}`,
      messages: [
        { role: 'user' as const, content: messageText.slice(0, 500) },
      ],
      maxOutputTokens: 80,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    const validIntents: MessageIntent[] = ['story', 'question', 'feedback', 'need', 'vision', 'greeting', 'unknown']

    return {
      intent: validIntents.includes(parsed.intent) ? parsed.intent : 'unknown',
      category: String(parsed.category || 'unclassified').slice(0, 50),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
    }
  } catch {
    return null // Fall through to keyword-based result
  }
}

/**
 * Message Intent Classifier
 *
 * Uses MiniMax M2.5 to classify inbound community messages by intent.
 * Fast and cheap (~$0.00006/message).
 */

import { generateText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'

export type MessageIntent = 'story' | 'question' | 'feedback' | 'need' | 'vision' | 'greeting' | 'unknown'

export interface ClassificationResult {
  intent: MessageIntent
  category: string
  confidence: number
}

function getClassifierModel() {
  const minimaxKey = process.env.MINIMAX_API_KEY
  if (minimaxKey) {
    const minimax = createOpenAICompatible({
      name: 'minimax',
      baseURL: 'https://api.minimax.io/v1',
      apiKey: minimaxKey,
    })
    return minimax.chatModel('MiniMax-M2.5')
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    const provider = createAnthropic({ apiKey: anthropicKey })
    return provider('claude-haiku-4-5-20251001')
  }

  throw new Error('No AI API key configured for message classification')
}

const CLASSIFICATION_PROMPT = `You classify incoming community messages for Palm Island Community Company (PICC).

Classify the message into ONE intent:
- story: sharing a personal experience, testimony, or something that happened to them (e.g. "I went to the healing service and felt great")
- question: asking for information about services, programs, history, or anything (e.g. "What programs do you have for youth?")
- feedback: giving feedback about a service or experience — positive or negative (e.g. "The clinic wait times are too long")
- need: expressing a need for help, support, or a specific service (e.g. "I need help with housing")
- vision: sharing hopes, ideas, or aspirations for the community's future (e.g. "I wish we had more youth programs")
- greeting: a simple hello, thanks, or conversational opener (e.g. "Hi", "Thanks for that")
- unknown: cannot determine intent

Also provide a brief category label (1-3 words) and confidence score (0.0-1.0).

Respond ONLY with JSON: {"intent":"...","category":"...","confidence":0.0}`

/**
 * Classify a community message by intent.
 * Returns intent, category, and confidence score.
 */
export async function classifyMessage(messageText: string): Promise<ClassificationResult> {
  // Quick checks for obvious greetings
  const greeting = /^(hi|hello|hey|thanks|thank you|cheers|g'day|yo|sup)\b/i
  if (greeting.test(messageText.trim()) && messageText.trim().split(/\s+/).length <= 4) {
    return { intent: 'greeting', category: 'greeting', confidence: 0.95 }
  }

  try {
    const { text } = await generateText({
      model: getClassifierModel(),
      system: CLASSIFICATION_PROMPT,
      messages: [
        { role: 'user' as const, content: `Classify this message: "${messageText.slice(0, 500)}"` },
      ],
      maxOutputTokens: 100,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[classify-message] No JSON in response:', text)
      return { intent: 'unknown', category: 'unclassified', confidence: 0 }
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validIntents: MessageIntent[] = ['story', 'question', 'feedback', 'need', 'vision', 'greeting', 'unknown']

    return {
      intent: validIntents.includes(parsed.intent) ? parsed.intent : 'unknown',
      category: String(parsed.category || 'unclassified').slice(0, 50),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[classify-message] Classification failed:', msg)
    return { intent: 'unknown', category: 'error', confidence: 0 }
  }
}

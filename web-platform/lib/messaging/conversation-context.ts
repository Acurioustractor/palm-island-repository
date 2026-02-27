/**
 * Conversation Context Manager
 *
 * Loads conversation history from community_messages table
 * and formats it for the AI SDK message format.
 */

import { createServerSupabase } from '@/lib/supabase/client'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Load conversation history from community_messages table.
 * Returns messages formatted for the AI SDK.
 */
export async function getConversationHistory(
  conversationId: string,
  limit = 10
): Promise<ConversationMessage[]> {
  const supabase = createServerSupabase()

  const { data: messages } = await supabase
    .from('community_messages')
    .select('direction, body, created_at')
    .eq('ghl_conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (!messages || messages.length === 0) return []

  return messages.map(m => ({
    role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
    content: m.body,
  }))
}

/**
 * Detect if a conversation is going in circles.
 * Returns true if 3+ exchanges have happened without progress
 * (heuristic: user keeps asking similar things).
 */
export async function shouldEscalate(conversationId: string): Promise<{
  escalate: boolean
  reason?: string
}> {
  const supabase = createServerSupabase()

  const { data: messages } = await supabase
    .from('community_messages')
    .select('direction, body, created_at')
    .eq('ghl_conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!messages || messages.length < 6) {
    return { escalate: false }
  }

  // Count back-and-forth exchanges
  const userMessages = messages.filter(m => m.direction === 'inbound')

  if (userMessages.length >= 4) {
    // Check if user messages are repetitive (same topic)
    const recent = userMessages.slice(0, 3).map(m => m.body.toLowerCase())
    const words = recent.flatMap(m => m.split(/\s+/).filter((w: string) => w.length > 3))
    const wordCounts = new Map<string, number>()
    for (const w of words) {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1)
    }
    const repeatedWords = Array.from(wordCounts.values()).filter(c => c >= 3).length
    if (repeatedWords >= 2) {
      return { escalate: true, reason: 'circular_conversation' }
    }
  }

  // Check conversation age — if 5+ messages over 30+ minutes, offer human
  if (messages.length >= 5) {
    const newest = new Date(messages[0].created_at).getTime()
    const oldest = new Date(messages[messages.length - 1].created_at).getTime()
    const durationMinutes = (newest - oldest) / 60_000
    if (durationMinutes > 30) {
      return { escalate: true, reason: 'long_conversation' }
    }
  }

  return { escalate: false }
}

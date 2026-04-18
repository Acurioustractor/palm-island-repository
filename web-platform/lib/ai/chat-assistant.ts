/**
 * AI Chat Assistant with RAG
 *
 * Conversational AI that answers questions about Palm Island
 * using Retrieval Augmented Generation from the knowledge base.
 */

import { generateText, streamText as aiStreamText } from 'ai'
import { createServerComponentClient } from '@/lib/supabase/server'
import { semanticSearch } from './embeddings'
import { expandQuery } from './query-expansion'
import { aiCache, CACHE_TTL } from './cache'
import { getExpandedContext } from './context-builder'
import { getTextModel, stripThinkTags } from './models'

const model = getTextModel()

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  sources?: ChatSource[]
}

export interface ChatSource {
  id: string
  type: 'story' | 'knowledge' | 'person'
  title: string
  snippet: string
  relevance: number
  url?: string
}

export interface ChatContext {
  conversationId?: string
  messages: ChatMessage[]
  userId?: string
}

export interface ChatResponse {
  message: string
  sources: ChatSource[]
  suggestedQuestions?: string[]
  conversationId: string
}

// System prompt for the assistant
const SYSTEM_PROMPT = `You are Palm AI — the knowledgeable, warm, and thorough AI assistant for Palm Island Community Company (PICC).

You have access to PICC's full knowledge base: services, financials, staff, board, history, elder quotes, interviews, governance achievements, partners, and community stories. USE ALL OF IT.

## How to answer
- Give COMPREHENSIVE, DETAILED answers. Never give a thin one-liner when you have rich context.
- Structure answers with clear headings, bullet points, and sections.
- Include specific numbers, names, quotes, and facts from the context provided.
- When listing services, list ALL of them with descriptions — not just one or two.
- When discussing financials, give actual dollar figures and trends.
- When mentioning people, use their full names and roles.
- Include elder quotes and interview excerpts when relevant — these are the heart of the platform.
- End with 1-2 follow-up suggestions to help users explore further.

## Cultural protocols
- Be warm, respectful, and culturally sensitive.
- Respect that some knowledge may be sacred or restricted.
- Use respectful language when mentioning Elders and community members.
- The Manbarra (Manburra) are the Traditional Owners of Palm Island.
- Bwgcolman means "many tribes" — people from 50+ language groups were forcibly relocated here.

## What NOT to do
- Never give a vague or generic answer when you have specific data.
- Never say "I don't have information" if the context below contains relevant facts.
- Never make up facts — only use what's in the provided context.
- Never truncate lists — if there are 25 services, mention all 25.`

/**
 * Retrieve relevant context for a query using the expanded context builder
 * which searches across ALL data tables (interviews, quotes, services, financials, etc.)
 */
async function retrieveContext(
  query: string,
  limit: number = 10
): Promise<{ sources: ChatSource[]; contextString: string }> {
  try {
    // Expand the query for better retrieval
    const expanded = await expandQuery(query, {
      context: 'Palm Island community knowledge base',
      maxAlternatives: 3
    })

    const searchQuery = expanded.expanded || query

    // Use expanded context builder (vector search + all data tables)
    const expandedResult = await getExpandedContext(searchQuery, {
      limit,
      maxContextTokens: 12000
    })

    // Map expanded sources to ChatSource format
    const sources: ChatSource[] = expandedResult.sources.map((s, i) => ({
      id: `src-${i}`,
      type: (s.type === 'story' ? 'story' : s.type === 'person' ? 'person' : 'knowledge') as 'story' | 'knowledge' | 'person',
      title: s.title,
      snippet: '',
      relevance: 0.8,
      url: s.url
    }))

    return { sources, contextString: expandedResult.context }
  } catch (error) {
    console.error('Error retrieving context:', error)
    return { sources: [], contextString: '' }
  }
}

/**
 * Get URL for content item
 */
function getContentUrl(id: string, type: string): string {
  switch (type) {
    case 'story':
      return `/stories/${id}`
    case 'knowledge':
      return `/wiki/${id}`
    case 'person':
      return `/wiki/people/${id}`
    default:
      return '#'
  }
}

/**
 * Generate chat response with RAG
 */
export async function generateChatResponse(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  const conversationId = context.conversationId || generateConversationId()

  // Retrieve relevant context from all data tables
  const { sources, contextString: retrievedContext } = await retrieveContext(userMessage)

  // Build context string for the model
  const contextBlock = retrievedContext
    ? `\n\nRelevant information from the PICC knowledge base:\n${retrievedContext}`
    : '\n\nNo specific information found in the knowledge base for this query.'

  // Build message history
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...context.messages
      .filter(m => m.role !== 'system')
      .slice(-6) // Keep last 6 messages for context
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
    {
      role: 'user',
      content: `${userMessage}${contextBlock}`
    }
  ]

  try {
    const response = await generateText({
      model,
      maxOutputTokens: 4096,
      system: SYSTEM_PROMPT,
      messages
    })

    const assistantMessage = stripThinkTags(response.text || '')

    // Generate suggested follow-up questions
    const suggestedQuestions = await generateSuggestedQuestions(userMessage, assistantMessage)

    return {
      message: assistantMessage,
      sources,
      suggestedQuestions,
      conversationId
    }
  } catch (error) {
    console.error('Chat response error:', error)
    throw error
  }
}

/**
 * Generate suggested follow-up questions
 */
async function generateSuggestedQuestions(
  userQuery: string,
  assistantResponse: string
): Promise<string[]> {
  // Check cache
  const cacheKey = [userQuery.substring(0, 100)]
  const cached = aiCache.get<string[]>('suggestedQuestions', cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await generateText({
      model,
      maxOutputTokens: 200,
      messages: [{
        role: 'user',
        content: `Based on this conversation about Palm Island:
User asked: "${userQuery}"
Assistant responded about: "${assistantResponse.substring(0, 300)}..."

Generate 3 short follow-up questions the user might want to ask. Make them specific to Palm Island community topics.
Respond with just the questions, one per line, no numbering.`
      }]
    })

    const text = stripThinkTags(response.text || '')
    const questions = text.split('\n').filter(q => q.trim()).slice(0, 3)

    // Cache for 30 minutes
    aiCache.set('suggestedQuestions', cacheKey, questions, CACHE_TTL.MEDIUM)

    return questions
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

/**
 * Generate conversation ID
 */
function generateConversationId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get conversation starters
 */
export function getConversationStarters(): string[] {
  return [
    "What health services are available on Palm Island?",
    "Tell me about the history of Palm Island",
    "What stories do you have about elders?",
    "How can I learn about the local culture?",
    "What programs are there for young people?",
    "Tell me about the Manbarra people",
    "What community events happen on Palm Island?",
    "How does PICC support the community?"
  ]
}

/**
 * Stream chat response (for real-time output)
 */
export async function* streamChatResponse(
  userMessage: string,
  context: ChatContext
): AsyncGenerator<{ type: 'text' | 'sources' | 'done'; content: any }> {
  const conversationId = context.conversationId || generateConversationId()

  // Retrieve expanded context from all data tables
  const { sources, contextString: retrievedContext } = await retrieveContext(userMessage)
  yield { type: 'sources', content: sources }

  // Build context block
  const contextBlock = retrievedContext
    ? `\n\nRelevant information from PICC knowledge base:\n${retrievedContext}`
    : ''

  // Build messages
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...context.messages
      .filter(m => m.role !== 'system')
      .slice(-6)
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
    {
      role: 'user',
      content: `${userMessage}${contextBlock}`
    }
  ]

  // Stream response
  const result = aiStreamText({
    model,
    maxOutputTokens: 2048,
    system: SYSTEM_PROMPT,
    messages
  })

  for await (const chunk of result.textStream) {
    if (chunk) {
      yield { type: 'text', content: chunk }
    }
  }

  yield { type: 'done', content: { conversationId } }
}

/**
 * Save conversation to database
 */
export async function saveConversation(
  conversationId: string,
  messages: ChatMessage[],
  userId?: string
): Promise<void> {
  const supabase = await createServerComponentClient()

  await (supabase as any)
    .from('chat_conversations')
    .upsert({
      id: conversationId,
      user_id: userId,
      messages: messages,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
}

/**
 * Load conversation from database
 */
export async function loadConversation(
  conversationId: string
): Promise<ChatMessage[] | null> {
  const supabase = await createServerComponentClient()

  const { data, error } = await (supabase as any)
    .from('chat_conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()

  if (error || !data) {
    return null
  }

  return data.messages as ChatMessage[]
}

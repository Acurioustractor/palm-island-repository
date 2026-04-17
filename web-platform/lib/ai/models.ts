/**
 * Centralized AI model routing.
 *
 * Two layers:
 *   1. Model ID constants — for raw `@anthropic-ai/sdk` call sites
 *      (use directly: `model: MODEL_TEXT_HEAVY`)
 *   2. Provider helpers — for Vercel AI SDK call sites
 *      (use: `getTextModel()`, `getStructuredModel()`, etc.)
 *
 * Routing policy (cost-aware):
 *   - TEXT (chat, copy, summaries): MiniMax-first → Anthropic Haiku fallback
 *   - STRUCTURED (JSON, tool use): Anthropic only — MiniMax <think> tags break JSON
 *   - VISION (image/PDF analysis): Anthropic Sonnet only — MiniMax M2.5 not vision-reliable
 *   - REASONING (agent core, multi-step): Anthropic Opus — reserve for hard work
 *
 * To bump a model fleet-wide, change the constant here. To override the chat
 * provider at runtime, set CHAT_PROVIDER=anthropic|minimax in env.
 */

import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// ---------- Model ID constants (for raw @anthropic-ai/sdk call sites) ----------

export const MODEL_TEXT_HEAVY = 'claude-sonnet-4-6' as const          // creative gen, summaries, analysis
export const MODEL_TEXT_LIGHT = 'claude-haiku-4-5-20251001' as const  // classification, query expansion, reranking
export const MODEL_VISION = 'claude-sonnet-4-6' as const              // image/PDF analysis, OCR
export const MODEL_REASONING = 'claude-opus-4-7' as const             // agent core, multi-step tool use
export const MODEL_MINIMAX_CHAT = 'MiniMax-M2.5' as const             // chat-only, MiniMax M2.5

// ---------- Vercel AI SDK helpers (for app/api/chat etc.) ----------

function minimaxModel() {
  const key = process.env.MINIMAX_API_KEY
  if (!key) return null
  const provider = createOpenAICompatible({
    name: 'minimax',
    baseURL: 'https://api.minimax.io/v1',
    apiKey: key,
  })
  return provider.chatModel(MODEL_MINIMAX_CHAT)
}

function anthropicModel(modelId: string) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const provider = createAnthropic({ apiKey: key })
  return provider(modelId)
}

/**
 * Chat / text generation.
 * MiniMax-first unless CHAT_PROVIDER=anthropic. Falls back to Anthropic Haiku
 * if MiniMax key missing.
 */
export function getTextModel() {
  const preferAnthropic = process.env.CHAT_PROVIDER === 'anthropic'
  const model = preferAnthropic
    ? anthropicModel(MODEL_TEXT_LIGHT) || minimaxModel()
    : minimaxModel() || anthropicModel(MODEL_TEXT_LIGHT)
  if (!model) {
    throw new Error('No AI API key configured (MINIMAX_API_KEY or ANTHROPIC_API_KEY)')
  }
  return model
}

/**
 * Structured output / tool use. Anthropic only — MiniMax <think> tags
 * consume output budget before producing JSON.
 */
export function getStructuredModel() {
  const model = anthropicModel(MODEL_TEXT_LIGHT)
  if (!model) throw new Error('ANTHROPIC_API_KEY required for structured output')
  return model
}

/**
 * Vision / multimodal. Anthropic Sonnet — MiniMax M2.5 not vision-reliable
 * via OpenAI-compatible endpoint.
 */
export function getVisionModel() {
  const model = anthropicModel(MODEL_VISION)
  if (!model) throw new Error('ANTHROPIC_API_KEY required for vision')
  return model
}

/**
 * Heavy reasoning / agent loops. Opus 4.7 — reserve for hard work, prompts
 * must include task budget + stop criteria + fallback (see CLAUDE.md).
 */
export function getReasoningModel() {
  const model = anthropicModel(MODEL_REASONING)
  if (!model) throw new Error('ANTHROPIC_API_KEY required for reasoning')
  return model
}

/**
 * Anthropic-only fallback for chat (used when MiniMax is primary and we want
 * a guaranteed Claude path for retries).
 */
export function getAnthropicFallback() {
  return anthropicModel(MODEL_TEXT_LIGHT)
}

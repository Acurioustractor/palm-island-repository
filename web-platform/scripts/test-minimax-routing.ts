/**
 * Smoke test for MiniMax-first routing.
 * Runs 4 representative paths and reports: <think> tag presence,
 * JSON parse success (where applicable), and output sample.
 *
 * Usage: npx tsx scripts/test-minimax-routing.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { generateText } from 'ai'
import { getTextModel, stripThinkTags } from '../lib/ai/models'
import { summarizeContent, generateOneLiner } from '../lib/ai/summarization'
import { getCulturalGuidance } from '../lib/ai/story-prompts'

const SAMPLE_STORY = `
Aunty May has been running the kitchen at the Palm Island community centre for 17 years.
She knows every kid by name, knows whose dad is inside, knows who hasn't eaten today.
Last month the grant ended. The fridge is still running. She's still there.
"You don't stop feeding kids because the funding stopped," she says. "That's not how this works."
The new program, the one with the metrics and the strategic plan, hasn't started yet.
`.trim()

function reportRaw(name: string, raw: string) {
  const hasThink = /<think>[\s\S]*?<\/think>/.test(raw)
  const stripped = stripThinkTags(raw)
  console.log(`\n[${name}]`)
  console.log(`  raw length:     ${raw.length} chars`)
  console.log(`  <think> tags:   ${hasThink ? 'YES (stripped before use)' : 'no'}`)
  console.log(`  stripped len:   ${stripped.length} chars`)
  console.log(`  preview:        ${stripped.slice(0, 200).replace(/\n/g, ' ')}${stripped.length > 200 ? '…' : ''}`)
}

async function test1_RawTextModel() {
  const { text } = await generateText({
    model: getTextModel(),
    prompt: 'In one sentence: why do community feeding programs matter on Palm Island?',
    maxOutputTokens: 200,
  })
  reportRaw('1. getTextModel() raw — plain text', text)
}

async function test2_Summarize() {
  console.log('\n[2. summarizeContent — JSON parsing]')
  const result = await summarizeContent(SAMPLE_STORY, { maxLength: 50 })
  console.log(`  success:        ${result.success}`)
  console.log(`  summary:        ${result.summary?.slice(0, 200) ?? '(empty)'}`)
  console.log(`  keyPoints:      ${result.keyPoints?.length ?? 0} items`)
  console.log(`  sentiment:      ${result.sentiment}`)
  if (result.error) console.log(`  error:          ${result.error}`)
}

async function test3_OneLiner() {
  console.log('\n[3. generateOneLiner — plain text]')
  const oneLiner = await generateOneLiner(SAMPLE_STORY, 'Aunty May\'s kitchen')
  console.log(`  result:         ${oneLiner}`)
  console.log(`  length:         ${oneLiner.length} chars`)
}

async function test4_CulturalGuidance() {
  console.log('\n[4. getCulturalGuidance — JSON parsing]')
  const result = await getCulturalGuidance('elder oral history about land', 'elder_wisdom')
  console.log(`  guidance:       ${result.guidance.length} items`)
  console.log(`  approval:       ${result.approvalNeeded}`)
  console.log(`  consultation:   ${result.suggestedConsultation.join(', ') || '(none)'}`)
  if (result.guidance[0]) console.log(`  first point:    ${result.guidance[0].slice(0, 200)}`)
}

async function main() {
  console.log('═══ MiniMax routing smoke test ═══')
  console.log(`MINIMAX_API_KEY:    ${process.env.MINIMAX_API_KEY ? 'set' : 'MISSING'}`)
  console.log(`ANTHROPIC_API_KEY:  ${process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING'}`)
  console.log(`CHAT_PROVIDER:      ${process.env.CHAT_PROVIDER || '(unset, MiniMax-first)'}`)

  const tests = [
    { name: '1. raw text', fn: test1_RawTextModel },
    { name: '2. summarize', fn: test2_Summarize },
    { name: '3. oneLiner', fn: test3_OneLiner },
    { name: '4. cultural', fn: test4_CulturalGuidance },
  ]

  let passed = 0
  let failed = 0
  for (const t of tests) {
    try {
      await t.fn()
      passed++
    } catch (err: any) {
      console.log(`\n[${t.name}] ✗ FAILED: ${err.message}`)
      failed++
    }
  }

  console.log(`\n═══ ${passed} passed, ${failed} failed ═══`)
  process.exit(failed > 0 ? 1 : 0)
}

main()

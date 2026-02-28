/**
 * Generate History Stories from Scraped Content
 *
 * Queries scraped_content and historical_artifacts for Palm Island history material,
 * groups by chapter, and generates draft stories using Gemini.
 * All stories are created as drafts (is_public: false, status: 'draft') for human review.
 *
 * Usage:
 *   npx tsx scripts/generate-history-stories.ts
 *   npx tsx scripts/generate-history-stories.ts --chapter hull-river
 *   npx tsx scripts/generate-history-stories.ts --dry-run
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const DRY_RUN = process.argv.includes('--dry-run')
const CHAPTER_FILTER = process.argv.find(a => a.startsWith('--chapter='))?.split('=')?.[1]
const RATE_LIMIT_MS = 5000 // 15 RPM free tier

// ─── Chapter Definitions ─────────────────────────────────────────────────────

const CHAPTERS = [
  {
    ref: 'manbarra',
    title: 'Manbarra Country (Pre-1914)',
    keywords: ['manbarra', 'wulgurukaba', 'canoe people', 'gabbul', 'bêche-de-mer', 'pre-contact'],
    sensitivity: 'medium' as const,
  },
  {
    ref: 'reserve',
    title: 'The Reserve (1914)',
    keywords: ['bleakley', 'protector', 'reserve', 'gazetted', '1914', 'opium act', 'removal'],
    sensitivity: 'low' as const,
  },
  {
    ref: 'hull-river',
    title: 'Hull River (1914-1918)',
    keywords: ['hull river', 'cyclone', '1918', 'tully', 'djiru', 'kenny', 'fantome', 'lazaret'],
    sensitivity: 'high' as const,
  },
  {
    ref: 'languages',
    title: 'Many Tribes, One People (1918-1972)',
    keywords: ['bwgcolman', 'language', 'removal', 'tribes', 'dick palm island', '3950'],
    sensitivity: 'medium' as const,
  },
  {
    ref: 'dormitories',
    title: 'Life Under Government Control',
    keywords: ['dormitory', 'superintendent', 'curry', 'curfew', 'bell', 'eclipse island', 'stolen generations'],
    sensitivity: 'high' as const,
  },
  {
    ref: 'strike-1957',
    title: 'The Strike of 1957',
    keywords: ['strike', '1957', 'magnificent seven', 'thaiday', 'geia', 'lymburner', 'sibley', 'congoo', 'watson', 'tapau'],
    sensitivity: 'medium' as const,
  },
  {
    ref: 'mulrunji',
    title: 'Mulrunji (2004)',
    keywords: ['mulrunji', 'doomadgee', 'hurley', 'death in custody', '2004', 'wotton', 'riot'],
    sensitivity: 'high' as const,
  },
  {
    ref: 'self-determination',
    title: 'Self-Determination',
    keywords: ['self-determination', 'DOGIT', 'deed of grant', 'community control', 'council'],
    sensitivity: 'low' as const,
  },
  {
    ref: 'picc',
    title: 'PICC and the 20-Year Vision',
    keywords: ['picc', 'community company', 'rachel atkinson', '20-year', 'catsi'],
    sensitivity: 'low' as const,
  },
] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateStory(
  chapterRef: string,
  chapterTitle: string,
  sources: { title: string; content: string; source: string; url?: string }[],
  sensitivity: string
): Promise<{
  title: string
  content: string
  summary: string
  sources_cited: string[]
}> {
  const sourcesText = sources
    .map((s, i) => `[Source ${i + 1}: ${s.title} (${s.source})]:\n${s.content.slice(0, 2000)}`)
    .join('\n\n---\n\n')

  const prompt = `You are writing a history story for the Palm Island Community Company (PICC) website.

Chapter: "${chapterTitle}" (ref: ${chapterRef})
Cultural sensitivity level: ${sensitivity}

Using the sources below, write a compelling narrative story that:
1. Tells the story from the community's perspective (not the coloniser's)
2. Centers Aboriginal agency, resilience, and survival
3. Uses specific facts, dates, names, and quotes from the sources
4. Acknowledges difficult history without being gratuitous
5. Is suitable for a general audience visiting the PICC website
6. Cites which source each key fact comes from

Sources:
${sourcesText}

Return a JSON object with:
- title: A compelling title (not just the chapter name)
- content: The full story text in markdown (800-1500 words)
- summary: A 2-3 sentence summary
- sources_cited: Array of source titles/URLs used

Return ONLY valid JSON, no markdown fences.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      title: `${chapterTitle} — Draft Story`,
      content: text,
      summary: `Draft story for ${chapterTitle} chapter, generated from ${sources.length} sources.`,
      sources_cited: sources.map(s => s.title),
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Generate History Stories from Sources')
  console.log('═══════════════════════════════════════')
  if (DRY_RUN) console.log('🔍 DRY RUN — no database writes')
  console.log(`Using: Gemini 2.0 Flash\n`)

  const chaptersToProcess = CHAPTER_FILTER
    ? CHAPTERS.filter(c => c.ref === CHAPTER_FILTER)
    : [...CHAPTERS]

  let totalGenerated = 0

  for (const chapter of chaptersToProcess) {
    console.log(`\n📖 Chapter: ${chapter.title} (${chapter.ref})`)

    // Gather sources from historical_artifacts
    const { data: artifacts } = await supabase
      .from('historical_artifacts')
      .select('title, content_text, content_summary, source_name, source_url')
      .eq('chapter_ref', chapter.ref)
      .not('content_text', 'is', null)
      .limit(20)

    // Also check scraped_content for relevant material
    const keywordQuery = chapter.keywords.slice(0, 3).join(' | ')
    const { data: scraped } = await supabase
      .from('scraped_content')
      .select('title, content, url')
      .textSearch('content', keywordQuery, { type: 'websearch' })
      .limit(10)

    const sources = [
      ...(artifacts || []).map(a => ({
        title: a.title,
        content: a.content_text || a.content_summary || '',
        source: a.source_name || 'Unknown',
        url: a.source_url || undefined,
      })),
      ...(scraped || []).map(s => ({
        title: s.title || 'Scraped content',
        content: s.content || '',
        source: 'Web scrape',
        url: s.url || undefined,
      })),
    ].filter(s => s.content.length > 50)

    if (sources.length === 0) {
      console.log(`  ⏭️  No sources found — skipping`)
      continue
    }

    console.log(`  Found ${sources.length} sources`)

    // Check if story already exists
    const { data: existingStory } = await supabase
      .from('stories')
      .select('id')
      .contains('tags', [`history-${chapter.ref}`])
      .single()

    if (existingStory) {
      console.log(`  ⏭️  Story already exists for this chapter`)
      continue
    }

    // Generate
    console.log(`  ✍️  Generating story...`)
    await sleep(RATE_LIMIT_MS)
    const story = await generateStory(
      chapter.ref,
      chapter.title,
      sources,
      chapter.sensitivity
    )

    console.log(`  Title: "${story.title}"`)
    console.log(`  Summary: ${story.summary.slice(0, 100)}...`)

    if (!DRY_RUN) {
      const { error } = await supabase.from('stories').insert({
        storyteller_id: '00000000-0000-0000-0000-000000000001',
        title: story.title,
        content: story.content,
        summary: story.summary,
        category: 'history',
        location: 'Palm Island',
        tags: ['history', `history-${chapter.ref}`, chapter.ref, 'generated', 'draft'],
        is_public: false,
        status: 'draft',
        cultural_sensitivity_level: chapter.sensitivity,
        elder_approval_required: chapter.sensitivity === 'high',
        metadata: {
          chapter_ref: chapter.ref,
          chapter_title: chapter.title,
          sources_cited: story.sources_cited,
          generated_at: new Date().toISOString(),
          generated_by: 'generate-history-stories.ts',
          ai_model: 'gemini-2.5-flash',
          source_count: sources.length,
        },
      })

      if (error) {
        console.error(`  ❌ Failed to store: ${error.message}`)
      } else {
        console.log(`  ✅ Stored as draft (is_public: false)`)
        totalGenerated++
      }
    } else {
      totalGenerated++
    }
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Stories generated: ${totalGenerated}`)
  console.log(`\nAll stories created as DRAFTS — review at /picc/stories`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

/**
 * POST /api/admin/draft-description
 *
 * Generates 3 candidate brand-voice descriptions for a service or
 * project, using BRAND.md's Service register tone + any storyteller
 * quotes EL has about the entity.
 *
 * Body: { type: 'service'|'project', slug: string }
 * Returns: { candidates: string[], context: { voiceCount: number, hadDescription: boolean } }
 *
 * Used by /picc/services/coverage and /picc/projects/coverage to give
 * Narelle a starting point for DRAFT/thin descriptions. She edits and
 * pastes back into EL admin.
 *
 * Auth: simple — requires admin cookie (route lives under /api/admin).
 * Real auth comes from the existing AdminProvider gate on the page.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getTextModel } from '@/lib/ai/models'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { getVoicesPool } from '@/lib/services/el-coverage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are drafting a service or project description for the Palm Island Community Company (PICC) website. PICC is a Bwgcolman & Manbarra community-controlled organisation on Palm Island, Queensland.

VOICE — Service register (per BRAND.md §3C):
- Specific. Short. Cited in the order staff would cite them.
- "Auspiced since 2008. Six staff. ~120 community members supported a year."
- Concrete numbers, named teams, dates, places.
- The lead person on this service should read it aloud and recognise it.

NEVER:
- Generic SaaS-speak. No "leverage", "synergies", "harness", "empower", "ecosystem".
- Em-dashes as drama beats.
- "We helped / provided / delivered" — PICC is the community delivering to itself.
- Cherry-picking heroics. Don't hide the hard parts.
- Generic descriptions that could fit any Aboriginal community-controlled organisation. It must fit THIS one.

DO:
- Lead with what it IS, not what it ASPIRES TO.
- Use real Palm Island place names (Ferdy's Haven, Bwgcolman, BHS, CFC) where they fit.
- 80–180 words for services, 60–140 for projects.
- One short paragraph, no bullets.

Output exactly 3 candidate descriptions, separated by "---".
No headings, no labels, no commentary — just the three paragraphs.`

interface Body {
  type?: 'service' | 'project'
  slug?: string
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!body.type || !['service', 'project'].includes(body.type)) {
    return NextResponse.json({ error: 'type must be "service" or "project"' }, { status: 400 })
  }
  if (!body.slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  // Fetch the entity + supporting context
  let name = ''
  let category = ''
  let currentDescription = ''
  if (body.type === 'service') {
    const services = await getPiccServices({ status: 'active' }).catch(() => [])
    const svc = services.find((s) => s.slug === body.slug)
    if (!svc) return NextResponse.json({ error: 'service not found' }, { status: 404 })
    name = svc.name
    category = svc.service_category || ''
    currentDescription = svc.description || ''
  } else {
    const projects = await getPiccProjects({ status: 'all' }).catch(() => [])
    const proj = projects.find((p) => p.slug === body.slug)
    if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
    name = proj.name
    category = proj.project_type || ''
    currentDescription = proj.description || ''
  }

  // Sample voices about this entity (storyteller quotes via service slug)
  const voices = body.type === 'service'
    ? await getVoicesPool(body.slug).catch(() => [])
    : []
  const voiceQuotes = voices
    .slice(0, 6)
    .map((v) => `"${v.quote}" — ${v.speaker_name}${v.speaker_role ? ' · ' + v.speaker_role : ''}`)
    .join('\n')

  const userPrompt = [
    `Type: ${body.type}`,
    `Name: ${name}`,
    category ? `Category: ${category}` : '',
    currentDescription
      ? `Current description (rewrite or improve):\n"""\n${currentDescription}\n"""`
      : `(no description yet)`,
    voiceQuotes
      ? `\nStoryteller voices about this:\n${voiceQuotes}`
      : '',
    `\nWrite 3 candidate descriptions in the Service register. Separate with --- on its own line.`,
  ]
    .filter(Boolean)
    .join('\n')

  let text: string
  try {
    const result = await generateText({
      model: getTextModel(),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })
    text = result.text
  } catch (err: any) {
    return NextResponse.json(
      { error: 'generation failed', detail: err?.message || String(err) },
      { status: 500 },
    )
  }

  // Split into candidates
  const candidates = text
    .split(/\n---\n|\n\s*---\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 1500)
    .slice(0, 3)

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: 'no usable candidates', raw: text },
      { status: 500 },
    )
  }

  return NextResponse.json({
    candidates,
    context: {
      voiceCount: voices.length,
      hadDescription: !!currentDescription,
      name,
    },
  })
}
